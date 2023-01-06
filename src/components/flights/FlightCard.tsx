import { Box } from '@chakra-ui/react';
import { Flight } from '@prisma/client';

type ComponentProps = {
  flightData: Flight;
};

export default function FlightCard({
  flightData,
}: ComponentProps): JSX.Element {
  return <Box>{JSON.stringify(flightData)}</Box>;
}
