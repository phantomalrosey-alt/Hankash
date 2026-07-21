const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
async function askAI(prompt) {
  try {
    const { data } = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      }
    );

    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "معرفتش أرد."
    );
  } catch (err) {
    console.log(err.response?.data || err.message);
    return "❌ حصل خطأ أثناء الاتصال بـ Gemini.";
  }
}

module.exports = { askAI };
