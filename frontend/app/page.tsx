"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextInput, Button } from "flowbite-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, token }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("userId", data.userId);
        router.push("/dashboard");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Errore sconosciuto durante il login.");
      }
    } catch (err) {
      setError("Errore di rete. Controlla la tua connessione.");
      console.error("Errore di connessione:", err);
    }
  };

  return (
    <div className="flex flex-col w-full h-screen justify-center items-center">
      <div className="w-full h-screen flex justify-center items-center">
        <form onSubmit={handleSubmit}>
          <div>
            <TextInput
              className="py-2"
              type="text"
              id="authUsername"
              placeholder="Username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextInput
              className="py-2"
              type="text"
              id="authToken"
              placeholder="Token autenticazione Movolab"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <Button className="button-submit-custom" color="blue" type="submit">
              Vai
            </Button>
          </div>
          {error && (
            <div className="mt-2 text-red-600">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
