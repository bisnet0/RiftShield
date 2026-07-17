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
import { useT } from '../../../hooks/useT';

export const AuthFields: React.FC<AuthFieldsProps> = ({ state, setters, actions }) => {
  const t = useT();

  return (
    <Box as="form" onSubmit={actions.handleSubmit} w="100%">
      <VStack spacing={4} align="flex-start">

        {!state.isLogin && (
          <>
            <FormControl isRequired>
              <FormLabel htmlFor="name">{t("auth.name")}</FormLabel>
              <Input
                id="name"
                type="text"
                value={state.name}
                onChange={e => setters.setName(e.target.value)}
                placeholder={t("auth.name_placeholder")}
                focusBorderColor="brand"
              />
            </FormControl>

            <HStack w="full">
              <FormControl>
                <FormLabel htmlFor="phone">{t("auth.phone")}</FormLabel>
                <Input
                  id="phone"
                  type="tel"
                  value={state.phone}
                  onChange={e => setters.setPhone(e.target.value)}
                  placeholder={t("auth.phone_placeholder")}
                  focusBorderColor="brand"
                />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="country">{t("auth.country")}</FormLabel>
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
              <FormControl>
                <FormLabel htmlFor="state">{t("auth.state")}</FormLabel>
                <Input
                  id="state"
                  type="text"
                  value={state.stateUF}
                  onChange={e => setters.setStateUF(e.target.value)}
                  placeholder={t("auth.state_placeholder")}
                  focusBorderColor="brand"
                />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="city">{t("auth.city")}</FormLabel>
                <Input
                  id="city"
                  type="text"
                  value={state.city}
                  onChange={e => setters.setCity(e.target.value)}
                  placeholder={t("auth.city_placeholder")}
                  focusBorderColor="brand"
                />
              </FormControl>
            </HStack>
          </>
        )}

        <FormControl isRequired>
          <FormLabel htmlFor="email">{t("auth.email")}</FormLabel>
          <Input
            id="email"
            type="email"
            value={state.email}
            onChange={e => setters.setEmail(e.target.value)}
            placeholder={t("auth.email_placeholder")}
            focusBorderColor="brand"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel htmlFor="password">{t("auth.password")}</FormLabel>
          <Input
            id="password"
            type="password"
            value={state.password}
            onChange={e => setters.setPassword(e.target.value)}
            placeholder={t("auth.password_placeholder")}
            focusBorderColor="brand"
          />
        </FormControl>

        {!state.isLogin && (
          <FormControl isRequired mt={2}>
            <FormLabel htmlFor="inviteCode">{t("auth.invite")}</FormLabel>
            <Input
              id="inviteCode"
              type="text"
              value={state.inviteCode}
              onChange={e => setters.setInviteCode(e.target.value)}
              placeholder={t("auth.invite_placeholder")}
              focusBorderColor="brand"
            />
          </FormControl>
        )}

        <Button
          type="submit"
          colorScheme="yellow"
          bg="brand"
          color="white"
          size="lg"
          w="full"
          mt={6}
          _hover={{ bg: "brandHover" }}
          isLoading={state.loading}
          loadingText={t("auth.loading")}
        >
          {state.isLogin ? t("auth.btn_login") : t("auth.btn_register")}
        </Button>

      </VStack>
    </Box>
  );
};
