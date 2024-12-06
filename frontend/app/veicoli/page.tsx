import React from "react";
import { Card } from "flowbite-react";

export default function Veicoli() {
  const veicoli = [
    { nome: "Fiat Panda", prezzo: "€10,000" },
    { nome: "Volkswagen Golf", prezzo: "€20,000" },
    { nome: "Tesla Model 3", prezzo: "€40,000" },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Veicoli disponibili</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-11/12">
        {veicoli.map((veicolo, index) => (
          <Card key={index}>
            <h2 className="text-xl font-semibold">{veicolo.nome}</h2>
            <p className="text-lg text-gray-600">{veicolo.prezzo}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
