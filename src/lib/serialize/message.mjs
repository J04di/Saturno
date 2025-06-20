import { jidNormalizedUser } from "@whiskeysockets/baileys";
/**
 * @param {import("@whiskeysockets/baileys").WASocket} venus 
 * @param {import("@whiskeysockets/baileys").proto.IWebMessageInfo} msg 
 */
export function serialize(venus, msg) {
    try {
        if (!msg.message) {
            return null;
        }
        /**
         * @type {{
         * message: import("@whiskeysockets/baileys").proto.IMessage,
         * key: import("@whiskeysockets/baileys").proto.IMessageKey,
         * chat: string,
         * sender: string,
         * isGroup: boolean,
         * pushName: string,
         * type: keyof import("@whiskeysockets/baileys").proto.Message,
         * mentionedJid: Array<string>,
         * mimetype: string,
         * quoted: {
         * message: import("@whiskeysockets/baileys").proto.IMessage,
         * key: import("@whiskeysockets/baileys").proto.IMessageKey,
         * sender: string,
         * mimetype: string
         * } | null,
         * }}
         */
        const m = {};
        m.message = msg.message;
        m.key = msg.key;
        m.chat = msg.key.remoteJid;
        m.sender = m.key.fromMe ? jidNormalizedUser(venus.user.id) : m.key.participant || m.key.remoteJid;
        m.isGroup = /@g\.us$/.test(m.chat);
        m.pushName = msg.pushName || msg.verifiedBizName || "A stranger";
        m.type = Object.keys((m.message)).find((type) => type !== "senderKeyDistributionMessage" && type !== "messageContextInfo");
        /**
         * @type {import("@whiskeysockets/baileys").proto.ContextInfo}
         */
        const contextInfo = m.message[m.type]?.contextInfo;
        const quotedMessage = contextInfo?.quotedMessage;
        m.mentionedJid = contextInfo?.mentionedJid || [];
        m.mimetype = "";
        m.quoted = null;
        if (quotedMessage) {
            m.quoted = {
                message: quotedMessage,
                key: {
                    remoteJid: contextInfo.remoteJid || m.chat || m.sender,
                    participant: contextInfo.participant,
                    fromMe: contextInfo.participant === jidNormalizedUser(venus.user.id),
                    id: contextInfo.stanzaId
                },
                sender: contextInfo.participant,
                mimetype: ""

            }
        }
        if (!!m.message?.imageMessage) {
            m.mimetype = m.message.imageMessage.mimetype;
        } else if (!!m.message?.videoMessage) {
            m.mimetype = m.message.videoMessage.mimetype;
        } else if (m.message?.documentMessage) {
            m.mimetype = m.message.documentMessage.mimetype;
        } else if (!!m.message?.viewOnceMessage?.message?.imageMessage) {
            m.mimetype = m.message.viewOnceMessage.message.imageMessage.mimetype;
        } else if (!!m.message?.viewOnceMessage?.message?.videoMessage) {
            m.mimetype = m.message.viewOnceMessage.message.videoMessage.mimetype;
        } else if (!!m.message?.viewOnceMessageV2?.message?.imageMessage) {
            m.mimetype = m.message.viewOnceMessageV2.message.imageMessage.mimetype;
        } else if (m.message?.viewOnceMessageV2?.message?.videoMessage) {
            m.mimetype = m.message.viewOnceMessageV2.message.videoMessage.mimetype;
        }
        if (quotedMessage) {
            if (!!quotedMessage.conversation) {
                m.quoted.mimetype = "text/plain";
            } else if (!!quotedMessage.extendedTextMessage) {
                m.quoted.mimetype = "text/plain";
            } else if (!!quotedMessage.viewOnceMessageV2?.message?.imageMessage) {
                m.quoted.mimetype = quotedMessage.viewOnceMessageV2.message.imageMessage.mimetype;
            } else if (quotedMessage?.viewOnceMessageV2?.message?.videoMessage) {
                m.quoted.mimetype = quotedMessage.viewOnceMessageV2.message.videoMessage.mimetype;
            } else if (quotedMessage?.viewOnceMessageV2Extension?.message?.audioMessage) {
                m.quoted.mimetype = quotedMessage.viewOnceMessageV2Extension.message.audioMessage.mimetype;
            } else if (quotedMessage?.imageMessage) {
                m.quoted.mimetype = quotedMessage.imageMessage.mimetype;
            } else if (quotedMessage?.videoMessage) {
                m.quoted.mimetype = quotedMessage.videoMessage.mimetype;
            } else if (quotedMessage?.documentMessage) {
                m.quoted.mimetype = quotedMessage.documentMessage.mimetype;
            } else if (quotedMessage?.documentWithCaptionMessage?.message?.documentMessage) {
                m.quoted.mimetype = quotedMessage.documentWithCaptionMessage.message.documentMessage.mimetype;
            } else if (quotedMessage?.audioMessage) {
                m.quoted.mimetype = quotedMessage.audioMessage.mimetype;
            } else if (quotedMessage?.stickerMessage) {
                m.quoted.mimetype = quotedMessage.stickerMessage.mimetype;
            }
        }
        return m;
    } catch (error) {
        console.error(error);
        return null;
    }
}