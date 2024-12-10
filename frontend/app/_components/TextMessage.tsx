"use client";

import { Textarea, Button } from "flowbite-react";
import React from "react";

interface TextMessageProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const TextMessage: React.FC<TextMessageProps> = ({ value, onChange, onSubmit }) => {
  return (
    <div className="flex flex-col items-center w-full">
      <form
        className="flex flex-col gap-4 w-full max-w-md"
        onSubmit={onSubmit}
      >
        <Textarea
          id="comment"
          placeholder="Scrivi qui la tua richiesta..."
          required
          rows={6}
          cols={120}
          className="p-4"
          value={value}
          onChange={onChange}
        />
        <div className="flex items-center justify-end">
          <Button type="submit" color="blue" className="w-1/2 button-submit-custom">
            Vai
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TextMessage;
