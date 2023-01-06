import { Flight, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const saveNewFlight = async (flightData: Flight) => {
  const flight = await prisma.flight.create({
    data: flightData,
  });
  return flight;
};

export { saveNewFlight };
