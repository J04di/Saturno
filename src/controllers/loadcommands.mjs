import { promises as fs, watch } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsFolder = path.join(__dirname, "..", "commands");

export default class Commands {
    static commands = new Map();

    static async load() {
        try {
            const files = await fs.readdir(commandsFolder);
            if (files.length !== 0) {
                for (const file of files) {
                    try {
                        if (/\.m?js$/.test(file)) {
                            const command = await import(`${path.join(commandsFolder, file)}?update=${Date.now()}`);
                            const module = command.default || command;

                            if (!module || !module.handled) {
                                console.warn(`⚠️ [Advertencia] El comando "${file}" no exporta una función 'handled' válida`);
                                continue;
                            }

                            this.commands.set(file, module);
                        }
                    } catch (error) {
                        console.error(`❌ [Error al cargar el comando "${file}"]`);
                        console.error(`→ Tipo: ${error.name}`);
                        console.error(`→ Mensaje: ${error.message}`);
                        console.error(`→ Stack:\n${error.stack}`);
                    }
                }
                console.info(`✅ Se cargaron "${this.commands.size}" comandos exitosamente`);
            } else {
                console.warn("⚠️ No hay comandos para cargar actualmente");
            }
        } catch (error) {
            console.error("❌ Error al leer el directorio de comandos:");
            console.error(error);
        }
    }

    /**
     * Recarga un solo comando por nombre de archivo
     * @param {string} filename 
     */
    static async reload(filename) {
        try {
            if (/\.m?js$/.test(filename)) {
                const command = await import(`${path.join(commandsFolder, filename)}?update=${Date.now()}`);
                const module = command.default || command;

                if (!module || !module.handled) {
                    console.warn(`⚠️ [Advertencia] El comando "${filename}" no tiene 'handled'`);
                    return;
                }

                this.commands.set(filename, module);
                console.info(`🔁 Se recargó el comando "${filename}"`);
            }
        } catch (error) {
            console.error(`❌ [Error al recargar el comando "${filename}"]`);
            console.error(`→ Tipo: ${error.name}`);
            console.error(`→ Mensaje: ${error.message}`);
            console.error(`→ Stack:\n${error.stack}`);
        }
    }

    /**
     * Elimina un comando del registro interno
     * @param {string} filename 
     */
    static delete(filename) {
        if (this.commands.has(filename)) {
            this.commands.delete(filename);
            console.info(`🗑️ Se eliminó el comando "${filename}" del registro`);
        }
    }

    /**
     * Obtiene un comando por nombre
     * @param {string} command 
     * @returns {{
     *  commands: Array<string>,
     *  flags: Array<string>,
     *  handled: (venus: import("@whiskeysockets/baileys").WASocket, data: object) => Promise<void>
     * }}
     */
    static get(command) {
        return Array.from(this.commands.values()).find((data) => data.commands.includes(command));
    }

    /**
     * Observa la carpeta y recarga comandos automáticamente
     */
    static watch() {
        watch(commandsFolder, async (eventType, filename) => {
            if (/\.m?js$/.test(filename)) {
                switch (eventType) {
                    case "rename":
                        try {
                            await fs.access(path.join(commandsFolder, filename));
                            console.info(`📦 Nuevo comando o renombrado detectado: "${filename}"`);
                            await Commands.reload(filename);
                        } catch {
                            console.info(`🗑️ Comando eliminado: "${filename}"`);
                            Commands.delete(filename);
                        }
                        break;
                    case "change":
                        console.info(`🛠️ Comando modificado: "${filename}", recargando...`);
                        await Commands.reload(filename);
                        break;
                }
            }
        });

        console.info("👀 Observando carpeta de comandos para recarga en vivo...");
    }
}