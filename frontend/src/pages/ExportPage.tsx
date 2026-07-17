import { useState } from "react";
import {
  Box, VStack, HStack, Text, Button, Divider, Heading, useColorModeValue,
  Flex, Icon, Checkbox, CheckboxGroup, Select, Switch, SimpleGrid, Stat, StatLabel, StatNumber,
  useToast,
} from "@chakra-ui/react";
import { Download, FileJson, FileSpreadsheet, FileText, Archive, Shield, Database, BarChart3, GraduationCap, Bug, Swords, User, Settings } from "lucide-react";
import { useAppThemeFx } from "../styles/app-theme-fx";
import { useT } from "../hooks/useT";
import api from "../middleware/api";

const SECTIONS = [
  { key: "inferences", label: "inf.title", icon: BarChart3 },
  { key: "threats", label: "thr.title", icon: Shield },
  { key: "dataset", label: "ds.title", icon: Database },
  { key: "training", label: "tr.title", icon: GraduationCap },
  { key: "vulnerabilities", label: "vuln.title", icon: Bug },
  { key: "countermeasures", label: "cm.title", icon: Swords },
];

export default function ExportPage() {
  const themeFx = useAppThemeFx();
  const cardBg = useColorModeValue("#ffffff", "#1a1a1a");
  const cardBorder = useColorModeValue("rgba(230, 92, 0, 0.15)", "#333333");
  const { showToast } = useToast();
  const t = useT();

  const [selectedSections, setSelectedSections] = useState<string[]>(["inferences", "threats", "vulnerabilities"]);
  const [format, setFormat] = useState("json");
  const [includeProfile, setIncludeProfile] = useState(false);
  const [includeSettings, setIncludeSettings] = useState(false);
  const [zipOutput, setZipOutput] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (selectedSections.length === 0) {
      showToast({ title: t("geral.erro"), message: "Selecione ao menos uma seção para exportar", type: "warning", duration: 3000 });
      return;
    }
    setExporting(true);
    try {
      const res = await api.post("/export/export", {
        sections: selectedSections,
        include_profile: includeProfile,
        include_settings: includeSettings,
        format,
        zip: zipOutput,
      });
      const data = res.data;
      if (data.error) {
        showToast({ title: t("geral.erro"), message: data.error, type: "error", duration: 5000 });
        return;
      }
      const mimeTypes: Record<string, string> = {
        json: "application/json", csv: "text/csv", excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        pdf: "application/pdf",
      };
      const blob = new Blob(
        [typeof data.content === "string" ? data.content : new Uint8Array(data.content)],
        { type: mimeTypes[format] || "application/octet-stream" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
      showToast({ title: t("geral.sucesso"), message: `Arquivo ${data.filename} baixado`, type: "success", duration: 3000 });
    } catch (err: any) {
      showToast({ title: t("geral.erro"), message: err?.response?.data?.error || "Falha na exportação", type: "error", duration: 5000 });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box w="full" maxW="1800px" mx="auto" pb={10}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg" color={themeFx.textColor}>Exportação</Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Box bg={cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={cardBorder}>
            <Heading size="sm" color={themeFx.textColor} mb={4}>Seções para Exportar</Heading>
            <Divider mb={4} />
            <CheckboxGroup value={selectedSections} onChange={(v) => setSelectedSections(v as string[])}>
              <VStack align="stretch" spacing={3}>
                {SECTIONS.map((sec) => (
                  <Checkbox key={sec.key} value={sec.key} colorScheme="orange">
                    <HStack>
                      <Icon as={sec.icon} size={14} color={themeFx.brandColor} />
                      <Text fontSize="sm" color={themeFx.textColor}>{t(sec.label)}</Text>
                    </HStack>
                  </Checkbox>
                ))}
                <Divider />
                <Checkbox value="profile" isChecked={includeProfile} onChange={(e) => setIncludeProfile(e.target.checked)} colorScheme="orange">
                  <HStack><Icon as={User} size={14} color={themeFx.brandColor} /><Text fontSize="sm" color={themeFx.textColor}>{t("prof.info_pessoais")}</Text></HStack>
                </Checkbox>
                <Checkbox value="settings" isChecked={includeSettings} onChange={(e) => setIncludeSettings(e.target.checked)} colorScheme="orange">
                  <HStack><Icon as={Settings} size={14} color={themeFx.brandColor} /><Text fontSize="sm" color={themeFx.textColor}>{t("sett.title")}</Text></HStack>
                </Checkbox>
              </VStack>
            </CheckboxGroup>
          </Box>

          <Box bg={cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={cardBorder}>
            <Heading size="sm" color={themeFx.textColor} mb={4}>Formato e Opções</Heading>
            <Divider mb={4} />
            <VStack spacing={5} align="stretch">
              <Box>
                <Text fontSize="sm" color={themeFx.textMuted} mb={2} fontWeight="medium">Formato</Text>
                <Select value={format} onChange={(e) => setFormat(e.target.value)} bg={cardBg} borderColor={cardBorder} color={themeFx.textColor}>
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                  <option value="pdf">PDF (relatório completo com gráficos)</option>
                </Select>
              </Box>
              <HStack justify="space-between">
                <HStack>
                  <Icon as={Archive} color={themeFx.brandColor} />
                  <Text fontSize="sm" color={themeFx.textColor}>Compactar em ZIP</Text>
                </HStack>
                <Switch colorScheme="orange" isChecked={zipOutput} onChange={(e) => setZipOutput(e.target.checked)} />
              </HStack>
            </VStack>
          </Box>
        </SimpleGrid>

        <Flex justify="flex-end">
          <Button
            leftIcon={<Icon as={Download} />}
            colorScheme="orange"
            bg="brand"
            color="white"
            size="lg"
            onClick={handleExport}
            isLoading={exporting}
            loadingText="Exportando..."
            _hover={{ bg: "brandHover" }}
          >
            Exportar Dados
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}
