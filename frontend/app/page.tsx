"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Button, Spinner } from "flowbite-react";
import TextMessage from "./_components/TextMessage";

// Caricamento dinamico del componente AudioMessage (non server-side renderizzato)
const AudioMessage = dynamic(() => import("./_components/AudioMessage"), {
  ssr: false,
});

export default function Dashboard() {
  const [inputMethod, setInputMethod] = useState<"text" | "audio" | null>(null);
  const [message, setMessage] = useState<string>("");
  const [audioFile, setAudioFile] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  // Funzione per inviare un messaggio di testo
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;
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

  // Funzione per inviare un messaggio audio
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

  return (
    <div className="flex flex-col w-full h-screen items-center page-custom">
      <div className="widget-custom rounded-lg shadow-lg bg-white w-full max-w-md">

        {/* Titolo */}
        <div className="banner-custom-title flex items-center border-b border-gray-200 bg-gray-50 p-4">
          <h2 className="font-bold">Cosa vuoi fare oggi?</h2>
        </div>

        {/* Componente per messaggi di testo */}
        {inputMethod === "text" && (
          <div className="banner-custom-chat p-4 space-y-6">
            <TextMessage
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onSubmit={handleTextSubmit}
            />
          </div>
        )}

        {/* Componente per messaggi audio */}
        {inputMethod === "audio" && (
          <div className="banner-custom-chat p-4 space-y-6">
            <AudioMessage
              onAudioReady={(blob) => setAudioFile(blob)} // Imposta il file audio quando è pronto
            />
            {/* Se il file audio è pronto, aggiungi un pulsante per inviarlo */}
            {audioFile && (
              <div className="mt-4 flex justify-center">
                <Button onClick={handleAudioSubmit} color="gray" disabled={isLoading}>
                  Invia Audio
                </Button>
              </div>
            )}
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

        {/* Footer per l'input dell'utente */}
        <div className="banner-custom-footer flex w-full items-center justify-between border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex w-full items-center rounded-md border border-gray-300 p-2 bg-white mb-2">
            <input
              className="w-full outline-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Scrivi un messaggio..."
              disabled={inputMethod === "audio"} // Disabilita l'input di testo durante la registrazione audio
            />
            <button
              className="btn-microphone ml-2 text-gray-600 hover:text-blue-500 focus:outline-none"
              onClick={() => setInputMethod(inputMethod === "audio" ? null : "audio")}
            >
              <i className="fa-solid fa-microphone text-xl"></i>
            </button>
          </div>

          <div className="flex banner-buttons">
            <button
              className="btn-send"
              onClick={inputMethod === "audio" ? handleAudioSubmit : handleTextSubmit}
              disabled={inputMethod === "audio" ? !audioFile : !message}
            >
              {inputMethod === "audio" ? "Invia Audio" : "Invia Messaggio"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
