import { Box, Divider, Spinner, VStack } from '@chakra-ui/react';
import { Flight } from '@prisma/client';
import { useEffect, useState } from 'react';
import FlightCard from './FlightCard';
import NewFlightForm from './NewFlightModal';

type ComponentProps = {};

export default function FlightsView(props: ComponentProps): JSX.Element {
  const [isLoading, setLoading] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);

  const loadFlights = async () => {
    setLoading(true);
    const data = await fetch('/api/flights');
    const flights = await data.json();
    setFlights(flights.data);
    setLoading(false);
  };

  useEffect(() => {
    loadFlights();
  }, []);

  return (
    <Box>
      <NewFlightForm
        onSuccessfulSave={() => {
          loadFlights();
        }}
      />
      <Divider />
      <VStack h="100%">
        {isLoading ? (
          <Spinner />
        ) : flights.length ? (
          flights.map((flight) => (
            <Box mt={4} width="100%">
              <FlightCard key={flight.id} flightData={flight} />
            </Box>
          ))
        ) : (
          'No flights :('
        )}
      </VStack>
    </Box>
  );
}
