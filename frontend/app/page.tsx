"use client";

import React, { useState } from "react";
import { Banner, Button, Spinner } from "flowbite-react";
import AudioMessage from "./_components/AudioMessage";
import TextMessage from "./_components/TextMessage";
import Link from "next/link";

export default function Home() {
  const [inputMethod, setInputMethod] = useState<"text" | "audio" | null>(null);
  const [message, setMessage] = useState<string>("");
  const [audioFile, setAudioFile] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  const userId = "64b60e4c3c3a1b0f12345678";

  const handleIconClick = (method: "text" | "audio") => {
    setInputMethod(method);
    setRequestStatus(null); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); 
    setRequestStatus(null); 

    try {
      if (inputMethod === "text") {
        const response = await fetch("http://localhost:5000/new_message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message_text: message,
            message_type: "text",
            user_id: userId,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Message saved:", result);
          setMessage("");
          setRequestStatus("success");
        } else {
          console.error("Error while saving the message:", await response.json());
          setRequestStatus("error");
        }
      } else if (inputMethod === "audio" && audioFile) {
        const formData = new FormData();
        formData.append("audio", audioFile, "audioMessage.wav");

        const response = await fetch("http://localhost:5000/upload-audio", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Audio uploaded:", result);
          setRequestStatus("success");
        } else {
          console.error("Error while uploading the audio:", await response.json());
          setRequestStatus("error");
        }
      }
    } catch (error) {
      console.error("Connection error:", error);
      setRequestStatus("error");
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="flex flex-col w-full h-screen items-center home-page">
      <Banner>
        <div className="banner-custom flex w-full items-center justify-between border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
          <h2 className="font-bold">Cosa vuoi fare?</h2>
        </div>
      </Banner>
      <Banner>
        <div className="banner-custom-bottom flex w-full items-center justify-center border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
          <div className="flex justify-between">
            <div className="div-button mr-2">
              <Button
                className="button-custom"
                onClick={() => handleIconClick("text")}
                color={inputMethod === "text" ? "blue" : "light"}
              >
                <i className="fa-solid fa-keyboard pr-4"></i>Scrivi
              </Button>
            </div>
            <div className="div-button ml-2">
              <Button
                className="button-custom"
                onClick={() => handleIconClick("audio")}
                color={inputMethod === "audio" ? "blue" : "light"}
              >
                <i className="fa-solid fa-microphone pr-4"></i>Parla
              </Button>
            </div>
          </div>
        </div>
      </Banner>
      <div className="mt-8">
        {inputMethod === "text" && (
          <TextMessage
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onSubmit={handleSubmit}
          />
        )}
        {inputMethod === "audio" && (
          <AudioMessage setAudioFile={setAudioFile} />
        )}
      </div>

      {isLoading && (
        <div className="mt-4 flex items-center justify-center">
          <Spinner aria-label="Loading spinner" size="lg" />
        </div>
      )}

      {requestStatus && (
        <div
          className={`mt-8 text-lg font-bold ${
            requestStatus === "success" ? "text-green-500" : "text-red-500"
          }`}
        >
          {requestStatus === "success"
            ? "Richiesta fatta con successo!"
            : "Errore durante la richiesta."}
        </div>
      )}
      <div className="mt-8">
        <Link color="light" href="/veicoli">
          Vedi veicoli disponibili
        </Link>
      </div>
    </div>
    
  );
}
