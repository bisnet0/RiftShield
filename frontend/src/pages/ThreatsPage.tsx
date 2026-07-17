import { Box, Heading, Text, VStack, Button, Icon, Badge, HStack, SimpleGrid, Collapse, Tag, TagLabel, Image, Flex, Spinner, Center } from "@chakra-ui/react";
import { ShieldAlert, Eye, Trash2, RefreshCw, FileImage, Bug, ShieldCheck, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useInferenceThemeFx } from "../styles/inference-theme-fx";
import { useAppThemeFx } from "../styles/app-theme-fx";
import { useToast } from "../components/Toast/components/ToastContext";
import { listThreatReports, getThreatReport, type ThreatReport } from "../services/inference-service";
import { ROUTES } from "../router/paths";
import { useT } from "../hooks/useT";

export default function ThreatsPage() {
  const fx = useInferenceThemeFx();
  const appFx = useAppThemeFx();
  const { showToast } = useToast();
  const t = useT();
  const navigate = useNavigate();
  const [reports, setReports] = useState<ThreatReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ThreatReport | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listThreatReports();
      setReports(res.items);
    } catch { showToast({ title: "Erro", message: "Falha ao carregar relatórios", type: "error" }); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const riskColor = (score: number | null) => {
    if (!score) return "gray";
    if (score >= 7) return "red";
    if (score >= 4) return "orange";
    return "green";
  };

  if (loading) return <Center h="300px"><Spinner /></Center>;

  return (
    <Box w="full" maxW="1800px" mx="auto" pb={10}>
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="lg" color={appFx.textColor}>{t("thr.title")}</Heading>
          <Button size="sm" variant="ghost" leftIcon={<Icon as={RefreshCw} />} onClick={load}>{t("geral.atualizar")}</Button>
        </Flex>

        {reports.length === 0 && (
          <Box textAlign="center" py={16}>
            <Icon as={ShieldAlert} boxSize={16} color={appFx.textMuted} mb={4} />
            <Text color={appFx.textMuted}>{t("thr.sem_relatorios")}</Text>
            <Button mt={4} colorScheme="orange" onClick={() => navigate(ROUTES.INFERENCE)}>{t("inf.analisar")}</Button>
          </Box>
        )}

        {reports.map((tr) => (
          <Box key={tr.id} p={6} bg={fx.cardBg} borderRadius="xl" border="1px solid" borderColor={fx.cardBorder} boxShadow={fx.cardShadow}>
            <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
              <VStack align="start" spacing={1}>
                <Flex align="center" gap={2}>
                  <Icon as={FileImage} color={appFx.textMuted} />
                  <Text fontWeight="bold" color={appFx.textColor}>{t("thr.title")}</Text>
                </Flex>
                <Text fontSize="sm" color={appFx.textMuted}>{new Date(tr.created_at).toLocaleString("pt-BR")}</Text>
                <HStack wrap="wrap" gap={1}>
                  {Object.entries(tr.stride_summary).filter(([, c]) => c > 0).map(([cat, count]) => (
                    <Badge key={cat} colorScheme="orange" variant="subtle">{cat} ({count})</Badge>
                  ))}
                </HStack>
              </VStack>
              <HStack>
                <Badge fontSize="md" px={4} py={1} colorScheme={riskColor(tr.overall_risk_score)}>
                  {t("thr.risco_geral")}: {tr.overall_risk_score?.toFixed(1) || "N/A"}
                </Badge>
                <Button size="sm" variant="outline" leftIcon={<Icon as={Eye} />} colorScheme="orange" onClick={() => setSelected(selected?.id === tr.id ? null : tr)}>Detalhes</Button>
              </HStack>
            </Flex>

            <Collapse in={selected?.id === tr.id}>
              <Box mt={4} pt={4} borderTop="1px solid" borderColor={fx.cardBorder}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {tr.component_analyses.map((ca, ci) => (
                    <Box key={ci} p={4} bg={appFx.navHoverBg} borderRadius="md">
                      <Text fontWeight="bold" color={appFx.textColor} mb={2}>{ca.component_label}</Text>

                      {ca.stride_threats.length > 0 && (
                        <>
                          <Text fontSize="xs" fontWeight="bold" color={appFx.textMuted} mb={1}>{t("thr.ameacas")}</Text>
                          <HStack wrap="wrap" mb={2}>
                            {ca.stride_threats.map((t, ti) => (
                              <Tag key={ti} size="sm" variant="subtle" colorScheme={t.risk_level === "critical" ? "red" : t.risk_level === "high" ? "orange" : t.risk_level === "medium" ? "yellow" : "green"}>
                                <TagLabel>{t.category}</TagLabel>
                              </Tag>
                            ))}
                          </HStack>
                        </>
                      )}

                      {ca.vulnerabilities.length > 0 && (
                        <>
                          <Text fontSize="xs" fontWeight="bold" color={appFx.textMuted} mb={1}>
                            <Icon as={Bug} boxSize={3} mr={1} />{t("thr.vulnerabilidades")} ({ca.vulnerabilities.length})
                          </Text>
                          {ca.vulnerabilities.slice(0, 4).map((v, vi) => (
                            <Text key={vi} fontSize="sm" color={appFx.textColor}>• {v.title} {v.cvss_score && <Badge fontSize="xs" colorScheme={v.cvss_score >= 7 ? "red" : "orange"}>{v.cvss_score}</Badge>}</Text>
                          ))}
                        </>
                      )}

                      {ca.countermeasures.length > 0 && (
                        <>
                          <Text fontSize="xs" fontWeight="bold" color={appFx.textMuted} mt={2} mb={1}>
                            <Icon as={ShieldCheck} boxSize={3} mr={1} />{t("thr.contramedidas")}
                          </Text>
                          {ca.countermeasures.slice(0, 2).map((cm, mi) => (
                            <Text key={mi} fontSize="sm" color={appFx.textColor}>• {cm.title}</Text>
                          ))}
                        </>
                      )}
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>
            </Collapse>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
