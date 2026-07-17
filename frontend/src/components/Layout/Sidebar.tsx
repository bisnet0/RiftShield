import { Box, Flex, Text, Icon, VStack, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, Image } from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "./nav-config";
import { useAppThemeFx } from "../../styles/app-theme-fx";
import { useT } from "../../hooks/useT";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: Props) {
  const themeFx = useAppThemeFx();
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();

  const SidebarContent = () => (
    <VStack spacing={2} align="stretch" w="100%">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Flex
            key={item.id}
            align="center"
            px={4}
            py={3}
            mx={2}
            borderRadius="lg"
            cursor="pointer"
            bg={isActive ? themeFx.navActiveBg : "transparent"}
            color={isActive ? themeFx.navActiveColor : themeFx.textMuted}
            fontWeight={isActive ? "bold" : "medium"}
            transition="all 0.2s"
            _hover={{ bg: isActive ? themeFx.navActiveBg : themeFx.navHoverBg }}
            onClick={() => {
              navigate(item.path);
              onClose();
            }}
          >
            <Icon as={item.icon} boxSize={5} mr={4} />
            <Text fontSize="sm">{t(`nav.${item.id}`)}</Text>
          </Flex>
        );
      })}
    </VStack>
  );

  return (
    <>
      <Box
        display={{ base: "none", md: "block" }}
        position="fixed"
        left={0}
        top="70px"
        w="250px"
        h="calc(100vh - 70px)"
        bg={themeFx.sidebarBg}
        borderRight="1px solid"
        borderColor={themeFx.headerBorder}
        py={6}
        zIndex={900}
      >
        <SidebarContent />
      </Box>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay display={{ base: "block", md: "none" }} />
        <DrawerContent bg={themeFx.sidebarBg} display={{ base: "block", md: "none" }}>
          <DrawerCloseButton color={themeFx.textColor} />
          <DrawerHeader borderBottomWidth="1px" borderColor={themeFx.headerBorder} color={themeFx.textColor}>
            <Flex align="center">
              <Image src="/public/Rift_Shield_Logo.png" alt="Logo" w="36px" mr={3} />
              <Text fontWeight={"light"}>Rift</Text>
              <Text marginLeft={1} fontSize="xl" fontWeight="bold" color="#FFD52B" letterSpacing="tight">Shield</Text>
            </Flex>
          </DrawerHeader>
          <DrawerBody pt={6} px={0}>
            <SidebarContent />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
