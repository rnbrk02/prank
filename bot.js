const { Telegraf } = require("telegraf");
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const BOT_TOKEN = "7183860879:AAGr8i14JOPt6UZDTHwhTk-XeA-jOeXN51k";
const CHAT_ID = "887550513";

const bot = new Telegraf(BOT_TOKEN);
const app = express();
const upload = multer();

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("Файл не найден");
    }

    const fileType = req.file.mimetype.split("/")[1] || "bin"; // Определяем расширение
    const fileName = `file.${fileType}`; // Даем имя с расширением

    // Создаем form-data для корректной отправки
    const form = new FormData();
    form.append("chat_id", CHAT_ID);
    form.append("document", req.file.buffer, fileName);

    // Отправляем файл через Telegram API
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, form, {
      headers: form.getHeaders(),
    });

    res.send("Файл отправлен с расширением");
  } catch (error) {
    console.error("Ошибка при отправке файла:", error);
    res.status(500).send("Ошибка при отправке");
  }
});

bot.launch();
app.listen(3001, () => console.log("Bot server запущен на 3001"));
