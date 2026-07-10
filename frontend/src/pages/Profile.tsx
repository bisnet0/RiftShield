import { useState, useEffect, useRef } from "react";
import {
  Box, VStack, HStack, Text, Input, Button, Divider, Heading, useColorModeValue,
  Flex, Icon, Badge, Spinner, useToast,
} from "@chakra-ui/react";
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Shield, Zap } from "lucide-react";
import { useAppThemeFx } from "../styles/app-theme-fx";
import api from "../middleware/api";

const MAX_DAYS = 30;

const SENIORITY_OPTIONS = [
  { value: "junior", label: "Júnior", color: "green" },
  { value: "mid-level", label: "Pleno", color: "orange" },
  { value: "senior", label: "Sênior", color: "red" },
];

function ProgressingText() {
  const base = "PROGREDINDO";
  const [text, setText] = useState("P");
  const dots = useRef(0);
  const idx = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (idx.current < base.length) {
        setText(base.slice(0, idx.current + 1));
        idx.current++;
      } else {
        dots.current = (dots.current + 1) % 4;
        setText(base + ".".repeat(dots.current));
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return <>{text}</>;
}

export default function Profile() {
  const themeFx = useAppThemeFx();
  const toast = useToast();
  const cardBg = useColorModeValue("#ffffff", "#1a1a1a");
  const cardBorder = useColorModeValue("rgba(230, 92, 0, 0.15)", "#333333");
  const progressBg = useColorModeValue("#f0f0f0", "#1a1a1a");
  const barBg = useColorModeValue("linear-gradient(90deg, #e65c00, #e6b800)", "linear-gradient(90deg, #e6b800, #e65c00)");
  const glitchColor = useColorModeValue("rgba(230, 92, 0, 0.3)", "rgba(230, 184, 0, 0.3)");

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", country: "", state: "", city: "", profession: "", seniority: "", age: "" });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get("/users/me");
      const u = res.data.user;
      setUser(u);
      setForm({ name: u.name || "", phone: u.phone || "", country: u.country || "", state: u.state || "", city: u.city || "", profession: u.profession || "", seniority: u.seniority || "", age: u.age?.toString() || "" });
    } catch {}
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {};
      if (form.name && form.name !== user.name) payload.name = form.name;
      if (form.phone !== (user.phone || "")) payload.phone = form.phone;
      if (form.country !== (user.country || "")) payload.country = form.country;
      if (form.state !== (user.state || "")) payload.state = form.state;
      if (form.city !== (user.city || "")) payload.city = form.city;
      if (form.profession !== (user.profession || "")) payload.profession = form.profession;
      if (form.seniority !== (user.seniority || "")) payload.seniority = form.seniority;
      if (form.age !== (user.age?.toString() || "")) payload.age = form.age ? parseInt(form.age) : null;
      if (Object.keys(payload).length === 0) { toast({ title: "Nenhuma alteração", status: "info", duration: 2000 }); return; }
      const res = await api.put("/users/me", payload);
      setUser(res.data.user);
      toast({ title: "Perfil atualizado", status: "success", duration: 3000 });
    } catch { toast({ title: "Erro ao salvar", status: "error", duration: 3000 }); }
    setSaving(false);
  };

  if (loading) return <Spinner />;

  const days = Math.min(user?.total_days_active || 0, MAX_DAYS);
  const progress = (days / MAX_DAYS) * 100;

  return (
    <VStack spacing={8} align="stretch" w="full" maxW="900px" mx="auto" pb={10}>
      <Heading size="lg" color={themeFx.textColor}>Perfil</Heading>

      <Flex gap={6} direction={{ base: "column", md: "row" }}>
        <Box flex={1} p={6} bg={cardBg} borderRadius="xl" border="1px solid" borderColor={cardBorder}>
          <VStack spacing={5} align="stretch">
            <HStack spacing={3}>
              <Icon as={User} color={themeFx.brandColor} />
              <Text fontWeight="bold" color={themeFx.textColor}>Informações Pessoais</Text>
            </HStack>
            <Divider />
            <Field icon={User} label="Nome" value={form.name} onChange={(v) => setForm({ ...form, name: v })} themeFx={themeFx} cardBg={cardBg} cardBorder={cardBorder} />
            <Field icon={Mail} label="Email" value={user?.email || ""} onChange={() => {}} themeFx={themeFx} cardBg={cardBg} cardBorder={cardBorder} disabled />
            <Field icon={Phone} label="Contato" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} themeFx={themeFx} cardBg={cardBg} cardBorder={cardBorder} />
            <HStack>
              <Field icon={MapPin} label="País" value={form.country} onChange={(v) => setForm({ ...form, country: v })} themeFx={themeFx} cardBg={cardBg} cardBorder={cardBorder} />
              <Field icon={MapPin} label="Estado" value={form.state} onChange={(v) => setForm({ ...form, state: v })} themeFx={themeFx} cardBg={cardBg} cardBorder={cardBorder} />
              <Field icon={MapPin} label="Cidade" value={form.city} onChange={(v) => setForm({ ...form, city: v })} themeFx={themeFx} cardBg={cardBg} cardBorder={cardBorder} />
            </HStack>
          </VStack>
        </Box>

        <Box flex={1} p={6} bg={cardBg} borderRadius="xl" border="1px solid" borderColor={cardBorder}>
          <VStack spacing={5} align="stretch">
            <HStack spacing={3}>
              <Icon as={Briefcase} color={themeFx.brandColor} />
              <Text fontWeight="bold" color={themeFx.textColor}>Profissão</Text>
            </HStack>
            <Divider />
            <Field icon={Briefcase} label="Profissão" value={form.profession} onChange={(v) => setForm({ ...form, profession: v })} themeFx={themeFx} cardBg={cardBg} cardBorder={cardBorder} placeholder="Ex: Arquiteto de Sistemas" />
            <Field icon={Calendar} label="Idade" value={form.age} onChange={(v) => setForm({ ...form, age: v })} themeFx={themeFx} cardBg={cardBg} cardBorder={cardBorder} placeholder="Ex: 30" type="number" />
            <Box>
              <Text fontSize="sm" color={themeFx.textMuted} mb={2} fontWeight="medium">Senioridade</Text>
              <HStack spacing={2}>
                {SENIORITY_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    size="sm"
                    variant={form.seniority === opt.value ? "solid" : "outline"}
                    colorScheme={opt.color}
                    onClick={() => setForm({ ...form, seniority: opt.value })}
                    flex={1}
                    _hover={{ transform: "scale(1.02)" }}
                  >
                    {opt.label}
                  </Button>
                ))}
              </HStack>
            </Box>
          </VStack>

          <Divider my={5} />

          <VStack spacing={3} align="stretch">
            <HStack spacing={3}>
              <Icon as={Zap} color={themeFx.brandColor} />
              <Text fontWeight="bold" color={themeFx.textColor}>Experiência no App</Text>
              <Badge colorScheme="orange" variant="subtle" fontSize="xs">{days}/{MAX_DAYS} dias</Badge>
            </HStack>
            <Box position="relative">
              <Box bg={progressBg} borderRadius="full" h="28px" overflow="hidden" border="1px solid" borderColor={cardBorder}>
                <Box
                  h="full"
                  borderRadius="full"
                  bg={barBg}
                  width={`${progress}%`}
                  transition="width 1.5s ease-in-out"
                  position="relative"
                  overflow="hidden"
                  sx={{
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: `linear-gradient(90deg, transparent 0%, ${glitchColor} 50%, transparent 100%)`,
                      animation: "shimmer 3s ease-in-out infinite",
                    },
                  }}
                />
              </Box>
              <Text
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                fontSize="10px"
                fontWeight="bold"
                fontFamily="monospace"
                color={progress > 40 ? "white" : themeFx.textColor}
                letterSpacing="0.5px"
              >
                [<ProgressingText />]
              </Text>
            </Box>
            <Text fontSize="xs" color={themeFx.textMuted} textAlign="center">
              {days >= MAX_DAYS ? "Experiência completa! 🎉" : `Use o RiftShield por mais ${MAX_DAYS - days} dias para evoluir ao máximo`}
            </Text>
          </VStack>
        </Box>
      </Flex>

      <Flex justify="flex-end">
        <Button
          colorScheme="orange"
          bg="brand"
          color="white"
          onClick={handleSave}
          isLoading={saving}
          loadingText="Salvando..."
          _hover={{ bg: "brandHover" }}
          leftIcon={<Icon as={Shield} />}
        >
          Salvar Perfil
        </Button>
      </Flex>
    </VStack>
  );
}

function Field({ icon, label, value, onChange, themeFx, cardBg, cardBorder, disabled, placeholder, type }: any) {
  return (
    <Box>
      <Text fontSize="sm" color={themeFx.textMuted} mb={1} fontWeight="medium">{label}</Text>
      <Input
        size="sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        bg={cardBg}
        borderColor={cardBorder}
        color={themeFx.textColor}
        disabled={disabled}
        placeholder={placeholder}
        type={type || "text"}
        _disabled={{ opacity: 0.6, cursor: "not-allowed" }}
      />
    </Box>
  );
}
