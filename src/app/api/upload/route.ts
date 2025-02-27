import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    // Проверяем, является ли file объектом File
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Файл не получен или некорректен" }, { status: 400 });
    }

    const proxyFormData = new FormData();
    proxyFormData.append("file", file);

    // Отправляем файл на Railway-сервер
    const response = await fetch("https://prank-production.up.railway.app/api/upload", {
      method: "POST",
      body: proxyFormData, // fetch сам выставит нужные заголовки
    });

    if (!response.ok) {
      throw new Error(`Ошибка при отправке на сервер бота: ${response.statusText}`);
    }

    return NextResponse.json({ message: "Фото отправлено через Railway!" });
  } catch (error) {
    console.error("Ошибка API:", error?.toString() || "Неизвестная ошибка");
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}