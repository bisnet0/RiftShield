import { Box, Heading, Text, VStack, Button, Icon, Badge, HStack, SimpleGrid, Flex, Select, Tabs, TabList, TabPanels, Tab, TabPanel, Progress, Stat, StatLabel, StatNumber, StatHelpText, Image, Alert, AlertIcon, useDisclosure, Collapse, Input, FormLabel, FormControl, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from "@chakra-ui/react";
import { Database, Upload, RefreshCw, Trash2, Copy, Plus, BarChart3, Image as ImageIcon, Layers, FlipHorizontal, FlipVertical } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useAppThemeFx } from "../styles/app-theme-fx";
import { useInferenceThemeFx } from "../styles/inference-theme-fx";
import { logSystemEvent } from "../utils/logger";

import { useToast } from "../components/Toast/components/ToastContext";
import { uploadEntry, listEntries, deleteEntry, augmentEntry, getDatasetStats, type DatasetEntry, type DatasetStats } from "../services/dataset-service";

export default function DatasetPage() {
  const fx = useInferenceThemeFx();
  const appFx = useAppThemeFx();
  const { showToast } = useToast();
  const [entries, setEntries] = useState<DatasetEntry[]>([]);
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [splitFilter, setSplitFilter] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [labelsJson, setLabelsJson] = useState("[]");
  const [split, setSplit] = useState("train");

  const onDrop = (accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "image/*": [".png", ".jpg", ".jpeg"] }, maxFiles: 1 });

  const loadData = async () => {
    setLoading(true);
    try {
      const [eRes, sRes] = await Promise.all([
        listEntries(splitFilter, "", 0, 100),
        getDatasetStats(),
      ]);
      setEntries(eRes.items);
      setStats(sRes);
    } catch { showToast({ title: "Erro", message: "Falha ao carregar dataset", type: "error" }); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [splitFilter]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await uploadEntry(file, labelsJson, split);
      logSystemEvent("upload", `Dataset enviado: ${file.name}`, "dataset");
      showToast({ title: "Sucesso", message: "Entrada adicionada ao dataset", type: "success" });
      setFile(null);
      setPreview(null);
      setLabelsJson("[]");
      loadData();
    } catch (err: any) {
      showToast({ title: "Erro", message: err?.response?.data?.error || "Falha no upload", type: "error" });
    } finally { setUploading(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEntry(id);
      showToast({ title: "Removido", message: "Entrada excluída", type: "info" });
      loadData();
    } catch { showToast({ title: "Erro", message: "Falha ao excluir", type: "error" }); }
  };

  const handleAugment = async (id: string) => {
    try {
      const res = await augmentEntry(id);
      showToast({ title: "Aumentado", message: `${res.total} variações geradas`, type: "success" });
      loadData();
    } catch { showToast({ title: "Erro", message: "Falha ao aumentar", type: "error" }); }
  };

  return (
    <Box w="full" maxW="1800px" mx="auto" pb={10}>
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Heading size="lg" color={appFx.textColor}>Dataset</Heading>
          <Button size="sm" variant="ghost" leftIcon={<Icon as={RefreshCw} />} onClick={loadData} isLoading={loading}>Atualizar</Button>
        </Flex>

        {stats && (
          <SimpleGrid columns={{ base: 2, md: 4, lg: 7 }} spacing={3}>
            <Stat bg={fx.cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={fx.cardBorder}>
              <StatLabel color={appFx.textMuted}>Total</StatLabel>
              <StatNumber color={appFx.textColor}>{stats.total}</StatNumber>
            </Stat>
            <Stat bg={fx.cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={fx.cardBorder}>
              <StatLabel color={appFx.textMuted}>Train</StatLabel>
              <StatNumber color="green.400">{stats.train_count}</StatNumber>
            </Stat>
            <Stat bg={fx.cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={fx.cardBorder}>
              <StatLabel color={appFx.textMuted}>Val</StatLabel>
              <StatNumber color="blue.400">{stats.val_count}</StatNumber>
            </Stat>
            <Stat bg={fx.cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={fx.cardBorder}>
              <StatLabel color={appFx.textMuted}>Test</StatLabel>
              <StatNumber color="purple.400">{stats.test_count}</StatNumber>
            </Stat>
            <Stat bg={fx.cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={fx.cardBorder}>
              <StatLabel color={appFx.textMuted}>Manual</StatLabel>
              <StatNumber color="orange.400">{stats.manual_count}</StatNumber>
            </Stat>
            <Stat bg={fx.cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={fx.cardBorder}>
              <StatLabel color={appFx.textMuted}>Aumentado</StatLabel>
              <StatNumber color="cyan.400">{stats.augmented_count}</StatNumber>
            </Stat>
          </SimpleGrid>
        )}

        <Box bg={fx.cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={fx.cardBorder} boxShadow={fx.cardShadow}>
          <Heading size="md" mb={4} color={appFx.textColor}>Upload de Imagem Rotulada</Heading>
          <VStack spacing={4}>
            <Box {...getRootProps()} w="full" p={8} border="2px dashed" borderColor={isDragActive ? "orange.400" : fx.cardBorder} borderRadius="lg" textAlign="center" cursor="pointer">
              <input {...getInputProps()} />
              <Icon as={ImageIcon} boxSize={10} color="orange.400" mb={2} />
              <Text color={appFx.textColor}>{isDragActive ? "Solte aqui" : "Arraste a imagem do diagrama"}</Text>
            </Box>

            {preview && <Image src={preview} alt="Preview" maxH="200px" borderRadius="md" />}

            <FormControl>
              <FormLabel color={appFx.textMuted} fontSize="sm">Labels (JSON: [{"{class_id, x_center, y_center, width, height}"}])</FormLabel>
              <Input value={labelsJson} onChange={(e) => setLabelsJson(e.target.value)} fontFamily="mono" fontSize="sm" bg={appFx.navHoverBg} borderColor={fx.cardBorder} color={appFx.textColor} />
            </FormControl>

            <HStack w="full">
              <FormControl>
                <FormLabel color={appFx.textMuted} fontSize="sm">Split</FormLabel>
                <Select value={split} onChange={(e) => setSplit(e.target.value)} bg={appFx.navHoverBg} borderColor={fx.cardBorder} color={appFx.textColor}>
                  <option value="train">Train</option>
                  <option value="val">Val</option>
                  <option value="test">Test</option>
                </Select>
              </FormControl>
              <Button leftIcon={<Icon as={Upload} />} colorScheme="orange" mt="auto" isLoading={uploading} isDisabled={!file} onClick={handleUpload}>Upload</Button>
            </HStack>
          </VStack>
        </Box>

        <Box bg={fx.cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={fx.cardBorder} boxShadow={fx.cardShadow}>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md" color={appFx.textColor}>Entradas ({entries.length})</Heading>
            <HStack>
              <Select size="sm" value={splitFilter} onChange={(e) => setSplitFilter(e.target.value)} bg={appFx.navHoverBg} borderColor={fx.cardBorder} color={appFx.textColor} w="120px">
                <option value="">Todos</option>
                <option value="train">Train</option>
                <option value="val">Val</option>
                <option value="test">Test</option>
              </Select>
            </HStack>
          </Flex>

          {entries.length === 0 && <Text color={appFx.textMuted} textAlign="center" py={8}>Nenhuma entrada no dataset</Text>}

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
            {entries.map((e) => (
              <Box key={e.id} p={4} bg={appFx.navHoverBg} borderRadius="md">
                <Flex justify="space-between" align="start">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" color={appFx.textColor} fontSize="sm">{e.filename}</Text>
                    <HStack>
                      <Badge colorScheme={e.split === "train" ? "green" : e.split === "val" ? "blue" : "purple"}>{e.split}</Badge>
                      <Badge colorScheme={e.augmented ? "cyan" : "gray"}>{e.source}</Badge>
                    </HStack>
                    <Text fontSize="xs" color={appFx.textMuted}>{e.labels.length} label(s)</Text>
                  </VStack>
                  <HStack>
                    {!e.augmented && (
                      <Button size="xs" variant="ghost" onClick={() => handleAugment(e.id)} title="Aumentar">
                        <Icon as={FlipHorizontal} boxSize={3} />
                      </Button>
                    )}
                    <Button size="xs" variant="ghost" colorScheme="red" onClick={() => handleDelete(e.id)}><Icon as={Trash2} boxSize={3} /></Button>
                  </HStack>
                </Flex>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </VStack>
    </Box>
  );
}
