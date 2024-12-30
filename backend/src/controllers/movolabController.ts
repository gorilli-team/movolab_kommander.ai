import axios from 'axios';

export const movolabAvailableVehicles = async (params: any, authToken: string): Promise<any> => {
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
        'Authorization': `Bearer ${authToken}`,
      },
    };

    const response = await axios.post(
      'https://movolab-backend.herokuapp.com/rents/availability/getAvailSimple',
      requestBody,
      config
    );

    const availableVehicles = response.data;

    return availableVehicles;

  } catch (error: any) {
    console.error('Errore durante la richiesta dei veicoli disponibili:', error.message);
    throw new Error('Impossibile recuperare i veicoli disponibili. Controlla i log.');
  }
};


export const movolabCreateReservation = async (
  params: any,
  authToken: string
): Promise<any> => {
  try {
    const {
      workflow,
      movementType,
      group,
      dropOffDate,
      dropOffLocation,
      pickUpDate,
      pickUpLocation,
      vehicle,
    } = params;

    const requestBody = {
      customer: '649bfb73101ba971f62d8bd3',
      customerFullName: 'Paolo Antonio Rossi',
      customerPhone: '3463666034',
      discountAmount: 0,
      discountPercentage: 0,
      driver: '649bfb73101ba971f62d8bd3',
      driverFullName: 'Paolo Antonio Rossi',
      driverPhone: '3463666034',
      dropOffDate,
      dropOffLocation,
      group,
      fare: "66ea8f2f25372c22acea5f2a",
      initiator: "dashboard",
      movementType,
      pickUpDate,
      pickUpLocation,
      price: {
        amount: 40,
        dailyAmount: 40,
        discount: {
          amount: 0,
          percentage: 0,
        },
        totalAmount: 40,
      },
      priceList: "66ea8f3b25372c22acea60fb",
      range: "66ea8f2d25372c22acea5f01",
      totalDays: 1,
      vehicle,
      workflow
    };

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    };

    const response = await axios.post(
      'https://movolab-backend.herokuapp.com/reservations',
      requestBody,
      config
    );

    return response.data;
  } catch (error: any) {
    console.error('Errore durante la creazione della prenotazione:', error.message);
    throw new Error('Impossibile creare la prenotazione. Controlla i log.');
  }
};


