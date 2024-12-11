"use client";

import React, { useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import { Button, Spinner } from "flowbite-react";

interface AudioMessageProps {
  setAudioFile: React.Dispatch<React.SetStateAction<Blob | null>>;
}

const AudioMessage: React.FC<AudioMessageProps> = ({ setAudioFile }) => {
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [showRecorder, setShowRecorder] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({
    audio: true,
    onStop: (blobUrl, blob) => {
      setRecordedBlob(blob);
      setAudioFile(blob); 
      setShowRecorder(false);
    },
  });

  const handleSubmitAudio = async () => {
    if (!recordedBlob) return;
    setIsLoading(true);
    setRequestStatus(null);

    const formData = new FormData();
    formData.append("audio", recordedBlob, "audioMessage.wav");

    try {
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
    } catch (error) {
      console.error("Connection error:", error);
      setRequestStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setRecordedBlob(null);
    setShowRecorder(true);
    setRequestStatus(null);
  };

  return (
    <div className="flex flex-col items-center">
      {showRecorder && (
        <>
          <div className="mt-4">
            {status === "recording" ? (
              <Button color="warning" onClick={stopRecording}>
                Stop
              </Button>
            ) : (
              <Button color="success" onClick={startRecording}>
                Registra
              </Button>
            )}
          </div>
        </>
      )}

      {recordedBlob && (
        <div className="mt-4 flex flex-col items-center">
          <audio controls src={mediaBlobUrl || URL.createObjectURL(recordedBlob)} />
          <div className="mt-4 flex space-x-4">
            <Button onClick={handleSubmitAudio} color="gray" disabled={isLoading}>
              Vai
            </Button>
            <Button onClick={handleRetry} color="light" disabled={isLoading}>
              Registra ancora
            </Button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="mt-4">
          <Spinner color="info" aria-label="Loading spinner" size="lg" />
        </div>
      )}

      {requestStatus && (
        <div
          className={`mt-4 text-lg font-bold ${
            requestStatus === "success" ? "text-green-500" : "text-red-500"
          }`}
        >
          {requestStatus === "success"
            ? "Richiesta fatta con successo!"
            : "Errore durante il caricamento."}
        </div>
      )}
    </div>
  );
};

export default AudioMessage;
