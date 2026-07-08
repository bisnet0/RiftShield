import { useState, useRef, useCallback, useEffect } from "react";
import {
  Box, Flex, Text, IconButton, Collapse, useColorModeValue, HStack, Badge, Spinner,
} from "@chakra-ui/react";
import { ChevronUp, ChevronDown, Bot, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAppThemeFx } from "../styles/app-theme-fx";
import { useLocalStorage } from "../hooks/useLocalStorage";
import api from "../middleware/api";

const MAX_HEIGHT = 380;
const MIN_HEIGHT = 40;
const SNAP_THRESHOLD = 150;

interface LogEntry {
  id: string;
  role: "user" | "agent";
  content: string;
  created_at?: string;
}

export function HermesLogDrawer() {
  const themeFx = useAppThemeFx();
  const [hermesEnabled] = useLocalStorage("hermes_enabled", true);
  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState(MIN_HEIGHT);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const startHeight = useRef(MIN_HEIGHT);

  const containerBg = useColorModeValue("rgba(245, 240, 232, 0.97)", "rgba(13, 13, 13, 0.97)");
  const borderColor = useColorModeValue("rgba(230, 92, 0, 0.2)", "rgba(230, 184, 0, 0.2)");
  const userMsgBg = useColorModeValue("#e65c00", "#e6b800");
  const userMsgText = useColorModeValue("white", "black");
  const agentMsgBg = useColorModeValue("#ffffff", "#1a1a1a");
  const agentMsgText = useColorModeValue("#1a1a1a", "#f5f5f0");
  const mutedText = useColorModeValue("#6b6b6b", "#6b6b6b");

  const loadLogs = useCallback(async () => {
    if (!hermesEnabled) return;
    setLoading(true);
    try {
      const res = await api.get("/hermes/history");
      const recent = res.data?.slice(-20) || [];
      setLogs(recent);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [hermesEnabled]);

  useEffect(() => {
    if (isOpen) loadLogs();
  }, [isOpen, loadLogs]);

  const toggleOpen = () => {
    if (height < SNAP_THRESHOLD) {
      setHeight(280);
      setIsOpen(true);
    } else {
      setHeight(MIN_HEIGHT);
      setIsOpen(false);
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    startY.current = e.clientY;
    startHeight.current = height;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [height]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const delta = startY.current - e.clientY;
    const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeight.current + delta));
    setHeight(newHeight);
    setIsOpen(newHeight > SNAP_THRESHOLD);
  }, []);

  const handleMouseUp = useCallback(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    if (height < SNAP_THRESHOLD) {
      setHeight(MIN_HEIGHT);
      setIsOpen(false);
    } else {
      setHeight(Math.max(height, 200));
      setIsOpen(true);
    }
  }, [height]);

  if (!hermesEnabled) return null;

  const isExpanded = isOpen && height > SNAP_THRESHOLD;

  return (
    <Box
      position="relative"
      borderTop="1px solid"
      borderColor={borderColor}
      bg={containerBg}
      transition="height 0.15s ease-out"
      height={`${height}px`}
      overflow="hidden"
      w="full"
      zIndex={50}
    >
      <Flex
        ref={dragRef}
        h="32px"
        align="center"
        justify="space-between"
        px={4}
        cursor="row-resize"
        borderBottom={isExpanded ? "1px solid" : "none"}
        borderColor={borderColor}
        _hover={{ bg: "blackAlpha.50" }}
        sx={{ userSelect: "none" }}
        onMouseDown={handleMouseDown}
        onClick={toggleOpen}
        position="relative"
      >
        <HStack spacing={2}>
          <Bot size={16} color={themeFx.brandColor} />
          <Text fontSize="sm" fontWeight="medium" color={themeFx.textColor}>Hermes Log</Text>
          {loading && <Spinner size="xs" />}
          {!loading && logs.length > 0 && (
            <Badge colorScheme="orange" variant="subtle" fontSize="2xs">{logs.length}</Badge>
          )}
        </HStack>
        <HStack spacing={2}>
          <IconButton
            icon={<Trash2 size={14} />}
            size="xs"
            variant="ghost"
            aria-label="Limpar"
            color={mutedText}
            onClick={(e) => { e.stopPropagation(); setLogs([]); }}
          />
          {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </HStack>
      </Flex>

      <Collapse in={isExpanded} animateOpacity style={{ height: isExpanded ? "auto" : 0 }}>
        <Box
          h={`${height - 32}px`}
          overflowY="auto"
          px={4}
          py={2}
          css={{
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-thumb": { background: borderColor, borderRadius: "4px" },
          }}
        >
          {logs.length === 0 && !loading && (
            <Text fontSize="sm" color={mutedText} textAlign="center" py={4}>
              Nenhum log do Hermes ainda. Inicie uma conversa no chat.
            </Text>
          )}
          {logs.map((entry) => (
            <Flex key={entry.id} justify={entry.role === "user" ? "flex-end" : "flex-start"} mb={2}>
              <Box
                maxW="80%"
                bg={entry.role === "user" ? userMsgBg : agentMsgBg}
                color={entry.role === "user" ? userMsgText : agentMsgText}
                px={3}
                py={2}
                borderRadius="lg"
                borderTopRightRadius={entry.role === "user" ? "sm" : "lg"}
                borderTopLeftRadius={entry.role === "agent" ? "sm" : "lg"}
                border={entry.role === "agent" ? "1px solid" : "none"}
                borderColor={borderColor}
                fontSize="xs"
                sx={{
                  p: { mb: "0.3em", "&:last-child": { mb: 0 } },
                  strong: { fontWeight: "bold" },
                  "ul, ol": { pl: "1.2em" },
                  code: { bg: "blackAlpha.200", px: 1, borderRadius: "sm", fontSize: "2xs" },
                }}
              >
                <ReactMarkdown>{entry.content.slice(0, 300)}{entry.content.length > 300 ? "..." : ""}</ReactMarkdown>
              </Box>
            </Flex>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
