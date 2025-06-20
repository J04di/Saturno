export default {
    commands: ["open", "close"],
    flags: ["isGroup", "isAdmin"],
    handled: async (venus, { m, usedCommand }) => {
        const shouldOpen = usedCommand === "open";
        await venus.groupSettingUpdate(m.chat, shouldOpen ? "not_announcement" : "announcement");
        await venus.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    }
}