export let firstMessage: string | null = null;
export const otherMessages: string[] = [];
let isFirstMessage = true;

export const addMessageToStore = (message: string) => {
  if (isFirstMessage) {
    firstMessage = message; 
    isFirstMessage = false;
  } else {
    otherMessages.push(message); 
  }
  console.log("First Message:", firstMessage);
  console.log("Other Messages:", otherMessages);
};

const resetMessageStore = () => {
  firstMessage = null;
  otherMessages.length = 0;
  isFirstMessage = true;
  console.log("Message store resettato.");
};

resetMessageStore();
