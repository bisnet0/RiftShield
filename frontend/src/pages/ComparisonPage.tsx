import { useState, useRef } from "react";
import {
  Box, VStack, HStack, Text, Button, Divider, Heading, useColorModeValue,
  Flex, Icon, Image, SimpleGrid, Badge, Spinner, Tooltip,
} from "@chakra-ui/react";
import { Upload, ArrowRightLeft, Sparkles, Shield, AlertTriangle, CheckCircle, XCircle, Plus, Minus, ArrowUp, ArrowDown } from "lucide-react";
import { useAppThemeFx } from "../styles/app-theme-fx";
import { useInferenceThemeFx } from "../styles/inference-theme-fx";
import { useT } from "../hooks/useT";
import { logSystemEvent } from "../utils/logger";
import api from "../middleware/api";

export default function ComparisonPage() {
  const appFx = useAppThemeFx();
  const fx = useInferenceThemeFx();
  const t = useT();
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
  const refA = useRef<HTMLInputElement>(null);
  const refB = useRef<HTMLInputElement>(null);

  const handleCompare = async () => {
    if (!fileA || !fileB) return;
    logSystemEvent("compare", "Comparando arquiteturas...", "activity");
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
    logSystemEvent("suggest", "Gerando sugestão de arquitetura com IA...", "activity");
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
    spoofing: "Spoofing", tampering: "Tampering", repudiation: "RepudiaÃ§Ã£o",
    information_disclosure: "ExposiÃ§Ã£o", denial_of_service: "DoS", elevation_of_privilege: "ElevaÃ§Ã£o",
  };

  return (
    <Box w="full" maxW="1800px" mx="auto" pb={10}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg" color={appFx.textColor}>Comparação de Arquiteturas</Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Box bg={cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={cardBorder}>
            <Heading size="sm" color={appFx.textColor} mb={4}>Arquitetura A (Atual)</Heading>
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
                <VStack><Icon as={Upload} color="orange.400" boxSize={8} /><Text fontSize="sm" color={appFx.textMuted}>Selecionar imagem</Text></VStack>
              )}
            </Box>
            {fileA && <Text fontSize="xs" color={appFx.textMuted} mt={1}>{fileA.name}</Text>}
          </Box>

          <Box bg={cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={cardBorder}>
            <Heading size="sm" color={appFx.textColor} mb={4}>Arquitetura B (Proposta)</Heading>
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
                <VStack><Icon as={Upload} color="orange.400" boxSize={8} /><Text fontSize="sm" color={appFx.textMuted}>Selecionar imagem</Text></VStack>
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
            loadingText="Comparando..."
            isDisabled={!fileA || !fileB}
          >
            Comparar Arquiteturas
          </Button>
          {result && (
            <Button
              leftIcon={<Icon as={Sparkles} />}
              colorScheme="purple"
              size="lg"
              onClick={handleSuggest}
              isLoading={suggesting}
              loadingText="Gerando..."
              variant="outline"
            >
              Sugerir Arquitetura âœ¨
            </Button>
          )}
        </Flex>

        {result && (
          <Box bg={cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={cardBorder}>
            <Heading size="md" color={appFx.textColor} mb={4}>Resultado da ComparaÃ§Ã£o</Heading>
            <Divider mb={4} />

            <Flex align="center" gap={3} mb={6} p={4} bg={appFx.navHoverBg} borderRadius="lg">
              <Icon as={result.verdict === "ARQUITETURA_B_RECOMENDADA" ? CheckCircle : result.verdict === "ARQUITETURA_A_RECOMENDADA" ? AlertTriangle : Minus}
                color={result.verdict === "ARQUITETURA_B_RECOMENDADA" ? "green.400" : result.verdict === "ARQUITETURA_A_RECOMENDADA" ? "orange.400" : "gray.400"} boxSize={6} />
              <Text fontWeight="bold" color={appFx.textColor}>{result.summary_text}</Text>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
              <Box>
                <Text fontWeight="bold" color={appFx.textColor} mb={2}>Arquitetura A</Text>
                <Text fontSize="sm" color={appFx.textMuted}>Risco: {result.architecture_a.risk_score?.toFixed(1) || "?"}/10</Text>
                <Text fontSize="sm" color={appFx.textMuted}>AmeaÃ§as: {result.architecture_a.total_threats}</Text>
                <Text fontSize="sm" color={appFx.textMuted}>Componentes: {result.architecture_a.components?.join(", ") || "â€”"}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color={appFx.textColor} mb={2}>Arquitetura B</Text>
                <Text fontSize="sm" color={appFx.textMuted}>Risco: {result.architecture_b.risk_score?.toFixed(1) || "?"}/10</Text>
                <Text fontSize="sm" color={appFx.textMuted}>AmeaÃ§as: {result.architecture_b.total_threats}</Text>
                <Text fontSize="sm" color={appFx.textMuted}>Componentes: {result.architecture_b.components?.join(", ") || "â€”"}</Text>
              </Box>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
              <Box p={4} bg={appFx.navHoverBg} borderRadius="md">
                <HStack mb={2}><Icon as={Plus} color="green.400" /><Text fontWeight="bold" color="green.400" fontSize="sm">Adicionados</Text></HStack>
                {result.diff.components_added?.length > 0 ? result.diff.components_added.map((c: string) => <Text key={c} fontSize="xs" color={appFx.textColor}>+ {c}</Text>) : <Text fontSize="xs" color={appFx.textMuted}>Nenhum</Text>}
              </Box>
              <Box p={4} bg={appFx.navHoverBg} borderRadius="md">
                <HStack mb={2}><Icon as={Minus} color="red.400" /><Text fontWeight="bold" color="red.400" fontSize="sm">Removidos</Text></HStack>
                {result.diff.components_removed?.length > 0 ? result.diff.components_removed.map((c: string) => <Text key={c} fontSize="xs" color={appFx.textColor}>- {c}</Text>) : <Text fontSize="xs" color={appFx.textMuted}>Nenhum</Text>}
              </Box>
              <Box p={4} bg={appFx.navHoverBg} borderRadius="md">
                <HStack mb={2}><Icon as={Shield} color="blue.400" /><Text fontWeight="bold" color="blue.400" fontSize="sm">Comuns</Text></HStack>
                {result.diff.components_common?.length > 0 ? result.diff.components_common.map((c: string) => <Text key={c} fontSize="xs" color={appFx.textColor}>{c}</Text>) : <Text fontSize="xs" color={appFx.textMuted}>Nenhum</Text>}
              </Box>
            </SimpleGrid>

            <Box mb={4}>
              <Text fontWeight="bold" color={appFx.textColor} mb={2}>Delta STRIDE (B - A)</Text>
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
                <HStack mb={2}><Icon as={CheckCircle} color="green.400" /><Text fontWeight="bold" color="green.400" fontSize="sm">Vulnerabilidades Mitigadas ({result.diff.vulnerabilities_mitigated?.length || 0})</Text></HStack>
                {(result.diff.vulnerabilities_mitigated || []).map((v: any) => (
                  <Text key={v.cve} fontSize="xs" color={appFx.textColor}>âœ… {v.cve} â€” {v.title}</Text>
                ))}
                {(!result.diff.vulnerabilities_mitigated || result.diff.vulnerabilities_mitigated.length === 0) && <Text fontSize="xs" color={appFx.textMuted}>Nenhuma</Text>}
              </Box>
              <Box p={4} bg={appFx.navHoverBg} borderRadius="md">
                <HStack mb={2}><Icon as={AlertTriangle} color="red.400" /><Text fontWeight="bold" color="red.400" fontSize="sm">Novas Vulnerabilidades ({result.diff.vulnerabilities_new?.length || 0})</Text></HStack>
                {(result.diff.vulnerabilities_new || []).map((v: any) => (
                  <Text key={v.cve} fontSize="xs" color={appFx.textColor}>âš ï¸ {v.cve} â€” {v.title}</Text>
                ))}
                {(!result.diff.vulnerabilities_new || result.diff.vulnerabilities_new.length === 0) && <Text fontSize="xs" color={appFx.textMuted}>Nenhuma</Text>}
              </Box>
            </SimpleGrid>
          </Box>
        )}

        {suggestion && !suggestion.error && (
          <Box bg={cardBg} p={6} borderRadius="xl" border="1px solid" borderColor="purple.400" boxShadow="0 0 20px rgba(168, 85, 247, 0.1)">
            <HStack mb={4}><Icon as={Sparkles} color="purple.400" /><Heading size="md" color={appFx.textColor}>{suggestion.nome || "Arquitetura C â€” Mesclagem Inteligente"}</Heading></HStack>
            <Divider mb={4} />
            <Text fontSize="sm" color={appFx.textColor} mb={4} whiteSpace="pre-line">{suggestion.descricao}</Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
              <Box>
                <Text fontWeight="bold" color={appFx.textColor} mb={2}>Componentes</Text>
                {(suggestion.componentes || []).map((c: any) => (
                  <Flex key={c.label} align="center" gap={2} mb={1}>
                    <Badge colorScheme="purple" variant="subtle">{c.label}</Badge>
                    <Text fontSize="xs" color={appFx.textMuted}>{c.justificativa}</Text>
                  </Flex>
                ))}
              </Box>
              <Box>
                <Text fontWeight="bold" color={appFx.textColor} mb={2}>BenefÃ­cios de SeguranÃ§a</Text>
                {(suggestion.beneficios_seguranca || []).map((b: string, i: number) => (
                  <HStack key={i} align="start" mb={1}><Icon as={Shield} color="green.400" boxSize={3} mt={1} /><Text fontSize="xs" color={appFx.textColor}>{b}</Text></HStack>
                ))}
              </Box>
            </SimpleGrid>

            {suggestion.stride_expected && (
              <Box>
                <Text fontWeight="bold" color={appFx.textColor} mb={2}>STRIDE Esperado</Text>
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
      </VStack>
    </Box>
  );
}

