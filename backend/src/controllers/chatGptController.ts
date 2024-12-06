import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const callChatGpt = async (text: string): Promise<string> => {
  try {
    const prompt = `
    Analizza il seguente messaggio del cliente: "${text}"
    Estrai i seguenti parametri:
    1. La data di presa del veicolo (formato: YYYY-MM-DD).
    2. La data di restituzione del veicolo (formato: YYYY-MM-DD).
    3. Il nome del conducente.
    4. Il nome del cliente.
    5. Il numero di telefono del conducente.
    6. Il numero di telefono del cliente.

    I dati di riferimento sono i seguenti:
    - **Gruppo di veicoli** (se più gruppi sono indicati, restituire un array): ["CITY CAR", "SUV", "LUXURY"]
    - **Workflow**: "Flusso standard per i tuoi clienti"
    - **Location di noleggio**: "Tarvisio 8"

    Rispondi in formato JSON come nell'esempio qui sotto:

    {
      "pickup_date": "YYYY-MM-DD",
      "return_date": "YYYY-MM-DD",
      "driver_name": "Nome Conducente",
      "customer_name": "Nome Cliente",
      "driver_phone": "Telefono Conducente",
      "customer_phone": "Telefono Cliente",
      "group": ["CITY CAR", "SUV"],  // Array di gruppi
      "workflow": "Flusso standard per i tuoi clienti",
      "rental_location": "Tarvisio 8"
    }
    `;

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
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    return reply;
  } catch (error) {
    console.error('Error in ChatGPT call:', error);
    throw new Error('Failed to fetch response from ChatGPT.');
  }
};
