import { Flight, PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  flights?: Flight[];
  errorMessage?: String;
  success: Boolean;
};
const allowedMethods = ['GET'];
export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  if (!allowedMethods.includes(req.method!) || req.method == 'OPTIONS') {
    return res
      .status(405)
      .send({ success: false, errorMessage: 'Method not allowed.' });
  }

  // Get all non-deleted flights and sort them by date
  try {
    const prisma = new PrismaClient();
    const flights = await prisma.flight.findMany({
      where: { deletedAt: null },
    });

    const flightsSorted = flights.sort((a, b) => {
      const dateA = new Date(a.departureTime);
      const dateB = new Date(b.departureTime);
      if (dateA > dateB) return -1;
      if (dateA < dateB) return 1;
      return 0;
    });
    res.json({ flights: flightsSorted, success: true });
  } catch (e) {
    console.log('Ran into error while deleting flight');
    console.log(e);
    return res
      .status(500)
      .send({ success: false, errorMessage: JSON.stringify(e) });
  }
};
