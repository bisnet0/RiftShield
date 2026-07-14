import { Box, Heading, Text, VStack, Button, Icon, Badge, HStack, SimpleGrid, Flex, Select, Progress, Stat, StatLabel, StatNumber, Image, Alert, AlertIcon, Tooltip, FormLabel, FormControl } from "@chakra-ui/react";
import { Database, Upload, RefreshCw, Trash2, BarChart3, Image as ImageIcon, HelpCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAppThemeFx } from "../styles/app-theme-fx";
import { useInferenceThemeFx } from "../styles/inference-theme-fx";
import { logSystemEvent } from "../utils/logger";
import { useToast } from "../components/Toast/components/ToastContext";
import { uploadEntry, listEntries, deleteEntry, getDatasetStats, type DatasetEntry, type DatasetStats } from "../services/dataset-service";

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
  const [split, setSplit] = useState("train");
  const fileRef = useRef<HTMLInputElement>(null);

  const SPLIT_LABELS: Record<string, string> = { train: "Treino", val: "Validação", test: "Teste" };
  const SPLIT_DESC: Record<string, string> = {
    train: "Imagens usadas para o treinamento do modelo YOLO",
    val: "Imagens usadas para validar a acurácia durante o treinamento",
    test: "Imagens usadas para testar o modelo após o treinamento",
  };

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await uploadEntry(file, "[]", split);
      logSystemEvent("upload", `Dataset enviado: ${file.name}`, "dataset");
      showToast({ title: "Sucesso", message: "Imagem adicionada ao dataset", type: "success" });
      setFile(null);
      setPreview(null);
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
              <StatLabel color={appFx.textMuted}>Treino</StatLabel>
              <StatNumber color="green.400">{stats.train_count}</StatNumber>
            </Stat>
            <Stat bg={fx.cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={fx.cardBorder}>
              <StatLabel color={appFx.textMuted}>Validação</StatLabel>
              <StatNumber color="blue.400">{stats.val_count}</StatNumber>
            </Stat>
            <Stat bg={fx.cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={fx.cardBorder}>
              <StatLabel color={appFx.textMuted}>Teste</StatLabel>
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
          <Heading size="md" mb={4} color={appFx.textColor}>Upload de Imagem</Heading>
          <VStack spacing={4}>
            <input type="file" accept="image/*" onChange={handleFileChange} ref={fileRef} style={{ display: "none" }} />
            <Box
              w="full" p={8} border="2px dashed" borderColor={fx.cardBorder} borderRadius="lg" textAlign="center" cursor="pointer"
              onClick={() => fileRef.current?.click()}
              _hover={{ borderColor: "orange.400" }}
            >
              <Icon as={ImageIcon} boxSize={10} color="orange.400" mb={2} />
              <Text color={appFx.textColor}>{file ? file.name : "Clique para selecionar uma imagem"}</Text>
            </Box>

            {preview && <Image src={preview} alt="Preview" maxH="200px" borderRadius="md" />}

            <HStack w="full">
              <FormControl>
                <FormLabel color={appFx.textMuted} fontSize="sm">
                  Split
                  <Tooltip label="Define como a imagem será usada no treinamento do YOLO" placement="top" hasArrow>
                    <Icon as={HelpCircle} boxSize={3} color={appFx.textMuted} ml={1} style={{ cursor: "help" }} />
                  </Tooltip>
                </FormLabel>
                <Select value={split} onChange={(e) => setSplit(e.target.value)} bg={appFx.navHoverBg} borderColor={fx.cardBorder} color={appFx.textColor}>
                  {Object.entries(SPLIT_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </Select>
                <Text fontSize="xs" color={appFx.textMuted} mt={1}>{SPLIT_DESC[split]}</Text>
              </FormControl>
              <Button leftIcon={<Icon as={Upload} />} colorScheme="orange" mt="auto" isLoading={uploading} isDisabled={!file} onClick={handleUpload}>
                Upload
              </Button>
            </HStack>
          </VStack>
        </Box>

        <Box bg={fx.cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={fx.cardBorder} boxShadow={fx.cardShadow}>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md" color={appFx.textColor}>Entradas ({entries.length})</Heading>
            <HStack>
              <Select size="sm" value={splitFilter} onChange={(e) => setSplitFilter(e.target.value)} bg={appFx.navHoverBg} borderColor={fx.cardBorder} color={appFx.textColor} w="140px">
                <option value="">Todos</option>
                {Object.entries(SPLIT_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
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
                      <Badge colorScheme={e.split === "train" ? "green" : e.split === "val" ? "blue" : "purple"}>{SPLIT_LABELS[e.split] || e.split}</Badge>
                      <Badge colorScheme={e.augmented ? "cyan" : "gray"}>{e.source}</Badge>
                    </HStack>
                    <Text fontSize="xs" color={appFx.textMuted}>{e.labels?.length || 0} label(s)</Text>
                  </VStack>
                  <Button size="xs" variant="ghost" colorScheme="red" onClick={() => handleDelete(e.id)}><Icon as={Trash2} boxSize={3} /></Button>
                </Flex>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </VStack>
    </Box>
  );
}
