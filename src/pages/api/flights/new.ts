import { Flight, Prisma, PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayjs from 'dayjs';
import { z } from 'zod';
import { scheduleJob } from '../../../lib/fridayServerUtils';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

type Data = {
  flight?: Flight;
  errorMessage?: String;
  success: Boolean;
};

const flightRequestSchema = z.object({
  confirmationNumber: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string().optional(),
  email: z.string().optional(),
});

export type FlightRequest = z.infer<typeof flightRequestSchema>;

const allowedMethods = ['POST'];
export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  if (!allowedMethods.includes(req.method!) || req.method == 'OPTIONS') {
    return res
      .status(405)
      .send({ success: false, errorMessage: 'Method not allowed.' });
  }

  const prisma = new PrismaClient();

  // Parse flight request and save to prisma
  const flightRequest = flightRequestSchema.parse(req.body);
  await prisma.flight.create({
    data: flightRequest,
  });

  // Kick off job to get full flight info from southwest site
  const detailJobResult = await scheduleJob({
    name: `Flight Info Request: ${flightRequest.confirmationNumber}, ${flightRequest.firstName} ${flightRequest.lastName}`,
    taskScript: 'getSouthwestFlightDetails',
    data: flightRequest,
  });

  // // Pull Additional flight data
  // try {
  //   console.log(`Getting flight data with following info: "${req.body}"...`);

  //   const departureDate = dayjs(flightData.flightDate, 'MM-DD-YYYY h:mm a');

  //   // Test using southwest flight details script to get more info about flight
  //   // TODO: make this script return immediately
  //   const detailedFlightInfo = await fetch(
  //     `${process.env.FRIDAY_SERVER_URL}/jobs`,
  //     {
  //       method: 'POST',
  //       headers: {
  //         Accept: 'application/json',
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         name: ,
  //         taskScript: 'getSouthwestFlightDetails',
  //         callbackUrl: `${process.env.FRIDAY_CLIENT_URL}/api/flights/flightDetailsCallback`,
  //         data: JSON.stringify({
  //           confirmationNumber: flightData.confirmationNumber,
  //           firstName: flightData.firstName,
  //           lastName: flightData.lastName,
  //         }),
  //         secret: process.env.FRIDAY_SERVER_SECRET,
  //       }),
  //     }
  //   );
  //   console.log('Successfully scheduled flight details request');
  //   console.log(`Okay? ${detailedFlightInfo.ok}`);
  //   const detailResult = await detailedFlightInfo.json();
  //   console.log('Result:');
  //   console.log(JSON.stringify(detailResult, null, 2));
  //   console.log('Scheduling check in as normal');

  // const success = true;
  // const errorMessage = 'No error ;)';
  // const fullFlightDataResult = {
  //   departureAirport: 'NA',
  //   departureTime: departureDate.toISOString(),
  //   arrivalAirport: 'NA',
  //   arrivalTime: departureDate.toISOString(),
  //   flightDuration: 'PT3H',
  // };

  // if (success) {
  //   const newFlight = await prisma.flight.create({
  //     data: { ...flightData, ...fullFlightDataResult },
  //   });
  //   console.log(
  //     'Successfully found extra flight data and saved flight to prisma.'
  //   );
  //   console.log(newFlight);

  //   // Subtract 1 day from dayjs date
  //   // Attempt to schedule job
  //   const scheduleDate = departureDate.subtract(1, 'day');
  //   console.log(
  //     `Trying to schedule flight checkin for following date: ${scheduleDate.toString()}...`
  //   );

  //   const scheduleData = await fetch(
  //     `${process.env.FRIDAY_SERVER_URL}/jobs`,
  //     {
  //       method: 'POST',
  //       headers: {
  //         Accept: 'application/json',
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         name: `${newFlight.firstName}-${newFlight.flightDate.replace(
  //           ' ',
  //           '_'
  //         )}-${newFlight.departureAirport}-${newFlight.arrivalAirport}`,
  //         taskScript: 'southwestCheckin',
  //         scheduleDate: scheduleDate.toISOString(),
  //         callbackUrl: `${process.env.FRIDAY_CLIENT_URL}/api/flights/checkinCallback`,
  //         data: JSON.stringify({
  //           confirmationNumber: newFlight.confirmationNumber,
  //           firstName: newFlight.firstName,
  //           lastName: newFlight.lastName,
  //           phoneNumber: newFlight.phoneNumber || undefined,
  //           email: newFlight.email || undefined,
  //         }),
  //         secret: process.env.FRIDAY_SERVER_SECRET,
  //       }),
  //     }
  //   );

  //   if (scheduleData.ok) {
  //     const result = await scheduleData.json();
  //     console.log('Successfully scheduled checkin');

  //     // Save job id
  //     let updatedFlight = await prisma.flight.update({
  //       where: { id: newFlight.id },
  //       data: { checkinJobId: result.id, checkinStatus: 1 },
  //     });

  //     res.json({
  //       success,
  //       flight: updatedFlight,
  //       errorMessage: '',
  //     });
  //   } else {
  //     // If scheduling failed, rollback flight creation
  //     await prisma.flight.delete({ where: { id: newFlight.id } });
  //     res.json({
  //       success: false,
  //       errorMessage: `SCHEDULING CHECK-IN FAILED: ${await scheduleData.text()}. Flight must be at least 24 hours away.`,
  //     });
  //   }
  // } else {
  //   // TODO: clean up potentially bad data, any null checkinJobId values is invalid
  //   console.log('Failed to find flight data. Got error: ' + errorMessage);
  //   res.json({ success: false, errorMessage: errorMessage });
  // }
  // } catch (e: any) {
  //   console.log('Caught error while searching for flight data');
  //   const errorMessage = JSON.stringify(e);
  //   console.log(errorMessage);
  //   res.json({
  //     success: false,
  //     errorMessage: errorMessage,
  //   });
  // }
};
