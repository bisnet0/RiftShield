import { Box, Heading, Text, VStack, Button, Icon, Grid, Badge, SimpleGrid, HStack, Divider, Image, Tag, TagLabel, TagCloseButton, Select, Flex, useDisclosure, Collapse, Progress, Tooltip, Alert, AlertIcon } from "@chakra-ui/react";
import { ScanSearch, Upload, FileImage, ShieldAlert, Bug, ShieldCheck, AlertTriangle, ArrowRight, RotateCcw, Trash2, Eye, BarChart3, Download, Plus, RefreshCw, Play, Activity, CheckCircle, XCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useInferenceThemeFx } from "../../styles/inference-theme-fx";
import { useAppThemeFx } from "../../styles/app-theme-fx";
import { useToast } from "../Toast/components/ToastContext";

import {
  analyzeAndThreat,
  listReports,
  getReport,
  listThreatReports,
  getThreatReport,
  deleteReport,
  type AnalyzeResponse,
  type ThreatReport,
  type ComponentThreatAnalysis,
} from "../../services/inference-service";

type Tab = "upload" | "reports";

export default function InferencePage() {
  const fx = useInferenceThemeFx();
  const appFx = useAppThemeFx();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState<{ inference: AnalyzeResponse; threat_report: ThreatReport } | null>(null);
  const [reports, setReports] = useState<AnalyzeResponse[]>([]);
  const [threatReports, setThreatReports] = useState<ThreatReport[]>([]);
  const [selectedThreat, setSelectedThreat] = useState<ThreatReport | null>(null);
  const [reportsLoading, setReportsLoading] = useState(false);

  const onDrop = (accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setAnalyzeResult(null);
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "image/*": [".png", ".jpg", ".jpeg"] }, maxFiles: 1 });

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const result = await analyzeAndThreat(file);
      setAnalyzeResult(result);
      showToast({ title: "Análise concluída", message: `Detectados ${result.inference.components.length} componentes`, type: "success" });
      loadReports();
    } catch (err: any) {
      showToast({ title: "Erro", message: err?.response?.data?.error || "Falha na análise", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    setReportsLoading(true);
    try {
      const [r, tr] = await Promise.all([listReports(), listThreatReports()]);
      setReports(r.items);
      setThreatReports(tr.items);
    } catch { /* ignore */ } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => { loadReports(); }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteReport(id);
      showToast({ title: "Removido", message: "Relatório excluído", type: "info" });
      loadReports();
    } catch { showToast({ title: "Erro", message: "Falha ao excluir", type: "error" }); }
  };

  const riskColor = (level: string) => {
    const map: Record<string, string> = { critical: fx.riskCritical, high: fx.riskHigh, medium: fx.riskMedium, low: fx.riskLow };
    return map[level] || fx.riskMedium;
  };

  return (
    <Box w="full" maxW="1800px" mx="auto" pb={10}>
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Heading size="lg" color={appFx.textColor}>Análise de Arquitetura</Heading>
          <HStack>
            <Button size="sm" variant={tab === "upload" ? "solid" : "ghost"} colorScheme="orange" onClick={() => setTab("upload")} leftIcon={<Icon as={Upload} />}>Upload</Button>
            <Button size="sm" variant={tab === "reports" ? "solid" : "ghost"} colorScheme="orange" onClick={() => { setTab("reports"); loadReports(); }} leftIcon={<Icon as={BarChart3} />}>Relatórios</Button>
          </HStack>
        </Flex>

        {tab === "upload" && (
          <Box bg={fx.cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={fx.cardBorder} boxShadow={fx.cardShadow}>
            <VStack spacing={6}>
              <Box {...getRootProps()} w="full" p={10} border="2px dashed" borderColor={isDragActive ? "orange.400" : fx.cardBorder} borderRadius="lg" textAlign="center" cursor="pointer" transition="all 0.2s" _hover={{ borderColor: "orange.400" }}>
                <input {...getInputProps()} />
                <VStack spacing={3}>
                  <Icon as={FileImage} boxSize={12} color="orange.400" />
                  <Text color={appFx.textColor} fontWeight="bold">{isDragActive ? "Solte aqui" : "Arraste um diagrama de arquitetura"}</Text>
                  <Text fontSize="sm" color={appFx.textMuted}>PNG ou JPEG</Text>
                </VStack>
              </Box>

              {preview && (
                <Box w="full" maxH="400px" overflow="hidden" borderRadius="lg" border="1px solid" borderColor={fx.cardBorder}>
                  <Image src={preview} alt="Preview" w="full" objectFit="contain" />
                </Box>
              )}

              <Button leftIcon={<Icon as={ScanSearch} />} colorScheme="orange" size="lg" w="full" isLoading={loading} loadingText="Analisando..." isDisabled={!file} onClick={handleAnalyze}>
                Analisar Diagrama + STRIDE
              </Button>
            </VStack>
          </Box>
        )}

        {analyzeResult && (
          <VStack spacing={6}>
            <Box bg={fx.cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={fx.cardBorder} boxShadow={fx.cardShadow}>
              <Heading size="md" mb={4} color={appFx.textColor}>Componentes Detectados</Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
                {analyzeResult.inference.components.map((c, i) => (
                  <HStack key={i} p={3} bg={appFx.navHoverBg} borderRadius="md" justify="space-between">
                    <Text fontWeight="bold" color={appFx.textColor}>{c.label}</Text>
                    <Badge colorScheme={c.confidence > 0.8 ? "green" : c.confidence > 0.5 ? "yellow" : "red"}>
                      {(c.confidence * 100).toFixed(0)}%
                    </Badge>
                  </HStack>
                ))}
              </SimpleGrid>
              {analyzeResult.inference.processing_time_ms && (
                <Text mt={3} fontSize="sm" color={appFx.textMuted}>Processado em {analyzeResult.inference.processing_time_ms}ms</Text>
              )}
            </Box>

            <Box bg={fx.cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={fx.cardBorder} boxShadow={fx.cardShadow}>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md" color={appFx.textColor}>Relatório STRIDE</Heading>
                <HStack>
                  <Text fontSize="sm" color={appFx.textMuted}>Risco Geral:</Text>
                  <Badge fontSize="md" px={3} py={1} colorScheme={analyzeResult.threat_report.overall_risk_score && analyzeResult.threat_report.overall_risk_score > 7 ? "red" : analyzeResult.threat_report.overall_risk_score && analyzeResult.threat_report.overall_risk_score > 4 ? "orange" : "green"}>
                    {analyzeResult.threat_report.overall_risk_score?.toFixed(1) || "N/A"}/10
                  </Badge>
                </HStack>
              </Flex>

              <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={2} mb={4}>
                {Object.entries(analyzeResult.threat_report.stride_summary).map(([cat, count]) => (
                  <Tooltip key={cat} label={cat}>
                    <Badge p={2} textAlign="center" fontSize="sm" colorScheme={count > 0 ? "orange" : "gray"}>
                      {cat}: {count}
                    </Badge>
                  </Tooltip>
                ))}
              </SimpleGrid>

              <Divider my={4} />

              {analyzeResult.threat_report.component_analyses.map((ca, ci) => (
                <Box key={ci} mb={4} p={4} bg={appFx.navHoverBg} borderRadius="md">
                  <Heading size="sm" mb={2} color={appFx.textColor}>{ca.component_label}</Heading>

                  {ca.stride_threats.length > 0 && (
                    <>
                      <Text fontSize="sm" fontWeight="bold" mt={2} mb={1} color={appFx.textMuted}>Ameaças STRIDE:</Text>
                      <HStack wrap="wrap">
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
                      <Text fontSize="sm" fontWeight="bold" mt={3} mb={1} color={appFx.textMuted}>Vulnerabilidades:</Text>
                      {ca.vulnerabilities.slice(0, 3).map((v, vi) => (
                        <HStack key={vi} spacing={2} mb={1}>
                          <Icon as={Bug} boxSize={3} color="red.400" />
                          <Text fontSize="sm" color={appFx.textColor}>{v.title} {v.cvss_score && <Badge ml={1} fontSize="xs" colorScheme={v.cvss_score >= 7 ? "red" : v.cvss_score >= 4 ? "orange" : "green"}>{v.cvss_score}</Badge>}</Text>
                        </HStack>
                      ))}
                    </>
                  )}

                  {ca.countermeasures.length > 0 && (
                    <>
                      <Text fontSize="sm" fontWeight="bold" mt={3} mb={1} color={appFx.textMuted}>Contramedidas:</Text>
                      {ca.countermeasures.slice(0, 2).map((cm, mi) => (
                        <HStack key={mi} spacing={2} mb={1}>
                          <Icon as={ShieldCheck} boxSize={3} color="green.400" />
                          <Text fontSize="sm" color={appFx.textColor}>{cm.title}</Text>
                        </HStack>
                      ))}
                    </>
                  )}
                </Box>
              ))}
            </Box>
          </VStack>
        )}

        {tab === "reports" && (
          <Box bg={fx.cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={fx.cardBorder} boxShadow={fx.cardShadow}>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md" color={appFx.textColor}>Relatórios Salvos</Heading>
              <Button size="sm" variant="ghost" leftIcon={<Icon as={RefreshCw} />} onClick={loadReports} isLoading={reportsLoading}>Atualizar</Button>
            </Flex>

            <VStack spacing={3} align="stretch">
              {threatReports.length === 0 && reports.length === 0 && (
                <Text color={appFx.textMuted} textAlign="center" py={8}>Nenhum relatório encontrado. Faça upload de um diagrama.</Text>
              )}

              {threatReports.map((tr) => (
                <Box key={tr.id} p={4} bg={appFx.navHoverBg} borderRadius="md">
                  <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold" color={appFx.textColor}>Relatório STRIDE</Text>
                      <Text fontSize="sm" color={appFx.textMuted}>{new Date(tr.created_at).toLocaleString("pt-BR")}</Text>
                      <HStack wrap="wrap" gap={1}>
                        {Object.entries(tr.stride_summary).filter(([, c]) => c > 0).map(([cat]) => (
                          <Badge key={cat} size="sm" colorScheme="orange">{cat}</Badge>
                        ))}
                      </HStack>
                    </VStack>
                    <HStack>
                      <Badge fontSize="md" px={3} colorScheme={tr.overall_risk_score && tr.overall_risk_score > 7 ? "red" : tr.overall_risk_score && tr.overall_risk_score > 4 ? "orange" : "green"}>
                        Risco: {tr.overall_risk_score?.toFixed(1) || "N/A"}
                      </Badge>
                      <Button size="sm" variant="ghost" leftIcon={<Icon as={Eye} />} onClick={() => setSelectedThreat(selectedThreat?.id === tr.id ? null : tr)}>Ver</Button>
                      <Button size="sm" variant="ghost" colorScheme="red" onClick={() => handleDelete(tr.inference_id)}><Icon as={Trash2} /></Button>
                    </HStack>
                  </Flex>

                  <Collapse in={selectedThreat?.id === tr.id}>
                    <Box mt={4} p={4} bg={fx.cardBg} borderRadius="md" border="1px solid" borderColor={fx.cardBorder}>
                      {tr.component_analyses.map((ca, ci) => (
                        <Box key={ci} mb={3}>
                          <Text fontWeight="bold" color={appFx.textColor}>{ca.component_label}</Text>
                          <HStack wrap="wrap" mt={1}>
                            {ca.stride_threats.map((t, ti) => (
                              <Tag key={ti} size="sm" variant="subtle" colorScheme={riskColor(t.risk_level) === fx.riskCritical ? "red" : "orange"}>
                                <TagLabel>{t.category}</TagLabel>
                              </Tag>
                            ))}
                          </HStack>
                          {ca.vulnerabilities.length > 0 && (
                            <Text fontSize="sm" color={appFx.textMuted} mt={1}>{ca.vulnerabilities.length} vulnerabilidade(s)</Text>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Collapse>
                </Box>
              ))}
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
