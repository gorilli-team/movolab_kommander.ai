export let messages: string[] = [];
export let availableVehiclesStore: any[] = [];
let isAvailableVehiclesSet = false;
export let lastMessageStore: any = {};

export const addMessageToStore = (message: string) => {
  messages.push(message);
  console.log("Messagessss:", messages);
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

export const addLastMessageToStore = (message: any) => {
  lastMessageStore = message;
  console.log("Last message stored:", lastMessageStore);
  return lastMessageStore;
};

export const resetStore = () => {
  messages.length = 0;
  availableVehiclesStore = [];
  lastMessageStore = {};
  isAvailableVehiclesSet = false;

  console.log("Store reset.");
};

resetStore();
