const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

const app = express();
const upload = multer();

const BOT_TOKEN = "7183860879:AAGr8i14JOPt6UZDTHwhTk-XeA-jOeXN51k";
const CHAT_ID = "887550513";

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("Файл не найден");

    const form = new FormData();
    form.append("chat_id", CHAT_ID);
    form.append("document", req.file.buffer, "photo.png");

    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, form, {
      headers: form.getHeaders(),
    });

    res.send("Файл отправлен!");
  } catch (error) {
    console.error("Ошибка при отправке в Telegram:", error);
    res.status(500).send("Ошибка сервера");
  }
});

app.listen(3001, () => console.log("Бот запущен на порту 3001"));
