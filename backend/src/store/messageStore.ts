export let firstMessage: string | null = null;
export const otherMessages: string[] = [];
let isFirstMessage = true;

export let availableVehiclesStore: any[] = [];
let isAvailableVehiclesSet = false;

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

export const addAvailableVehiclesToStore = (vehicles: any[]) => {
  if (isAvailableVehiclesSet) {
    console.log("Available vehicles already set.");
    return;
  }

  availableVehiclesStore = vehicles;
  isAvailableVehiclesSet = true;

  console.log("Veicoli memorizzati nello store:", availableVehiclesStore);
};


const resetStore = () => {
  firstMessage = null;
  otherMessages.length = 0;
  isFirstMessage = true;
  availableVehiclesStore = [];
  isAvailableVehiclesSet = false;

  console.log("Store reset.");
};

resetStore();
