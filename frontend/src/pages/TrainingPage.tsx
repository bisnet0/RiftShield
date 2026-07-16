import { Box, Heading, Text, VStack, Button, Icon, Badge, HStack, SimpleGrid, Flex, Spinner, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Stat, StatLabel, StatNumber, Alert, AlertIcon, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, FormControl, FormLabel } from "@chakra-ui/react";
import { Play, RefreshCw, CheckCircle, XCircle, Clock, Zap, Database, Filter, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { useAppThemeFx } from "../styles/app-theme-fx";
import { useInferenceThemeFx } from "../styles/inference-theme-fx";
import { useToast } from "../components/Toast/components/ToastContext";
import { logSystemEvent } from "../utils/logger";
import { fineTuneUpload, listModels, activateModel, type TrainingLog } from "../services/training-service";
import { listEntries, getDatasetStats, type DatasetEntry, type DatasetStats } from "../services/dataset-service";

export default function TrainingPage() {
  const fx = useInferenceThemeFx();
  const appFx = useAppThemeFx();
  const { showToast } = useToast();
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [entries, setEntries] = useState<DatasetEntry[]>([]);
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [epochs, setEpochs] = useState(10);
  const [progress, setProgress] = useState<{ stage: string; message: string } | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [mRes, eRes, sRes] = await Promise.all([
        listModels(),
        listEntries("", "", 0, 100),
        getDatasetStats(),
      ]);
      setLogs(mRes.items);
      setEntries(eRes.items);
      setStats(sRes);
    } catch { showToast({ title: "Erro", message: "Falha ao carregar dados", type: "error" }); } finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  const handleTrain = async () => {
    const trainEntries = entries.filter((e) => e.split === "train");
    if (trainEntries.length === 0) { showToast({ title: "Aviso", message: "Nenhuma imagem no split Treino. Adicione imagens no Dataset primeiro.", type: "info" }); return; }
    setTraining(true);
    setProgress({ stage: "export", message: "Preparando dataset..." });
    try {
      logSystemEvent("training", `Treinando com ${trainEntries.length} imagem(ns)`, "training");
      setProgress({ stage: "training", message: "Fine-tuning em andamento..." });
      const result = await fineTuneUpload(epochs);
      if (result.status === "failed") {
        showToast({ title: "Erro", message: result.metrics?.error || "Falha no treinamento", type: "error" });
      } else {
        setProgress({ stage: "done", message: "Fine-tune concluído!" });
        showToast({ title: "Sucesso", message: `Modelo atualizado com ${trainEntries.length} imagem(ns)`, type: "success" });
      }
      loadAll();
    } catch (err: any) {
      showToast({ title: "Erro", message: err?.response?.data?.error || "Falha no treinamento", type: "error" });
    } finally { setTraining(false); setProgress(null); }
  };

  const SPLIT_LABELS: Record<string, string> = { train: "Treino", val: "Validação", test: "Teste" };

  return (
    <Box w="full" maxW="1800px" mx="auto" pb={10}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg" color={appFx.textColor}>Treinamento de Modelo</Heading>

        {stats && (
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
            <Stat bg={fx.cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={fx.cardBorder}>
              <StatLabel color={appFx.textMuted}>Total Dataset</StatLabel>
              <StatNumber color={appFx.textColor}>{stats.total}</StatNumber>
            </Stat>
            <Stat bg={fx.cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={fx.cardBorder}>
              <StatLabel color={appFx.textMuted}>Treino</StatLabel>
              <StatNumber color="green.400">{stats.train_count}</StatNumber>
            </Stat>
            <Stat bg={fx.cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={fx.cardBorder}>
              <StatLabel color={appFx.textMuted}>Validação</StatLabel>
              <StatNumber color="blue.400">{stats.val_count}</StatNumber>
            </Stat>
            <Stat bg={fx.cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={fx.cardBorder}>
              <StatLabel color={appFx.textMuted}>Fine-Tunes</StatLabel>
              <StatNumber color="orange.400">{logs.length}</StatNumber>
            </Stat>
          </SimpleGrid>
        )}

        <Box bg={fx.cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={fx.cardBorder} boxShadow={fx.cardShadow}>
          <Heading size="md" mb={4} color={appFx.textColor}>Executar Treinamento</Heading>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={4}>
            <FormControl>
              <FormLabel color={appFx.textMuted} fontSize="sm">Épocas (fine-tune)</FormLabel>
              <NumberInput value={epochs} min={1} max={100} onChange={(_, v) => setEpochs(v)}>
                <NumberInputField bg={appFx.navHoverBg} borderColor={fx.cardBorder} color={appFx.textColor} />
                <NumberInputStepper>
                  <NumberIncrementStepper color={appFx.textColor} />
                  <NumberDecrementStepper color={appFx.textColor} />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <Button leftIcon={<Icon as={Play} />} colorScheme="orange" size="lg" isLoading={training} loadingText="Treinando..." onClick={handleTrain} mt="auto" gridColumn="span 3">
              Treinar com Dataset ({entries.filter(e => e.split === "train").length} imagens de treino)
            </Button>
          </SimpleGrid>

          {progress && (
            <Flex align="center" gap={3} mt={2} p={3} bg={appFx.navHoverBg} borderRadius="md">
              <Spinner size="sm" color="orange.400" />
              <Text fontSize="sm" color={appFx.textColor}>{progress.stage === "done" ? "Concluído!" : `${progress.message}...`}</Text>
            </Flex>
          )}
        </Box>

        <Box bg={fx.cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={fx.cardBorder} boxShadow={fx.cardShadow}>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md" color={appFx.textColor}>Imagens do Dataset para Treino</Heading>
            <Button size="sm" variant="ghost" leftIcon={<Icon as={RefreshCw} />} onClick={loadAll} isLoading={loading}>Atualizar</Button>
          </Flex>

          {loading && <Spinner />}

          {!loading && entries.length === 0 && (
            <Text color={appFx.textMuted} textAlign="center" py={8}>Nenhuma imagem no dataset. Vá em Dataset e faça upload.</Text>
          )}

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3} mb={6}>
            {entries.slice(0, 12).map((e) => (
              <Flex key={e.id} p={3} bg={appFx.navHoverBg} borderRadius="md" align="center" justify="space-between">
                <HStack>
                  <Icon as={Database} size={14} color={appFx.textMuted} />
                  <Text fontSize="sm" color={appFx.textColor}>{e.filename}</Text>
                </HStack>
                <Badge colorScheme={e.split === "train" ? "green" : e.split === "val" ? "blue" : "purple"} fontSize="2xs">
                  {SPLIT_LABELS[e.split] || e.split}
                </Badge>
              </Flex>
            ))}
          </SimpleGrid>

          {entries.length > 12 && (
            <Text fontSize="sm" color={appFx.textMuted} textAlign="center">e mais {entries.length - 12} imagem(ns)...</Text>
          )}
        </Box>

        <Box bg={fx.cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={fx.cardBorder} boxShadow={fx.cardShadow}>
          <Heading size="md" mb={4} color={appFx.textColor}>Histórico de Fine-Tunes</Heading>

          {logs.length === 0 && <Text color={appFx.textMuted} textAlign="center" py={4}>Nenhum fine-tune realizado ainda</Text>}

          <Accordion allowToggle>
            {logs.map((log) => (
              <AccordionItem key={log.id} border="1px solid" borderColor={fx.cardBorder} borderRadius="md" mb={2}>
                <h2>
                  <AccordionButton _expanded={{ bg: appFx.navHoverBg }}>
                    <HStack flex={1} spacing={4}>
                      {log.status === "completed" ? <Icon as={CheckCircle} color="green.400" /> : log.status === "failed" ? <Icon as={XCircle} color="red.400" /> : <Icon as={Clock} color="gray.400" />}
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" color={appFx.textColor}>{log.model_type}</Text>
                        <Text fontSize="xs" color={appFx.textMuted}>{new Date(log.created_at).toLocaleString("pt-BR")}</Text>
                      </VStack>
                      <Badge colorScheme={log.status === "completed" ? "green" : log.status === "failed" ? "red" : "gray"}>{log.status}</Badge>
                    </HStack>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} bg={appFx.navHoverBg}>
                  {log.metrics?.error && (
                    <Alert status="error" borderRadius="md" mb={3}><AlertIcon />{log.metrics.error}</Alert>
                  )}
                  {log.status === "completed" && log.model_path && (
                    <Button size="sm" leftIcon={<Icon as={Zap} />} colorScheme="green" onClick={() => activateModel(log.model_path!)}>
                      Ativar este Modelo
                    </Button>
                  )}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Box>
      </VStack>
    </Box>
  );
}
