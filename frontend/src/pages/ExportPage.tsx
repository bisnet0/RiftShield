import { useState } from "react";
import {
  Box, VStack, HStack, Text, Button, Divider, Heading, useColorModeValue,
  Flex, Icon, Checkbox, CheckboxGroup, Select, Switch, SimpleGrid, Stat, StatLabel, StatNumber,
} from "@chakra-ui/react";
import { Download, FileJson, FileSpreadsheet, FileText, Archive, Shield, Database, BarChart3, GraduationCap, Bug, Swords, User, Settings } from "lucide-react";
import { useAppThemeFx } from "../styles/app-theme-fx";
import { useT } from "../hooks/useT";
import { useApiTranslator } from "../hooks/useApiTranslator";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../components/Toast/components/ToastContext";
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
  const at = useApiTranslator();
  const { lang } = useLanguage();

  const [selectedSections, setSelectedSections] = useState<string[]>(["inferences", "threats", "dataset", "training", "vulnerabilities", "countermeasures"]);
  const [format, setFormat] = useState("json");
  const [includeProfile, setIncludeProfile] = useState(false);
  const [includeSettings, setIncludeSettings] = useState(false);
  const [zipOutput, setZipOutput] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (selectedSections.length === 0) {
      showToast({ title: t("geral.erro"), message: t("exp.select_section"), type: "warning", duration: 3000 });
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
        lang,
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
      showToast({ title: t("geral.sucesso"), message: t("exp.downloaded", { filename: data.filename }), type: "success", duration: 3000 });
    } catch (err: any) {
      showToast({ title: t("geral.erro"), message: err?.response?.data?.error || t("exp.failed"), type: "error", duration: 5000 });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box w="full" maxW="1800px" mx="auto" pb={10}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg" color={themeFx.textColor}>{t("exp.title")}</Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Box bg={cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={cardBorder}>
            <Heading size="sm" color={themeFx.textColor} mb={4}>{t("exp.sections")}</Heading>
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
            <Heading size="sm" color={themeFx.textColor} mb={4}>{t("exp.format_opts")}</Heading>
            <Divider mb={4} />
            <VStack spacing={5} align="stretch">
              <Box>
                <Text fontSize="sm" color={themeFx.textMuted} mb={2} fontWeight="medium">{t("exp.format")}</Text>
                <Select value={format} onChange={(e) => setFormat(e.target.value)} bg={cardBg} borderColor={cardBorder} color={themeFx.textColor}>
                  <option value="json">{t("exp.fmt_json")}</option>
                  <option value="csv">{t("exp.fmt_csv")}</option>
                  <option value="excel">{t("exp.fmt_excel")}</option>
                  <option value="pdf">{t("exp.fmt_pdf")}</option>
                </Select>
              </Box>
              <HStack justify="space-between">
                <HStack>
                  <Icon as={Archive} color={themeFx.brandColor} />
                  <Text fontSize="sm" color={themeFx.textColor}>{t("exp.zip_label")}</Text>
                </HStack>
                <Switch colorScheme="orange" isChecked={zipOutput} onChange={(e) => setZipOutput(e.target.checked)} sx={{
                  ".chakra-switch__track[data-checked]": { bg: "brand !important" },
                  ".chakra-switch__thumb[data-checked]": { bg: "white !important" },
                }} />
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
            loadingText={t("exp.loading")}
            _hover={{ bg: "brandHover" }}
          >
            {t("exp.btn")}
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}
