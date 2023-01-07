import { Flight, PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  flight?: Flight;
  errorMessage?: String;
  success: Boolean;
};
const allowedMethods = ['POST'];
export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  if (!allowedMethods.includes(req.method!) || req.method == 'OPTIONS') {
    return res
      .status(405)
      .send({ success: false, errorMessage: 'Method not allowed.' });
  }

  // Extract ID from request body
  const id = JSON.parse(req.body).id;
  if (!id) {
    return res.status(400).send({
      success: false,
      errorMessage: 'Did not find `id` in request body',
    });
  }

  // Cancel flight
  try {
    const prisma = new PrismaClient();
    const flight = await prisma.flight.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Cancel scheduled job if exists
    if (flight.checkinJobId) {
      const result = await fetch(
        `${process.env.FRIDAY_SERVER_URL}/jobs/cancel`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: flight.checkinJobId,
            secret: process.env.FRIDAY_SERVER_SECRET,
          }),
        }
      );

      if (!result.ok) {
        throw new Error(
          `Failed to cancel scheduling job. ${await result.text()}`
        );
      }
    }

    return res.status(200).json({ success: true, flight });
  } catch (e) {
    console.log('Ran into error while deleting flight');
    console.log(e);
    return res
      .status(500)
      .send({ success: false, errorMessage: JSON.stringify(e) });
  }
};
