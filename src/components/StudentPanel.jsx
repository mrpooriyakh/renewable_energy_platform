import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Input,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Flex,
  Avatar,
  Spacer,
  VStack,
  HStack,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Spinner,
  Center,
  Image,
  Link,
  Divider,
  Icon,
  useToast
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaSun,
  FaWater,
  FaFire,
  FaWind,
  FaDownload,
  FaSearch,
  FaSignOutAlt,
  FaBook,
  FaFileAlt,
  FaCalendarAlt,
  FaUser
} from 'react-icons/fa'
import { supabase } from '../lib/supabase'

const MotionBox = motion(Box)
const MotionCard = motion(Card)

const energyTypes = {
  solar: {
    name: 'Solar Energy',
    icon: FaSun,
    color: 'orange',
    gradient: 'linear(to-r, orange.400, yellow.400)',
    bgGradient: 'linear(to-br, orange.50, yellow.50)',
    description: 'Harness the power of the sun'
  },
  hydro: {
    name: 'Hydro Energy',
    icon: FaWater,
    color: 'blue',
    gradient: 'linear(to-r, blue.400, cyan.400)',
    bgGradient: 'linear(to-br, blue.50, cyan.50)',
    description: 'Energy from flowing water'
  },
  geothermal: {
    name: 'Geothermal Energy',
    icon: FaFire,
    color: 'red',
    gradient: 'linear(to-r, red.400, orange.400)',
    bgGradient: 'linear(to-br, red.50, orange.50)',
    description: 'Heat from the Earth\'s core'
  },
  wind: {
    name: 'Wind Energy',
    icon: FaWind,
    color: 'green',
    gradient: 'linear(to-r, green.400, teal.400)',
    bgGradient: 'linear(to-br, green.50, teal.50)',
    description: 'Power from moving air'
  }
}

function StudentPanel({ user, onLogout }) {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState(0)
  const toast = useToast()

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')

  useEffect(() => {
    fetchContent()

    const subscription = supabase
      .channel('content-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'content' },
        () => {
          fetchContent()
          toast({
            title: 'New content available!',
            description: 'Content has been updated in real-time.',
            status: 'info',
            duration: 3000,
            isClosable: true,
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [toast])

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setContent(data || [])
    } catch (error) {
      console.error('Error fetching content:', error)
      toast({
        title: 'Error loading content',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: 'Download started',
      description: `Downloading ${fileName}`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
  }

  const getContentByType = (type) => {
    return content.filter(item => {
      const energyType = item.energy_type || 'general'
      const matchesType = type === 'all' || energyType === type
      const matchesSearch = searchTerm === '' ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesType && matchesSearch
    })
  }

  const getAllContent = () => {
    return content.filter(item =>
      searchTerm === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const ContentCard = ({ item, index }) => {
    const energyType = energyTypes[item.energy_type] || {
      name: 'General',
      icon: FaBook,
      color: 'gray',
      gradient: 'linear(to-r, gray.400, gray.600)',
      bgGradient: 'linear(to-br, gray.50, gray.100)'
    }

    return (
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        bg={cardBg}
        shadow="md"
        borderRadius="xl"
        overflow="hidden"
        _hover={{ shadow: 'xl', transform: 'translateY(-4px)' }}
        transition="all 0.3s ease"
        border="1px"
        borderColor="gray.200"
      >
        <Box
          h="4px"
          bgGradient={energyType.gradient}
        />
        <CardHeader pb={2}>
          <Flex align="center" gap={3}>
            <Box
              p={2}
              borderRadius="lg"
              bgGradient={energyType.bgGradient}
            >
              <Icon as={energyType.icon} color={`${energyType.color}.500`} size="20px" />
            </Box>
            <VStack align="start" spacing={0} flex={1}>
              <Heading size="md" color="gray.800">{item.title}</Heading>
              <Badge colorScheme={energyType.color} variant="subtle">
                {energyType.name}
              </Badge>
            </VStack>
          </Flex>
        </CardHeader>

        <CardBody pt={0}>
          <Text color="gray.600" mb={4} lineHeight="1.6">
            {item.description}
          </Text>

          {item.file_url && (
            <Box
              p={3}
              bg="gray.50"
              borderRadius="md"
              border="1px dashed"
              borderColor="gray.300"
              mb={4}
            >
              <HStack justify="space-between">
                <HStack>
                  <Icon as={FaFileAlt} color="blue.500" />
                  <Text fontSize="sm" fontWeight="medium">
                    {item.file_name || 'Download File'}
                  </Text>
                </HStack>
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="ghost"
                  onClick={() => handleDownload(item.file_url, item.file_name)}
                  leftIcon={<FaDownload />}
                >
                  Download
                </Button>
              </HStack>
            </Box>
          )}

          <Divider mb={3} />

          <HStack justify="space-between" fontSize="sm" color="gray.500">
            <HStack>
              <Icon as={FaUser} />
              <Text>By: {item.uploaded_by?.split('@')[0] || 'Teacher'}</Text>
            </HStack>
            <HStack>
              <Icon as={FaCalendarAlt} />
              <Text>{new Date(item.created_at).toLocaleDateString()}</Text>
            </HStack>
          </HStack>
        </CardBody>
      </MotionCard>
    )
  }

  if (loading) {
    return (
      <Center minH="100vh" bg={bgColor}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text fontSize="lg" color="gray.600">Loading renewable energy content...</Text>
        </VStack>
      </Center>
    )
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Header */}
      <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200">
        <Container maxW="7xl" py={4}>
          <Flex align="center">
            <HStack spacing={3}>
              <Box
                p={2}
                bg="green.100"
                borderRadius="lg"
              >
                <Icon as={FaBook} color="green.500" size="24px" />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="lg" color="gray.800">Renewable Energy Learning Hub</Heading>
                <Text color="gray.600" fontSize="sm">Explore sustainable energy solutions</Text>
              </VStack>
            </HStack>
            <Spacer />
            <HStack spacing={4}>
              <Text fontSize="sm" color="gray.600">Welcome, {user.email}</Text>
              <Button
                leftIcon={<FaSignOutAlt />}
                colorScheme="red"
                variant="outline"
                size="sm"
                onClick={onLogout}
              >
                Logout
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="7xl" py={8}>
        {/* Search Bar */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          mb={8}
        >
          <Box position="relative" maxW="md">
            <Input
              placeholder="Search renewable energy content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              pl={10}
              size="lg"
              borderRadius="full"
              bg="white"
              shadow="sm"
              border="1px"
              borderColor="gray.300"
              _focus={{ borderColor: 'blue.500', shadow: 'md' }}
            />
            <Icon
              as={FaSearch}
              position="absolute"
              left={3}
              top="50%"
              transform="translateY(-50%)"
              color="gray.400"
            />
          </Box>
        </MotionBox>

        {/* Energy Type Tabs */}
        <Tabs index={selectedTab} onChange={setSelectedTab} variant="soft-rounded" colorScheme="blue">
          <TabList mb={8} flexWrap="wrap" gap={2}>
            <Tab>All Content ({getAllContent().length})</Tab>
            {Object.entries(energyTypes).map(([key, type]) => (
              <Tab key={key}>
                <HStack spacing={2}>
                  <Icon as={type.icon} />
                  <Text>{type.name} ({getContentByType(key).length})</Text>
                </HStack>
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            {/* All Content Tab */}
            <TabPanel p={0}>
              <AnimatePresence>
                {getAllContent().length === 0 ? (
                  <MotionBox
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    textAlign="center"
                    py={16}
                  >
                    <Icon as={FaBook} size="4em" color="gray.300" mb={4} />
                    <Heading size="lg" color="gray.600" mb={2}>
                      {searchTerm ? 'No content found' : 'No content available yet'}
                    </Heading>
                    <Text color="gray.500">
                      {searchTerm
                        ? 'Try adjusting your search terms'
                        : 'Your teacher will upload learning materials soon!'
                      }
                    </Text>
                  </MotionBox>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {getAllContent().map((item, index) => (
                      <ContentCard key={item.id} item={item} index={index} />
                    ))}
                  </SimpleGrid>
                )}
              </AnimatePresence>
            </TabPanel>

            {/* Energy Type Specific Tabs */}
            {Object.entries(energyTypes).map(([key, type]) => (
              <TabPanel key={key} p={0}>
                <AnimatePresence>
                  {getContentByType(key).length === 0 ? (
                    <MotionBox
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      textAlign="center"
                      py={16}
                    >
                      <Box
                        p={4}
                        bg={type.bgGradient}
                        borderRadius="full"
                        display="inline-block"
                        mb={4}
                      >
                        <Icon as={type.icon} size="3em" color={`${type.color}.500`} />
                      </Box>
                      <Heading size="lg" color="gray.600" mb={2}>
                        No {type.name.toLowerCase()} content yet
                      </Heading>
                      <Text color="gray.500" mb={4}>
                        {type.description}
                      </Text>
                      <Text color="gray.400" fontSize="sm">
                        Check back soon for exciting content about {type.name.toLowerCase()}!
                      </Text>
                    </MotionBox>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                      {getContentByType(key).map((item, index) => (
                        <ContentCard key={item.id} item={item} index={index} />
                      ))}
                    </SimpleGrid>
                  )}
                </AnimatePresence>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>

        {/* Real-time indicator */}
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          mt={12}
          textAlign="center"
        >
          <Badge
            colorScheme="green"
            variant="subtle"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="sm"
          >
            <HStack spacing={2}>
              <Box
                w={2}
                h={2}
                bg="green.500"
                borderRadius="full"
                animation="pulse 2s infinite"
              />
              <Text>Live updates enabled</Text>
            </HStack>
          </Badge>
        </MotionBox>
      </Container>
    </Box>
  )
}

export default StudentPanel