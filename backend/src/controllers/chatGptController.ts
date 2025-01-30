import axios from 'axios';
import dotenv from 'dotenv';


dotenv.config();

export const callChatGpt = async (text: string, texts: string[]): Promise<Record<string, any>> => {
  const referenceData = {
    "groups": [
      { "_id": "63acb41afd939e8f05d5069a", "mnemonic": "2WC", "description": "SCOOTER" },
      { "_id": "63acb43dfd939e8f05d5069d", "mnemonic": "2WM", "description": "MOTO" },
      { "_id": "63acb44ffd939e8f05d506a0", "mnemonic": "4W", "description": "QUADRICICLI" },
      { "_id": "63acb29cacaff598c5508793", "mnemonic": "A", "description": "CITY CAR" },
      { "_id": "66463f08649ad7fac3e117d5", "mnemonic": "A+", "description": "CITY CAR" },
      { "_id": "63acb2d8acaff598c5508796", "mnemonic": "B", "description": "UTILITARIE" },
      { "_id": "6645ee56a7c9657d8f84d32d", "mnemonic": "B+", "description": "UTILITARIE" },
      { "_id": "63acb302acaff598c550879c", "mnemonic": "C", "description": "MEDIE" },
      { "_id": "6645ee56a7c9657d8f84d32e", "mnemonic": "C+", "description": "MEDIE" },
      { "_id": "63acb31bacaff598c550879f", "mnemonic": "D", "description": "GRANDI" },
      { "_id": "6645ee56a7c9657d8f84d32f", "mnemonic": "D+", "description": "GRANDI" },
      { "_id": "63acb32eacaff598c55087a2", "mnemonic": "E", "description": "PREMIUM" },
      { "_id": "6645ee56a7c9657d8f84d330", "mnemonic": "E+", "description": "PREMIUM" },
      { "_id": "6645ee56a7c9657d8f84d331", "mnemonic": "F", "description": "SUPERCAR" },
      { "_id": "63acb3ebfd939e8f05d50694", "mnemonic": "L", "description": "MONOVOLUMI 9 PAX" },
      { "_id": "63acb34cacaff598c55087a5", "mnemonic": "Z", "description": "COMMERCIALI" }
    ],
    "workflows": [
      { "_id": "66f2920c3364651640195666", "name": "Solo Cassala"},
      { "_id": "66f291e73364651640193481", "name": "Solo Tarvisio"},
      { "_id": "66ea8f3c25372c22acea62b2", "name": "I tuoi clienti"},
      { "_id": "670a245fa3125360eead5b12", "name": "Prepagato Apertura Movo"},
      { "_id": "670a2413a3125360eead413f", "name": "Prepagato Prenotazione"},
      { "_id": "66ea8f3c25372c22acea62b4", "name": "Auto sostitutiva"}
    ],
    "rental_location": [
      { "_id": "66f1d24c27e100b4a9e4d4b6", "name": "Rossi Noleggi Viale Cassala"},
      { "_id": "66ea9ae39d53a10b66934fca","name": "Rossi Noleggi Tarvisio"}
    ],
   "movement_types": [
      { "_id": "670a8d3937df135b0265aaf5", "enum": "NOL", "name": "Noleggio" },
      { "_id": "670a8d3937df135b0265aaf6", "enum": "COM", "name": "Comodato" },
      { "_id": "670a8d3937df135b0265aaf7", "enum": "MNP", "name": "Movimento non produttivo" }
    ]
  };
  
  const prompt = `
  Analizza il seguente messaggio del cliente: "${text}", osserva eventuali messaggi precedenti ${texts} ed estrai i parametri.
  
  Hai questi dati di riferimento con i quali puoi aiutarti.
  
  - **Gruppi di veicoli**: ${JSON.stringify(referenceData.groups)}
  - **Workflows**: ${JSON.stringify(referenceData.workflows)}
  - **Location di noleggio**: ${JSON.stringify(referenceData.rental_location)}
  - **Tipi di movimento**: ${JSON.stringify(referenceData.movement_types)}
  
  Devi estrarre i seguenti parametri:
  
  1. La data di presa del veicolo (formato: YYYY-MM-DDTHH:MM).
  2. La data di restituzione del veicolo (formato: YYYY-MM-DDTHH:MM).
  3. Il nome del conducente.
  4. Il nome del cliente.
  5. Il numero di telefono del conducente.
  6. Il numero di telefono del cliente.
  7. Il gruppo di veicoli (id, mnemonic, description). Il gruppo rappresenta il tipo di veicolo. Se dice mostrami tutti i veicoli, scegli tutti i veicoli e quindi tutti i gruppi.
  8. Il workflow (id, nome).
  9. PickUpLocation (id, nome), è legato a rental location.
  10. DropOffLocation (id, nome), è legato a rental location.
  11. Il tipo di movimento, sicuramente ti verrà indicato il nome per intero, e non l'enum.
  12. Response (response text, missing parameters). 
    - **ResponseText**: Un messaggio indicativo riguardo l'esito della richiesta. Se ci sono tutti i parametri, scrivi "Richiesta riuscita!". Se manca anche solo un parametro, scrivi una frase del tipo: "Per completare la tua richiesta ho bisogno delle seguenti informazioni: parametro1, parametro2, etc."
    - **MissingParameters**: Un array dove vengono inseriti i parametri mancanti (es. ["parameter1", "parameter2"]). Se non mancano parametri, l'array sarà vuoto.

  Non aggiungere note aggiuntive. E SOPRATTUTTO NON dedurre alcun parametro. Se un'informazione non è esplicitamente indicata nei messaggi dell'utente, non inserirla. Se un parametro manca, devi segnalarlo nei "missingParameters" e devi metterlo momentaneamente a null.
  Rispondi solo in formato JSON, come nell'esempio qui sotto ma aggiungendo tu le informazioni ricavate dai messaggi dell'utente.

  - Se mancano delle informazioni:
  {
    "pickUpDate": "2025-03-10T10:00",
    "dropOffDate": "2025-03-12T18:00",
    "driver_name": "Antonio Rossi",
    "customer_name": "Mario Rossi",
    "driver_phone": "3463666034",
    "customer_phone": "3463666034",
    "response": {
      "responseText": "Per completare la tua richiesta ho bisogno delle seguenti informazioni: workflow, movementType",
      "missingParameters": ["workflow", "movementType"]
    },
    "group": [
      { "_id": "63acb2d8acaff598c5508796", "mnemonic": "B", "description": "UTILITARIE" }
    ],
    "workflow": { "_id": null, "name": null },
    "pickUpLocation": { "_id": "66f1d24c27e100b4a9e4d4b6", "name": "Rossi Noleggi Viale Cassala" },
    "dropOffLocation": { "_id": "66f1d24c27e100b4a9e4d4b6", "name": "Rossi Noleggi Viale Cassala" },
    "movementType": { "_id": null, "name": null, "enum": null }
  }


  - Se sono presenti tutte le informazioni:
  {
    "pickUpDate": "2025-03-10T10:00",
    "dropOffDate": "2025-03-12T18:00",
    "driver_name": "Antonio Rossi",
    "customer_name": "Mario Rossi",
    "driver_phone": "3463666034",
    "customer_phone": "3463666034",
    "response": {
      "responseText": "Richiesta riuscita!",
      "missingParameters": []
    },
    "group": [
      { "_id": "63acb2d8acaff598c5508796", "mnemonic": "B", "description": "UTILITARIE" }
    ],
    "workflow": { "_id": "670a2413a3125360eead413f", "name": "Prepagato Prenotazione"},
    "pickUpLocation": { "_id": "66f1d24c27e100b4a9e4d4b6", "name": "Rossi Noleggi Viale Cassala" },
    "dropOffLocation": { "_id": "66f1d24c27e100b4a9e4d4b6", "name": "Rossi Noleggi Viale Cassala" },
    "movementType": { "_id": "670a8d3937df135b0265aaf5", "enum": "NOL", "name": "Noleggio" },
  }
  `;
  
  
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'developer', content: 'You are an assistant specialized in extracting key details from user messages.' },
          { role: 'user', content: prompt },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const rawReply = response.data.choices[0].message.content;

    return parseChatGptResponse(rawReply);
  } catch (error: any) {
    console.error('Errore nella chiamata a ChatGPT:', error.message);
    throw new Error('Errore nella chiamata a ChatGPT. Controlla i log.');
  }
};

const extractJson = (rawReply: string): string => {
  const jsonMatch = rawReply.match(/({[\s\S]*})/);
  if (!jsonMatch) {
    throw new Error('Nessun blocco JSON trovato nella risposta.');
  }
  return jsonMatch[1];
};


const parseChatGptResponse = (rawReply: string): Record<string, any> => {
  try {
    console.log('Risposta grezza da ChatGPT:', rawReply);

    const sanitizedReply = extractJson(rawReply);

    const parsedReply = JSON.parse(sanitizedReply);

    if (typeof parsedReply !== 'object' || parsedReply === null) {
      throw new Error('La risposta JSON non è un oggetto valido.');
    }

    return parsedReply;
  } catch (error: any) {
    console.error('Errore di parsing JSON:', error.message);
    console.error('Risposta grezza:', rawReply);
    throw new Error('Il JSON restituito da ChatGPT non è valido.');
  }
};



export const selectVehicle = async (userText: string, availableVehicles: any[]): Promise<Record<string, any>> => {

  const availableVehiclesJson = JSON.stringify(availableVehicles);


  const prompt = `
   L'utente fornisce un numero "${userText}" e un array di veicoli ${availableVehiclesJson}.

   Il numero rappresenta la posizione del veicolo che devi scegliere all'interno dell'array, non l'indice.
   Mi raccomando, prendi l'elemento corrispondente a quella posizione nell'array. Ad esempio, se scrivi '3', verrà restituito il terzo elemento dell'array.

   Se il numero è 1, devi prendere il primo elemento nell'array,
   Se il numero è 2, devi prendere il secondo elemento nell'array, 
   Se il numero è 3, devi prendere il terzo elemento nell'array,
   Se il numero è 4, devi prendere il quarto elemento nell'array,
   Se il numero è 5, devi prendere il quinto elemento nell'array,
   Se il numero è 6, devi prendere il sesto elemento nell'array,
   Se il numero è 7, devi prendere il settimo elemento nell'array,
   Se il numero è 8, devi prendere l'ottavo elemento nell'array,
   Se il numero è 9, devi prendere il nono elemento nell'array,
   Se il numero è 10, devi prendere il decimo elemento nell'array,
   Se il numero è 11, devi prendere l'undicesimo elemento nell'array e così via.

    Restituisci solo il JSON, niente spiegazione fuori dal JSON.

    Seleziona il veicolo corrispondente e restituisci le seguenti informazioni in formato JSON:
    {
      "selectedVehicle": {
        "_id": "id del veicolo selezionato",
        "targa": "targa del veicolo selezionato",
        "brand": "nome del brand",
        "model": "nome del modello",
        "gruppo": "id del gruppo",
        "responseText": "Hai scelto il veicolo con targa ..., brand ..., modello ..."
      }
    }
  `;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an assistant specialized in selecting vehicles based on user input.' },
          { role: 'user', content: prompt },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );
  
    const rawReply = response.data.choices[0].message.content;
    console.log("Risposta grezza da ChatGPT:", rawReply);
  
    return parseChatGptResponse(rawReply);
  
  } catch (error: any) {
    console.error('Errore nella chiamata a ChatGPT:', error.message);
    console.error('Dettagli dell\'errore:', error.response?.data);
    throw new Error('Errore nella chiamata a ChatGPT. Controlla i log.');
  }
  
};