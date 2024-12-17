import axios from 'axios';
import dotenv from 'dotenv';


dotenv.config();

export const callChatGpt = async (text: string): Promise<Record<string, any>> => {
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
  Analizza il seguente messaggio del cliente: "${text}" ed estrai i seguenti parametri:
  1. La data di presa del veicolo (formato: YYYY-MM-DDTHH:MM).
  2. La data di restituzione del veicolo (formato: YYYY-MM-DDTHH:MM).
  3. Il nome del conducente.
  4. Il nome del cliente.
  5. Il numero di telefono del conducente.
  6. Il numero di telefono del cliente.
  7. Il gruppo di veicoli (id, mnemonic, description). Tendenzialmente il gruppo è rappresentato dal tipo di veicolo. Puoi anche scegliere tutti i gruppi quindi devi prenderli tutti.
  8. Il workflow (id, nome).
  9. PickUpLocation (id, nome), è legato a rental location.
  10. DropOffLocation (id, nome), è legato a rental location.
  11. Il tipo di movimento, sicuramente ti verrà indicato il nome e non l'enum. 
  12. Response (response text, missing parameters). 
    =>  - ResponseText: Un messaggio indicativo riguardo l'esito della richiesta. Se manca anche solo un parametro devi scrivere ERRORE, elencando i parametri mancanti.
        - MissingParameters: Un array dove vengo inseriti i parametri mancanti, se non mancano parametri allora l'array sarà vuoto.

  Se manca un parametro, restituisci il valore a null.

  I dati di riferimento sono i seguenti:
  - **Gruppi di veicoli**: ${JSON.stringify(referenceData.groups)}
  - **Workflows**: ${JSON.stringify(referenceData.workflows)}
  - **Location di noleggio**: ${JSON.stringify(referenceData.rental_location)}
  - **Tipi di movimento**: ${JSON.stringify(referenceData.movement_types)}
  
  Rispondi in formato JSON come nell'esempio qui sotto:
  
  {
    "pickUpDate": "2024-12-07T17:13",
    "dropOffDate": "2024-12-08T16:16",
    "driver_name": "Mario Rossi",
    "customer_name": "Giovanni Verdi",
    "driver_phone": "+39 012 345 6789",
    "customer_phone": "+39 987 654 3210",
    "group": [
      { "_id": "63acb41afd939e8f05d5069a", "mnemonic": "2WC", "description": "SCOOTER" }
    ],
    "workflow": {
      "_id": "670a8d3937df135b0265aaf4",
      "name": "Prepagato Prenotazione"
    },
    "pickUpLocation": {
      "_id": "66eb13cb072e8e794505bcaf",
      "name": "Tarvisio 8"
    },
    "dropOffLocation": {
      "_id": "66eb13cb072e8e794505bcaf",
      "name": "Tarvisio 8"
    },
    "movementType": {
      "_id": " ",
      "name": "Noleggio",
      "enum": "NOL"
    }, 
    "response": {
      "responseText": "Richiesta riuscita / Errore nella richiesta, mancano i seguenti parametri: ["workflow"],
      "missingParameters": ["customer_phone", "workflow"]
    },
  }
`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an assistant specialized in extracting key details from user messages.' },
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



const parseChatGptResponse = (rawReply: string): Record<string, any> => {
  try {
    console.log('Risposta grezza da ChatGPT:', rawReply);

    const sanitizedReply = rawReply.replace(/,\s*([}\]])/g, '$1').trim();

    if (!sanitizedReply.startsWith('{') || !sanitizedReply.endsWith('}')) {
      throw new Error('La risposta non è un JSON valido.');
    }

  
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

