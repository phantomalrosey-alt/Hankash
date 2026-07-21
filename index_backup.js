const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const P = require("pino");
const qrcode = require("qrcode-terminal");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {
    if (qr) {
      qrcode.generate(qr, { small: true });
      console.log("📱 امسح QR");
    }

    if (connection === "open") {
      console.log("✅ حنكش اشتغل");
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        startBot();
      } else {
        console.log("❌ تم تسجيل الخروج");
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg) return;
    if (msg.key.fromMe) return;
    if (!msg.message) return;

    const text = (
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ""
    ).trim();

    const jid = msg.key.remoteJid;

    console.log("نوع الرسالة:", msg.key.remoteJid);
    console.log("المحادثة:", jid.endsWith("@g.us") ? "جروب" : "خاص");
    console.log("JID:", jid);
    console.log("FromMe:", msg.key.fromMe);
    console.log("📩", JSON.stringify(msg.message, null, 2));
    console.log("النص:", text);

if (text.toLowerCase().trim() === "سلام" && !jid.endsWith("@g.us")) {
      console.log("دخل الشرط");

      try {
        await sock.sendMessage(jid, {
          text: "وعليكم السلام 🌹 أنا حنكش."
        });

        console.log("✅ تم إرسال الرسالة");

      } catch (err) {
        console.log("❌ خطأ في الإرسال:");
        console.log(err);
      }

    } else if (text === "منيو") {

      await sock.sendMessage(jid, {
        text: `🤖 *حنكش*

الأوامر الحالية:

• سلام
• منيو
• نكت
• نصائح
• معلومات
• الغز
• وقت

وقريباً:
🎵 أغاني
🧠 ذكاء اصطناعي
🖼️ تحليل الصور
🌦️ الطقس
⏰ التذكيرات
🎮 الألعاب`
      });

    } else if (text === "نكت") {

      await sock.sendMessage(jid, {
        text: "😂 مرة واحد راح للدكتور قاله كل ما أشرب شاي بيوجعني عيني... قاله شيل المعلقة من الكوباية."
      });

    } else if (text === "نصائح") {

      await sock.sendMessage(jid, {
        text: "💡 لا تؤجل عمل اليوم إلى الغد."
      });

    } else if (text === "معلومات") {

      await sock.sendMessage(jid, {
        text: "🌍 هل تعلم؟ قلب الأخطبوط له 3 قلوب."
      });

    } else if (text === "الغز") {

      await sock.sendMessage(jid, {
        text: "❓ ما هو الشيء الذي له أسنان ولا يعض؟\n\nالإجابة: المشط."
      });

    } else if (text === "وقت") {

      await sock.sendMessage(jid, {
        text: "🕒 " + new Date().toLocaleString("ar-EG")
      });

    }

  });

}

startBot();
