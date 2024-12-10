import React from "react";
import { Card } from "flowbite-react";

const VehicleCard = ({ vehicle }: { vehicle: any }) => {
  return (
    <Card>
      <p>Targa: {vehicle.plate}</p>
      <p>Km attuali: {vehicle.km}</p>
      <img src={vehicle.version.imageUrl} alt={vehicle.id} />
      <p>{vehicle.brand.brandName} {vehicle.model.modelName}</p>
      <p>Gruppo: {vehicle.version.group.mnemonic} {vehicle.version.group.description}</p>
    </Card>
  );
};

export default VehicleCard;
