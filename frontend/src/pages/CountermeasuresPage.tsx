import { Box, Heading, Text, VStack, Button, Icon, Badge, HStack, SimpleGrid, Flex, Select, Spinner, Tag, TagLabel, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Link, Divider } from "@chakra-ui/react";
import { ShieldCheck, RefreshCw, ExternalLink, ArrowUpRight, Shield, Lock, Key, Eye, Globe, Server, HardDrive } from "lucide-react";
import { useState, useEffect } from "react";
import { useAppThemeFx } from "../styles/app-theme-fx";
import { useInferenceThemeFx } from "../styles/inference-theme-fx";
import { listCountermeasures, type KBCountermeasure } from "../services/kb-service";
import { useT } from "../hooks/useT";

const PRIORITY_COLORS: Record<string, string> = {
  critical: "red",
  high: "orange",
  medium: "yellow",
  low: "green",
};

export default function CountermeasuresPage() {
  const fx = useInferenceThemeFx();
  const appFx = useAppThemeFx();
  const [items, setItems] = useState<KBCountermeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [cweFilter, setCweFilter] = useState("");
  const t = useT();

  const load = async () => {
    setLoading(true);
    try {
      const res = await listCountermeasures(cweFilter, 0, 100);
      setItems(res.items);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [cweFilter]);

  return (
    <Box w="full" maxW="1800px" mx="auto" pb={10}>
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Heading size="lg" color={appFx.textColor}>{t("cm.title")}</Heading>
          <HStack>
            <Select placeholder={t("cm.filtrar_cwe")} value={cweFilter} onChange={(e) => setCweFilter(e.target.value)} w="200px" bg={appFx.navHoverBg} borderColor={fx.cardBorder} color={appFx.textColor}>
              <option value="CWE-287">{t("cm.cwe_287")}</option>
              <option value="CWE-89">{t("cm.cwe_89")}</option>
              <option value="CWE-79">{t("cm.cwe_79")}</option>
              <option value="CWE-400">{t("cm.cwe_400")}</option>
              <option value="CWE-200">{t("cm.cwe_200")}</option>
              <option value="CWE-269">{t("cm.cwe_269")}</option>
              <option value="CWE-798">{t("cm.cwe_798")}</option>
              <option value="CWE-918">{t("cm.cwe_918")}</option>
              <option value="CWE-22">{t("cm.cwe_22")}</option>
              <option value="CWE-502">{t("cm.cwe_502")}</option>
            </Select>
            <Button size="sm" variant="ghost" leftIcon={<Icon as={RefreshCw} />} onClick={load} isLoading={loading}>{t("geral.atualizar")}</Button>
          </HStack>
        </Flex>

        {loading && <Spinner />}

        {!loading && items.length === 0 && (
          <Box textAlign="center" py={16}>
            <Icon as={ShieldCheck} boxSize={16} color={appFx.textMuted} mb={4} />
            <Text color={appFx.textMuted}>{t("cm.sem_resultados")}</Text>
          </Box>
        )}

        <Accordion allowToggle>
          {items.map((cm) => (
            <AccordionItem key={cm.id} border="1px solid" borderColor={fx.cardBorder} borderRadius="xl" mb={3} bg={fx.cardBg}>
              <h2>
                <AccordionButton _expanded={{ bg: appFx.navHoverBg }} py={4}>
                  <HStack flex={1} spacing={4}>
                    <Icon as={ShieldCheck} color={PRIORITY_COLORS[cm.priority] === "red" ? "red.400" : PRIORITY_COLORS[cm.priority] === "orange" ? "orange.400" : "green.400"} boxSize={5} />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" color={appFx.textColor} textAlign="left">{cm.title}</Text>
                      <Text fontSize="xs" color={appFx.textMuted} textAlign="left">{cm.description.substring(0, 80)}...</Text>
                    </VStack>
                    <Badge colorScheme={PRIORITY_COLORS[cm.priority] || "gray"} fontSize="sm" px={3}>
                      {cm.priority}
                    </Badge>
                  </HStack>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={6} bg={appFx.navHoverBg}>
                <Text color={appFx.textColor} mb={4}>{cm.description}</Text>

                {cm.implementation_guide && (
                  <Box mb={4} p={4} bg={fx.cardBg} borderRadius="md" border="1px solid" borderColor={fx.cardBorder}>
                    <Text fontWeight="bold" color={appFx.textColor} mb={2}>{t("cm.guia_implementacao")}</Text>
                    <Text color={appFx.textColor} fontSize="sm">{cm.implementation_guide}</Text>
                  </Box>
                )}

                <HStack wrap="wrap" mb={3}>
                  {cm.vulnerability_cwe_ids.map((cwe) => (
                    <Tag key={cwe} size="sm" colorScheme="purple" variant="subtle">
                      <TagLabel>{cwe}</TagLabel>
                    </Tag>
                  ))}
                </HStack>

                {cm.references.length > 0 && (
                  <>
                    <Text fontWeight="bold" color={appFx.textColor} mb={2} fontSize="sm">{t("cm.referencias")}</Text>
                    <VStack align="start" spacing={1}>
                      {cm.references.map((ref, i) => (
                        <Link key={i} href={ref} isExternal fontSize="sm" color="orange.400">
                          <HStack>
                            <Icon as={ExternalLink} boxSize={3} />
                            <Text>{ref.length > 60 ? ref.substring(0, 60) + "..." : ref}</Text>
                          </HStack>
                        </Link>
                      ))}
                    </VStack>
                  </>
                )}
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </VStack>
    </Box>
  );
}
