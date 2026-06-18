import { Box, Heading, Text, VStack, Button, Icon, Badge, HStack, SimpleGrid, Flex, Input, InputGroup, InputLeftElement, Select, Spinner, Tag, TagLabel, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Divider, Link } from "@chakra-ui/react";
import { Bug, Search, RefreshCw, ExternalLink, AlertTriangle, Info, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useAppThemeFx } from "../styles/app-theme-fx";
import { useInferenceThemeFx } from "../styles/inference-theme-fx";
import { listVulnerabilities, type KBVulnerability } from "../services/kb-service";

const STRIDE_COLORS: Record<string, string> = {
  authentication: "red",
  injection: "purple",
  xss: "pink",
  dos: "orange",
  "information-disclosure": "yellow",
  "privilege-escalation": "red",
  "access-control": "orange",
  credentials: "red",
  authorization: "orange",
  deserialization: "purple",
  "path-traversal": "cyan",
  ssrf: "blue",
  permissions: "teal",
  misconfiguration: "gray",
  "server-side": "blue",
  "file-access": "cyan",
  resource: "yellow",
  privacy: "green",
  rce: "red",
  database: "blue",
};

export default function VulnerabilitiesPage() {
  const fx = useInferenceThemeFx();
  const appFx = useAppThemeFx();
  const [vulns, setVulns] = useState<KBVulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [componentFilter, setComponentFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await listVulnerabilities({ search: search || undefined, component: componentFilter || undefined, limit: 100 });
      setVulns(res.items);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [componentFilter]);

  const handleSearch = () => load();

  const cvssColor = (score: number | null) => {
    if (!score) return "gray";
    if (score >= 9) return "red";
    if (score >= 7) return "orange";
    if (score >= 4) return "yellow";
    return "green";
  };

  return (
    <Box w="full" maxW="1800px" mx="auto" pb={10}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg" color={appFx.textColor}>Base de Vulnerabilidades</Heading>

        <HStack spacing={4} wrap="wrap">
          <InputGroup maxW="400px">
            <InputLeftElement><Icon as={Search} color={appFx.textMuted} /></InputLeftElement>
            <Input placeholder="Buscar vulnerabilidade..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} bg={appFx.navHoverBg} borderColor={fx.cardBorder} color={appFx.textColor} _placeholder={{ color: appFx.textMuted }} />
          </InputGroup>
          <Select placeholder="Filtrar por componente" value={componentFilter} onChange={(e) => setComponentFilter(e.target.value)} w="200px" bg={appFx.navHoverBg} borderColor={fx.cardBorder} color={appFx.textColor}>
            <option value="api">API</option>
            <option value="server">Server</option>
            <option value="database">Database</option>
            <option value="user">User</option>
            <option value="gateway">Gateway</option>
            <option value="microservice">Microservice</option>
            <option value="container">Container</option>
            <option value="storage">Storage</option>
            <option value="load_balancer">Load Balancer</option>
            <option value="message_queue">Message Queue</option>
            <option value="identity_provider">Identity Provider</option>
          </Select>
          <Button size="sm" variant="ghost" leftIcon={<Icon as={RefreshCw} />} onClick={load}>Atualizar</Button>
        </HStack>

        {loading && <Spinner />}

        {!loading && vulns.length === 0 && (
          <Box textAlign="center" py={16}>
            <Icon as={Bug} boxSize={16} color={appFx.textMuted} mb={4} />
            <Text color={appFx.textMuted}>Nenhuma vulnerabilidade encontrada</Text>
          </Box>
        )}

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {vulns.map((v) => (
            <Box key={v.id} p={5} bg={fx.cardBg} borderRadius="xl" border="1px solid" borderColor={fx.cardBorder} boxShadow={fx.cardShadow}>
              <Flex justify="space-between" align="start" mb={2}>
                <VStack align="start" spacing={1} flex={1}>
                  <Text fontWeight="bold" color={appFx.textColor} fontSize="sm">{v.title}</Text>
                  {v.cve_id && <Badge colorScheme="purple" fontSize="xs">{v.cve_id}</Badge>}
                </VStack>
                {v.cvss_score && (
                  <Badge fontSize="lg" px={3} py={1} colorScheme={cvssColor(v.cvss_score)}>
                    {v.cvss_score.toFixed(1)}
                  </Badge>
                )}
              </Flex>

              <Text fontSize="sm" color={appFx.textColor} mb={3} noOfLines={3}>{v.description}</Text>

              <HStack wrap="wrap" mb={2}>
                {v.affected_components.map((c) => (
                  <Tag key={c} size="sm" variant="subtle" colorScheme="orange">
                    <TagLabel>{c}</TagLabel>
                  </Tag>
                ))}
              </HStack>

              <HStack wrap="wrap">
                {v.tags.map((t) => (
                  <Tag key={t} size="sm" variant="solid" colorScheme={STRIDE_COLORS[t] || "gray"}>
                    <TagLabel>{t}</TagLabel>
                  </Tag>
                ))}
              </HStack>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
}
