export default {
  commands: ["simp", "pareja", "matchhot"],
  flags: ["isGroup"],
  handled: async (venus, { m }) => {
    const mentioned = m.mentionedJid;

    if (mentioned.length === 0) {
      return await venus.sendMessage(m.chat, {
        text: "😏 Menciona al menos a una persona para calcular el *SIMPómetro*"
      }, { quoted: m });
    }

    const user1 = mentioned[0];
    const user2 = mentioned[1] || m.sender;

    const name1 = user1.split("@")[0];
    const name2 = user2.split("@")[0];

    const percent = Math.floor(Math.random() * 101);

    const frasesBajas = [
      "😐 Apenas se hablan... ni para amigos con derechos llegan.",
      "🧊 Más fríos que un iceberg en el Ártico.",
      "🙄 Uno de los dos ni sabe que el otro existe.",
      "🚫 Esto no es amor ni lujuria… es indiferencia pura.",
      "📵 Necesitan Wi-Fi emocional, porque no hay conexión."
    ];

    const frasesMedias = [
      "😏 Hay tensión... pero nadie se lanza.",
      "👀 Se gustan, pero se hacen los difíciles.",
      "💬 Algún día uno de los dos romperá el hielo (ojalá).",
      "🫣 Se mandan memes, pero los fueguitos están guardados.",
      "🤔 Hay algo... pero no lo suficiente aún."
    ];

    const frasesAltas = [
      "🔥 Esta pareja tiene más química que un laboratorio clandestino.",
      "💋 Si se besan, el grupo explota de calor.",
      "👀 Uno quiere, el otro también... ¡ya declárense!",
      "💦 Cuidado, que con ese porcentaje alguien va a terminar sin ropa.",
      "🛏️ Esto termina en... abrazos intensos (o algo más)."
    ];

    const frasesExtremas = [
      "🥵 Eso no es amor... ¡es lujuria pura!",
      "📸 Ya quiero ver su OnlyFans juntos.",
      "🫦 Mucho simp, poco acción... ¡manos a la obra!",
      "💌 Háganse un dúo en TikTok... pero versión +18 😏",
      "🍑 Esa pareja da miedo... de lo buena que sería en la cama."
    ];

    const frases = percent <= 20 ? frasesBajas
                  : percent <= 60 ? frasesMedias
                  : percent <= 85 ? frasesAltas
                  : frasesExtremas;

    const fraseFinal = frases[Math.floor(Math.random() * frases.length)];

    const barras = [
      "Cargando el SIMPómetro... ▒▒▒▒▒▒▒▒▒▒ 0%",
      "Cargando el SIMPómetro... █▒▒▒▒▒▒▒▒▒ 10%",
      "Cargando el SIMPómetro... ██▒▒▒▒▒▒▒▒ 25%",
      "Cargando el SIMPómetro... █████▒▒▒▒▒ 50%",
      "Cargando el SIMPómetro... ███████▒▒▒ 75%",
      "Cargando el SIMPómetro... ██████████ 100%"
    ];

    // Enviar el primer mensaje de carga
    let msg = await venus.sendMessage(m.chat, {
      text: barras[0],
      mentions: [user1, user2]
    }, { quoted: m });

    // Editar ese mismo mensaje simulando la animación
    for (let i = 1; i < barras.length; i++) {
      await new Promise(res => setTimeout(res, 700));
      await venus.sendMessage(m.chat, {
        text: barras[i],
        edit: msg.key,
        mentions: [user1, user2]
      });
    }

    await new Promise(res => setTimeout(res, 800));

    // Finalmente editar para mostrar resultado final
    await venus.sendMessage(m.chat, {
      text: `🔞 *Resultado del SIMPómetro* 🔥\n\n💘 Entre @${name1} y @${name2} hay un *${percent}%* de deseo carnal 😏\n\n${fraseFinal}`,
      edit: msg.key,
      mentions: [user1, user2]
    }, { quoted: m });
  }
};