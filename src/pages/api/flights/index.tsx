import { Flight, PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
const Amadeus = require('amadeus');
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  result: Flight[] | Flight;
  success: Boolean;
};

// TODO: Error checking
export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const prisma = new PrismaClient();
  const amadeus = new Amadeus();

  if (req.method === 'POST') {
    const flightData: Flight = JSON.parse(req.body);
    flightData.flightDate = new Date(flightData.flightDate); // TODO timezones :(

    // Pull Additional flight data
    try {
      console.log('Getting flight data...');
      console.log('Date: ' + dayjs(flightData.flightDate).format('YYYY-MM-DD'));
      const fullFlightData = await amadeus.schedule.flights.get({
        carrierCode: 'WN',
        flightNumber: '' + flightData.flightNumber,
        scheduledDepartureDate: dayjs(flightData.flightDate).format(
          'YYYY-MM-DD'
        ),
      });
      console.log(fullFlightData);
    } catch (e) {
      console.log(e);
    }

    const newFlight = await prisma.flight.create({ data: flightData });
    res.json({ result: newFlight, success: true });
  } else {
    const flights = await prisma.flight.findMany();
    res.json({ result: flights, success: true });
  }
};
