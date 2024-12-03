"use client";

import React, { useState } from "react";
import { ReactMic } from "react-mic";
import { Button } from "flowbite-react";

interface AudioMessageProps {
  setAudioFile: React.Dispatch<React.SetStateAction<Blob | null>>;
}

const AudioMessage: React.FC<AudioMessageProps> = ({ setAudioFile }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const onData = (recordedData: any) => {
    console.log("Recording in progress:", recordedData);
  };

  const onStop = (recordedData: any) => {
    console.log("Recording stopped. Audio data:", recordedData);
    console.log("File MIME type:", recordedData.blob.type);
    setRecordedBlob(recordedData.blob);
    setAudioFile(recordedData.blob);
  };

  const handleSubmitAudio = async () => {
    if (!recordedBlob) return;

    const formData = new FormData();
    formData.append("audio", recordedBlob, "audioMessage.wav");

    try {
      const response = await fetch("http://localhost:5000/upload-audio", {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text(); 
      console.log('Response text:', responseText);

      if (response.ok) {
        try {
          const result = JSON.parse(responseText);
          console.log("Audio uploaded:", result);
        } catch (e) {
          console.error('Error parsing JSON:', e);
        }
      } else {
        console.error("Error while uploading the audio:", responseText);
      }
    } catch (error) {
      console.error("Connection error:", error);
    }
  };


  return (
    <div className="flex flex-col items-center">
      <ReactMic
        record={isRecording}
        className="sound-wave"
        onStop={onStop}
        onData={onData}
        strokeColor="#000000"
        backgroundColor="#ffffff"
      />
      <div className="mt-4">
        {isRecording ? (
          <button
            onClick={handleStopRecording}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Stop Recording
          </button>
        ) : (
          <button
            onClick={handleStartRecording}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Start Recording
          </button>
        )}
      </div>
      {recordedBlob && (
        <div className="mt-4">
          <audio controls src={URL.createObjectURL(recordedBlob)} />
        </div>
      )}
      {recordedBlob && (
        <div className="mt-4">
          <Button onClick={handleSubmitAudio} color="blue">
            Upload Audio
          </Button>
        </div>
      )}
    </div>
  );
};

export default AudioMessage;
