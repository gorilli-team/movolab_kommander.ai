"use client";

import React from "react";

export default function Dashboard() {
  return (
    <div className="overflow-auto flex w-full h-screen justify-center items-center bg-gray-100">
      <div className="widget-custom rounded-lg shadow-lg bg-white">
        {/* Titolo */}
        <div className="banner-custom-title flex items-center border-b border-gray-200 bg-gray-50 p-4">
          <h2 className="font-bold">Cosa vuoi fare oggi?</h2>
        </div>

        {/* Chat */}
        <div className="banner-custom-chat p-4 space-y-6">
          {/* Messaggio Utente */}
          <div className="flex items-start">
            <img
              className="logo-kommander-chat"
              src="./spiaggia-tramonto.png"
              alt="user-icon"
            />
            <div>
              <div className="info-message-div">
                <span className="font-bold type-user">User</span>
                <span className="hour-message">11:20</span>
              </div>
              <p className="message pt-1">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
          </div>

          {/* Messaggio Kommander */}
          <div className="flex items-start mt-6">
            <div className="ml-auto flex items-start">
              <img
                className="logo-kommander-chat ml-2"
                src="./kommander-logo.png"
                alt="kommander-icon"
              />
              <div>
                <div className="info-message-div">
                  <span className="font-bold type-user">Kommander.ai</span>
                  <span className="hour-message">11:21</span>
                </div>
                <p className="message pt-1">
                  Curabitur suscipit vitae diam vel condimentum.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="banner-custom-footer flex w-full items-center justify-between border-t border-gray-200 bg-gray-50 p-4">

          <div className="flex w-full items-center rounded-md border border-gray-300 p-2 bg-white mb-2">
            <input
              className="w-full outline-none"
              placeholder="Scrivi un messaggio..."
            />
            <button
              className="btn-microphone ml-2 text-gray-600 hover:text-blue-500 focus:outline-none"
              onClick={() => console.log("Microfono attivato")}
            >
              <i className="fa-solid fa-microphone text-xl"></i>
            </button>
          </div>

          <div className="flex space-x-4">
            <button
              className="btn-send"
              onClick={() => console.log("Invio messaggio")}
            >
              Vai
            </button>
            <button
              className="btn-audio"
              onClick={() => console.log("Invio audio")}
            >
              Audio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
