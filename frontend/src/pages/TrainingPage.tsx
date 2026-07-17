import { Box, Heading, Text, VStack, Button, Icon, Badge, HStack, SimpleGrid, Flex, Spinner, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Stat, StatLabel, StatNumber, Alert, AlertIcon, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, FormControl, FormLabel } from "@chakra-ui/react";
import { Play, RefreshCw, CheckCircle, XCircle, Clock, Zap, Database, Filter, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { useAppThemeFx } from "../styles/app-theme-fx";
import { useInferenceThemeFx } from "../styles/inference-theme-fx";
import { useToast } from "../components/Toast/components/ToastContext";
import { logSystemEvent } from "../utils/logger";
import { fineTuneUpload, listModels, activateModel, type TrainingLog } from "../services/training-service";
import { listEntries, getDatasetStats, type DatasetEntry, type DatasetStats } from "../services/dataset-service";
import { useT } from "../hooks/useT";

export default function TrainingPage() {
  const fx = useInferenceThemeFx();
  const appFx = useAppThemeFx();
  const { showToast } = useToast();
  const t = useT();
  const [activeModelPath, setActiveModelPath] = useState<string | null>(null);
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
      const active = mRes.items.find((l: TrainingLog) => l.status === "completed" && l.model_path);
      if (active) setActiveModelPath(active.model_path);
      setEntries(eRes.items);
      setStats(sRes);
    } catch { showToast({ title: t("geral.erro"), message: t("tr.erro_carregar"), type: "error" }); } finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  const handleTrain = async () => {
    const trainEntries = entries.filter((e) => e.split === "train");
    if (trainEntries.length === 0) { showToast({ title: t("geral.atencao"), message: t("tr.sem_imagens_treino"), type: "info" }); return; }
    setTraining(true);
    setProgress({ stage: "export", message: t("tr.preparando_dataset") });
    try {
      logSystemEvent("training", `Treinando com ${trainEntries.length} imagem(ns)`, "training");
      setProgress({ stage: "training", message: t("tr.fine_tune_andamento") });
      const result = await fineTuneUpload(epochs);
      if (result.status === "failed") {
        showToast({ title: t("geral.erro"), message: result.metrics?.error || t("tr.falha_treinamento"), type: "error" });
      } else {
        setProgress({ stage: "done", message: t("tr.fine_tune_concluido") });
        showToast({ title: t("geral.sucesso"), message: t("tr.modelo_atualizado", { count: trainEntries.length }), type: "success" });
      }
      loadAll();
    } catch (err: any) {
      showToast({ title: t("geral.erro"), message: err?.response?.data?.error || t("tr.falha_treinamento"), type: "error" });
    } finally { setTraining(false); setProgress(null); }
  };

  const SPLIT_LABELS: Record<string, string> = { train: t("ds.treino"), val: t("ds.validacao"), test: t("ds.teste") };

  const isActiveModel = (log: TrainingLog): boolean => {
    return log.status === "completed" && !!log.model_path && log.model_path === activeModelPath;
  };

  return (
    <Box w="full" maxW="1800px" mx="auto" pb={10}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg" color={appFx.textColor}>{t("tr.title")}</Heading>

        {stats && (
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
            <Stat bg={fx.cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={fx.cardBorder}>
              <StatLabel color={appFx.textMuted}>{t("ds.total")}</StatLabel>
              <StatNumber color={appFx.textColor}>{stats.total}</StatNumber>
            </Stat>
            <Stat bg={fx.cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={fx.cardBorder}>
              <StatLabel color={appFx.textMuted}>{t("ds.treino")}</StatLabel>
              <StatNumber color="green.400">{stats.train_count}</StatNumber>
            </Stat>
            <Stat bg={fx.cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={fx.cardBorder}>
              <StatLabel color={appFx.textMuted}>{t("ds.validacao")}</StatLabel>
              <StatNumber color="blue.400">{stats.val_count}</StatNumber>
            </Stat>
            <Stat bg={fx.cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={fx.cardBorder}>
              <StatLabel color={appFx.textMuted}>{t("tr.fine_tune")}</StatLabel>
              <StatNumber color="orange.400">{logs.length}</StatNumber>
            </Stat>
          </SimpleGrid>
        )}

        <Box bg={fx.cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={fx.cardBorder} boxShadow={fx.cardShadow}>
          <Heading size="md" mb={4} color={appFx.textColor}>{t("tr.iniciar")}</Heading>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={4}>
            <FormControl>
              <FormLabel color={appFx.textMuted} fontSize="sm">{t("tr.epocas")}</FormLabel>
              <NumberInput value={epochs} min={1} max={100} onChange={(_, v) => setEpochs(v)}>
                <NumberInputField bg={appFx.navHoverBg} borderColor={fx.cardBorder} color={appFx.textColor} />
                <NumberInputStepper>
                  <NumberIncrementStepper color={appFx.textColor} />
                  <NumberDecrementStepper color={appFx.textColor} />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <Button leftIcon={<Icon as={Play} />} colorScheme="orange" size="lg" isLoading={training} loadingText={t("tr.treinando") + "..."} onClick={handleTrain} mt="auto" gridColumn="span 3">
              {t("tr.treinar_dataset")} ({entries.filter(e => e.split === "train").length} {t("ds.treino").toLowerCase()})
            </Button>
          </SimpleGrid>

          {progress && (
            <Flex align="center" gap={3} mt={2} p={3} bg={appFx.navHoverBg} borderRadius="md">
              <Spinner size="sm" color="orange.400" />
              <Text fontSize="sm" color={appFx.textColor}>{progress.stage === "done" ? t("tr.concluido") : `${progress.message}...`}</Text>
            </Flex>
          )}
        </Box>

        <Box bg={fx.cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={fx.cardBorder} boxShadow={fx.cardShadow}>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md" color={appFx.textColor}>{t("tr.imagens_dataset")}</Heading>
            <Button size="sm" variant="ghost" leftIcon={<Icon as={RefreshCw} />} onClick={loadAll} isLoading={loading}>{t("geral.atualizar")}</Button>
          </Flex>

          {loading && <Spinner />}

          {!loading && entries.length === 0 && (
            <Text color={appFx.textMuted} textAlign="center" py={8}>{t("tr.sem_imagens")}</Text>
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
            <Text fontSize="sm" color={appFx.textMuted} textAlign="center">{t("tr.e_mais", { count: entries.length - 12 })}</Text>
          )}
        </Box>

        <Box bg={fx.cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={fx.cardBorder} boxShadow={fx.cardShadow}>
            <Heading size="md" mb={4} color={appFx.textColor}>{t("tr.historico")}</Heading>

          {logs.length === 0 && <Text color={appFx.textMuted} textAlign="center" py={4}>{t("tr.sem_treinos")}</Text>}

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
                    <HStack spacing={2}>
                      {isActiveModel(log) && (
                        <Badge colorScheme="green" variant="solid">{t("geral.ativo")}</Badge>
                      )}
                      <Button size="sm" leftIcon={<Icon as={Zap} />} colorScheme="green" onClick={async () => { await activateModel(log.model_path!); setActiveModelPath(log.model_path); loadAll(); }}>
                        {t("tr.ativar_modelo")}
                      </Button>
                    </HStack>
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
