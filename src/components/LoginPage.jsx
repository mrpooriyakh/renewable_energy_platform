import { useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Input,
  VStack,
  HStack,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Icon,
  useColorModeValue,
  Center
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FaLeaf, FaUser, FaLock, FaSignInAlt, FaSun, FaWater, FaFire, FaWind } from 'react-icons/fa'

const MotionBox = motion(Box)
const MotionCard = motion(Card)

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const bgGradient = useColorModeValue(
    'linear(to-br, blue.400, purple.500, green.400)',
    'linear(to-br, blue.600, purple.700, green.600)'
  )
  const cardBg = useColorModeValue('white', 'gray.800')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await onLogin(username, password)
    } catch (error) {
      setError(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      minH="100vh"
      bgGradient={bgGradient}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      position="relative"
      overflow="hidden"
    >
      {/* Animated background elements */}
      <MotionBox
        position="absolute"
        top="10%"
        left="10%"
        w="100px"
        h="100px"
        borderRadius="full"
        bg="white"
        opacity={0.1}
        animate={{
          y: [0, -20, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <MotionBox
        position="absolute"
        top="20%"
        right="15%"
        w="60px"
        h="60px"
        borderRadius="full"
        bg="white"
        opacity={0.1}
        animate={{
          y: [0, 15, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <MotionBox
        position="absolute"
        bottom="15%"
        left="20%"
        w="80px"
        h="80px"
        borderRadius="full"
        bg="white"
        opacity={0.1}
        animate={{
          rotate: [0, -180, -360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <Container maxW="md">
        <MotionCard
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          bg={cardBg}
          shadow="2xl"
          borderRadius="2xl"
          overflow="hidden"
          backdropFilter="blur(10px)"
          border="1px"
          borderColor="white"
        >
          {/* Header */}
          <Box
            bgGradient="linear(to-r, green.400, blue.500)"
            p={8}
            textAlign="center"
            color="white"
          >
            <MotionBox
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              mb={4}
            >
              <Box
                p={4}
                bg="white"
                borderRadius="full"
                display="inline-block"
                shadow="lg"
              >
                <Icon as={FaLeaf} color="green.500" boxSize="3rem" />
              </Box>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Heading size="xl" mb={2} fontWeight="bold">
                Renewable Energy Platform
              </Heading>
              <Text fontSize="lg" opacity={0.9}>
                Learn about sustainable energy solutions
              </Text>
            </MotionBox>
          </Box>

          <CardBody p={8}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <VStack spacing={6} align="stretch">
                <Center>
                  <Text color="gray.600" fontSize="lg" textAlign="center">
                    Sign in to access your learning portal
                  </Text>
                </Center>

                {error && (
                  <Alert status="error" borderRadius="lg">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <VStack spacing={6} align="stretch">
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                        Username
                      </FormLabel>
                      <Box position="relative">
                        <Input
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Enter your username"
                          size="lg"
                          pl={12}
                          focusBorderColor="green.500"
                          borderColor="gray.300"
                          _hover={{ borderColor: 'green.400' }}
                          bg="gray.50"
                          _focus={{ bg: 'white' }}
                        />
                        <Icon
                          as={FaUser}
                          position="absolute"
                          left={4}
                          top="50%"
                          transform="translateY(-50%)"
                          color="gray.400"
                        />
                      </Box>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                        Password
                      </FormLabel>
                      <Box position="relative">
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          size="lg"
                          pl={12}
                          focusBorderColor="green.500"
                          borderColor="gray.300"
                          _hover={{ borderColor: 'green.400' }}
                          bg="gray.50"
                          _focus={{ bg: 'white' }}
                        />
                        <Icon
                          as={FaLock}
                          position="absolute"
                          left={4}
                          top="50%"
                          transform="translateY(-50%)"
                          color="gray.400"
                        />
                      </Box>
                    </FormControl>

                    <Button
                      type="submit"
                      isLoading={loading}
                      loadingText="Signing in..."
                      colorScheme="green"
                      size="lg"
                      leftIcon={<FaSignInAlt />}
                      bgGradient="linear(to-r, green.400, blue.500)"
                      _hover={{
                        bgGradient: "linear(to-r, green.500, blue.600)",
                        transform: "translateY(-2px)",
                        shadow: "lg"
                      }}
                      _active={{
                        transform: "translateY(0px)",
                      }}
                      transition="all 0.2s"
                      fontWeight="bold"
                    >
                      Sign In
                    </Button>
                  </VStack>
                </form>

                {/* Demo Credentials */}
                <Box
                  bg="gray.50"
                  p={6}
                  borderRadius="lg"
                  border="1px"
                  borderColor="gray.200"
                >
                  <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={3} textAlign="center">
                    Demo Credentials
                  </Text>
                  <VStack spacing={2} fontSize="sm">
                    <HStack justify="space-between" w="full">
                      <Text color="gray.600" fontWeight="medium">Student Portal:</Text>
                      <Text color="blue.600" fontWeight="bold">admin / admin123</Text>
                    </HStack>
                    <HStack justify="space-between" w="full">
                      <Text color="gray.600" fontWeight="medium">Teacher Portal:</Text>
                      <Text color="green.600" fontWeight="bold">admin1 / admin123</Text>
                    </HStack>
                  </VStack>
                </Box>

                {/* Features */}
                <VStack spacing={3} pt={4}>
                  <Text fontSize="sm" color="gray.600" textAlign="center" fontWeight="medium">
                    Explore renewable energy topics:
                  </Text>
                  <HStack spacing={4} justify="center" flexWrap="wrap">
                    <HStack spacing={1}>
                      <Icon as={FaSun} color="orange.500" />
                      <Text fontSize="xs" color="gray.600">Solar</Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Icon as={FaWater} color="blue.500" />
                      <Text fontSize="xs" color="gray.600">Hydro</Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Icon as={FaFire} color="red.500" />
                      <Text fontSize="xs" color="gray.600">Geothermal</Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Icon as={FaWind} color="green.500" />
                      <Text fontSize="xs" color="gray.600">Wind</Text>
                    </HStack>
                  </HStack>
                </VStack>
              </VStack>
            </MotionBox>
          </CardBody>
        </MotionCard>
      </Container>
    </Box>
  )
}

export default LoginPage