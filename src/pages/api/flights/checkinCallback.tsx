import { Flight, PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = { success: Boolean; errorMessage?: String };

const allowedMethods = ['POST'];
export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  if (!allowedMethods.includes(req.method!) || req.method == 'OPTIONS') {
    return res
      .status(405)
      .send({ success: false, errorMessage: 'Method not allowed.' });
  }

  // Take in checkin result and update local flight
  try {
    const prisma = new PrismaClient();
    console.log(
      `Received checkin callback with data: ${JSON.stringify(req.body)}`
    );
    const data = req.body;
    const { jobId } = data;
    const flight = await prisma.flight.findFirst({
      where: { checkinJobId: jobId },
    });

    if (!flight) {
      throw new Error(`Could not find flight with jobId: ${jobId}`);
    }

    if (data.result.success) {
      const { boardingPosition } = data.result;
      await prisma.flight.update({
        where: { id: flight.id },
        data: { checkinStatus: 3, boardingPosition: boardingPosition },
      });
    } else {
      const { errorMessage } = data.result;
      await prisma.flight.update({
        where: { id: flight.id },
        data: { checkinStatus: 2, checkinError: errorMessage },
      });
    }
    res.status(200).send({ success: true });
  } catch (e) {
    console.log('Ran into error while updating check-in status for flight');
    console.log(e);
    return res
      .status(500)
      .send({ success: false, errorMessage: JSON.stringify(e) });
  }
};
