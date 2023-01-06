import { Flight, PrismaClient } from '@prisma/client';
const Amadeus = require('amadeus');
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  data: Flight | Flight[];
  errorMessage: String;
  success: Boolean;
};

const parseAmadeusResult = (amadeusResult: any) => {
  try {
    let data = amadeusResult.data[0];
    if (data) {
      // Parse out flight info
      const departureAirport = data.flightPoints[0].iataCode;
      const departureTime = data.flightPoints[0].departure.timings[0].value;
      const arrivalAirport = data.flightPoints[1].iataCode;
      const arrivalTime = data.flightPoints[1].arrival.timings[0].value;
      const flightDuration = data.segments[0].scheduledSegmentDuration;
      return {
        success: true,
        fullFlightData: {
          departureAirport,
          departureTime,
          arrivalAirport,
          arrivalTime,
          flightDuration,
        },
        errorMessage: '',
      };
    } else {
      return {
        success: false,
        fullFlightData: {},
        errorMessage: 'NO FLIGHT FOUND: Double check flight number and date',
      };
    }
  } catch (e) {
    console.log('Failed to parse amadeus result');
    console.log(amadeusResult);
    console.log(e);
    return {
      success: false,
      fullFlightData: {},
      errorMessage: JSON.stringify(e),
    };
  }
};

// TODO: Error checking
export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const prisma = new PrismaClient();
  const amadeus = new Amadeus();

  // Creating new flight
  if (req.method === 'POST') {
    const flightData: Flight = JSON.parse(req.body);

    // Pull Additional flight data
    try {
      console.log(`Getting flight data with following info: "${req.body}"...`);
      const amadeusResult = await amadeus.schedule.flights.get({
        carrierCode: 'WN',
        flightNumber: '' + flightData.flightNumber,
        scheduledDepartureDate: flightData.flightDate,
      });
      console.log('Finished amadeus fetch');
      const { success, errorMessage, fullFlightData } = parseAmadeusResult(
        amadeusResult.result
      );
      console.log('Parsed result');

      if (success) {
        const newFlight = await prisma.flight.create({
          data: { ...flightData, ...fullFlightData },
        });
        console.log(
          'Successfully found extra flight data and saved flight to prisma.'
        );
        console.log(newFlight);

        // Attempt to schedule job
        console.log('Trying to schedule flight checkin...');
        const scheduleData = await fetch('http://localhost:3001/jobs', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `${newFlight.firstName}-${newFlight.flightDate}-${newFlight.departureAirport}-${newFlight.arrivalAirport}`,
            taskScript: 'southwestCheckin',
            scheduleDate: newFlight.flightDate,
            data: JSON.stringify({
              confirmationNumber: newFlight.confirmationNumber,
              firstName: newFlight.firstName,
              lastName: newFlight.lastName,
              phoneNumber: newFlight.phoneNumber,
              email: newFlight.email,
            }),
            secret: 'password',
          }),
        });
        const result = await scheduleData.json();
        console.log('SCHEDULE RESULT');
        console.log(result);

        res.json({
          success,
          data: newFlight,
          errorMessage: '',
        });
      } else {
        console.log('Failed to find flight data. Got error: ' + errorMessage);
        res.json({ success, data: [], errorMessage: errorMessage });
      }
    } catch (e: any) {
      console.log('Caught error while searching for flight data');
      let errorMessage;
      if (e.response) {
        console.log('Found errors in amadeus result');
        errorMessage = JSON.stringify(
          e.response.result.errors.map((e: any) => {
            if (e.detail.includes('past date'))
              return 'INVALID DATE: Date cannot be in the past.';
            return `${e.title} (${e.code}): ${e.detail}`;
          })
        );
      } else {
        errorMessage = JSON.stringify(e);
      }
      console.log(errorMessage);
      res.json({
        success: false,
        data: [],
        errorMessage: errorMessage,
      });
    }
  } else {
    // Get all flights
    const flights = await prisma.flight.findMany();
    res.json({ data: flights, success: true, errorMessage: '' });
  }
};
