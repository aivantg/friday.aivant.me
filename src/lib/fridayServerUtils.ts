import type { Dayjs } from 'dayjs';
import { z } from 'zod';
import { FlightRequest } from '../pages/api/flights/new';

type scheduleJobParams = {
  name: string;
  scheduleDate?: Dayjs;
  taskScript: 'getSouthwestFlightDetails' | 'southwestCheckin';
  data: FlightRequest;
};

const scheduleJobResultSchema = z.discriminatedUnion('taskScript', [
  z.object({
    taskScript: z.literal('getSouthwestFlightDetails'),
    flightDetails: z.object({
      // TODO
    }),
  }),
  z.object({
    taskScript: z.literal('southwestCheckin'),
    checkinStatus: z.number(),
  }),
]);
type ScheduleJobResult = z.infer<typeof scheduleJobResultSchema>;

/**
 * Schedules a job on the Friday server. When finished, /api/flights/callback will be called with the result.
 *
 * If scheduleDate is not provided, the job will be scheduled immediately.
 */
export const scheduleJob = async ({
  name,
  scheduleDate,
  taskScript,
  data,
}: scheduleJobParams): Promise<ScheduleJobResult> => {
  const result = await fetch(`${process.env.FRIDAY_SERVER_URL}/jobs`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      taskScript,
      scheduleDate: scheduleDate?.toISOString() || undefined,
      callbackUrl: `${process.env.FRIDAY_CLIENT_URL}/api/flights/callback`,
      data: JSON.stringify(data),
      secret: process.env.FRIDAY_SERVER_SECRET,
    }),
  });

  if (!result.ok) {
    throw new Error(`Failed to schedule job: ${result.statusText}`);
  }

  return result.json();
};
