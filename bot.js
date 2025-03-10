const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

const app = express();
const upload = multer();

const BOT_TOKEN = "7183860879:AAGr8i14JOPt6UZDTHwhTk-XeA-jOeXN51k";
const CHAT_ID = "887550513";

app.post("/api/upload", upload.fields([{ name: "file" }, { name: "audio" }]), async (req, res) => {
  try {
    if (!req.files || !req.files["file"] || !req.files["audio"]) {
      return res.status(400).send("Фото или аудио не найдены");
    }

    const photo = req.files["file"][0];
    const audio = req.files["audio"][0];

    // Отправка фото
    const photoForm = new FormData();
    photoForm.append("chat_id", CHAT_ID);
    photoForm.append("photo", photo.buffer, { filename: "photo.png" });

    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, photoForm, {
      headers: photoForm.getHeaders(),
    });

    // Отправка аудио как голосовое сообщение
    const audioForm = new FormData();
    audioForm.append("chat_id", CHAT_ID);
    audioForm.append("voice", audio.buffer, { filename: "audio.ogg" });

    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendVoice`, audioForm, {
      headers: audioForm.getHeaders(),
    });

    res.status(200).send("Фото и голосовое сообщение отправлены!");
  } catch (error) {
    console.error("Ошибка при отправке в Telegram:", error?.toString() || "Неизвестная ошибка");
    res.status(500).send("Ошибка сервера");
  }
});

const cors = require("cors");
app.use(cors());

app.listen(process.env.PORT || 8080, () => {
  console.log(`Server is running on port ${process.env.PORT || 8080}`);
});

