"use client";

import React, { useState } from 'react';
import TextMessage from './_components/TextMessage';
import AudioMessage from './_components/AudioMessage';
import { Banner, Button, Textarea } from "flowbite-react";

export default function Home() {
  const [inputMethod, setInputMethod] = useState<'text' | 'audio' | null>(null);

  const handleIconClick = (method: 'text' | 'audio') => {
    setInputMethod(method);
  };

  return (
    <div className='flex flex-col w-full h-screen items-center home-page'>
      <Banner>
        <div className="banner-custom flex w-full items-center justify-between border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
          <div className="flex w-full shrink-0 items-center sm:w-auto">
            <form action="#" className="flex w-full flex-col items-center md:flex-row md:gap-x-3">
              <h2 className='font-bold'>Cosa vuoi fare?</h2>
            </form>
          </div>
        </div>
      </Banner>
      <Banner>
        <div className="banner-custom-bottom flex w-full items-center justify-center border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
          <div className='flex justify-between'>
            <div className='div-button mr-2'>
              <Button
                onClick={() => handleIconClick('text')}
                color={inputMethod === 'text' ? "blue" : "light"}
              >
                <i className="fa-solid fa-keyboard pr-4"></i>Scrivi
              </Button>
            </div>
            <div className='div-button ml-2'>
              <Button
                onClick={() => handleIconClick('audio')}
                color={inputMethod === 'audio' ? "blue" : "light"}
              >
                <i className="fa-solid fa-microphone pr-4"></i>Parla
              </Button>
            </div>
          </div>
        </div>        
      </Banner>
      <div className='mt-4'>
      {inputMethod === 'text' && (
          <div className="flex flex-col items-center mt-4 w-full">
            <Textarea
              id="comment"
              placeholder="Scrivi qui la tua richiesta..."
              required
              rows={6}
              cols={90}
              className="p-4"
            />
          </div>
          )}
          {inputMethod === 'audio' && <AudioMessage />}
      </div>
    </div>
  );
}
