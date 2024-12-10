import React from "react";
import { Card } from "flowbite-react";

const VehicleCard = ({ vehicle }: { vehicle: any }) => {
  return (
    <Card>
      <p>Targa: {vehicle.plate}</p>

    </Card>
  );
};

export default VehicleCard;
