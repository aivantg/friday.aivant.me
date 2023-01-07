import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  Heading,
  HStack,
  IconButton,
  Link,
  Text,
  Tooltip,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { PhoneIcon, EmailIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { Flight } from '@prisma/client';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import advanced from 'dayjs/plugin/advancedFormat';
import FlightCheckinStatus from './FlightCheckinStatus';
dayjs.extend(timezone);
dayjs.extend(advanced);

type ComponentProps = {
  flightData: Flight;
  onSuccessfulCancel: () => void;
};

export default function FlightCard({
  flightData,
  onSuccessfulCancel,
}: ComponentProps): JSX.Element {
  const toast = useToast();
  const departureDate = dayjs(flightData.departureTime);
  const arrivalDate = dayjs(flightData.arrivalTime);

  const cancelFlight = async () => {
    const resultData = await fetch('/api/flights/cancel', {
      method: 'POST',
      body: JSON.stringify({ id: flightData.id }),
    });
    const { success, flight, errorMessage } = await resultData.json();
    if (success) {
      onSuccessfulCancel();
    } else {
      toast({
        title: 'Error canceling flight',
        description: errorMessage,
        status: 'error',
        position: 'top',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  return (
    <Card variant="outline" mr={4}>
      <CardBody pb={2} pt={2}>
        <Flex justifyContent="flex-end" alignItems="center">
          <Heading flex={1} size="s">
            Flight on {departureDate.format('MMM DD, YYYY')}
          </Heading>
          <FlightCheckinStatus
            flightData={flightData}
            onCancel={() => cancelFlight()}
          />
        </Flex>
        <Divider mt={1} mb={1} />
        <Flex>
          <Box flex={1}>
            <HStack>
              <VStack spacing={0}>
                <Text fontSize="2xl">{flightData.departureAirport}</Text>
                <Text fontSize="xs">{departureDate.format('h:mma z')}</Text>
              </VStack>
              <Text fontSize="2xl" p={4}>
                →
              </Text>
              <VStack spacing={0}>
                <Text fontSize="2xl">{flightData.arrivalAirport}</Text>
                <Text fontSize="xs">{arrivalDate.format('h:mma z')}</Text>
              </VStack>
            </HStack>
          </Box>
          {flightData.checkinError ? (
            <Flex
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              <Text fontSize="xs">
                <b>Error details:</b> {flightData.checkinError}
              </Text>
              <Link
                fontSize="xs"
                href={`https://www.southwest.com/air/check-in/?confirmationNumber=${flightData.confirmationNumber}&passengerFirstName=${flightData.firstName}&passengerLastName=${flightData.lastName}`}
                isExternal
              >
                Check-in manually <ExternalLinkIcon mx="2px" />
              </Link>
            </Flex>
          ) : (
            <HStack>
              <Text fontSize="s">Boarding Position:</Text>
              <Text fontSize="2xl">TBD</Text>
            </HStack>
          )}
        </Flex>
        <Divider mt={1} mb={1} />
        <Flex w="100%" justifyContent="flex-end">
          <HStack flex={1}>
            <Text fontSize="xs" mr={4}>
              <b>Passenger</b>: {flightData.firstName} {flightData.lastName}
            </Text>
            <Text fontSize="xs">
              <b>Confirmation</b>: {flightData.confirmationNumber}
            </Text>
          </HStack>
          <HStack>
            <Text fontSize="xs">
              <b>Boarding Pass Settings:</b>
            </Text>
            {flightData.email && (
              <Tooltip label={flightData.email}>
                <EmailIcon w={4} h={4} />
              </Tooltip>
            )}
            {flightData.phoneNumber && (
              <Tooltip label={flightData.phoneNumber}>
                <PhoneIcon w={4} h={4} />
              </Tooltip>
            )}
            {!(flightData.email || flightData.phoneNumber) && (
              <Text fontSize="xs">None</Text>
            )}
          </HStack>
        </Flex>
      </CardBody>
    </Card>
  );
}
