import axios from "axios";
import { toMp4 } from "../lib/tools.mjs";
export default {
    commands: ["kill"],
    flags: ["isGroup"],
    handled: async (venus, { m }) => {
        const mentionedJid = m.mentionedJid[0] || m.quoted?.sender || null;
        if (!mentionedJid) {
            await venus.sendMessage(m.chat, { text: "Eiqueta o menciona a un usuario", mentions: [m.sender] }, { quoted: m });
            return;
        }
        const { data } = await axios.get("https://api.waifu.pics/sfw/kill");
        if (!data || !data.url) {
            await venus.sendMessage(m.chat, { text: "Ocurrió un error", mentions: [m.sender] }, { quoted: m });
            return;
        }
        const { data: buffer } = await axios.get(data.url, {
            responseType: "arraybuffer",
        });
        const result = await toMp4(Buffer.from(buffer));
        if (!Buffer.isBuffer(result)) {
            await venus.sendMessage(m.chat, { text: "Ocurrió un error", mentions: [m.sender] }, { quoted: m });
            return;
        }
        await venus.sendMessage(m.chat, { video: result, mimetype: "video/mp4", gifPlayback: true, caption: `@${m.sender.split("@")[0]} mató a @${mentionedJid.split("@")[0]}`, mentions: [m.sender, mentionedJid] }, { quoted: m });
    }
}