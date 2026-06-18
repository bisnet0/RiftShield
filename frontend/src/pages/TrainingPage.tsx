import { Box, Heading, Text, VStack, Button, Icon, Badge, HStack, SimpleGrid, Flex, Spinner, Progress, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Stat, StatLabel, StatNumber, StatHelpText, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, FormControl, FormLabel, Select, Alert, AlertIcon } from "@chakra-ui/react";
import { GraduationCap, Play, RefreshCw, CheckCircle, XCircle, Clock, Activity, BarChart3, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { useAppThemeFx } from "../styles/app-theme-fx";
import { useInferenceThemeFx } from "../styles/inference-theme-fx";
import { useToast } from "../components/Toast/components/ToastContext";
import { startTraining, listModels, activateModel, type TrainingLog } from "../services/training-service";

export default function TrainingPage() {
  const fx = useInferenceThemeFx();
  const appFx = useAppThemeFx();
  const { showToast } = useToast();
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [modelType, setModelType] = useState("yolov8n");
  const [epochs, setEpochs] = useState(100);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listModels();
      setLogs(res.items);
    } catch { showToast({ title: "Erro", message: "Falha ao carregar modelos", type: "error" }); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleTrain = async () => {
    setTraining(true);
    try {
      const result = await startTraining(modelType, epochs);
      showToast({ title: "Treinamento iniciado", message: `Modelo: ${result.model_type}`, type: "success" });
      load();
    } catch (err: any) {
      showToast({ title: "Erro", message: err?.response?.data?.error || "Falha ao iniciar treinamento", type: "error" });
    } finally { setTraining(false); }
  };

  const handleActivate = async (path: string) => {
    try {
      await activateModel(path);
      showToast({ title: "Modelo ativado", message: "Modelo carregado para inferência", type: "success" });
    } catch { showToast({ title: "Erro", message: "Falha ao ativar modelo", type: "error" }); }
  };

  const statusIcon = (s: string) => {
    if (s === "completed") return <Icon as={CheckCircle} color="green.400" />;
    if (s === "running") return <Icon as={Activity} color="blue.400" />;
    if (s === "failed") return <Icon as={XCircle} color="red.400" />;
    return <Icon as={Clock} color="gray.400" />;
  };

  return (
    <Box w="full" maxW="1800px" mx="auto" pb={10}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg" color={appFx.textColor}>Treinamento de Modelo</Heading>

        <Box bg={fx.cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={fx.cardBorder} boxShadow={fx.cardShadow}>
          <Heading size="md" mb={4} color={appFx.textColor}>Iniciar Treinamento</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
            <FormControl>
              <FormLabel color={appFx.textMuted} fontSize="sm">Modelo Base</FormLabel>
              <Select value={modelType} onChange={(e) => setModelType(e.target.value)} bg={appFx.navHoverBg} borderColor={fx.cardBorder} color={appFx.textColor}>
                <option value="yolov8n">YOLOv8 Nano</option>
                <option value="yolov8s">YOLOv8 Small</option>
                <option value="yolov8m">YOLOv8 Medium</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel color={appFx.textMuted} fontSize="sm">Épocas</FormLabel>
              <NumberInput value={epochs} min={1} max={1000} onChange={(_, v) => setEpochs(v)}>
                <NumberInputField bg={appFx.navHoverBg} borderColor={fx.cardBorder} color={appFx.textColor} />
                <NumberInputStepper>
                  <NumberIncrementStepper color={appFx.textColor} />
                  <NumberDecrementStepper color={appFx.textColor} />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <Button leftIcon={<Icon as={Play} />} colorScheme="orange" size="lg" isLoading={training} loadingText="Treinando..." onClick={handleTrain} mt="auto">
              Iniciar Treinamento
            </Button>
          </SimpleGrid>
        </Box>

        <Box bg={fx.cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={fx.cardBorder} boxShadow={fx.cardShadow}>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md" color={appFx.textColor}>Histórico de Modelos</Heading>
            <Button size="sm" variant="ghost" leftIcon={<Icon as={RefreshCw} />} onClick={load} isLoading={loading}>Atualizar</Button>
          </Flex>

          {loading && <Spinner />}

          {!loading && logs.length === 0 && (
            <Text color={appFx.textMuted} textAlign="center" py={8}>Nenhum treinamento realizado ainda</Text>
          )}

          <Accordion allowToggle>
            {logs.map((log) => (
              <AccordionItem key={log.id} border="1px solid" borderColor={fx.cardBorder} borderRadius="md" mb={2}>
                <h2>
                  <AccordionButton _expanded={{ bg: appFx.navHoverBg }}>
                    <HStack flex={1} spacing={4}>
                      {statusIcon(log.status)}
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" color={appFx.textColor}>{log.model_type}</Text>
                        <Text fontSize="xs" color={appFx.textMuted}>{new Date(log.created_at).toLocaleString("pt-BR")}</Text>
                      </VStack>
                      <Badge colorScheme={log.status === "completed" ? "green" : log.status === "running" ? "blue" : log.status === "failed" ? "red" : "gray"}>{log.status}</Badge>
                      {log.metrics?.mAP50 && <Badge colorScheme="orange">mAP: {log.metrics.mAP50.toFixed(3)}</Badge>}
                    </HStack>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} bg={appFx.navHoverBg}>
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={4}>
                    <Stat>
                      <StatLabel color={appFx.textMuted}>mAP@0.5</StatLabel>
                      <StatNumber color={appFx.textColor}>{log.metrics?.mAP50?.toFixed(4) || "-"}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel color={appFx.textMuted}>mAP@0.5:0.95</StatLabel>
                      <StatNumber color={appFx.textColor}>{log.metrics?.mAP50_95?.toFixed(4) || "-"}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel color={appFx.textMuted}>Precision</StatLabel>
                      <StatNumber color={appFx.textColor}>{log.metrics?.precision?.toFixed(4) || "-"}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel color={appFx.textMuted}>Recall</StatLabel>
                      <StatNumber color={appFx.textColor}>{log.metrics?.recall?.toFixed(4) || "-"}</StatNumber>
                    </Stat>
                  </SimpleGrid>

                  {log.metrics?.error && (
                    <Alert status="error" borderRadius="md" mb={3}>
                      <AlertIcon />{log.metrics.error}
                    </Alert>
                  )}

                  {log.status === "completed" && log.model_path && (
                    <Button size="sm" leftIcon={<Icon as={Zap} />} colorScheme="green" onClick={() => handleActivate(log.model_path!)}>
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
