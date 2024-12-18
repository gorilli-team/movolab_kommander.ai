"use client";

import React, { useState, useEffect, useRef } from "react";
import { useReactMediaRecorder } from "react-media-recorder";

export default function Dashboard() {
  const [message, setMessage] = useState<string>("");
  const [audioFile, setAudioFile] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const [userMessages, setUserMessages] = useState<any[]>([]);
  const [kommanderMessages, setKommanderMessages] = useState<any[]>([]);

  const { startRecording, stopRecording, status, mediaBlobUrl } = useReactMediaRecorder({
    audio: true,
    onStop: (blobUrl, blob) => {
      setAudioFile(blob);
      setIsRecording(false);
    },
  });

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;

    setIsLoading(true);

    setUserMessages((prevMessages) => [
      ...prevMessages,
      { type: "user", content: message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);

    setMessage("");

    setTimeout(() => {
      setKommanderMessages((prevMessages) => [
        ...prevMessages,
        { type: "kommander", content: "Risposta automatica di Kommander", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
    }, 1000);

    setIsLoading(false);
  };

  const handleAudioSubmit = async () => {
    if (!audioFile) return;

    setIsLoading(true);

    setUserMessages((prevMessages) => [
      ...prevMessages,
      { type: "user", content: audioFile, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);

    setAudioFile(null);

    setTimeout(() => {
      setKommanderMessages((prevMessages) => [
        ...prevMessages,
        { type: "kommander", content: "Risposta automatica di Kommander", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
    }, 1000);

    setIsLoading(false);
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
          {userMessages.map((message, index) => (
            <div key={index} className="w-full">
              <div className="banner-chat-user flex">
                <img
                  className="logo-kommander-chat"
                  src={message.type === "user" ? "./spiaggia-tramonto.png" : "./kommander-logo.png"}
                  alt={`${message.type}-icon`}
                />
                <div>
                  <div className="info-message-div">
                    <span className="font-bold type-user">{message.type === "user" ? "User" : "Kommander.ai"}</span>
                    <span className="hour-message">{message.time}</span>
                  </div>
                  {message.type === "user" && typeof message.content === "string" ? (
                    <p className="message pt-1">{message.content}</p>
                  ) : message.type === "user" && message.content instanceof Blob ? (
                    <div className="w-full max-w-md mb-2 ml-2">
                      <audio controls src={URL.createObjectURL(message.content)} />
                    </div>
                  ) : (
                    <p className="message pt-1">{message.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {kommanderMessages.map((message, index) => (
            <div key={index} className="w-full flex justify-end">
              <div className="banner-chat-kommander flex">
                <img
                  className="logo-kommander-chat"
                  src="./kommander-logo.png"
                  alt="kommander-icon"
                />
                <div>
                  <div className="info-message-div">
                    <span className="font-bold type-user">Kommander.ai</span>
                    <span className="hour-message">{message.time}</span>
                  </div>
                  <p className="message pt-1">{message.content}</p>
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
              <span><i className="fa-solid fa-file-audio"></i></span>
            </button>
          </div>
        </div>

        {mediaBlobUrl && (
          <div className="w-full max-w-md mb-2 ml-2">
            <audio controls src={mediaBlobUrl} />
          </div>
        )}
      </div>
    </div>
  );
}
