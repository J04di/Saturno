import { serialize } from "./serialize/message.mjs";
import { promises as fs } from "node:fs";
import ffmpeg from "fluent-ffmpeg";
import { fileTypeFromBuffer } from "file-type";
import webpmux from "node-webpmux";
import { PassThrough } from "node:stream";
import path from "node:path";
import { promisify } from "node:util";
import { exec } from "node:child_process";
/**
 * @param {ReturnType<typeof serialize>} m
 */
export function getBody(m) {
    switch (true) {
        case !!m.message.conversation:
            return m.message.conversation;
        case !!m.message.extendedTextMessage?.text:
            return m.message.extendedTextMessage.text;
        case !!m.message.imageMessage?.caption:
            return m.message.imageMessage.caption;
        case !!m.message.videoMessage?.caption:
            return m.message.videoMessage.caption;
        case !!m.message.documentMessage?.caption:
            return m.message.documentMessage.caption;
        case !!m.message.reactionMessage?.text:
            return m.message.reactionMessage.text;
        case !!m.message.locationMessage?.comment:
            return m.message.locationMessage.comment;
        case !!m.message.viewOnceMessage?.message?.imageMessage?.caption:
            return m.message.viewOnceMessage.message.imageMessage.caption;
        case !!m.message.viewOnceMessage?.message?.videoMessage?.caption:
            return m.message.viewOnceMessage.message.videoMessage.caption;
        case !!m.message.viewOnceMessageV2?.message?.imageMessage?.caption:
            return m.message.viewOnceMessageV2.message.imageMessage.caption;
        case !!m.message.viewOnceMessageV2?.message?.videoMessage?.caption:
            return m.message.viewOnceMessageV2.message.videoMessage.caption;
        default:
            return "";
    }
}

/**
 * @param {Buffer} buffer 
 * @returns {Promise<Buffer>}
 */
async function exif(buffer) {
    const tmp = path.join(".", "tmp", `${Date.now()}.webp`);
    try {
        if (!Buffer.isBuffer(buffer)) {
            throw `No se pudo procesar el archivo`
        }
        await fs.writeFile(tmp, buffer);
        const img = new webpmux.Image();
        await img.load(tmp);
        const jsonMetadata = {
            "sticker-pack-id": "saturno.bot",
            "sticker-pack-name": "Saturno-Bot 🪐",
            "sticker-pack-publisher": "Vs 1.0.0",
        };
        const exifAttr = Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
        const jsonBuffer = Buffer.from(JSON.stringify(jsonMetadata), "utf-8");
        const exifBuffer = Buffer.concat([exifAttr, jsonBuffer]);
        exifBuffer.writeUIntLE(jsonBuffer.length, 14, 4);
        await img.load(tmp);
        img.exif = exifBuffer;
        await img.save(tmp);
        const outputBuffer = await fs.readFile(tmp);
        await fs.rm(tmp, { force: true }).catch(() => void 0);
        return outputBuffer;
    } catch (err) {
        console.error(err);
        return buffer;
    } finally {
        await fs.rm(tmp, { force: true }).catch(() => void 0);
    }
}

/**
 * @param {Buffer} buffer 
 * @returns {Promise<Buffer>}
 */
export async function sticker(buffer) {
    if (!Buffer.isBuffer(buffer)) {
        throw `No se pudo procesar el archivo`
    }
    const { ext, mime } = await fileTypeFromBuffer(buffer);
    if (!ext || !mime) {
        throw `No se pudo obtener el mime del archivo`
    }
    if (!/^(image|video)/.test(mime)) {
        throw `El tipo de mime "${mime}" no es compatible`
    }
    let result = null;
    if (/\/webp$/.test(mime)) {
        result = await exif(buffer);
    } else {
        const webp = await new Promise((resolve, reject) => {
            const ffmpegStream = new PassThrough();
            const chunks = [];
            const options = ["-vcodec", "libwebp", "-vf", "scale='min(250,iw)':min'(250,ih)':force_original_aspect_ratio=decrease,fps=15,pad=250:250:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse"];
            if (/^video/.test(mime)) {
                options.push("-loop", "0", "-ss", "00:00:00", "-t", "00:00:07", "-preset", "default", "-an", "-vsync", "0");
            }
            const stream = new PassThrough();
            stream.push(buffer);
            stream.push(null);
            ffmpeg(stream)
                .toFormat("webp")
                .outputOptions(options)
                .on("error", (err) => reject(err))
                .pipe(ffmpegStream);
            ffmpegStream.on("data", (chunk) => chunks.push(chunk));
            ffmpegStream.on("end", () => resolve(Buffer.concat(chunks)));
            ffmpegStream.on("error", (err) => reject(err));
        });
        result = await exif(webp);
    }
    return result;
}

/**
 * @param {Buffer} gif 
 * @returns {Promise<Buffer>}
 */
export async function toMp4(gif) {
    if (!Buffer.isBuffer(gif)) {
        throw `No se pudo procesar el archivo`
    }
    const tmp = path.join(".", "tmp", `${Date.now()}`);
    const execSync = promisify(exec);
    try {
        await fs.writeFile(`${tmp}.gif`, gif);
        await execSync(`ffmpeg -f gif -i ${tmp}.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${tmp}.mp4`);
        return await fs.readFile(`${tmp}.mp4`);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        await Promise.all([
            fs.rm(`${tmp}.gif`, { force: true }).catch(() => void 0),
            fs.rm(`${tmp}.mp4`, { force: true }).catch(() => void 0),
        ]);
    }
}