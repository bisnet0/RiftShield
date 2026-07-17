import { useState, useRef, useEffect } from "react";
import {
  Box, VStack, HStack, Text, Button, Divider, Heading, useColorModeValue,
  Flex, Icon, Image, SimpleGrid, Badge, Spinner, Collapse,
} from "@chakra-ui/react";
import { Upload, ArrowRightLeft, Sparkles, Shield, AlertTriangle, CheckCircle, XCircle, Plus, Minus, ArrowUp, ArrowDown, Clock, History } from "lucide-react";
import { useAppThemeFx } from "../styles/app-theme-fx";
import { useInferenceThemeFx } from "../styles/inference-theme-fx";
import { useT } from "../hooks/useT";
import { useApiTranslator } from "../hooks/useApiTranslator";
import { logSystemEvent } from "../utils/logger";
import api from "../middleware/api";

export default function ComparisonPage() {
  const appFx = useAppThemeFx();
  const fx = useInferenceThemeFx();
  const t = useT();
  const at = useApiTranslator();
  const cardBg = useColorModeValue("#ffffff", "#1a1a1a");
  const cardBorder = useColorModeValue("rgba(230, 92, 0, 0.15)", "#333333");

  const [fileA, setFileA] = useState<File | null>(null);
  const [previewA, setPreviewA] = useState<string | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [previewB, setPreviewB] = useState<string | null>(null);
  const [comparing, setComparing] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedHist, setSelectedHist] = useState<any>(null);
  const refA = useRef<HTMLInputElement>(null);
  const refB = useRef<HTMLInputElement>(null);

  const loadHistory = async () => {
    try {
      const res = await api.get("/inference/comparisons");
      setHistory(res.data.items || []);
    } catch {}
  };

  useEffect(() => { loadHistory(); }, []);

  const handleCompare = async () => {
    if (!fileA || !fileB) return;
    logSystemEvent("compare", "Comparing architectures...", "activity");
    setComparing(true);
    setResult(null);
    setSuggestion(null);
    try {
      const form = new FormData();
      form.append("file_a", fileA);
      form.append("file_b", fileB);
      const res = await api.post("/inference/compare", form);
      setResult(res.data);
    } catch (err: any) {
      console.error("Compare error", err);
    } finally {
      setComparing(false);
    }
  };

  const handleSuggest = async () => {
    if (!fileA || !fileB) return;
    logSystemEvent("suggest", "Generating AI architecture suggestion...", "activity");
    setSuggesting(true);
    setSuggestion(null);
    try {
      const form = new FormData();
      form.append("file_a", fileA);
      form.append("file_b", fileB);
      const res = await api.post("/inference/suggest", form);
      setSuggestion(res.data);
    } catch (err: any) {
      console.error("Suggest error", err);
    } finally {
      setSuggesting(false);
    }
  };

  const strideColor = (cat: string, val: number) => {
    if (val === 0) return "green.400";
    if (cat === "spoofing" || cat === "elevation_of_privilege") return "red.400";
    if (cat === "denial_of_service") return "purple.400";
    return "orange.400";
  };

  const STRIDE_LABELS: Record<string, string> = {
    spoofing: t("stride.spoofing"), tampering: t("stride.tampering"), repudiation: t("stride.repudiation"),
    information_disclosure: t("stride.information_disclosure"), denial_of_service: t("stride.denial_of_service"), elevation_of_privilege: t("stride.elevation_of_privilege"),
  };

  return (
    <Box w="full" maxW="1800px" mx="auto" pb={10}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg" color={appFx.textColor}>{t("nav.compare") || t("cmp.title")}</Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Box bg={cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={cardBorder}>
            <Heading size="sm" color={appFx.textColor} mb={4}>{t("cmp.arch_a")}</Heading>
            <Divider mb={4} />
            <input type="file" accept="image/*" ref={refA} onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) { setFileA(f); setPreviewA(URL.createObjectURL(f)); }
            }} style={{ display: "none" }} />
            <Box
              w="full" h="200px" border="2px dashed" borderColor={cardBorder} borderRadius="lg"
              display="flex" alignItems="center" justifyContent="center" cursor="pointer"
              onClick={() => refA.current?.click()} _hover={{ borderColor: "orange.400" }}
              bg={appFx.navHoverBg}
            >
              {previewA ? <Image src={previewA} maxH="180px" borderRadius="md" /> : (
                <VStack><Icon as={Upload} color="orange.400" boxSize={8} /><Text fontSize="sm" color={appFx.textMuted}>{t("cmp.select_image")}</Text></VStack>
              )}
            </Box>
            {fileA && <Text fontSize="xs" color={appFx.textMuted} mt={1}>{fileA.name}</Text>}
          </Box>

          <Box bg={cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={cardBorder}>
            <Heading size="sm" color={appFx.textColor} mb={4}>{t("cmp.arch_b")}</Heading>
            <Divider mb={4} />
            <input type="file" accept="image/*" ref={refB} onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) { setFileB(f); setPreviewB(URL.createObjectURL(f)); }
            }} style={{ display: "none" }} />
            <Box
              w="full" h="200px" border="2px dashed" borderColor={cardBorder} borderRadius="lg"
              display="flex" alignItems="center" justifyContent="center" cursor="pointer"
              onClick={() => refB.current?.click()} _hover={{ borderColor: "orange.400" }}
              bg={appFx.navHoverBg}
            >
              {previewB ? <Image src={previewB} maxH="180px" borderRadius="md" /> : (
                <VStack><Icon as={Upload} color="orange.400" boxSize={8} /><Text fontSize="sm" color={appFx.textMuted}>{t("cmp.select_image")}</Text></VStack>
              )}
            </Box>
            {fileB && <Text fontSize="xs" color={appFx.textMuted} mt={1}>{fileB.name}</Text>}
          </Box>
        </SimpleGrid>

        <Flex justify="center" gap={4}>
          <Button
            leftIcon={<Icon as={ArrowRightLeft} />}
            colorScheme="orange"
            size="lg"
            onClick={handleCompare}
            isLoading={comparing}
            loadingText={t("cmp.comparing")}
            isDisabled={!fileA || !fileB}
          >
            {t("cmp.compare")}
          </Button>
          {result && (
            <Button
              leftIcon={<Icon as={Sparkles} />}
              colorScheme="orange"
              size="lg"
              onClick={handleSuggest}
              isLoading={suggesting}
              loadingText={t("cmp.generating")}
              variant="outline"
            >
              {t("cmp.suggest")}
            </Button>
          )}
        </Flex>

        {result && (
          <Box bg={cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={cardBorder}>
            <Heading size="md" color={appFx.textColor} mb={4}>{t("cmp.result_heading")}</Heading>
            <Divider mb={4} />

            <Flex align="center" gap={3} mb={6} p={4} bg={appFx.navHoverBg} borderRadius="lg">
              <Icon as={result.verdict === "ARQUITETURA_B_RECOMENDADA" ? CheckCircle : result.verdict === "ARQUITETURA_A_RECOMENDADA" ? AlertTriangle : Minus}
                color={result.verdict === "ARQUITETURA_B_RECOMENDADA" ? "green.400" : result.verdict === "ARQUITETURA_A_RECOMENDADA" ? "orange.400" : "gray.400"} boxSize={6} />
              <Text fontWeight="bold" color={appFx.textColor}>{result.summary_text}</Text>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
              <Box>
                <Text fontWeight="bold" color={appFx.textColor} mb={2}>{t("cmp.arch_a_label")}</Text>
                <Text fontSize="sm" color={appFx.textMuted}>{t("cmp.risk")}: {result.architecture_a.risk_score?.toFixed(1) || "?"}/10</Text>
                <Text fontSize="sm" color={appFx.textMuted}>{t("cmp.threats")}: {result.architecture_a.total_threats}</Text>
                <Text fontSize="sm" color={appFx.textMuted}>{t("cmp.components")}: {result.architecture_a.components?.map((c:string)=>at.component(c)).join(", ") || "—"}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color={appFx.textColor} mb={2}>{t("cmp.arch_b_label")}</Text>
                <Text fontSize="sm" color={appFx.textMuted}>{t("cmp.risk")}: {result.architecture_b.risk_score?.toFixed(1) || "?"}/10</Text>
                <Text fontSize="sm" color={appFx.textMuted}>{t("cmp.threats")}: {result.architecture_b.total_threats}</Text>
                <Text fontSize="sm" color={appFx.textMuted}>{t("cmp.components")}: {result.architecture_b.components?.map((c:string)=>at.component(c)).join(", ") || "—"}</Text>
              </Box>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
              <Box p={4} bg={appFx.navHoverBg} borderRadius="md">
                <HStack mb={2}><Icon as={Plus} color="green.400" /><Text fontWeight="bold" color="green.400" fontSize="sm">{t("cmp.added")}</Text></HStack>
                {result.diff.components_added?.length > 0 ? result.diff.components_added.map((c: string) => <Text key={c} fontSize="xs" color={appFx.textColor}>+ {at.component(c)}</Text>) : <Text fontSize="xs" color={appFx.textMuted}>{t("cmp.none_m")}</Text>}
              </Box>
              <Box p={4} bg={appFx.navHoverBg} borderRadius="md">
                <HStack mb={2}><Icon as={Minus} color="red.400" /><Text fontWeight="bold" color="red.400" fontSize="sm">{t("cmp.removed")}</Text></HStack>
                {result.diff.components_removed?.length > 0 ? result.diff.components_removed.map((c: string) => <Text key={c} fontSize="xs" color={appFx.textColor}>- {at.component(c)}</Text>) : <Text fontSize="xs" color={appFx.textMuted}>{t("cmp.none_m")}</Text>}
              </Box>
              <Box p={4} bg={appFx.navHoverBg} borderRadius="md">
                <HStack mb={2}><Icon as={Shield} color="blue.400" /><Text fontWeight="bold" color="blue.400" fontSize="sm">{t("cmp.common")}</Text></HStack>
                {result.diff.components_common?.length > 0 ? result.diff.components_common.map((c: string) => <Text key={c} fontSize="xs" color={appFx.textColor}>{at.component(c)}</Text>) : <Text fontSize="xs" color={appFx.textMuted}>{t("cmp.none_m")}</Text>}
              </Box>
            </SimpleGrid>

            <Box mb={4}>
              <Text fontWeight="bold" color={appFx.textColor} mb={2}>{t("cmp.delta_stride")}</Text>
              <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={2}>
                {Object.entries(result.diff.stride_delta || {}).map(([cat, val]: [string, any]) => (
                  <Flex key={cat} align="center" gap={1} p={2} bg={appFx.navHoverBg} borderRadius="md">
                    {val > 0 ? <ArrowUp size={12} color="red" /> : val < 0 ? <ArrowDown size={12} color="green" /> : <Minus size={12} />}
                    <Text fontSize="xs" color={appFx.textColor}>{STRIDE_LABELS[cat] || cat}: {val > 0 ? `+${val}` : val}</Text>
                  </Flex>
                ))}
              </SimpleGrid>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Box p={4} bg={appFx.navHoverBg} borderRadius="md">
                <HStack mb={2}><Icon as={CheckCircle} color="green.400" /><Text fontWeight="bold" color="green.400" fontSize="sm">{t("cmp.vulns_mitigated")} ({result.diff.vulnerabilities_mitigated?.length || 0})</Text></HStack>
                {(result.diff.vulnerabilities_mitigated || []).map((v: any) => (
                  <Text key={v.cve} fontSize="xs" color={appFx.textColor}>✅ {v.cve} — {v.title}</Text>
                ))}
                {(!result.diff.vulnerabilities_mitigated || result.diff.vulnerabilities_mitigated.length === 0) && <Text fontSize="xs" color={appFx.textMuted}>{t("cmp.none_f")}</Text>}
              </Box>
              <Box p={4} bg={appFx.navHoverBg} borderRadius="md">
                <HStack mb={2}><Icon as={AlertTriangle} color="red.400" /><Text fontWeight="bold" color="red.400" fontSize="sm">{t("cmp.vulns_new")} ({result.diff.vulnerabilities_new?.length || 0})</Text></HStack>
                {(result.diff.vulnerabilities_new || []).map((v: any) => (
                  <Text key={v.cve} fontSize="xs" color={appFx.textColor}>⚠️ {v.cve} — {v.title}</Text>
                ))}
                {(!result.diff.vulnerabilities_new || result.diff.vulnerabilities_new.length === 0) && <Text fontSize="xs" color={appFx.textMuted}>{t("cmp.none_f")}</Text>}
              </Box>
            </SimpleGrid>
          </Box>
        )}

        {suggestion && !suggestion.error && (
          <Box bg={cardBg} p={6} borderRadius="xl" border="1px solid" borderColor="orange.400" boxShadow="0 0 20px rgba(168, 85, 247, 0.1)">
            <HStack mb={4}><Icon as={Sparkles} color="orange.400" /><Heading size="md" color={appFx.textColor}>{suggestion.nome || t("cmp.suggestion_fallback_title")}</Heading></HStack>
            <Divider mb={4} />
            <Text fontSize="sm" color={appFx.textColor} mb={4} whiteSpace="pre-line">{suggestion.descricao}</Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
              <Box>
                <Text fontWeight="bold" color={appFx.textColor} mb={2}>{t("cmp.components")}</Text>
                {(suggestion.componentes || []).map((c: any) => (
                  <Flex key={c.label} align="center" gap={2} mb={1}>
                    <Badge colorScheme="purple" variant="subtle">{c.label}</Badge>
                    <Text fontSize="xs" color={appFx.textMuted}>{c.justificativa}</Text>
                  </Flex>
                ))}
              </Box>
              <Box>
                <Text fontWeight="bold" color={appFx.textColor} mb={2}>{t("cmp.beneficios_seguranca")}</Text>
                {(suggestion.beneficios_seguranca || []).map((b: string, i: number) => (
                  <HStack key={i} align="start" mb={1}><Icon as={Shield} color="green.400" boxSize={3} mt={1} /><Text fontSize="xs" color={appFx.textColor}>{b}</Text></HStack>
                ))}
              </Box>
            </SimpleGrid>

            {suggestion.stride_expected && (
              <Box>
                <Text fontWeight="bold" color={appFx.textColor} mb={2}>{t("cmp.stride_esperado")}</Text>
                <SimpleGrid columns={{ base: 3, md: 6 }} spacing={2}>
                  {Object.entries(suggestion.stride_expected).map(([cat, val]: [string, any]) => (
                    <Flex key={cat} align="center" gap={1} p={2} bg={appFx.navHoverBg} borderRadius="md">
                      <Badge colorScheme={val > 0 ? "orange" : "green"}>{val}</Badge>
                      <Text fontSize="xs" color={appFx.textColor}>{STRIDE_LABELS[cat] || cat}</Text>
                    </Flex>
                  ))}
                </SimpleGrid>
              </Box>
            )}
          </Box>
        )}

        {suggestion?.error && (
          <Box bg={cardBg} p={6} borderRadius="xl" border="1px solid" borderColor="red.400">
            <Text color="red.400">{suggestion.error}</Text>
          </Box>
        )}

        <Box bg={cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={cardBorder}>
          <Flex justify="space-between" align="center" mb={2} cursor="pointer" onClick={() => setHistoryOpen(!historyOpen)}>
            <HStack><Icon as={History} color={appFx.brandColor} /><Heading size="sm" color={appFx.textColor}>{t("cmp.history_heading")}</Heading></HStack>
            <Badge colorScheme="orange" variant="subtle">{history.length}</Badge>
          </Flex>
          <Divider mb={4} />
          <Collapse in={historyOpen}>
            {history.length === 0 && <Text fontSize="sm" color={appFx.textMuted} textAlign="center" py={4}>{t("cmp.no_history")}</Text>}
            <VStack align="stretch" spacing={2}>
              {history.map((h) => (
                <Box key={h.id} p={3} bg={appFx.navHoverBg} borderRadius="md" cursor="pointer"
                  onClick={() => setSelectedHist(selectedHist?.id === h.id ? null : h)}
                  _hover={{ bg: "blackAlpha.100" }}
                >
                  <Flex justify="space-between" align="center">
                    <HStack>
                      <Icon as={ArrowRightLeft} size={14} color={appFx.brandColor} />
                      <Text fontSize="sm" color={appFx.textColor} fontWeight="medium">{h.filename_a} × {h.filename_b}</Text>
                    </HStack>
                    <HStack>
                      {h.suggestion && <Badge colorScheme="purple" variant="subtle" fontSize="2xs">{t("cmp.suggestion_badge")}</Badge>}
                      <Badge colorScheme={h.result?.verdict === "ARQUITETURA_B_RECOMENDADA" ? "green" : h.result?.verdict === "ARQUITETURA_A_RECOMENDADA" ? "orange" : "gray"} fontSize="2xs">
                        {h.result?.verdict === "ARQUITETURA_B_RECOMENDADA" ? t("cmp.verdict_b_better") : h.result?.verdict === "ARQUITETURA_A_RECOMENDADA" ? t("cmp.verdict_a_better") : t("cmp.verdict_equal")}
                      </Badge>
                      <Text fontSize="2xs" color={appFx.textMuted}>{new Date(h.created_at).toLocaleString("pt-BR")}</Text>
                    </HStack>
                  </Flex>
                  <Collapse in={selectedHist?.id === h.id}>
                    <Box mt={3} p={4} bg={cardBg} borderRadius="md" border="1px solid" borderColor={cardBorder}>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                        <Box>
                          <Text fontWeight="bold" fontSize="sm" color={appFx.textColor} mb={2}>{t("cmp.history_arch_a")}: {h.filename_a}</Text>
                          {h.image_a_b64 && <Image src={`data:image/png;base64,${h.image_a_b64}`} alt="Arch A" maxH="150px" borderRadius="md" objectFit="contain" bg={appFx.navHoverBg} p={1} />}
                        </Box>
                        <Box>
                          <Text fontWeight="bold" fontSize="sm" color={appFx.textColor} mb={2}>{t("cmp.history_arch_b")}: {h.filename_b}</Text>
                          {h.image_b_b64 && <Image src={`data:image/png;base64,${h.image_b_b64}`} alt="Arch B" maxH="150px" borderRadius="md" objectFit="contain" bg={appFx.navHoverBg} p={1} />}
                        </Box>
                      </SimpleGrid>

                      <Flex align="center" gap={2} mb={3} p={2} bg={appFx.navHoverBg} borderRadius="md">
                        <Icon as={h.result?.verdict === "ARQUITETURA_B_RECOMENDADA" ? CheckCircle : h.result?.verdict === "ARQUITETURA_A_RECOMENDADA" ? AlertTriangle : Minus}
                          color={h.result?.verdict === "ARQUITETURA_B_RECOMENDADA" ? "green.400" : h.result?.verdict === "ARQUITETURA_A_RECOMENDADA" ? "orange.400" : "gray.400"} boxSize={4} />
                        <Text fontSize="sm" color={appFx.textColor}>{h.result?.summary_text || "—"}</Text>
                      </Flex>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={3}>
                        <Box p={2} bg={appFx.navHoverBg} borderRadius="md">
                          <Text fontWeight="bold" fontSize="xs" color={appFx.textColor}>{t("cmp.history_arch_a")}</Text>
                          <Text fontSize="2xs" color={appFx.textMuted}>{t("cmp.risk")}: {h.result?.architecture_a?.risk_score?.toFixed(1)}/10 · {t("cmp.threats")}: {h.result?.architecture_a?.total_threats}</Text>
                          <Text fontSize="2xs" color={appFx.textMuted}>{t("cmp.components")}: {(h.result?.architecture_a?.components || []).join(", ")}</Text>
                        </Box>
                        <Box p={2} bg={appFx.navHoverBg} borderRadius="md">
                          <Text fontWeight="bold" fontSize="xs" color={appFx.textColor}>{t("cmp.history_arch_b")}</Text>
                          <Text fontSize="2xs" color={appFx.textMuted}>{t("cmp.risk")}: {h.result?.architecture_b?.risk_score?.toFixed(1)}/10 · {t("cmp.threats")}: {h.result?.architecture_b?.total_threats}</Text>
                          <Text fontSize="2xs" color={appFx.textMuted}>{t("cmp.components")}: {(h.result?.architecture_b?.components || []).join(", ")}</Text>
                        </Box>
                      </SimpleGrid>

                      {h.result?.diff && (
                        <SimpleGrid columns={3} spacing={2} mb={3}>
                          <Box p={2} bg={appFx.navHoverBg} borderRadius="md">
                            <Text fontWeight="bold" fontSize="xs" color="green.400">{t("cmp.added")}</Text>
                            {(h.result.diff.components_added || []).map((c: string) => <Text key={c} fontSize="2xs" color={appFx.textColor}>+ {at.component(c)}</Text>)}
                            {(!h.result.diff.components_added || h.result.diff.components_added.length === 0) && <Text fontSize="2xs" color={appFx.textMuted}>{t("cmp.none_m")}</Text>}
                          </Box>
                          <Box p={2} bg={appFx.navHoverBg} borderRadius="md">
                            <Text fontWeight="bold" fontSize="xs" color="red.400">{t("cmp.removed")}</Text>
                            {(h.result.diff.components_removed || []).map((c: string) => <Text key={c} fontSize="2xs" color={appFx.textColor}>- {at.component(c)}</Text>)}
                            {(!h.result.diff.components_removed || h.result.diff.components_removed.length === 0) && <Text fontSize="2xs" color={appFx.textMuted}>{t("cmp.none_m")}</Text>}
                          </Box>
                          <Box p={2} bg={appFx.navHoverBg} borderRadius="md">
                            <Text fontWeight="bold" fontSize="xs" color="blue.400">{t("cmp.delta_risco")}</Text>
                            <Text fontSize="2xs" color={appFx.textColor}>{h.result.diff.risk_delta > 0 ? "+" : ""}{h.result.diff.risk_delta?.toFixed(2)}</Text>
                          </Box>
                        </SimpleGrid>
                      )}

                      {h.suggestion && (
                        <Box mt={2} p={3} bg="purple.50" borderRadius="md" border="1px solid" borderColor="purple.200">
                          <Text fontSize="sm" fontWeight="bold" color="purple.600">✨ {h.suggestion.nome || t("cmp.suggestion_badge")}</Text>
                          <Text fontSize="xs" color="purple.700" mb={2}>{h.suggestion.descricao || ""}</Text>
                          <SimpleGrid columns={2} spacing={2}>
                            {(h.suggestion.beneficios_seguranca || []).slice(0, 3).map((b: string, i: number) => (
                              <Text key={i} fontSize="2xs" color="purple.600">🛡️ {b}</Text>
                            ))}
                          </SimpleGrid>
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                </Box>
              ))}
            </VStack>
          </Collapse>
        </Box>
      </VStack>
    </Box>
  );
}


