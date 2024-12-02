"use client";

import React, { useState } from 'react';
import TextInput from './_components/TextInput';
import AudioInput from './_components/AudioInput';

export default function Home() {

  const [inputMethod, setInputMethod] = useState<'text' | 'audio' | null>(null);

  const handleIconClick = (method: 'text' | 'audio') => {
    setInputMethod(method);
  };

  return (
    <div className='flex flex-col w-full h-screen items-center home-page'>
      <h1>What would you like to do?</h1>
      <div>
        <button onClick={() => handleIconClick('text')}>🖊️</button>
        <button onClick={() => handleIconClick('audio')}>🎙️</button>
      </div>

      {inputMethod === 'text' && <TextInput />}
      {inputMethod === 'audio' && <AudioInput />}
    </div>
  );
}
