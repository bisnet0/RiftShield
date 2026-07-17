import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Flex, Text, Icon, Box, useColorModeValue } from "@chakra-ui/react";
import { Clock } from "lucide-react";
import { useAppThemeFx } from "../styles/app-theme-fx";
import api from "../middleware/api";

export function UsageTimer() {
  const themeFx = useAppThemeFx();
  const [expanded, setExpanded] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const bg = useColorModeValue("#ffffff", "#1a1a1a");
  const border = useColorModeValue("rgba(230, 92, 0, 0.15)", "#333333");

  const tick = useCallback(async () => {
    try {
      await api.post("/users/usage-tick");
      const res = await api.get("/users/usage-time");
      setHours(res.data.hours);
      setMinutes(res.data.minutes);
      setSeconds(res.data.seconds);
    } catch {}
  }, []);

  useEffect(() => {
    api.get("/users/usage-time").then((res) => {
      setHours(res.data.hours);
      setMinutes(res.data.minutes);
      setSeconds(res.data.seconds);
    }).catch(() => {});
    const interval = setInterval(tick, 30000);
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    }, 1000);
    return () => {
      clearInterval(interval);
      clearInterval(clockInterval);
    };
  }, [tick]);

  const pad = (n: number) => String(n).padStart(2, "0");

  const show = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPos({ top: r.top + r.height / 2, left: r.right + 20 });
    setExpanded(true);
  };

  return (
    <>
      <Flex
        align="center"
        px={4}
        py={3}
        mx={2}
        borderRadius="lg"
        cursor="pointer"
        color={themeFx.textMuted}
        fontWeight="medium"
        transition="all 0.2s"
        _hover={{ bg: themeFx.navHoverBg }}
        w="auto"
        onMouseEnter={show}
        onMouseLeave={() => setExpanded(false)}
      >
        <Icon as={Clock} boxSize={5} mr={4} />
        <Text fontSize="sm">Tempo de Uso</Text>
      </Flex>

      {expanded && createPortal(
        <Box
          position="fixed"
          top={`${pos.top}px`}
          left={`${pos.left}px`}
          transform="translateY(-50%)"
          bg={bg}
          borderRadius="lg"
          border="1px solid"
          borderColor={border}
          boxShadow="lg"
          p={3}
          minW="150px"
          zIndex={9999999}
          textAlign="center"
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
        >
          <Text fontSize="xs" fontWeight="bold" color={themeFx.textMuted} mb={1}>Tempo de Uso</Text>
          <Text fontSize="lg" fontWeight="bold" color={themeFx.brandColor} fontFamily="monospace" letterSpacing="1px">
            {pad(hours)}:{pad(minutes)}:{pad(seconds)}
          </Text>
          <Text fontSize="2xs" color={themeFx.textMuted} mt={1}>
            {currentTime}
          </Text>
        </Box>,
        document.body
      )}
    </>
  );
}
