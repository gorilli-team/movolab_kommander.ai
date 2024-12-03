"use client";

import React, { useState } from "react";
import { Banner, Button, Textarea } from "flowbite-react";
import AudioMessage from "./_components/AudioMessage";

export default function Home() {
  const [inputMethod, setInputMethod] = useState<"text" | "audio" | null>(null);
  const [message, setMessage] = useState<string>("");
  const [audioFile, setAudioFile] = useState<Blob | null>(null);

  const userId = "64b60e4c3c3a1b0f12345678";

  const handleIconClick = (method: "text" | "audio") => {
    setInputMethod(method);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputMethod === "text") {
      try {
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
        } else {
          console.error("Error while saving the message:", await response.json());
        }
      } catch (error) {
        console.error("Connection error:", error);
      }
    } else if (inputMethod === "audio" && audioFile) {
      console.log("Audio MIME type:", audioFile.type);
      const formData = new FormData();
      formData.append("audio", audioFile, "audioMessage.wav");

      try {
        const response = await fetch("http://localhost:5000/upload-audio", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Audio uploaded:", result);
        } else {
          console.error("Error while uploading the audio:", await response.json());
        }
      } catch (error) {
        console.error("Connection error:", error);
      }
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
      <div className="mt-4">
        {inputMethod === "text" && (
          <div className="flex flex-col items-center mt-4 w-full">
            <form
              className="flex flex-col gap-4 w-full max-w-md"
              onSubmit={handleSubmit}
            >
              <Textarea
                id="comment"
                placeholder="Scrivi qui la tua richiesta..."
                required
                rows={4}
                cols={50}
                className="p-4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="flex items-center justify-end">
                <Button type="submit" color="blue" className="w-1/2 button-submit-custom">
                  Vai
                </Button>
              </div>
            </form>
          </div>
        )}
        {inputMethod === "audio" && (
          <AudioMessage setAudioFile={setAudioFile} />
        )}
      </div>
    </div>
  );
}
