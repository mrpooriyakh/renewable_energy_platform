import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  Select,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Flex,
  Spacer,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useColorModeValue,
  Spinner,
  Center,
  Icon,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Tooltip
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaSun,
  FaWater,
  FaFire,
  FaWind,
  FaUpload,
  FaSignOutAlt,
  FaBook,
  FaFileAlt,
  FaCalendarAlt,
  FaUser,
  FaEye,
  FaTrash,
  FaPlus,
  FaCloudUploadAlt
} from 'react-icons/fa'
import { supabase } from '../lib/supabase'

const MotionBox = motion(Box)
const MotionCard = motion(Card)

const energyTypes = {
  general: {
    name: 'General',
    icon: FaBook,
    color: 'gray',
    gradient: 'linear(to-r, gray.400, gray.600)',
    bgGradient: 'linear(to-br, gray.50, gray.100)',
    description: 'General renewable energy content'
  },
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

function AdminPanel({ user, onLogout }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [energyType, setEnergyType] = useState('general')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploads, setUploads] = useState([])
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const [isUploading, setIsUploading] = useState(false)
  const toast = useToast()

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')

  useEffect(() => {
    fetchUploads()
  }, [])

  const fetchUploads = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUploads(data || [])
    } catch (error) {
      console.error('Error fetching uploads:', error)
      toast({
        title: 'Error loading content',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setIsUploading(true)
    setMessage('')

    try {
      let fileUrl = null
      let fileName = null

      if (file) {
        try {
          const fileExt = file.name.split('.').pop()
          const fileName_ = `${Date.now()}.${fileExt}`

          console.log('Attempting to upload file:', fileName_)

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('content-files')
            .upload(fileName_, file, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            console.error('Upload error:', uploadError)
            console.log('File upload failed, continuing with content only...')
            fileUrl = null
            fileName = null
          } else {
            console.log('Upload successful:', uploadData)

            const { data: urlData } = supabase.storage
              .from('content-files')
              .getPublicUrl(fileName_)

            fileUrl = urlData.publicUrl
            fileName = file.name
            console.log('File URL generated:', fileUrl)
          }
        } catch (fileError) {
          console.error('File processing error:', fileError)
          fileUrl = null
          fileName = null
        }
      }

      const { error } = await supabase
        .from('content')
        .insert([
          {
            title,
            description,
            energy_type: energyType,
            file_url: fileUrl,
            file_name: fileName,
            uploaded_by: user.email
          }
        ])

      if (error) throw error

      if (fileUrl) {
        setMessage('Content uploaded successfully with file!')
        setMessageType('success')
      } else if (file) {
        setMessage('Content uploaded successfully (file upload failed - check console)')
        setMessageType('warning')
      } else {
        setMessage('Content uploaded successfully!')
        setMessageType('success')
      }

      // Reset form
      setTitle('')
      setDescription('')
      setEnergyType('general')
      setFile(null)
      document.getElementById('file-input').value = ''
      fetchUploads()

      toast({
        title: 'Content uploaded!',
        description: `${energyTypes[energyType].name} content has been shared with students.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

    } catch (error) {
      setMessage(`Error: ${error.message}`)
      setMessageType('error')
      toast({
        title: 'Upload failed',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
      setIsUploading(false)
    }
  }

  const getUploadsByType = (type) => {
    return uploads.filter(item => (item.energy_type || 'general') === type)
  }

  const ContentRow = ({ item }) => {
    const energyTypeInfo = energyTypes[item.energy_type || 'general']

    return (
      <Tr>
        <Td>
          <HStack>
            <Box
              p={2}
              borderRadius="lg"
              bgGradient={energyTypeInfo.bgGradient}
            >
              <Icon as={energyTypeInfo.icon} color={`${energyTypeInfo.color}.500`} size="16px" />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontWeight="medium" fontSize="sm">{item.title}</Text>
              <Badge colorScheme={energyTypeInfo.color} variant="subtle" size="sm">
                {energyTypeInfo.name}
              </Badge>
            </VStack>
          </HStack>
        </Td>
        <Td>
          <Text fontSize="sm" color="gray.600" noOfLines={2}>
            {item.description}
          </Text>
        </Td>
        <Td>
          {item.file_name ? (
            <HStack spacing={1}>
              <Icon as={FaFileAlt} color="blue.500" size="12px" />
              <Text fontSize="xs" color="blue.600">{item.file_name}</Text>
            </HStack>
          ) : (
            <Text fontSize="xs" color="gray.400">No file</Text>
          )}
        </Td>
        <Td>
          <Text fontSize="xs" color="gray.500">
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </Td>
      </Tr>
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
                bg="blue.100"
                borderRadius="lg"
              >
                <Icon as={FaCloudUploadAlt} color="blue.500" size="24px" />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="lg" color="gray.800">Teacher Admin Panel</Heading>
                <Text color="gray.600" fontSize="sm">Upload renewable energy learning content</Text>
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
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          {/* Upload Form */}
          <MotionCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            bg={cardBg}
            shadow="lg"
            borderRadius="xl"
            overflow="hidden"
          >
            <Box
              h="4px"
              bgGradient="linear(to-r, blue.400, purple.400)"
            />
            <CardHeader>
              <HStack spacing={3}>
                <Icon as={FaPlus} color="blue.500" size="20px" />
                <Heading size="md">Upload New Content</Heading>
              </HStack>
            </CardHeader>

            <CardBody>
              {message && (
                <Alert
                  status={messageType === 'error' ? 'error' : messageType === 'warning' ? 'warning' : 'success'}
                  borderRadius="md"
                  mb={6}
                >
                  <AlertIcon />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <VStack spacing={6} align="stretch">
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="medium">Title</FormLabel>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter content title"
                      size="lg"
                      focusBorderColor="blue.500"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="medium">Energy Type</FormLabel>
                    <Select
                      value={energyType}
                      onChange={(e) => setEnergyType(e.target.value)}
                      size="lg"
                      focusBorderColor="blue.500"
                    >
                      {Object.entries(energyTypes).map(([key, type]) => (
                        <option key={key} value={key}>
                          {type.name} - {type.description}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="medium">Description</FormLabel>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter content description"
                      rows={4}
                      resize="vertical"
                      focusBorderColor="blue.500"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">File (optional)</FormLabel>
                    <Box
                      border="2px dashed"
                      borderColor="gray.300"
                      borderRadius="md"
                      p={6}
                      textAlign="center"
                      _hover={{ borderColor: 'blue.400', bg: 'blue.50' }}
                      transition="all 0.2s"
                    >
                      <Input
                        type="file"
                        id="file-input"
                        onChange={(e) => setFile(e.target.files[0])}
                        hidden
                      />
                      <VStack spacing={2}>
                        <Icon as={FaUpload} size="2em" color="gray.400" />
                        <Text fontSize="sm" color="gray.600">
                          Click to upload or drag and drop
                        </Text>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => document.getElementById('file-input').click()}
                        >
                          Choose File
                        </Button>
                        {file && (
                          <Text fontSize="sm" color="blue.600" fontWeight="medium">
                            📎 {file.name}
                          </Text>
                        )}
                      </VStack>
                    </Box>
                  </FormControl>

                  <Button
                    type="submit"
                    isLoading={loading}
                    loadingText={isUploading ? "Uploading..." : "Processing..."}
                    colorScheme="blue"
                    size="lg"
                    leftIcon={<FaCloudUploadAlt />}
                    disabled={loading}
                  >
                    Upload Content
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </MotionCard>

          {/* Energy Type Statistics */}
          <MotionBox
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card bg={cardBg} shadow="lg" borderRadius="xl" mb={6}>
              <CardHeader>
                <HStack spacing={3}>
                  <Icon as={FaEye} color="green.500" size="20px" />
                  <Heading size="md">Content Overview</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={2} spacing={4}>
                  {Object.entries(energyTypes).map(([key, type]) => {
                    const count = getUploadsByType(key).length
                    return (
                      <Box
                        key={key}
                        p={4}
                        borderRadius="lg"
                        border="1px"
                        borderColor="gray.200"
                        bgGradient={type.bgGradient}
                        _hover={{ shadow: 'md' }}
                        transition="all 0.2s"
                      >
                        <HStack spacing={3}>
                          <Icon as={type.icon} color={`${type.color}.500`} size="20px" />
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontSize="sm" fontWeight="medium" color="gray.700">
                              {type.name}
                            </Text>
                            <Text fontSize="lg" fontWeight="bold" color={`${type.color}.600`}>
                              {count}
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>
                    )
                  })}
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Recent Uploads Table */}
            <Card bg={cardBg} shadow="lg" borderRadius="xl">
              <CardHeader>
                <HStack spacing={3}>
                  <Icon as={FaBook} color="purple.500" size="20px" />
                  <Heading size="md">Recent Uploads ({uploads.length})</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <TableContainer>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Title & Type</Th>
                        <Th>Description</Th>
                        <Th>File</Th>
                        <Th>Date</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {uploads.slice(0, 5).map((upload) => (
                        <ContentRow key={upload.id} item={upload} />
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
                {uploads.length === 0 && (
                  <Center py={8}>
                    <VStack spacing={3}>
                      <Icon as={FaBook} size="3em" color="gray.300" />
                      <Text color="gray.500">No content uploaded yet</Text>
                    </VStack>
                  </Center>
                )}
              </CardBody>
            </Card>
          </MotionBox>
        </SimpleGrid>
      </Container>
    </Box>
  )
}

export default AdminPanel