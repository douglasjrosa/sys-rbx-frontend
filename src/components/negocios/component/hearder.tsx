import {
  Box,
  Button,
  Flex,
  FormLabel,
  Input,
  Select,
  Switch,
} from '@chakra-ui/react';

export const NegocioHeader = () => {
  return (
    <>
      <Flex gap={8}>
        <Box>
          <FormLabel
            htmlFor="cidade"
            fontSize="xs"
            fontWeight="md"
            color="gray.700"
            _dark={{
              color: 'gray.50',
            }}
          >
            id
          </FormLabel>
          <Input
            shadow="sm"
            size="sm"
            w="full"
            fontSize="xs"
            rounded="md"
            // onChange={(e) => 'setItenId'(e.target.value)}
            // value={''}
          />
        </Box>
        <Box>
          <FormLabel
            htmlFor="cidade"
            fontSize="xs"
            fontWeight="md"
            color="gray.700"
            _dark={{
              color: 'gray.50',
            }}
          >
            atendimento
          </FormLabel>
          <Select
            shadow="sm"
            size="sm"
            w="full"
            fontSize="xs"
            rounded="md"
            placeholder="Selecione um Produto"
            // onChange={(e) => 'setItenId'(e.target.value)}
            // value={''}
          >
            <option value="">internal approach</option>
            <option value="">external approach</option>
          </Select>
        </Box>
        <Box>
          <FormLabel
            htmlFor="cidade"
            fontSize="xs"
            fontWeight="md"
            color="gray.700"
            _dark={{
              color: 'gray.50',
            }}
          >
            Budget
          </FormLabel>
          <Input
            shadow="sm"
            size="sm"
            w="full"
            fontSize="xs"
            rounded="md"
            // onChange={(e) => 'setItenId'(e.target.value)}
            // value={''}
          />
        </Box>
        <Box>
          <FormLabel
            htmlFor="cidade"
            fontSize="xs"
            fontWeight="md"
            color="gray.700"
            _dark={{
              color: 'gray.50',
            }}
          >
            Deadline
          </FormLabel>
          <Input
            shadow="sm"
            size="sm"
            w="full"
            type={'date'}
            fontSize="xs"
            rounded="md"
            // onChange={(e) => 'setItenId'(e.target.value)}
            // value={''}
          />
        </Box>
        <Box>
          <FormLabel
            htmlFor="cidade"
            fontSize="xs"
            fontWeight="md"
            color="gray.700"
            _dark={{
              color: 'gray.50',
            }}
          >
            Andamento
          </FormLabel>
          <Select
            shadow="sm"
            size="sm"
            w="full"
            fontSize="xs"
            rounded="md"
            placeholder="Selecione um Produto"
            // onChange={(e) => 'setItenId'(e.target.value)}
            // value={''}
          >
            <option value="">ok</option>
          </Select>
        </Box>
        <Box>
          <FormLabel
            htmlFor="cidade"
            fontSize="xs"
            fontWeight="md"
            color="gray.700"
            _dark={{
              color: 'gray.50',
            }}
          >
            Status
          </FormLabel>
          <Switch size="md" colorScheme="whatsapp" />
        </Box>
        <Box>
          <Button colorScheme={'whatsapp'}>salve</Button>
        </Box>
      </Flex>
    </>
  );
};
