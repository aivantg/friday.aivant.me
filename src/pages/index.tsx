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

type UserApplication = {
  id: string;
  name: string;
  component: FC;
};

// Add to this list to create more applications
const applications: UserApplication[] = [
  { id: 'home', name: 'Home', component: Home },
  // { id: 'flights', name: 'Flights', component: FlightsView },
];

function Home() {
  return (
    <Box>
      <Heading>Welcome to the new empty friday.aivant.me</Heading>
    </Box>
  );
}

export default function Index() {
  return (
    <Box>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>Friday</title>
      </Head>
      <Center bg="#C3E8BD" w="100vw" h="100vh">
        <Box borderRadius="5%" p={4} bg="#FAF9F6" w="60vw" h="85vh">
          <Tabs h="100%">
            <TabList h="10%">
              {applications.map((app) => (
                <Tab key={app.id}>{app.name}</Tab>
              ))}
            </TabList>
            <TabPanels h="90%">
              {applications.map((app) => (
                <TabPanel key={app.id} h="100%">
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
