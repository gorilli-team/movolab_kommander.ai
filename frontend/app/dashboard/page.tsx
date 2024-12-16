"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Banner, Button, Spinner } from "flowbite-react";
import TextMessage from "../_components/TextMessage";

import { useRouter } from "next/navigation";

const AudioMessage = dynamic(() => import("../_components/AudioMessage"), {
  ssr: false,
});

export default function Dashboard() {
  const [inputMethod, setInputMethod] = useState<"text" | "audio" | null>(null);
  const [message, setMessage] = useState<string>("");
  const [audioFile, setAudioFile] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    console.log("User ID from localStorage:", storedUserId);
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      console.error("ID utente non trovato, reindirizzamento al login");
      router.push("/login");
    }
  }, [router]);

  const handleIconClick = (method: "text" | "audio") => {
    setInputMethod(method);
    setRequestStatus(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRequestStatus(null);

    console.log("User ID on submit:", userId); 

    try {
      let response;
      if (inputMethod === "text") {
        response = await fetch("http://localhost:5000/new_message", {
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
      } else if (inputMethod === "audio" && audioFile) {
        const formData = new FormData();
        formData.append("audio", audioFile, "audioMessage.wav");
        formData.append("user_id", userId ?? ""); 

        response = await fetch("http://localhost:5000/upload-audio", {
          method: "POST",
          body: formData,
        });
      }

      if (response?.ok) {
        const result = await response.json();
        const availableVehicles = result?.availableVehicles?.result || [];
        setVehicles(Array.isArray(availableVehicles) ? availableVehicles : []);
        availableVehicles.forEach((vehicle: any) => {
          console.log("Targa del veicolo:", vehicle.plate);
        });

        setRequestStatus("success");
      } else {
        console.error("Error in response:", await response?.json());
        setRequestStatus("error");
      }
    } catch (error) {
      console.error("Connection error:", error);
      setRequestStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.push("/");
  };

  return (
    <div className="overflow-auto flex flex-col w-full h-screen items-center page-custom">
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
        <div className="mt-6 flex items-center justify-center">
          <Spinner color="info" aria-label="Loading spinner" size="lg" />
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
      <div className="flex w-full h-screen justify-end items-end p-2">
        <Button className="mt-6" onClick={handleGoBack}>
          <i className="fa-solid fa-arrow-left"></i>
        </Button>
      </div>
    </div>
  );
}
