import { useState, useRef, useEffect, useCallback } from "react";
import {
  Box, Flex, Text, IconButton, Collapse, useColorModeValue, HStack, Badge, Spinner,
} from "@chakra-ui/react";
import { ChevronUp, ChevronDown, Terminal, Trash2, Lock, Unlock, FileUp, Search, AlertTriangle, Upload, Activity } from "lucide-react";
import { useT } from "../hooks/useT";
import { useAppThemeFx } from "../styles/app-theme-fx";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useAuth } from "../context/AuthContext";
import api from "../middleware/api";

const MAX_H = 380;
const MIN_H = 40;
const SNAP = 150;

interface LogEntry {
  id: string;
  role: "user" | "agent" | "system";
  content: string;
  created_at?: string;
  icon?: string;
}

interface SystemEvent {
  type: string;
  label: string;
  icon?: string;
}

function stripMd(t: string): string {
  return t.replace(/\*\*(.*?)\*\*/g, "$1").replace(/`(.*?)`/g, "$1").replace(/\[(.*?)\]\(.*?\)/g, "$1").replace(/#{1,6}\s/g, "").replace(/- /g, "  \u2514 ").replace(/\n{2,}/g, "\n").trim();
}

function fmtTime(iso: string | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "America/Sao_Paulo" });
  } catch {
    return new Date(iso).toLocaleTimeString();
  }
}

export function HermesLogDrawer({ onHeightChange }: { onHeightChange?: (h: number) => void }) {
  const themeFx = useAppThemeFx();
  const [hermesEnabled] = useLocalStorage("hermes_enabled", true);
  const { user } = useAuth();
  const userName = user?.name?.split(" ")[0] || "USER";
  const t = useT();
  const [open, setOpen] = useState(false);
  const [h, setH] = useState(MIN_H);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const sy = useRef(0);
  const sh = useRef(MIN_H);
  const systemLogsRef = useRef<LogEntry[]>([]);

  const bg = useColorModeValue("#e8e0d5", "#1A1A1A");
  const bc = useColorModeValue("rgba(230, 92, 0, 0.3)", "rgba(230, 184, 0, 0.3)");
  const ac = useColorModeValue("#e65c00", "#e6b800");
  const uc = useColorModeValue("#1a1a1a", "#f5f5f0");
  const mc = useColorModeValue("#6b6b6b", "#484f58");
  const gc = useColorModeValue("#8b949e", "#8b949e");
  const brand = useColorModeValue("#e65c00", "#e6b800");
  const navColor = useColorModeValue("#d97706", "#eab308");
  const timeUserColor = useColorModeValue("#dc2626", "#ef4444");
  const timeSysColor = useColorModeValue("#d97706", "#eab308");
  const badgeColor = useColorModeValue("rgba(230,92,0,0.15)", "rgba(230,184,0,0.15)");

  const expanded = open && h > SNAP;

  useEffect(() => { onHeightChange?.(h); }, [h, onHeightChange]);

  const refresh = useCallback(() => {
    const sys = systemLogsRef.current.slice(-10);
    api.get("/hermes/history").then((r) => {
      const backend = (r.data || []).slice(-15);
      setLogs([...sys, ...backend].slice(-20));
    }).catch(() => {});
  }, []);

  useEffect(() => { if (open) refresh(); }, [open, refresh]);

  useEffect(() => {
    const handler = () => { if (open) refresh(); };
    window.addEventListener("hermes-message", handler);
    return () => window.removeEventListener("hermes-message", handler);
  }, [open, refresh]);

  useEffect(() => {
    const handler = (e: CustomEvent<SystemEvent>) => {
      const ev = e.detail;
      const entry: LogEntry = {
        id: `sys-${Date.now()}`,
        role: "system",
        content: ev.label,
        icon: ev.icon || ev.type,
        created_at: new Date().toISOString(),
      };
      systemLogsRef.current = [...systemLogsRef.current, entry].slice(-10);
      setLogs((prev) => {
        const sys = systemLogsRef.current.slice(-10);
        const backend = prev.filter((p: LogEntry) => p.role !== "system");
        return [...sys, ...backend].slice(-20);
      });
    };
    window.addEventListener("hermes-system-event", handler as EventListener);
    return () => window.removeEventListener("hermes-system-event", handler as EventListener);
  }, []);

  useEffect(() => {
    if (expanded && autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, expanded, autoScroll]);

  const onDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = false;
    sy.current = e.clientY;
    sh.current = h;
    let lastH = h;
    const onMove = (ev: MouseEvent) => {
      const d = sy.current - ev.clientY;
      if (Math.abs(d) > 5) dragging.current = true;
      const nh = Math.min(MAX_H, Math.max(MIN_H, sh.current + d));
      lastH = nh;
      setH(nh);
      setOpen(nh > SNAP);
    };
    const scrollDown = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
        });
      });
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      if (!dragging.current) {
        if (h < SNAP) { setH(280); setOpen(true); }
        else { setH(MIN_H); setOpen(false); }
        scrollDown();
        return;
      }
      if (lastH < SNAP) { setH(MIN_H); setOpen(false); }
      else { setH(lastH); setOpen(true); }
      scrollDown();
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [h]);

  if (!hermesEnabled) return null;

  return (
    <Box position="relative" borderTop="1px solid" borderColor={bc} bg={bg}
      transition="height 0.12s" height={`${h}px`} overflow="hidden" w="full" zIndex={50}
      fontFamily="'Cascadia Code','Fira Code','JetBrains Mono',monospace"
    >
      <Flex h="32px" align="center" justify="space-between" px={4} cursor="row-resize"
        borderBottom={expanded ? "1px solid" : "none"} borderColor={bc}
        _hover={{ bg: useColorModeValue("rgba(230,92,0,0.08)", "rgba(230,184,0,0.08)") }} userSelect="none"
        onMouseDown={onDown}
      >
        <HStack spacing={2}>
          <Terminal size={14} color={brand} />
          <Text fontSize="11px" fontWeight="600" color={gc} letterSpacing="0.5px">{t("hlog.titulo")}</Text>
          {loading && <Spinner size="xs" color={brand} />}
          {!loading && logs.length > 0 && (
            <Badge bg={badgeColor} color={ac} fontSize="10px" borderRadius="sm" px={1.5}>{logs.length}</Badge>
          )}
        </HStack>
        <HStack spacing={1}>
          <IconButton
            icon={autoScroll ? <Lock size={12} /> : <Unlock size={12} />}
            size="xs" variant="ghost"
            color={autoScroll ? ac : mc}
            _hover={{ color: ac }}
            onClick={(e) => { e.stopPropagation(); setAutoScroll(!autoScroll); }}
            aria-label={autoScroll ? "Auto-scroll ativo" : "Auto-scroll desativado"}
          />
          <IconButton icon={<Trash2 size={12} />} size="xs" variant="ghost" color={mc}
            _hover={{ color: "red.400" }} onClick={(e) => { e.stopPropagation(); setLogs([]); }} aria-label="" />
          {expanded ? <ChevronDown size={14} color={gc} /> : <ChevronUp size={14} color={gc} />}
        </HStack>
      </Flex>
      <Collapse in={expanded} animateOpacity>
        <Box h={`${h - 32}px`} overflowY="auto" px={3} py={2} ref={expanded ? scrollRef : undefined}
          css={{ "&::-webkit-scrollbar": { width: "4px" }, "&::-webkit-scrollbar-thumb": { background: "rgba(48,209,144,0.2)", borderRadius: "4px" } }}
        >
          {logs.length === 0 && !loading && (
            <Flex justify="center" align="center" h="full"><Text fontSize="11px" color={mc}>{t("hlog.sem_logs")}</Text></Flex>
          )}
          {logs.map((e) => {
            const isSystem = e.role === "system";
            const isNavigation = isSystem && e.icon === "navigation";
            const clean = isSystem ? [e.content] : stripMd(e.content).split("\n").filter(Boolean);
            const displayColor = isNavigation ? navColor : isSystem ? mc : e.role === "agent" ? ac : uc;
            const iconMap: Record<string, any> = { upload: FileUp, analyze: Search, diagram: Search, threat: AlertTriangle, dataset: Upload, training: Activity, activity: Activity, navigation: Activity };
            const Icon = e.icon ? iconMap[e.icon] : null;
            return (
              <Box key={e.id} mb={2}>
                <Flex align="center" gap={1.5} mb={0.5}>
                  {isSystem && Icon && <Icon size={10} color={displayColor} style={{ opacity: 0.7 }} />}
                  <Text fontSize="10px" fontWeight="700"
                    color={displayColor}
                    fontStyle={isSystem ? "italic" : "normal"}
                  >
                    {isNavigation ? "NAV" : isSystem ? "SYS" : e.role === "agent" ? "HERMES" : userName.toUpperCase()}
                  </Text>
                  <Text fontSize="9px" color={isSystem ? timeSysColor : e.role === "agent" ? ac : timeUserColor}>
                    {fmtTime(e.created_at)}
                  </Text>
                </Flex>
                {clean.slice(0, 5).map((l, i) => (
                  <Text key={i} fontSize="11px"
                    color={displayColor}
                    fontStyle={isSystem ? "italic" : "normal"}
                    lineHeight="1.6" opacity={i === 4 && clean.length > 5 ? 0.5 : 0.85} pl={2}
                    sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                  >
                    {isSystem && Icon && <Icon size={10} style={{ display: "inline", marginRight: 4, opacity: 0.7 }} />}
                    {i === 4 && clean.length > 5 ? `  \u2514\u2514\u2500 and ${clean.length - 4} more lines...` : `  ${l}`}
                  </Text>
                ))}
              </Box>
            );
          })}
          {logs.length > 0 && (
            <Flex justify="center" mt={3}><Text fontSize="10px" color={mc}>{t("hlog.fim_log")}</Text></Flex>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
