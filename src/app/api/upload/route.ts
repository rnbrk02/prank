import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import axios from "axios";

const BOT_TOKEN = "7183860879:AAGr8i14JOPt6UZDTHwhTk-XeA-jOeXN51k";
const CHAT_ID = "887550513";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as Blob;

  if (!file) {
    return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
  }

  // Сохранение файла
  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(process.cwd(), "public", "upload_" + Date.now());
  await writeFile(filePath, buffer);

  // Отправка в Telegram
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`;
  const form = new FormData();
  form.append("chat_id", CHAT_ID);
  form.append("document", new Blob([buffer]), "file");

  await axios.post(url, form);

  return NextResponse.json({ success: true });
}