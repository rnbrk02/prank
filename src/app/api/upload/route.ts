import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "Файл не получен" }, { status: 400 });

    const proxyFormData = new FormData();
    proxyFormData.append("file", file);

    // Отправляем файл на Railway-сервер, где работает бот
    const response = await fetch("https://prank-production.up.railway.app/api/upload", {
      method: "POST",
      body: proxyFormData,
    });

    if (!response.ok) throw new Error("Ошибка при отправке на сервер бота");

    return NextResponse.json({ message: "Фото отправлено через Railway!" });
  } catch (error) {
    console.error("Ошибка API:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}