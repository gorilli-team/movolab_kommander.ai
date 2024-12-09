import axios from 'axios';

export const getAvailableVehicles = async (params: any, sessionCookie: string): Promise<any> => {
  try {
    const { dropOffDate, dropOffLocation, group, movementType, pickUpDate, pickUpLocation, workflow  } = params;

    const groupIds = group.map((g: any) => g._id);

    const requestBody = {
      dropOffDate,
      dropOffLocation: dropOffLocation._id,
      group: groupIds,
      initiator: "dashboard",
      movementType: movementType.enum,
      pickUpDate,
      pickUpLocation: pickUpLocation._id,
      priceList: null,
      workflow: workflow._id
    };

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionCookie}`,
      },
    };

    const response = await axios.post(
      'https://movolab-backend-demo-9a535b77af26.herokuapp.com/rents/availability/getAvailSimple',
      requestBody,
      config
    );

    const availableVehicles = response.data;

    console.log('Veicoli Disponibili:', availableVehicles);
    return availableVehicles;

  } catch (error: any) {
    console.error('Errore durante la richiesta dei veicoli disponibili:', error.message);
    throw new Error('Impossibile recuperare i veicoli disponibili. Controlla i log.');
  }
};
