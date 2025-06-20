import { makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser } from "@whiskeysockets/baileys";
import cfonts from "cfonts";
import pino from "pino";
import { Boom } from "@hapi/boom";
import pc from "picocolors";
import { promises as fs } from "node:fs";
import path from "node:path";
import qrcodeTerminal from "qrcode-terminal";
import NodeCache from "@cacheable/node-cache";
import { serialize } from "./lib/serialize/message.mjs";
import { getBody } from "./lib/tools.mjs";
import { handler } from "./handler.mjs";
import { groupMetadatas } from "./lib/caches/cache.mjs";
import Commands from "./controllers/loadcommands.mjs";
const venusSession = path.join(".", "VenusSession");

console.log(pc.green("Iniciando Venus-Bot 🪐"));
cfonts.say("Venus-Bot", {
    font: "block",
    align: "center",
    gradient: ["#fff0ba", "#a79256"]
});
cfonts.say("hecho por danixljs", {
    font: "console",
    align: "center",
    color: "cyan"
});

async function startVenus() {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(venusSession);
    const venus = makeWASocket({
        markOnlineOnConnect: true,
        defaultQueryTimeoutMs: undefined,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }).child({ level: "silent" })),
        },
        logger: pino({ level: "silent" }),
        browser: ["Ubuntu", "Edge", "131.0.2903.86"],
        connectTimeoutMs: 1000 * 60,
        qrTimeout: 1000 * 60,
        syncFullHistory: false,
        printQRInTerminal: false,
        msgRetryCounterCache: new NodeCache({
            stdTTL: 60 * 60,
            checkperiod: 60,
            useClones: false,
            deleteOnExpire: true,
            maxKeys: 1000,
        }),
        patchMessageBeforeSending: async (message) => {
            try {
                await venus.uploadPreKeysToServerIfRequired();
            } catch (err) {
                console.warn(err);
            }
            return message;
        },
        generateHighQualityLinkPreview: true,
        version,
    });

    console.info = () => { };
    console.debug = () => { };

    venus.ev.on("creds.update", saveCreds);

    venus.ev.on("connection.update", async ({ lastDisconnect, qr, connection }) => {
        if (qr) {
            console.log(pc.green(`
╭───────────────────╼
│ ${pc.cyan("Escanea este código QR para conectarte.")}
╰───────────────────╼`));
            qrcodeTerminal.generate(qr, { small: true });
        }

        if (connection === "close") {
            const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
            switch (code) {
                case DisconnectReason.loggedOut:
                case DisconnectReason.forbidden:
                case DisconnectReason.multideviceMismatch:
                    console.log(pc.red(`
╭───────────────────╼
│ ${pc.yellow("La conexión se cerró sin posibilidades de reconexión, se eliminará la carpeta de sesión.")}
╰───────────────────╼`));
                    console.log(JSON.stringify(lastDisconnect, null, 2));
                    await fs.rm(venusSession, { recursive: true, force: true }).catch(() => void 0);
                    process.exit(1);
                default:
                    console.log(pc.red(`
╭───────────────────╼
│ ${pc.yellow(`La conexión se cerró con el código de estado "${pc.white(code)}", reconéctando.`)}
╰───────────────────╼`));
                    await startVenus();
                    break;
            }
        }

        if (connection === "open") {
            const userJid = jidNormalizedUser(venus.user.id);
            const userName = venus.user.name || venus.user.verifiedName || "A stranger";
            console.log(pc.green(`
╭───────────────────╼
│ ${pc.cyan("Conéctado con éxito")}
│
│- ${pc.cyan("Usuario :")} +${pc.white(userJid.split("@")[0] + " - " + userName)}; 
│- ${pc.cyan("Versión de WhatsApp :")} ${pc.white(version)} es la última ? ${pc.white(isLatest)} 
╰───────────────────╼`));
        }
    });

    venus.ev.on("messages.upsert", async ({ messages, type }) => {
        try {
            if (type === "notify" && messages && messages.length !== 0) {
                for (const message of messages) {
                    if (message.message) {
                        const m = serialize(venus, message);
                        if (m) {
                            const body = getBody(m);
                            if (body) {
                                console.log(pc.green(`
╭─────────< Venus-Bot 🪐 - Vs 1.0.0 >──────────╼
│ ${pc.cyan(`Mensaje recibido`)}
│
│- ${pc.cyan("Chat :")} ${pc.white(m.chat)}
│- ${pc.cyan("Usuario :")} +${pc.white(m.sender.split("@")[0] + " - " + m.pushName)}
│- ${pc.cyan("Tipo :")} ${pc.white(m.type)};
╰╼
 ${pc.whiteBright(body)}`));
                            }
                            handler(venus, m, body);
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    });

    venus.ev.on("group-participants.update", async ({ id, participants, author, action }) => {
        try {
            if (id) {
                const groupMetadata = await venus.groupMetadata(id).catch(() => void 0);
                if (groupMetadata) {
                    groupMetadatas.set(id, groupMetadata);

                    if (action === "promote" || action === "demote") {
                        const promoteMessage = `*ALERT :* @${participants[0].split("@")[0]} ha sido promovido a administrador por @${author.split("@")[0]}`.trim();
                        const demoteMessage = `*ALERT :* @${participants[0].split("@")[0]} ha sido degradado de administrador por @${author.split("@")[0]}`.trim();
                        const admins = groupMetadata.participants.filter((v) => v.admin !== null).map((v) => v.id);
                        await venus.sendMessage(id, {
                            text: action === "promote" ? promoteMessage : demoteMessage,
                            mentions: admins
                        });
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    });

    venus.ev.on("groups.update", async (updates) => {
        try {
            for (const { id } of updates) {
                if (id) {
                    const groupMetadata = await venus.groupMetadata(id).catch(() => void 0);
                    if (groupMetadata) {
                        groupMetadatas.set(id, groupMetadata);
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    });
}

await Promise.all([
    startVenus(),
    Commands.load(),
    Commands.watch()
]);