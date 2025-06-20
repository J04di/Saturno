import { execSync } from 'child_process'

export default {
  commands: ['install'],
  flags: ['isGroup'], // Solo en grupos
  handled: async (venus, { m, args, participants }) => {
    const jid = m.sender
    const admins = participants.filter(p => p.admin).map(p => p.id)

    if (!admins.includes(jid)) {
      return venus.sendMessage(m.chat, {
        text: '🚫 Solo los administradores del grupo pueden usar este comando.'
      }, { quoted: m })
    }

    const gestor = args[0] // 'npm' o 'pip'
    const paquete = args[1]

    if (!gestor || !paquete || !['npm', 'pip'].includes(gestor)) {
      return venus.sendMessage(m.chat, {
        text: `❌ Uso incorrecto del comando.

📦 Usa uno de estos formatos:
- /install npm axios
- /install pip yt-dlp`
      }, { quoted: m })
    }

    await venus.sendMessage(m.chat, {
      text: `📥 Instalando *${paquete}* con *${gestor}*...`
    }, { quoted: m })

    try {
      let resultado = ''
      if (gestor === 'npm') {
        resultado = execSync(`npm install ${paquete}`, { encoding: 'utf-8' })
      } else {
        resultado = execSync(`pip install ${paquete}`, { encoding: 'utf-8' })
      }

      await venus.sendMessage(m.chat, {
        text: `✅ Paquete *${paquete}* instalado correctamente con *${gestor}*.\n\n📝 Resultado:\n${resultado.slice(0, 1900)}...`
      }, { quoted: m })

    } catch (err) {
      await venus.sendMessage(m.chat, {
        text: `❌ Error al instalar *${paquete}* con *${gestor}*:\n\n${err.message}`
      }, { quoted: m })
    }
  }
}