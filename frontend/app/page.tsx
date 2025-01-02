"use client";

import React, { useState, useRef, useEffect } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import { HiInformationCircle } from "react-icons/hi";
import { Alert } from "flowbite-react";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [audioFile, setAudioFile] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  const { startRecording, stopRecording } = useReactMediaRecorder({
    audio: true,
    onStop: (blobUrl, blob) => {
      setAudioFile(blob);
      setIsRecording(false);
    },
  });

  const addMessage = (
    type: "user" | "kommander",
    content: string | Blob,
    isLoading: boolean = false
  ) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        type,
        content,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isLoading,
      },
    ]);
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedMessage = message.trim(); 

    if (!trimmedMessage) return;

    addMessage("user", trimmedMessage);
    setMessage("");

    setIsLoading(true);
    addMessage("kommander", "", true);

    try {
      const response = await fetch("http://localhost:5000/new_message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_text: trimmedMessage, message_type: "text" }),
      });

      const result = await response.json();
      console.log("Risultato ricevuto:", result);

      const errorMessage = result.responseText || "Errore di interpretazione. Riprova.";
      const responseText =
        result.createdMessage?.parameters?.response?.responseText || errorMessage;

      const availableVehicles = result.availableVehicles?.result || [];
      const missingParameters = result.missingParameters || [];

      setVehicles(availableVehicles);

      let messageContent = responseText;

      if (availableVehicles.length > 0) {
        const vehiclesList = `
          <div class="vehicle-grid">
            ${availableVehicles
              .map(
                (vehicle: any, index: number) => `
            <div class="vehicle-card">
              <div>
                <span class="vehicle-index">${index + 1}</span>
              </div>
              <div class="vehicle-card-image">
                <img src=${vehicle.version?.imageUrl} alt=${vehicle.id} />
              </div>
              <div class="vehicle-card-content">
                <p><strong>${vehicle.plate}</strong></p>
                <p>${vehicle.brand?.brandName}</p>
                <p>${vehicle.model?.modelName}</p>
              </div>
            </div>`
              )
              .join("")}
          </div>`;
        messageContent += `<br /> <p>Scegli uno dei seguenti veicoli: </p> <br />${vehiclesList}`;
      }
      
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        const lastKommanderMessage = newMessages.find(
          (msg) => msg.type === "kommander" && msg.isLoading
        );
        if (lastKommanderMessage) {
          lastKommanderMessage.content = messageContent;
          lastKommanderMessage.isLoading = false;
        }
        return newMessages;
      });
    } catch (error) {
      console.error(error);
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        const lastKommanderMessage = newMessages.find(
          (msg) => msg.type === "kommander" && msg.isLoading
        );
        if (lastKommanderMessage) {
          lastKommanderMessage.content = "Si è verificato un errore. Riprova.";
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

      const result = await response.json();
      console.log("Risultato ricevuto:", result);

      const errorMessage = result.responseText || "Errore di interpretazione. Riprova.";
      const responseText = result.responseText || errorMessage;

      const availableVehicles = result.availableVehicles?.result || [];
      const missingParameters = result.missingParameters || [];

      setVehicles(availableVehicles);

      let messageContent = responseText;

      if (availableVehicles.length > 0) {
        const vehiclesList = `
          <div class="vehicle-grid">
            ${availableVehicles
              .map(
                (vehicle: any, index: number) => `
            <div class="vehicle-card">
              <div>
                <span class="vehicle-index">${index + 1}</span>
              </div>
              <div class="vehicle-card-image">
                <img src=${vehicle.version?.imageUrl} alt=${vehicle.id} />
              </div>
              <div class="vehicle-card-content">
                <p><strong>${vehicle.plate}</strong></p>
                <p>${vehicle.brand?.brandName}</p>
                <p>${vehicle.model?.modelName}</p>
              </div>
            </div>`
              )
              .join("")}
          </div>`;
          messageContent += `<br /> <p>Scegli uno dei seguenti veicoli: </p> <br />${vehiclesList}`;
      }
      
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        const lastKommanderMessage = newMessages.find(
          (msg) => msg.type === "kommander" && msg.isLoading
        );
        if (lastKommanderMessage) {
          lastKommanderMessage.content = messageContent;
          lastKommanderMessage.isLoading = false;
        }
        return newMessages;
      });
    } catch (error) {
      console.error(error);
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        const lastKommanderMessage = newMessages.find(
          (msg) => msg.type === "kommander" && msg.isLoading
        );
        if (lastKommanderMessage) {
          lastKommanderMessage.content = "Si è verificato un errore. Riprova.";
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

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleTextButtonClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (vehicles.length > 0) {
      chooseVehicleMessage(e);
      setMessage("");
    } else {
      handleTextSubmit(e);
    }
  };
  
  const handleAudioButtonClick = () => {
    if (vehicles.length > 0) {
      if (audioFile) {
        chooseVehicleAudio();
        setAudioFile(null);
      }
    } else {
      handleAudioSubmit();
    }
  };


  const chooseVehicleMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim(); 
  
    if (!trimmedMessage) return;
  
    addMessage("user", trimmedMessage);
    setMessage("");
  
    setIsLoading(true);
    addMessage("kommander", "", true);
  
    if (vehicles.length > 0) {
      try {
        const response = await fetch("http://localhost:5000/choose_vehicle_message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message_text: trimmedMessage, message_type: "text", availableVehicles: vehicles }),
        });
  
        const result = await response.json();
        console.log("Risultato:", result);
        const responseText = result.selectionVehicle.selectedVehicle.responseText || "Errore di interpretazione. Riprova.";
        const reservationId = result.reservation.updatedReservation._id;
  
        let messageContent = `${responseText}<br /><a href="https://dev.movolab.it/dashboard/prenotazioni/${reservationId}" target="_blank" rel="noopener noreferrer" class="inline-block px-4 py-2 border border-blue-500 text-blue-500 bg-white rounded-md text-center hover:bg-blue-500 hover:text-white transition-colors">Vedi la tua prenotazione</a>`;

        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          const lastKommanderMessage = newMessages.find(
            (msg) => msg.type === "kommander" && msg.isLoading
          );
          if (lastKommanderMessage) {
            lastKommanderMessage.content = messageContent;
            lastKommanderMessage.isLoading = false;
          }

          return newMessages;
        });
      } catch (error) {
        console.error("Errore:", error);
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          const lastKommanderMessage = newMessages.find(
            (msg) => msg.type === "kommander" && msg.isLoading
          );
          if (lastKommanderMessage) {
            lastKommanderMessage.content = "Si è verificato un errore. Riprova.";
            lastKommanderMessage.isLoading = false;
          }
          return newMessages;
        });
      }
    } else {
      setIsLoading(false);
    }
  };
  
  
  const chooseVehicleAudio = async () => {
    if (!audioFile) return;
    addMessage("user", audioFile);
    setAudioFile(null);
  
    setIsLoading(true);
    addMessage("kommander", "", true);
  
    if (vehicles.length > 0) {
      try {
        const formData = new FormData();
        formData.append("audio", audioFile, "audioMessage.wav");
        formData.append("availableVehicles", JSON.stringify(vehicles));
  
        const response = await fetch("http://localhost:5000/choose_vehicle_audio", {
          method: "POST",
          body: formData,
        });
  
        const result = await response.json();
        console.log("Risultato:", result);
  
        const responseText = result.selectionVehicle.selectedVehicle.responseText || "Errore di interpretazione. Riprova.";
        const reservationId = result.reservation.updatedReservation._id;

        let messageContent = `${responseText}<br /><a href="https://dev.movolab.it/dashboard/prenotazioni/${reservationId}" target="_blank" rel="noopener noreferrer" class="inline-block px-4 py-2 border border-blue-500 text-blue-500 bg-white rounded-md text-center hover:bg-blue-500 hover:text-white transition-colors">Vedi la tua prenotazione</a>`;

        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          const lastKommanderMessage = newMessages.find(
            (msg) => msg.type === "kommander" && msg.isLoading
          );
          if (lastKommanderMessage) {
            lastKommanderMessage.content = messageContent;
            lastKommanderMessage.isLoading = false;
          }
            
          return newMessages;
        });
      } catch (error) {
        console.error("Errore:", error);
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          const lastKommanderMessage = newMessages.find(
            (msg) => msg.type === "kommander" && msg.isLoading
          );
          if (lastKommanderMessage) {
            lastKommanderMessage.content = "Si è verificato un errore. Riprova.";
            lastKommanderMessage.isLoading = false;
          }
          return newMessages;
        });
      }
    } else {
      setIsLoading(false);
    }
  };
  

  const resetState = () => {
    setIsModalOpen(false);
    setMessage("");
    setAudioFile(null);
    setIsLoading(false);
    setIsRecording(false);
    setMessages([]);
    setVehicles([]);
    setIsConfirmationOpen(false);
  };

  
  const handleNewConversation = async () => { 
      resetState();

    
       try {
   
         const response = await fetch("http://localhost:5000/create_conversation", {
         method: "POST",
         headers: { "Content-Type": "application/json" }
       });
    
        const result = await response.json();
        console.log("Conversazione creata con successo:", result);
    
      } catch (error) {
        console.error("Errore durante la creazione della conversazione:", error);
        }
      };
    
      const handleConfirmExit = () => {
       setIsConfirmationOpen(true);
      };
    
      const handleCloseConfirmation = () => {
        setIsConfirmationOpen(false);
      };
    
      const handleConfirmationNo = () => {
    
      setIsConfirmationOpen(false);
     };
    
    
  return (
    <div className="overflow-auto flex w-full h-screen justify-center items-center">

     {isConfirmationOpen && (
     <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
     <div className="rounded-lg p-6 text-center">
     <Alert
     color="light"
     rounded
     >
     <span className="font-bold question-alert">Sei sicuro di voler chiudere questa conversazione?</span>
     <div className="flex space-x-2 div-buttons-alert">
     <button
     className="btn-alert btn-alert-no border-gray-100 py-2 px-4 text-sm bg-red-500"
     onClick={handleConfirmationNo}
     >
     No
     </button>
     <button
     className="btn-alert btn-alert-yes border-red-800 py-2 px-4 text-sm bg-green-500"
     onClick={handleNewConversation}
     >
     Sì
     </button>
    </div>
     </Alert>
     </div>
     </div>
     )}

    <div
     className={`widget-custom rounded-lg shadow-lg bg-white ${
    isModalOpen ? "pointer-events-none opacity-50" : ""
    }`}
    >
        <div className="banner-custom-title flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4">
          <h2 className="font-bold">Prenota il tuo veicolo</h2>
          <button
            onClick={handleConfirmExit}
            className="text-gray-600 hover:text-blue-500"
           >
          <i className="fa-solid fa-pen-to-square text-xl"></i>
           </button>
        </div>    
        <div className="banner-custom-chat p-4" ref={messageContainerRef}>
        {messages.map((message, index) => (
          <div key={index} className={`w-full flex ${message.type === "user" ? "" : "justify-end"}`}>
            <div className={`banner-chat-${message.type} flex`}>
              <img
                className="logo-kommander-chat"
                src={message.type === "user" ? "./spiaggia-tramonto.png" : "./Logo (1).png"}
                alt={`${message.type}-icon`}
              />
              <div>
                <div className="info-message-div">
                  <span className="font-bold type-user">
                    {message.type === "user" ? "User" : "Kommander.ai"}
                  </span>
                  <span className="hour-message">{message.time}</span>
                </div>
                {message.isLoading ? (
                  <div className="loader-container">
                    <img
                      src="./fade-stagger-circles.svg"
                      alt="loader"
                      className="w-6 h-6"
                    />
                  </div>
                ) : (
                  <>
                    {message.type === "user" && message.content instanceof Blob ? (
                      <div className="w-full max-w-md mb-2 pt-2">
                        <audio controls src={URL.createObjectURL(message.content)} />
                      </div>
                    ) : (
                      <div
                        className="message pt-1"
                        dangerouslySetInnerHTML={{ __html: message.content }}
                      />
                    )}
                  </>
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
            <div className="register-div">
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
          </div>

          <div className="flex flex-col buttons-div items-center w-full space-y-2">
            <button
              className="btn-send py-2 px-4 text-sm"
              onClick={handleTextButtonClick}
              disabled={isRecording || !message.trim()}
            >
              <span><i className="fa-solid fa-envelope"></i></span>
            </button>

            <button
              className="btn-send py-2 px-4 text-sm"
              onClick={handleAudioButtonClick}
              disabled={isRecording || !audioFile}
            >
              <span><i className="fa-solid fa-volume-high"></i></span>
            </button>
          </div>
        </div>

        <div>
          {audioFile && (
            <div className="w-full max-w-md mb-2 ml-2">
              <audio controls src={URL.createObjectURL(audioFile)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}