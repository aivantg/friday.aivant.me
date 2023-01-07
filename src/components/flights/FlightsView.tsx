import {
  Box,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Spinner,
  Switch,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { Flight } from '@prisma/client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import FlightCard from './FlightCard';
import NewFlightForm from './NewFlightModal';
import EmptyStateImage from '../../public/images/empty-state.png';

type ComponentProps = {};

export default function FlightsView(props: ComponentProps): JSX.Element {
  const [isLoading, setLoading] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [showAllFlights, setShowAllFlights] = useState(false);
  const toast = useToast();
  const loadFlights = async () => {
    setLoading(true);
    const data = await fetch('/api/flights');
    const flights = await data.json();
    setFlights(flights.flights);
    setLoading(false);
  };

  useEffect(() => {
    loadFlights();
  }, []);

  const filteredFlights = flights.filter(
    (flight) => showAllFlights || new Date(flight.departureTime) > new Date()
  );

  const flightStack = (
    <VStack overflow="scroll">
      {filteredFlights.length ? (
        filteredFlights.map((flight) => (
          <Box mt={4} width="100%">
            <FlightCard
              key={flight.id}
              flightData={flight}
              onSuccessfulCancel={() => {
                toast({
                  title: 'Successfully canceled check-in',
                  status: 'success',
                  position: 'top',
                });
                loadFlights();
              }}
            />
          </Box>
        ))
      ) : (
        <Box mt={4}>
          <Image
            src={EmptyStateImage}
            alt="Image of an empty box"
            priority
            height="128"
            width="128"
          />
          <Text>No flights found :(</Text>
        </Box>
      )}
    </VStack>
  );

  return (
    <Flex h="100%" direction="column">
      <Flex justifyContent="flex-end" alignItems="center">
        <FormControl display="flex" alignItems="center">
          <FormLabel mb="0">Show past flights</FormLabel>
          <Switch
            colorScheme={'green'}
            onChange={() => {
              setShowAllFlights(!showAllFlights);
            }}
            isChecked={showAllFlights}
          />
        </FormControl>
        <NewFlightForm
          onSuccessfulSave={() => {
            loadFlights();
          }}
        />
      </Flex>
      <Divider mt={4} />
      {isLoading ? (
        <Flex h="100%" justifyContent="center" alignItems="center">
          <Spinner />
        </Flex>
      ) : (
        flightStack
      )}
    </Flex>
  );
}
