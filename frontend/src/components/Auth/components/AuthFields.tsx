import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
} from '@chakra-ui/react';
import type { AuthFieldsProps } from '../types';

export const AuthFields: React.FC<AuthFieldsProps> = ({ state, setters, actions }) => {
  return (
    <Box as="form" onSubmit={actions.handleSubmit} w="100%">
      <VStack spacing={4} align="flex-start">

        {!state.isLogin && (
          <>
            <FormControl isRequired>
              <FormLabel htmlFor="name">Nome Completo</FormLabel>
              <Input
                id="name"
                type="text"
                value={state.name}
                onChange={e => setters.setName(e.target.value)}
                placeholder="Seu nome"
                focusBorderColor="brand"
              />
            </FormControl>

            <HStack w="full">
              <FormControl isRequired>
                <FormLabel htmlFor="phone">Contato</FormLabel>
                <Input
                  id="phone"
                  type="tel"
                  value={state.phone}
                  onChange={e => setters.setPhone(e.target.value)}
                  placeholder="(71) 90000-0000"
                  focusBorderColor="brand"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel htmlFor="country">País</FormLabel>
                <Input
                  id="country"
                  type="text"
                  value={state.country}
                  onChange={e => setters.setCountry(e.target.value)}
                  focusBorderColor="brand"
                />
              </FormControl>
            </HStack>

            <HStack w="full">
              <FormControl isRequired>
                <FormLabel htmlFor="state">Estado</FormLabel>
                <Input
                  id="state"
                  type="text"
                  value={state.stateUF}
                  onChange={e => setters.setStateUF(e.target.value)}
                  placeholder="Ex: Bahia"
                  focusBorderColor="brand"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel htmlFor="city">Cidade</FormLabel>
                <Input
                  id="city"
                  type="text"
                  value={state.city}
                  onChange={e => setters.setCity(e.target.value)}
                  placeholder="Ex: Salvador"
                  focusBorderColor="brand"
                />
              </FormControl>
            </HStack>
          </>
        )}

        <FormControl isRequired>
          <FormLabel htmlFor="email">E-mail</FormLabel>
          <Input
            id="email"
            type="email"
            value={state.email}
            onChange={e => setters.setEmail(e.target.value)}
            placeholder="seu@email.com"
            focusBorderColor="brand"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel htmlFor="password">Senha</FormLabel>
          <Input
            id="password"
            type="password"
            value={state.password}
            onChange={e => setters.setPassword(e.target.value)}
            placeholder="********"
            focusBorderColor="brand"
          />
        </FormControl>

        {!state.isLogin && (
          <FormControl isRequired mt={2}>
            <FormLabel htmlFor="masterKey">Chave-Mestre</FormLabel>
            <Input
              id="masterKey"
              type="text"
              value={state.masterKey}
              onChange={e => setters.setMasterKey(e.target.value)}
              placeholder="Cole o token de liberação aqui"
              focusBorderColor="brand"
            />
          </FormControl>
        )}

        <Button
          type="submit"
          colorScheme="orange"
          size="lg"
          w="full"
          mt={6}
          isLoading={state.loading}
          loadingText="Processando..."
        >
          {state.isLogin ? 'Entrar na Plataforma' : 'Criar Conta'}
        </Button>

      </VStack>
    </Box>
  );
};
