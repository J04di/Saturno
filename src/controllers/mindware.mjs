import db from "./lib/database/lowdb.mjs";

export async function verificarModoSilencio(m) {
  await db.read();
  const chatId = m.chat;
  const senderId = m.sender;

  db.data.chats ||= {};
  const chatData = db.data.chats[chatId] || {};

  // Si está en modo silencio y el usuario no es owner/admin, ignorar comando
  if (chatData.modo === "silencio") {
    const isOwner = owners.includes(senderId);
    const isAdmin = m.isGroup && m.isGroupAdmin;

    if (!isOwner && !isAdmin) {
      return true; // Ignorar el comando
    }
  }

  return false; // Permitir el comando
}