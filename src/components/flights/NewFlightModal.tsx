import {
  Box,
  Button,
  Divider,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Flight } from '@prisma/client';
import { useState } from 'react';

type ComponentProps = {
  onSuccessfulSave: () => void;
};

export default function NewFlightModal(props: ComponentProps): JSX.Element {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setLoading] = useState(false);
  const toast = useToast();
  const onSubmit = async (values: Flight) => {
    setLoading(true);
    values.phoneNumber = `${values.phoneNumber}`; // Convert phone number to string
    const resultData = await fetch('/api/flights', {
      method: 'POST',
      body: JSON.stringify(values),
    });
    const { success, data, errorMessage } = await resultData.json();
    setLoading(false);
    if (success) {
      toast({
        title: `Successfully saved your flight from ${data.departureAirport} to ${data.arrivalAirport}`,
        description: `Scheduling check-in...`,
        status: 'success',
        position: 'top',
      });
      props.onSuccessfulSave();
      onClose();
    } else {
      toast({
        title: 'Error looking up flight',
        description: errorMessage,
        status: 'error',
        position: 'top',
        duration: 10000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Button onClick={onOpen}>Add new flight</Button>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Schedule an auto-checkin</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Formik
              initialValues={{
                confirmationNumber: '',
                firstName: '',
                lastName: '',
                flightNumber: '',
                flightDate: '',
                email: '',
                phoneNumber: '',
              }}
              validationSchema={Yup.object({
                confirmationNumber: Yup.string().required('Required'),
                firstName: Yup.string().required('Required'),
                lastName: Yup.string().required('Required'),
                flightNumber: Yup.number()
                  .required()
                  .integer()
                  .min(0)
                  .max(9999, 'Flight number must be 1-4 digits'),
                flightDate: Yup.string()
                  .required('Required')
                  .matches(
                    /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/,
                    'Must be a valid date with the format: YYYY-MM-DD'
                  ),
                email: Yup.string().email().notRequired(),
                phoneNumber: Yup.number()
                  .integer()
                  .min(1000000000, 'Phone number must be 10 digits')
                  .max(9999999999, 'Phone number must be 10 digits')
                  .notRequired(),
              })}
              onSubmit={onSubmit}
            >
              <Form>
                <SimpleGrid columns={2} spacing={4}>
                  <Field name="firstName">
                    {({ field, form }) => (
                      <FormControl
                        isRequired
                        isInvalid={
                          form.errors.firstName && form.touched.firstName
                        }
                      >
                        <FormLabel>First Name</FormLabel>
                        <Input {...field} placeholder="Jane" />
                        <FormErrorMessage>
                          {form.errors.firstName}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Field name="lastName">
                    {({ field, form }) => (
                      <FormControl
                        isRequired
                        isInvalid={
                          form.errors.lastName && form.touched.lastName
                        }
                      >
                        <FormLabel>Last Name</FormLabel>
                        <Input {...field} placeholder="Doe" />
                        <FormErrorMessage>
                          {form.errors.lastName}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Field name="confirmationNumber">
                    {({ field, form }) => (
                      <FormControl
                        isRequired
                        isInvalid={
                          form.errors.confirmationNumber &&
                          form.touched.confirmationNumber
                        }
                      >
                        <FormLabel>Confirmation Number</FormLabel>
                        <Input {...field} placeholder="ABC123" />
                        <FormErrorMessage>
                          {form.errors.confirmationNumber}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Field name="flightNumber">
                    {({ field, form }) => (
                      <FormControl
                        isRequired
                        isInvalid={
                          form.errors.flightNumber && form.touched.flightNumber
                        }
                      >
                        <FormLabel>Flight Number</FormLabel>
                        <Input {...field} type="number" placeholder="1234" />
                        <FormErrorMessage>
                          {form.errors.flightNumber}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </SimpleGrid>
                <Field name="flightDate">
                  {({ field, form }) => (
                    <FormControl
                      isRequired
                      isInvalid={
                        form.errors.flightDate && form.touched.flightDate
                      }
                    >
                      <FormLabel mt={4}>
                        Flight Date (local to departing airport)
                      </FormLabel>
                      <Input {...field} placeholder="YYYY-MM-DD" />
                      <FormErrorMessage>
                        {form.errors.flightDate}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Divider mt={4} />
                <Text mt={2} mb={2} fontSize="md">
                  Optionally enter email and/or phone number to receive boarding
                  pass
                </Text>
                <SimpleGrid columns={2} spacing={4}>
                  <Field name="email">
                    {({ field, form }) => (
                      <FormControl
                        isInvalid={form.errors.email && form.touched.email}
                      >
                        <FormLabel>Email</FormLabel>

                        <Input {...field} placeholder="janedoe@gmail.com" />
                        <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Field name="phoneNumber">
                    {({ field, form }) => (
                      <FormControl
                        isInvalid={
                          form.errors.phoneNumber && form.touched.phoneNumber
                        }
                      >
                        <FormLabel>Phone Number (digits only)</FormLabel>

                        <Input
                          {...field}
                          type="number"
                          placeholder="123456789"
                        />
                        <FormErrorMessage>
                          {form.errors.phoneNumber}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </SimpleGrid>
                <Box w="100%" display="flex" mb={4} justifyContent="flex-end">
                  <Button
                    mt={4}
                    colorScheme="teal"
                    type="submit"
                    isLoading={isLoading}
                  >
                    Submit
                  </Button>
                </Box>
              </Form>
            </Formik>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
