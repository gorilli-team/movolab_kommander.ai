"use client";

import React, { useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import { Button } from "flowbite-react";

interface AudioMessageProps {
  onAudioReady: (audioBlob: Blob) => void; 
}

const AudioMessage: React.FC<AudioMessageProps> = ({ onAudioReady }) => {
  const [isRecording, setIsRecording] = useState(false);
  const { startRecording, stopRecording, status } = useReactMediaRecorder({
    audio: true,
    onStop: (blobUrl, blob) => {
      onAudioReady(blob);
      setIsRecording(false);
    },
  });

  const handleStartRecording = () => {
    setIsRecording(true);
    startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
    setIsRecording(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mt-4">
        {status === "recording" ? (
          <Button color="warning" onClick={handleStopRecording}>
            Stop
          </Button>
        ) : (
          <Button color="success" onClick={handleStartRecording} disabled={isRecording}>
            Registra
          </Button>
        )}
      </div>
    </div>
  );
};

export default AudioMessage;
