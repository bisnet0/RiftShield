import { useState, useEffect } from "react";
import {
  Text, VStack, HStack, Switch, Box, Divider, Heading, useColorModeValue,
  Input, Button, Select, FormControl, FormLabel, Icon, Spinner,
} from "@chakra-ui/react";
import { useToast } from "../components/Toast/components/ToastContext";
import { Check, AlertTriangle } from "lucide-react";
import { useAppThemeFx } from "../styles/app-theme-fx";
import api from "../middleware/api";
import { useT } from "../hooks/useT";

interface HermesConfig {
  enabled: boolean;
  provider: string;
  google_api_key: string;
  openai_api_key: string;
  deepseek_api_key: string;
  google_model: string;
  openai_model: string;
  deepseek_model: string;
  diag_fallback: string;
}

export default function Settings() {
  const themeFx = useAppThemeFx();
  const cardBg = useColorModeValue("#ffffff", "#1a1a1a");
  const cardBorder = useColorModeValue("rgba(230, 92, 0, 0.15)", "#333333");
  const { showToast } = useToast();
  const t = useT();

  const [config, setConfig] = useState<HermesConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hermesEnabled, setHermesEnabled] = useState(true);
  const [diagFallback, setDiagFallback] = useState("yolo");

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await api.get("/hermes/config");
      setConfig(res.data);
      setHermesEnabled(res.data.enabled);
      setDiagFallback(res.data.diag_fallback || "yolo");
    } catch {
      setConfig({
        enabled: true, provider: "google",
        google_api_key: "", openai_api_key: "", deepseek_api_key: "",
        google_model: "gemini-2.5-flash-lite",
        openai_model: "gpt-4o-mini",
        deepseek_model: "deepseek-chat",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await api.put("/hermes/config", { ...config, enabled: hermesEnabled, diag_fallback: diagFallback });
      showToast({ title: t("sett.config_salvas"), type: "success", duration: 3000 });
    } catch {
      showToast({ title: t("prof.erro_salvar"), type: "error", duration: 3000 });
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof HermesConfig, value: any) => {
    setConfig((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  if (loading) return <Spinner />;

  const hasAnyKey = config?.google_api_key || config?.openai_api_key || config?.deepseek_api_key;

  return (
    <VStack spacing={8} align="stretch" w="full" maxW="800px" mx="auto" pb={10}>
      <Heading size="lg" color={themeFx.textColor}>{t("sett.title")}</Heading>

      <Box p={6} bg={cardBg} borderRadius="xl" border="1px solid" borderColor={cardBorder}>
        <Heading size="sm" color={themeFx.textColor} mb={4}>{t("sett.hermes")}</Heading>
        <Divider mb={4} />

        <HStack justify="space-between" w="full" mb={6}>
          <Box>
            <Text fontWeight="medium" color={themeFx.textColor}>{t("sett.habilitar")}</Text>
            <Text fontSize="sm" color={themeFx.textMuted}>
              {t("sett.hermes_desc")}
            </Text>
          </Box>
          <Switch
            colorScheme="orange"
            size="lg"
            isChecked={hermesEnabled}
            onChange={(e) => setHermesEnabled(e.target.checked)}
          />
        </HStack>

        <FormControl mb={4}>
          <FormLabel color={themeFx.textColor}>{t("sett.fallback")}</FormLabel>
          <Select
            value={diagFallback}
            onChange={(e) => setDiagFallback(e.target.value)}
            bg={cardBg}
            borderColor={cardBorder}
            color={themeFx.textColor}
          >
            <option value="yolo">{t("sett.fallback_yolo")}</option>
            <option value="hermes">{t("sett.fallback_hermes")}</option>
          </Select>
          <Text fontSize="xs" color={themeFx.textMuted} mt={1}>
            {t("sett.fallback_desc")}
          </Text>
        </FormControl>

        <Divider mb={4} />

        <FormControl mb={4}>
          <FormLabel color={themeFx.textColor}>{t("sett.provedor")}</FormLabel>
          <Select
            value={config?.provider || "google"}
            onChange={(e) => update("provider", e.target.value)}
            bg={cardBg}
            borderColor={cardBorder}
            color={themeFx.textColor}
          >
            <option value="google">{t("sett.provedor_google")}</option>
            <option value="openai">{t("sett.provedor_openai")}</option>
            <option value="deepseek">{t("sett.provedor_deepseek")}</option>
          </Select>
        </FormControl>

        {config?.provider === "google" && (
          <>
            <FormControl mb={4}>
              <FormLabel color={themeFx.textColor}>{t("sett.api_key_google")}</FormLabel>
              <Input
                type="password"
                placeholder="AIza..."
                value={config?.google_api_key || ""}
                onChange={(e) => update("google_api_key", e.target.value)}
                bg={cardBg} borderColor={cardBorder} color={themeFx.textColor}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel color={themeFx.textColor}>{t("sett.modelo")}</FormLabel>
              <Select
                value={config?.google_model || "gemini-2.5-flash-lite"}
                onChange={(e) => update("google_model", e.target.value)}
                bg={cardBg} borderColor={cardBorder} color={themeFx.textColor}
              >
                <option value="gemini-2.5-flash-lite">{t("sett.modelo_gemini_flash_lite")}</option>
                <option value="gemini-2.5-flash">{t("sett.modelo_gemini_flash")}</option>
                <option value="gemini-2.5-pro">{t("sett.modelo_gemini_pro")}</option>
              </Select>
            </FormControl>
          </>
        )}

        {config?.provider === "openai" && (
          <>
            <FormControl mb={4}>
              <FormLabel color={themeFx.textColor}>{t("sett.api_key_openai")}</FormLabel>
              <Input
                type="password"
                placeholder="sk-..."
                value={config?.openai_api_key || ""}
                onChange={(e) => update("openai_api_key", e.target.value)}
                bg={cardBg} borderColor={cardBorder} color={themeFx.textColor}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel color={themeFx.textColor}>{t("sett.modelo")}</FormLabel>
              <Select
                value={config?.openai_model || "gpt-4o-mini"}
                onChange={(e) => update("openai_model", e.target.value)}
                bg={cardBg} borderColor={cardBorder} color={themeFx.textColor}
              >
                <option value="gpt-4o-mini">{t("sett.modelo_gpt4o_mini")}</option>
                <option value="gpt-4o">{t("sett.modelo_gpt4o")}</option>
                <option value="gpt-4-turbo">{t("sett.modelo_gpt4_turbo")}</option>
              </Select>
            </FormControl>
          </>
        )}

        {config?.provider === "deepseek" && (
          <>
            <FormControl mb={4}>
              <FormLabel color={themeFx.textColor}>{t("sett.api_key_deepseek")}</FormLabel>
              <Input
                type="password"
                placeholder="sk-..."
                value={config?.deepseek_api_key || ""}
                onChange={(e) => update("deepseek_api_key", e.target.value)}
                bg={cardBg} borderColor={cardBorder} color={themeFx.textColor}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel color={themeFx.textColor}>{t("sett.modelo")}</FormLabel>
              <Select
                value={config?.deepseek_model || "deepseek-chat"}
                onChange={(e) => update("deepseek_model", e.target.value)}
                bg={cardBg} borderColor={cardBorder} color={themeFx.textColor}
              >
                <option value="deepseek-chat">{t("sett.modelo_deepseek_chat")}</option>
                <option value="deepseek-reasoner">{t("sett.modelo_deepseek_reasoner")}</option>
              </Select>
            </FormControl>
          </>
        )}

        <Button
          leftIcon={saving ? undefined : <Icon as={Check} />}
          colorScheme="orange"
          bg="brand"
          color="white"
          onClick={handleSave}
          isLoading={saving}
          loadingText={t("geral.carregando")}
          _hover={{ bg: "brandHover" }}
          mt={2}
        >
          {t("sett.salvar")}
        </Button>

        {!hasAnyKey && (
          <HStack mt={4} p={3} bg="orange.50" borderRadius="md" border="1px solid" borderColor="orange.200">
            <Icon as={AlertTriangle} color="orange.500" />
            <Text fontSize="sm" color="orange.700">
              {t("sett.sem_chave_api")}
            </Text>
          </HStack>
        )}
      </Box>

      <Box p={6} bg={cardBg} borderRadius="xl" border="1px solid" borderColor={cardBorder}>
        <Heading size="sm" color={themeFx.textColor} mb={4}>{t("sett.sistema")}</Heading>
        <Divider mb={4} />
        <Text fontSize="sm" color={themeFx.textMuted}>
          RiftShield v1.0.0 — Hackathon FIAP Software Security 2026
        </Text>
      </Box>
    </VStack>
  );
}
