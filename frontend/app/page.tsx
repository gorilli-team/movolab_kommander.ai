"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Banner, Button, Spinner } from "flowbite-react";
import TextMessage from "./_components/TextMessage";

const AudioMessage = dynamic(() => import("./_components/AudioMessage"), {
  ssr: false,
});

export default function Dashboard() {
  const [inputMethod, setInputMethod] = useState<"text" | "audio" | null>(null);
  const [message, setMessage] = useState<string>("");
  const [audioFile, setAudioFile] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  const handleIconClick = (method: "text" | "audio") => {
    setInputMethod(method);
    setRequestStatus(null);
  };

  const handleAudioSubmit = async () => {
    if (!audioFile) return;
    setIsLoading(true);
    setRequestStatus(null);

    try {
      const formData = new FormData();
      formData.append("audio", audioFile, "audioMessage.wav");

      const response = await fetch("http://localhost:5000/upload-audio", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setRequestStatus("success");
      } else {
        setRequestStatus("error");
      }
    } catch (error) {
      setRequestStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRequestStatus(null);

    try {
      const response = await fetch("http://localhost:5000/new_message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_text: message, message_type: "text" }),
      });

      if (response.ok) {
        const result = await response.json();
        setRequestStatus("success");
      } else {
        setRequestStatus("error");
      }
    } catch (error) {
      setRequestStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-screen items-center page-custom">
      <Banner>
        <h2 className="font-bold">Cosa vuoi fare?</h2>
      </Banner>

      {/* Pulsanti per selezionare il metodo */}
      {!inputMethod && (
        <div className="flex gap-4 mt-4">
          <Button color="blue" onClick={() => handleIconClick("text")}>
            Inserisci Testo
          </Button>
          <Button color="green" onClick={() => handleIconClick("audio")}>
            Registra Audio
          </Button>
        </div>
      )}

      {/* Componente per messaggi di testo */}
      {inputMethod === "text" && (
        <TextMessage
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onSubmit={handleTextSubmit}
        />
      )}

      {/* Componente per messaggi audio */}
      {inputMethod === "audio" && (
        <AudioMessage
          onAudioReady={(blob) => {
            setAudioFile(blob);
          }}
        />
      )}

      {/* Visualizza il file audio se presente */}
      {audioFile && inputMethod === "audio" && (
        <div className="mt-4 flex flex-col items-center">
          <audio controls src={URL.createObjectURL(audioFile)} />
          <Button onClick={handleAudioSubmit} color="gray" disabled={isLoading}>
            Invia Audio
          </Button>
        </div>
      )}

      {/* Stato di caricamento */}
      {isLoading && <Spinner />}

      {/* Messaggio di stato della richiesta */}
      {requestStatus && (
        <div>
          {requestStatus === "success" ? "Richiesta completata con successo!" : "Errore nella richiesta."}
        </div>
      )}
    </div>
  );
}
