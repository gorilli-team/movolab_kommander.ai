"use client";

import { Label, TextInput, Button } from "flowbite-react";

export default function Login() {
  return (
    <div className="flex flex-col w-full h-screen justify-center items-center">
      <div className="w-full h-screen flex justify-center items-center">
        <form>
          <div>
            <Label htmlFor="authToken">Token autenticazione Movolab</Label>
            <TextInput className="py-2" type="text" id="authToken" placeholder="Inserisci il tuo token" required/>
          </div>
          <div>
            <Button className="button-submit-custom" color="blue" type="submit">Vai</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
