import {
  Box,
  Center,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import Head from 'next/head';
import { FC } from 'react';
import FlightsView from '../components/flights/FlightsView';
import Home from '../components/home/Home';

type UserApplication = {
  id: string;
  name: string;
  component: FC;
};

// Add to this list to create more applications
const applications: UserApplication[] = [
  // { id: 'home', name: 'Home', component: Home },
  { id: 'flights', name: 'Flights', component: FlightsView },
];

export default function Index() {
  return (
    <Box>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>Friday</title>
      </Head>
      <Center bg="#C3E8BD" w="100vw" h="100vh">
        <Box borderRadius="5%" p={8} bg="white" w="60vw" h="70vh">
          <Heading size="md">Friday</Heading>
          <Tabs>
            <TabList>
              {applications.map((app) => (
                <Tab key={app.id}>{app.name}</Tab>
              ))}
            </TabList>
            <TabPanels>
              {applications.map((app) => (
                <TabPanel key={app.id}>
                  <app.component />
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </Box>
      </Center>
    </Box>
  );
}
