import { Box, Heading, Text, VStack, Button, Icon, Badge, HStack, SimpleGrid, Flex, Spinner, Center, Stat, StatLabel, StatNumber, StatHelpText, Progress, Tooltip } from "@chakra-ui/react";
import { LayoutDashboard, ScanSearch, ShieldAlert, Bug, ShieldCheck, AlertTriangle, Activity, BarChart3, TrendingUp, TrendingDown, FileImage, Database, GraduationCap } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppThemeFx } from "../styles/app-theme-fx";
import { useInferenceThemeFx } from "../styles/inference-theme-fx";
import { getDashboardStats, type DashboardStats } from "../services/dashboard-service";
import { ROUTES } from "../router/paths";
import { useT } from "../hooks/useT";
import { useApiTranslator } from "../hooks/useApiTranslator";

const STRIDE_LABELS: Record<string, string> = {
  spoofing: "Spoofing",
  tampering: "Tampering",
  repudiation: "Repudiation",
  information_disclosure: "Info Disclosure",
  denial_of_service: "DoS",
  elevation_of_privilege: "Elevation",
};

export default function Dashboard() {
  const fx = useInferenceThemeFx();
  const appFx = useAppThemeFx();
  const t = useT();
  const at = useApiTranslator();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <Center h="300px"><Spinner /></Center>;

  return (
    <Box w="full" maxW="1800px" mx="auto" pb={10}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg" color={appFx.textColor}>{t("dash.title")}</Heading>

        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
          <Box bg={fx.cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={fx.cardBorder} boxShadow={fx.cardShadow} cursor="pointer" onClick={() => navigate(ROUTES.INFERENCE)} _hover={{ borderColor: "orange.400", transform: "translateY(-2px)", transition: "all 0.2s" }}>
            <HStack spacing={4}>
              <Icon as={ScanSearch} boxSize={8} color="orange.400" />
              <Stat>
                <StatLabel color={appFx.textMuted}>{t("dash.total_analises")}</StatLabel>
                <StatNumber color={appFx.textColor}>{stats?.total_analyses || 0}</StatNumber>
                <StatHelpText color={appFx.textMuted} fontSize="xs">{stats?.completed_analyses} concluídas</StatHelpText>
              </Stat>
            </HStack>
          </Box>

          <Box bg={fx.cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={fx.cardBorder} boxShadow={fx.cardShadow} cursor="pointer" onClick={() => navigate(ROUTES.THREATS)} _hover={{ borderColor: "red.400", transform: "translateY(-2px)", transition: "all 0.2s" }}>
            <HStack spacing={4}>
              <Icon as={ShieldAlert} boxSize={8} color="red.400" />
              <Stat>
                <StatLabel color={appFx.textMuted}>{t("dash.total_ameacas")}</StatLabel>
                <StatNumber color={appFx.textColor}>{stats?.total_threats || 0}</StatNumber>
                <StatHelpText color={appFx.textMuted} fontSize="xs">{stats?.total_components_analyzed} componentes</StatHelpText>
              </Stat>
            </HStack>
          </Box>

          <Box bg={fx.cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={fx.cardBorder} boxShadow={fx.cardShadow}>
            <HStack spacing={4}>
              <Icon as={AlertTriangle} boxSize={8} color={stats?.threats_by_risk.critical && stats.threats_by_risk.critical > 0 ? "red.400" : "green.400"} />
              <Stat>
                <StatLabel color={appFx.textMuted}>Risco Crítico</StatLabel>
                <StatNumber color={appFx.textColor}>{stats?.threats_by_risk.critical || 0}</StatNumber>
                <StatHelpText color={appFx.textMuted} fontSize="xs">
                  {stats?.threats_by_risk.high || 0} alta / {stats?.threats_by_risk.medium || 0} média
                </StatHelpText>
              </Stat>
            </HStack>
          </Box>

          <Box bg={fx.cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={fx.cardBorder} boxShadow={fx.cardShadow} cursor="pointer" onClick={() => navigate(ROUTES.VULNERABILITIES)} _hover={{ borderColor: "purple.400", transform: "translateY(-2px)", transition: "all 0.2s" }}>
            <HStack spacing={4}>
              <Icon as={Bug} boxSize={8} color="purple.400" />
              <Stat>
                <StatLabel color={appFx.textMuted}>{t("vuln.title")}</StatLabel>
                <StatNumber color={appFx.textColor}>KB</StatNumber>
                <StatHelpText color={appFx.textMuted} fontSize="xs">{t("vuln.title")}</StatHelpText>
              </Stat>
            </HStack>
          </Box>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Box bg={fx.cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={fx.cardBorder} boxShadow={fx.cardShadow}>
            <Heading size="sm" mb={4} color={appFx.textColor}>Distribuição STRIDE</Heading>
            {stats && Object.keys(stats.stride_distribution).length > 0 ? (
              <VStack spacing={3} align="stretch">
                {Object.entries(stats.stride_distribution).map(([cat, count]) => {
                  const maxVal = Math.max(...Object.values(stats.stride_distribution), 1);
                  const pct = (count / maxVal) * 100;
                  return (
                    <Box key={cat}>
                      <Flex justify="space-between" mb={1}>
                        <Text fontSize="sm" color={appFx.textMuted}>{at.threatCategory(cat)}</Text>
                        <Text fontSize="sm" fontWeight="bold" color={appFx.textColor}>{count}</Text>
                      </Flex>
                      <Progress value={pct} size="sm" colorScheme={cat === "elevation_of_privilege" || cat === "spoofing" ? "red" : cat === "denial_of_service" ? "orange" : "blue"} borderRadius="full" />
                    </Box>
                  );
                })}
              </VStack>
            ) : (
              <Text color={appFx.textMuted} fontSize="sm" textAlign="center" py={4}>{t("thr.sem_relatorios")}</Text>
            )}
          </Box>

          <Box bg={fx.cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={fx.cardBorder} boxShadow={fx.cardShadow}>
            <Heading size="sm" mb={4} color={appFx.textColor}>{t("inf.componentes")}</Heading>
            {stats && stats.top_components.length > 0 ? (
              <VStack spacing={3} align="stretch">
                {stats.top_components.map((c) => {
                  const maxCount = Math.max(...stats.top_components.map((x) => x.count), 1);
                  const pct = (c.count / maxCount) * 100;
                  return (
                    <Box key={c.label}>
                      <Flex justify="space-between" mb={1}>
                        <Text fontSize="sm" color={appFx.textColor}>{at.component(c.label)}</Text>
                        <Text fontSize="sm" fontWeight="bold" color={appFx.textColor}>{c.count}</Text>
                      </Flex>
                      <Progress value={pct} size="sm" colorScheme="orange" borderRadius="full" />
                    </Box>
                  );
                })}
              </VStack>
            ) : (
              <Text color={appFx.textMuted} fontSize="sm" textAlign="center" py={4}>{t("inf.nenhum_relatorio")}</Text>
            )}
          </Box>
        </SimpleGrid>

        <Box bg={fx.cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={fx.cardBorder} boxShadow={fx.cardShadow}>
          <Heading size="sm" mb={4} color={appFx.textColor}>{t("inf.title")}</Heading>
          {stats && stats.recent_analyses.length > 0 ? (
            <VStack spacing={3} align="stretch">
              {stats.recent_analyses.map((r) => (
                <Flex key={r.id} justify="space-between" align="center" p={3} bg={appFx.navHoverBg} borderRadius="md" cursor="pointer" onClick={() => navigate(`${ROUTES.THREATS}`)} _hover={{ bg: fx.cardBorder }}>
                  <HStack>
                    <Icon as={FileImage} color={appFx.textMuted} />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" color={appFx.textColor} fontSize="sm">{r.filename}</Text>
                      <Text fontSize="xs" color={appFx.textMuted}>{r.components_count} {r.components_count === 1 ? "componente" : "componentes"}</Text>
                    </VStack>
                  </HStack>
                  <Badge colorScheme={r.status === "completed" ? "green" : r.status === "failed" ? "red" : "yellow"}>{at.status(r.status)}</Badge>
                </Flex>
              ))}
            </VStack>
          ) : (
            <Text color={appFx.textMuted} fontSize="sm" textAlign="center" py={4}>{t("inf.nenhum_relatorio")}</Text>
          )}
        </Box>

        <SimpleGrid columns={{ base: 2, md: 2, lg: 4 }} spacing={4}>
          <Button leftIcon={<Icon as={ScanSearch} />} colorScheme="orange" variant="outline" onClick={() => navigate(ROUTES.INFERENCE)} whiteSpace="normal" h="auto" minH="40px" px={4} py={2}>{t("inf.analisar")}</Button>
          <Button leftIcon={<Icon as={ShieldAlert} />} colorScheme="red" variant="outline" onClick={() => navigate(ROUTES.THREATS)} whiteSpace="normal" h="auto" minH="40px" px={4} py={2}>{t("thr.title")}</Button>
          <Button leftIcon={<Icon as={Database} />} colorScheme="blue" variant="outline" onClick={() => navigate(ROUTES.DATASET)} whiteSpace="normal" h="auto" minH="40px" px={4} py={2}>{t("ds.title")}</Button>
          <Button leftIcon={<Icon as={GraduationCap} />} colorScheme="green" variant="outline" onClick={() => navigate(ROUTES.TRAINING)} whiteSpace="normal" h="auto" minH="40px" px={4} py={2}>{t("tr.title")}</Button>
        </SimpleGrid>
      </VStack>
    </Box>
  );
}
