import { Badge, HStack, IconButton } from '@chakra-ui/react';
import { PhoneIcon, EmailIcon, CloseIcon } from '@chakra-ui/icons';
import { Flight } from '@prisma/client';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import advanced from 'dayjs/plugin/advancedFormat';
dayjs.extend(timezone);
dayjs.extend(advanced);

type ComponentProps = {
  flightData: Flight;
  onCancel: () => void;
};

const checkinStatusMap = [
  { badgeText: 'Error scheduling check-in', badgeColor: 'red' },
  { badgeText: 'Scheduled check-in', badgeColor: 'blue' },
  { badgeText: 'Check-in failed', badgeColor: 'red' },
  { badgeText: 'Check-in succeeded', badgeColor: 'green' },
];

export default function FlightCheckinStatus({
  flightData,
  onCancel,
}: ComponentProps): JSX.Element {
  let badgeData = checkinStatusMap[flightData.checkinStatus];
  return (
    <HStack>
      <Badge align-self="start" colorScheme={badgeData.badgeColor}>
        {badgeData.badgeText}
      </Badge>
      {flightData.checkinStatus <= 1 && ( // Only show cancel if
        <IconButton
          aria-label="Cancel flight check-in"
          variant="ghost"
          size="sm"
          icon={<CloseIcon w={3} h={3} />}
          onClick={onCancel}
        />
      )}
    </HStack>
  );
}
