"use client";

import { Textarea } from "flowbite-react";
import React from 'react';

const TextMessage = () => {
  return (
    <div className="max-w-md mt-8">
      <Textarea id="comment" placeholder="Scrivi qui la tua richiesta.." required rows={10} cols={150} />
    </div>
  );
};

export default TextMessage;
