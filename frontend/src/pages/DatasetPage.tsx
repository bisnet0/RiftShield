import { Box, Heading, Text, VStack, Button, Icon, Badge, HStack, SimpleGrid, Flex, Select, Progress, Stat, StatLabel, StatNumber, Image, Alert, AlertIcon, Tooltip, FormLabel, FormControl } from "@chakra-ui/react";
import { Database, Upload, RefreshCw, Trash2, BarChart3, Image as ImageIcon, HelpCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAppThemeFx } from "../styles/app-theme-fx";
import { useInferenceThemeFx } from "../styles/inference-theme-fx";
import { logSystemEvent } from "../utils/logger";
import { useToast } from "../components/Toast/components/ToastContext";
import { uploadEntry, listEntries, deleteEntry, getDatasetStats, type DatasetEntry, type DatasetStats } from "../services/dataset-service";
import { useT } from "../hooks/useT";

export default function DatasetPage() {
  const fx = useInferenceThemeFx();
  const appFx = useAppThemeFx();
  const { showToast } = useToast();
  const t = useT();
  const [entries, setEntries] = useState<DatasetEntry[]>([]);
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [splitFilter, setSplitFilter] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [split, setSplit] = useState("train");
  const fileRef = useRef<HTMLInputElement>(null);

  const SPLIT_LABELS: Record<string, string> = { train: t("ds.treino"), val: t("ds.validacao"), test: t("ds.teste") };
  const SPLIT_DESC: Record<string, string> = {
    train: t("ds.split_desc_train"),
    val: t("ds.split_desc_val"),
    test: t("ds.split_desc_test"),
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
    } catch { showToast({ title: t("geral.erro"), message: t("ds.erro_carregar"), type: "error" }); } finally { setLoading(false); }
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
      showToast({ title: t("geral.sucesso"), message: t("ds.imagem_adicionada"), type: "success" });
      setFile(null);
      setPreview(null);
      loadData();
    } catch (err: any) {
      showToast({ title: t("geral.erro"), message: err?.response?.data?.error || t("ds.falha_upload"), type: "error" });
    } finally { setUploading(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEntry(id);
      showToast({ title: t("geral.atencao"), message: t("ds.entrada_excluida"), type: "info" });
      loadData();
    } catch { showToast({ title: t("geral.erro"), message: t("ds.falha_excluir"), type: "error" }); }
  };

  return (
    <Box w="full" maxW="1800px" mx="auto" pb={10}>
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Heading size="lg" color={appFx.textColor}>{t("ds.title")}</Heading>
          <Button size="sm" variant="ghost" leftIcon={<Icon as={RefreshCw} />} onClick={loadData} isLoading={loading}>{t("geral.atualizar")}</Button>
        </Flex>

        {stats && (
          <SimpleGrid columns={{ base: 2, md: 4, lg: 7 }} spacing={3}>
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
              <StatLabel color={appFx.textMuted}>{t("ds.teste")}</StatLabel>
              <StatNumber color="purple.400">{stats.test_count}</StatNumber>
            </Stat>
            <Stat bg={fx.cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={fx.cardBorder}>
              <StatLabel color={appFx.textMuted}>{t("ds.manual")}</StatLabel>
              <StatNumber color="orange.400">{stats.manual_count}</StatNumber>
            </Stat>
            <Stat bg={fx.cardBg} p={4} borderRadius="lg" border="1px solid" borderColor={fx.cardBorder}>
              <StatLabel color={appFx.textMuted}>{t("ds.aumentado")}</StatLabel>
              <StatNumber color="cyan.400">{stats.augmented_count}</StatNumber>
            </Stat>
          </SimpleGrid>
        )}

        <Box bg={fx.cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={fx.cardBorder} boxShadow={fx.cardShadow}>
          <Heading size="md" mb={4} color={appFx.textColor}>{t("ds.upload")}</Heading>
          <VStack spacing={4}>
            <input type="file" accept="image/*" onChange={handleFileChange} ref={fileRef} style={{ display: "none" }} />
            <Box
              w="full" p={8} border="2px dashed" borderColor={fx.cardBorder} borderRadius="lg" textAlign="center" cursor="pointer"
              onClick={() => fileRef.current?.click()}
              _hover={{ borderColor: "orange.400" }}
            >
              <Icon as={ImageIcon} boxSize={10} color="orange.400" mb={2} />
              <Text color={appFx.textColor}>{file ? file.name : t("ds.clique_selecionar")}</Text>
            </Box>

            {preview && <Image src={preview} alt="Preview" maxH="200px" borderRadius="md" />}

            <HStack w="full" spacing={4}>
              <FormControl>
                <FormLabel color={appFx.textMuted} fontSize="sm">
                  {t("ds.split")}
                  <Tooltip label={t("ds.split_desc")} placement="top" hasArrow>
                    <Icon as={HelpCircle} boxSize={3} color={appFx.textMuted} ml={1} style={{ cursor: "help" }} />
                  </Tooltip>
                </FormLabel>
                <Select value={split} onChange={(e) => setSplit(e.target.value)} bg={appFx.navHoverBg} borderColor={fx.cardBorder} color={appFx.textColor}>
                  {Object.entries(SPLIT_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </Select>
              </FormControl>
              <Button leftIcon={<Icon as={Upload} />} colorScheme="orange" isLoading={uploading} isDisabled={!file} onClick={handleUpload} mt="auto" alignSelf="flex-end">
                {t("ds.upload_btn")}
              </Button>
            </HStack>
            {file && <Text fontSize="xs" color={appFx.textMuted}>{file.name} — {((file.size / 1024).toFixed(1))} KB</Text>}
          </VStack>
        </Box>

        <Box bg={fx.cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={fx.cardBorder} boxShadow={fx.cardShadow}>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md" color={appFx.textColor}>{t("ds.entradas")} ({entries.length})</Heading>
            <HStack>
              <Select size="sm" value={splitFilter} onChange={(e) => setSplitFilter(e.target.value)} bg={appFx.navHoverBg} borderColor={fx.cardBorder} color={appFx.textColor} w="140px">
                <option value="">{t("ds.todos")}</option>
                {Object.entries(SPLIT_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Select>
            </HStack>
          </Flex>

          {entries.length === 0 && <Text color={appFx.textMuted} textAlign="center" py={8}>{t("ds.sem_entradas")}</Text>}

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
