"use client";

import React, { useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import { Spinner } from "flowbite-react";

export default function Dashboard() {
  const [message, setMessage] = useState<string>("");
  const [audioFile, setAudioFile] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  const { startRecording, stopRecording, status, mediaBlobUrl } = useReactMediaRecorder({
    audio: true,
    onStop: (blobUrl, blob) => {
      setAudioFile(blob);
      setIsRecording(false);
    },
  });

  const addMessage = (type: "user" | "kommander", content: string | Blob, isLoading: boolean = false) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        type,
        content,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isLoading,
      },
    ]);
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;

    addMessage("user", message);
    setMessage("");

    setIsLoading(true);
    addMessage("kommander", "", true);

    try {
      const response = await fetch("http://localhost:5000/new_message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_text: message, message_type: "text" }),
      });

      if (response.ok) {
        const result = await response.json();
        const responseText = result.createdMessage?.parameters?.response?.responseText || "Messaggio non disponibile";
        const availableVehicles = result.availableVehicles?.parameters?.response?.vehicles || [];

        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          const lastKommanderMessage = newMessages.find((msg) => msg.type === "kommander" && msg.isLoading);
          if (lastKommanderMessage) {
            lastKommanderMessage.content = responseText;
            lastKommanderMessage.isLoading = false;

          }
          return newMessages;
        });
      } else {
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          const lastKommanderMessage = newMessages.find((msg) => msg.type === "kommander" && msg.isLoading);
          if (lastKommanderMessage) {
            lastKommanderMessage.content = "Errore nella richiesta.";
            lastKommanderMessage.isLoading = false;
          }
          return newMessages;
        });
      }
    } catch (error) {
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        const lastKommanderMessage = newMessages.find((msg) => msg.type === "kommander" && msg.isLoading);
        if (lastKommanderMessage) {
          lastKommanderMessage.content = "Errore di rete o server.";
          lastKommanderMessage.isLoading = false;
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioSubmit = async () => {
    if (!audioFile) return;

    addMessage("user", audioFile);
    setAudioFile(null);

    setIsLoading(true);
    addMessage("kommander", "", true);

    try {
      const formData = new FormData();
      formData.append("audio", audioFile, "audioMessage.wav");

      const response = await fetch("http://localhost:5000/upload-audio", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const responseText = result.createdMessage?.parameters?.response?.responseText || "Messaggio non disponibile";

        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          const lastKommanderMessage = newMessages.find((msg) => msg.type === "kommander" && msg.isLoading);
          if (lastKommanderMessage) {
            lastKommanderMessage.content = responseText;
            lastKommanderMessage.isLoading = false;
          }
          return newMessages;
        });
      } else {
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          const lastKommanderMessage = newMessages.find((msg) => msg.type === "kommander" && msg.isLoading);
          if (lastKommanderMessage) {
            lastKommanderMessage.content = "Errore nella richiesta.";
            lastKommanderMessage.isLoading = false;
          }
          return newMessages;
        });
      }
    } catch (error) {
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        const lastKommanderMessage = newMessages.find((msg) => msg.type === "kommander" && msg.isLoading);
        if (lastKommanderMessage) {
          lastKommanderMessage.content = "Errore di rete o server.";
          lastKommanderMessage.isLoading = false;
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrophoneClick = () => {
    if (isRecording) {
      stopRecording();
      setIsRecording(false);
    } else {
      startRecording();
      setIsRecording(true);
    }
  };

  return (
    <div className="overflow-auto flex w-full h-screen justify-center items-center bg-gray-100">
      <div className="widget-custom rounded-lg shadow-lg bg-white">
        <div className="banner-custom-title flex items-center border-b border-gray-200 bg-gray-50 p-4">
          <h2 className="font-bold">Cosa vuoi fare oggi?</h2>
        </div>

        <div className="banner-custom-chat p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`w-full flex ${message.type === "user" ? "" : "justify-end"}`}
            >
              <div className={`banner-chat-${message.type} flex`}>
                <img
                  className="logo-kommander-chat"
                  src={message.type === "user" ? "./spiaggia-tramonto.png" : "./kommander-logo.png"}
                  alt={`${message.type}-icon`}
                />
                <div>
                  <div className="info-message-div">
                    <span className="font-bold type-user">
                      {message.type === "user" ? "User" : "Kommander.ai"}
                    </span>
                    <span className="hour-message">{message.time}</span>
                  </div>
                  {message.type === "user" && message.content instanceof Blob ? (
                    <div className="w-full max-w-md mb-2 pt-2">
                      <audio controls src={URL.createObjectURL(message.content)} />
                    </div>
                  ) : message.type === "kommander" && message.isLoading ? (
                    <div className="w-full max-w-md mb-2 pt-2">
                      <Spinner aria-label="Caricamento risposta" />
                    </div>
                  ) : (
                    <p className="message pt-1">{message.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="banner-custom-footer flex w-full items-center justify-between border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex w-full items-center text-area-div rounded-md border border-gray-300 p-2 bg-white">
            <textarea
              className="w-full text-area-custom outline-none resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Scrivi un messaggio..."
              disabled={isRecording}
            />
            <button
              className="btn-microphone ml-2 text-gray-600 hover:text-blue-500 focus:outline-none"
              onClick={handleMicrophoneClick}
            >
              {isRecording ? (
                <i className="fa-regular fa-circle-stop text-xl"></i>
              ) : (
                <i className="fa-solid fa-microphone text-xl"></i>
              )}
            </button>
          </div>

          <div className="flex flex-col buttons-div items-center w-full space-y-2">
            <button
              className="btn-send py-2 px-4 text-sm"
              onClick={handleTextSubmit}
              disabled={isRecording || !message}
            >
              <span><i className="fa-solid fa-envelope"></i></span>
            </button>

            <button
              className="btn-send py-2 px-4 text-sm"
              onClick={handleAudioSubmit}
              disabled={isRecording || !audioFile}
            >
              <span><i className="fa-solid fa-volume-high"></i></span>
            </button>
          </div>
        </div>
        <div>
          {audioFile && !isLoading && (
            <div className="w-full max-w-md mb-2 ml-2">
              <audio controls src={URL.createObjectURL(audioFile)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
