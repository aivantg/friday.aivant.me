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
    console.log(
      `Received checkin callback with data:\n${JSON.stringify(
        req.body,
        null,
        2
      )}`
    );
    res.status(200).send({ success: true });
  } catch (e) {
    console.log('Ran into error while parsing flight details');
    console.log(e);
    return res
      .status(500)
      .send({ success: false, errorMessage: JSON.stringify(e) });
  }
};
