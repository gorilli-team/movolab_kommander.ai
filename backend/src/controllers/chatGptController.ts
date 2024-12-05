import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const callChatGpt = async (text: string): Promise<string> => {
  try {
    const prompt = `
    Analizza il seguente messaggio: "${text}".
    Ricava i dati che ritieni importanti per un noleggio auto (es. nome, date di noleggio, tipo di veicolo richiesto, altre preferenze o dettagli).
    Rispondi in un formato strutturato, elencando i dettagli chiave.
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
