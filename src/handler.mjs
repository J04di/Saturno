import { serialize } from "./lib/serialize/message.mjs";
import db from "./lib/database/lowdb.mjs";
import { groupMetadatas } from "./lib/caches/cache.mjs";
import { downloadMediaMessage, jidNormalizedUser } from "@whiskeysockets/baileys";
import { owners } from "./config.mjs";
import { sticker, toMp4 } from "./lib/tools.mjs";
import axios from "axios";
import Commands from "./controllers/loadcommands.mjs";

/**
 * @param {import("@whiskeysockets/baileys").WASocket} venus
 * @param {ReturnType<typeof serialize>} m
 * @param {string} body
 */
export async function handler(venus, m, body) {
  try {
    if (typeof db.data.users[m.sender] !== "object") {
      db.data.users[m.sender] = {
        points: 0,
        warns: 0
      };
      await db.write().catch((err) => console.error(err));
    }
    if (m.isGroup) {
      if (typeof db.data.groups[m.chat] !== "object") {
        db.data.groups[m.chat] = {
          antilinks: false,
          nsfw: false
        };
        await db.write().catch((err) => console.error(err));
      }
      if (!groupMetadatas.has(m.chat)) {
        const groupMetadata = await venus.groupMetadata(m.chat);
        if (groupMetadata) {
          groupMetadatas.set(m.chat, groupMetadata);
        }
      }
    }
    const user = db.data.users[m.sender];
    const group = m.isGroup ? db.data.groups[m.chat] : null;
    if (!user || (m.isGroup && !group)) {
      return;
    }
    /*
     * @type {import("@whiskeysockets/baileys").GroupMetadata | null}
     */
    const groupMetadata = m.isGroup ? groupMetadatas.get(m.chat) : null;
    const participants = m.isGroup && groupMetadata ? groupMetadata.participants : null;
    const venusNumber = jidNormalizedUser(venus.user.id);
    const senderInGroup = m.isGroup && participants ? participants.find((v) => v.id === m.sender) : null;
    const venusInGroup = m.isGroup && participants ? participants.find((v) => v.id === venusNumber) : null;
    const isOwner = owners.includes(m.sender);
    const isAdmin = isOwner || !!senderInGroup?.admin;
    const isVenusAdmin = !!venusInGroup?.admin;
    const bodySplit = body.trim().split(" ");
    const text = bodySplit.slice(1).join(" ");
    const args = bodySplit.slice(1);
    const usedPrefix = bodySplit[0].charAt(0);
    const usedCommand = bodySplit[0].slice(1);
    const command = Commands.get(usedCommand);

    if (m.isGroup && group.antilinks) {
      if (isVenusAdmin && /(?:chat.whatsapp.com|whatsapp.com\/channel)\/(?:invite\/|channel\/)?([0-9A-Za-z]{20,24})/i.test(body)) {
        try {
          const code = await venus.groupInviteCode(m.chat);
          const groupLink = `https://chat.whatsapp.com/${code}`;
          if (!body.includes(groupLink)) {
            if (!isAdmin && !m.fromMe) {
              await venus.sendMessage(m.chat, {
                delete: m.key,
              });
              venus.groupParticipantsUpdate(m.chat, [m.sender], "remove")
                .then(async (node) => {
                  if (node[0].status === "200") {
                    await venus.sendMessage(
                      m.chat,
                      { text: `Usuario @${m.sender.split("@")[0]} eliminado por enviar un link de whatsapp`, mentions: [m.sender] },
                      { quoted: m }
                    );
                  }
                });
            }
          }
        } catch (error) {
          console.error(error);
        }
      }
    }

    if (m.isGroup && /^(91|92|222|93|256|61|966|229|40|49|20|963|967|234|210|212)/.test(m.sender)) {
      try {
        if (isVenusAdmin) {
          await venus.sendMessage(
            m.chat,
            { text: `Se eliminará a @${m.sender.split("@")[0]} por tener un prefijo internacional prohibido`, mentions: [m.sender] },
            { quoted: m }
          );
          await venus.groupParticipantsUpdate(m.chat, [m.sender], "remove");
        }
      } catch (error) {
        console.error(error);
      }
    }

    if (m.isGroup && isVenusAdmin && !m.key.fromMe) {
      try {
        // Si quieres habilitar la eliminación de mensajes muy largos, descomenta:
        // if (body.length > 10000) {
        //   await venus.sendMessage(m.chat, { delete: m.key });
        //   await venus.sendMessage(m.chat, { text: `El mensaje contiene demasiados caracteres, será eliminado por protección`, mentions: [m.sender] }, { quoted: m });
        // }
      } catch (error) {
        console.error(error);
      }
    }

    if (/^\//.test(usedPrefix)) {
      if (command && typeof command.handled === "function") {
        if (command.flags.includes("isOwner") && !isOwner) {
          await venus.sendMessage(
            m.chat,
            { text: "Este comando solo puede ser ejecutado por mi dueño", mentions: [m.sender] },
            { quoted: m }
          );
          return;
        }
        if (command.flags.includes("isGroup") && !m.isGroup) {
          await venus.sendMessage(
            m.chat,
            { text: `El comando *${usedPrefix + usedCommand}* solo se puede ejecutar en grupos`, mentions: [m.sender] },
            { quoted: m }
          );
          return;
        }
        if (command.flags.includes("isAdmin") && !isAdmin) {
          await venus.sendMessage(
            m.chat,
            { text: `Necesitas ser admin para ejecutar el comando *${usedPrefix + usedCommand}*`, mentions: [m.sender] },
            { quoted: m }
          );
          return;
        }
        if (command.flags.includes("isVenusAdmin") && !isVenusAdmin) {
          await venus.sendMessage(
            m.chat,
            { text: `Necesito ser admin para ejecutar el comando *${usedPrefix + usedCommand}*`, mentions: [m.sender] },
            { quoted: m }
          );
          return;
        }
        try {
          await command.handled(venus, { m, groupMetadata, participants, venusNumber, isOwner, isAdmin, isVenusAdmin, text, args, usedPrefix, usedCommand, command });
        } catch (error) {
          await venus.sendMessage(m.chat, { text: String(error), mentions: [m.sender] }, { quoted: m });
        }
      } else {
        await venus.sendMessage(
          m.chat,
          { text: `El comando *${usedPrefix + usedCommand}* no existe`, mentions: [m.sender] },
          { quoted: m }
        );
      }
    }
  } catch (error) {
    console.error(error);
  }
}