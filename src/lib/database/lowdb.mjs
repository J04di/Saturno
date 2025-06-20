import { JSONFilePreset } from "lowdb/node";
import pc from "picocolors";

/* Inicializa la base de datos con campos vacíos si no existen */
const db = await JSONFilePreset("venus_db.json", {
  users: {},
  groups: {}
});

/* Asegura que los campos necesarios existan */
await db.read();
db.data ||= {};
db.data.users ||= {};
db.data.groups ||= {};
await db.write();

console.log(pc.green("✅ Base de datos cargada y verificada con éxito."));

/* Función para normalizar IDs (si quieres manejar por ID base sin sufijos) */
function normalizeId(id = '') {
  return id.replace(/(@g\.us|@s\.whatsapp\.net|@lid)$/i, '');
}

/* Obtener datos de un grupo, creando si no existe */
export function getOrCreateGroup(chatId) {
  if (!db.data.groups[chatId]) {
    db.data.groups[chatId] = {
      createdAt: Date.now(),
      settings: {}
    };
    console.log(pc.yellow(`📁 Nuevo grupo agregado a la base de datos: ${chatId}`));
    db.write();
  }
  return db.data.groups[chatId];
}

/* Obtener datos de un usuario, creando si no existe */
export function getOrCreateUser(userId) {
  if (!db.data.users[userId]) {
    db.data.users[userId] = {
      joinedAt: Date.now(),
      premium: false,
      points: 0
    };
    console.log(pc.yellow(`👤 Nuevo usuario agregado a la base de datos: ${userId}`));
    db.write();
  }
  return db.data.users[userId];
}

/* Exportar acceso directo a la DB por si se quiere acceder directamente */
export default db;