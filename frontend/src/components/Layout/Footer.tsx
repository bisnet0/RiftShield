import React from "react";
import { Flex, HStack, Text, Icon, Link } from "@chakra-ui/react";
import { Linkedin, Github, Globe } from "react-bootstrap-icons";
import { useAppThemeFx } from "../../styles/app-theme-fx";
import { useT } from "../../hooks/useT";

export const Footer: React.FC = () => {
  const themeFx = useAppThemeFx();
  const t = useT();

  return (
    <Flex
      as="footer"
      bg={themeFx.footerBg}
      borderTop="1px solid"
      borderColor={themeFx.headerBorder}
      py={6}
      px={{ base: 4, md: 8 }}
      align="center"
      justify="center"
      direction="column"
      gap={3}
      mt="auto"
    >
      <Text color={themeFx.textMuted} fontSize="sm" textAlign="center">
        {t("footer.desenvolvido_por")}{" "}
        <Text as="span" fontWeight="bold" color={themeFx.navActiveColor}>
          Henrique Bisneto
        </Text>
      </Text>

      <HStack spacing={5} color={themeFx.textMuted}>
        <Link
          href="https://linkedin.com/in/bisnet0/"
          isExternal
          _hover={{ color: "brand", transform: "translateY(-2px)" }}
          transition="all 0.2s"
        >
          <Icon as={Linkedin} boxSize={5} />
        </Link>
        <Link
          href="https://github.com/bisnet0"
          isExternal
          _hover={{ color: themeFx.textColor, transform: "translateY(-2px)" }}
          transition="all 0.2s"
        >
          <Icon as={Github} boxSize={5} />
        </Link>
        <Link
          href="https://www.henriquebisneto.com.br/"
          isExternal
          _hover={{ color: "brand", transform: "translateY(-2px)" }}
          transition="all 0.2s"
        >
          <Icon as={Globe} boxSize={5} />
        </Link>
      </HStack>
    </Flex>
  );
};
