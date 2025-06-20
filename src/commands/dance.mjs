import axios from "axios";
import { toMp4 } from "../lib/tools.mjs";
export default {
    commands: ["dance"],
    flags: ["isGroup"],
    handled: async (venus, { m }) => {
        const mentionedJid = m.mentionedJid[0] || m.quoted?.sender || m.sender;
        const { data } = await axios.get("https://api.waifu.pics/sfw/dance");
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
        await venus.sendMessage(m.chat, { video: result, mimetype: "video/mp4", gifPlayback: true, caption: `@${m.sender.split("@")[0]} está bailando ${mentionedJid !== m.sender ? `con @${mentionedJid.split("@")[0]}` : ""}`, mentions: [m.sender, mentionedJid] }, { quoted: m });
    }
}