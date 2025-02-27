import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file"); // Фото
    const audio = formData.get("audio"); // Аудио

    if (!(file instanceof File) || !(audio instanceof File)) {
      return NextResponse.json({ error: "Файл или аудио не получены" }, { status: 400 });
    }

    const proxyFormData = new FormData();
    proxyFormData.append("file", file);
    proxyFormData.append("audio", audio);

    const response = await fetch("https://prank-production.up.railway.app/api/upload", {
      method: "POST",
      body: proxyFormData,
    });

    if (!response.ok) {
      throw new Error(`Ошибка при отправке на сервер бота: ${response.statusText}`);
    }

    return NextResponse.json({ message: "Фото и аудио отправлены через Railway!" });
  } catch (error) {
    console.error("Ошибка API:", error?.toString() || "Неизвестная ошибка");
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
