const PT_BR: Record<string, string> = {
  // Descrições de vulnerabilidades (PT-BR para EN-US)
  "O sistema não valida adequadamente a identidade do usuário antes de conceder acesso.": "The system does not properly validate user identity before granting access.",
  "Injeção de comandos SQL através de inputs não sanitizados.": "SQL command injection through unsanitized inputs.",
  "Injeção de scripts maliciosos em páginas web.": "Injection of malicious scripts into web pages.",
  "O sistema não limita adequadamente o consumo de recursos.": "The system does not properly limit resource consumption.",
  "Exposição de informações sensíveis.": "Exposure of sensitive information.",
  "Falha na gestão adequada de privilégios.": "Failure in proper privilege management.",
  "Uso de credenciais fixas no código-fonte.": "Use of hard-coded credentials in source code.",
  "Funções críticas não exigem autenticação.": "Critical functions do not require authentication.",
  "O sistema não verifica permissões adequadamente.": "The system does not properly verify permissions.",
  "Desserialização de dados não confiáveis.": "Deserialization of untrusted data.",
  "Acesso a arquivos fora do diretório restrito.": "Access to files outside the restricted directory.",
  "O servidor pode ser induzido a fazer requisições internas.": "The server can be tricked into making internal requests.",
  "Permissões padrão muito permissivas.": "Default permissions are too permissive.",


  // Categorias STRIDE
  "Spoofing": "Falsificação",
  "Tampering": "Adulteração",
  "Repudiation": "Repúdio",
  "Information Disclosure": "Exposição de Informações",
  "Denial of Service": "Negação de Serviço",
  "Elevation of Privilege": "Elevação de Privilégio",

  // Risk levels
  "low": "Baixo",
  "medium": "Médio",
  "high": "Alto",
  "critical": "Crítico",

  // Status
  "completed": "Concluído",
  "failed": "Falhou",
  "processing": "Processando",
  "pending": "Pendente",
  "running": "Executando",

  // Componentes
  "user": "Usuário",
  "server": "Servidor",
  "database": "Banco de Dados",
  "api": "API",
  "load_balancer": "Balanceador de Carga",
  "firewall": "Firewall",
  "message_queue": "Fila de Mensagens",
  "cache": "Cache",
  "cdn": "CDN",
  "dns": "DNS",
  "microservice": "Microsserviço",
  "gateway": "Gateway",
  "storage": "Armazenamento",
  "container": "Container",
  "identity_provider": "Provedor de Identidade",
  "waf": "WAF",
  "api_gateway": "API Gateway",
  "redis_cache": "Redis Cache",
  "monitoring": "Monitoramento",
  "logging": "Registro de Logs",
  "auth_service": "Serviço de Autenticação",
  "unknown_29": "Desconhecido",

  // Prioridades
  "critical": "Crítico",
  "high": "Alta",
  "medium": "Média",
  "low": "Baixa",

  // Fontes
  "manual": "Manual",
  "augmented": "Aumentado",
  "synthetic": "Sintético",

  // Splits
  "train": "Treino",
  "val": "Validação",
  "test": "Teste",

  // Verdicts
  "ARQUITETURA_B_RECOMENDADA": "Arquitetura B Recomendada",
  "ARQUITETURA_A_RECOMENDADA": "Arquitetura A Recomendada",
  "EQUIVALENTES": "Equivalentes",

  // Nomes de vulnerabilidades (títulos em inglês → português)
  "Improper Authentication": "Autenticação Inadequada",
  "SQL Injection": "Injeção SQL",
  "Cross-Site Scripting (XSS)": "Cross-Site Scripting (XSS)",
  "Uncontrolled Resource Consumption": "Consumo Descontrolado de Recursos",
  "Information Exposure": "Exposição de Informações",
  "Improper Privilege Management": "Gestão Inadequada de Privilégios",
  "Use of Hard-coded Credentials": "Uso de Credenciais Fixas",
  "Missing Authentication for Critical Function": "Autenticação Ausente em Função Crítica",
  "Missing Authorization": "Autorização Ausente",
  "Deserialization of Untrusted Data": "Desserialização de Dados Não Confiáveis",
  "Path Traversal": "Path Traversal",
  "Server-Side Request Forgery (SSRF)": "Falsificação de Requisição no Servidor (SSRF)",
  "Incorrect Default Permissions": "Permissões Padrão Incorretas",

  // Descrições de vulnerabilidades (primeiras palavras para match parcial)
  "O sistema não valida adequadamente a identidade do usuário antes de conceder acesso.": "O sistema não valida adequadamente a identidade do usuário antes de conceder acesso.",
  "Injeção de comandos SQL através de inputs não sanitizados.": "Injeção de comandos SQL através de entradas não sanitizadas.",
  "Injeção de scripts maliciosos em páginas web.": "Injeção de scripts maliciosos em páginas web.",
  "O sistema não limita adequadamente o consumo de recursos.": "O sistema não limita adequadamente o consumo de recursos.",
  "Exposição de informações sensíveis.": "Exposição de informações sensíveis.",
  "Falha na gestão adequada de privilégios.": "Falha na gestão adequada de privilégios.",
  "Uso de credenciais fixas no código-fonte.": "Uso de credenciais fixas no código-fonte.",
  "Funções críticas não exigem autenticação.": "Funções críticas não exigem autenticação.",
  "O sistema não verifica permissões adequadamente.": "O sistema não verifica permissões adequadamente.",
  "Desserialização de dados não confiáveis.": "Desserialização de dados não confiáveis.",
  "Acesso a arquivos fora do diretório restrito.": "Acesso a arquivos fora do diretório restrito.",
  "O servidor pode ser induzido a fazer requisições internas.": "O servidor pode ser induzido a fazer requisições internas.",
  "Permissões padrão muito permissivas.": "Permissões padrão muito permissivas.",

  // Tags de vulnerabilidades (STRIDE tags)
  "authentication": "Autenticação",
  "access-control": "Controle de Acesso",
  "injection": "Injeção",
  "xss": "XSS",
  "dos": "DoS",
  "resource": "Recurso",
  "information-disclosure": "Exposição de Info",
  "privacy": "Privacidade",
  "privilege-escalation": "Elevação de Privilégio",
  "credentials": "Credenciais",
  "secrets": "Segredos",
  "authorization": "Autorização",
  "deserialization": "Desserialização",
  "rce": "RCE",
  "path-traversal": "Path Traversal",
  "file-access": "Acesso a Arquivos",
  "ssrf": "SSRF",
  "server-side": "Server-Side",
  "permissions": "Permissões",
  "misconfiguration": "Má Configuração",
  "database": "Banco de Dados",

  // Descrições de ameaças STRIDE
  "Falsificar a identidade de um usuário, processo ou dispositivo": "Falsifying the identity of a user, process or device",
  "Modificar dados ou código de forma não autorizada": "Modifying data or code without authorization",
  "Negar a realização de uma ação sem possibilidade de comprovação": "Denying an action without proof",
  "Expor informações a pessoas ou sistemas não autorizados": "Exposing information to unauthorized people or systems",
  "Interromper ou degradar o serviço para usuários legítimos": "Interrupting or degrading service for legitimate users",
  "Obter acesso a recursos além dos permitidos pela autorização": "Obtaining access beyond authorized permissions",
};

export function translateApiText(text: string, lang: "pt-BR" | "en-US"): string {
  const translated = PT_BR[text];
  if (!translated) return text;
  if (lang === "en-US") return translated;
  return text;
}

export function translateThreatCategory(cat: string, lang: "pt-BR" | "en-US"): string {
  if (lang === "en-US") return cat;
  const map: Record<string, string> = {
    spoofing: "Spoofing",
    tampering: "Tampering",
    repudiation: "Repudiação",
    information_disclosure: "Exposição de Info",
    denial_of_service: "DoS",
    elevation_of_privilege: "Elevação de Privilégio",
  };
  return map[cat] || cat;
}

export function translateRiskLevel(level: string, lang: "pt-BR" | "en-US"): string {
  if (lang === "en-US") return level;
  const map: Record<string, string> = {
    low: "Baixo",
    medium: "Médio",
    high: "Alto",
    critical: "Crítico",
  };
  return map[level] || level;
}

export function translateComponent(label: string, lang: "pt-BR" | "en-US"): string {
  if (lang === "en-US") return label;
  const map: Record<string, string> = {
    user: "Usuário",
    server: "Servidor",
    database: "Banco de Dados",
    api: "API",
    load_balancer: "Balanceador",
    firewall: "Firewall",
    message_queue: "Fila de Mensagens",
    cache: "Cache",
    cdn: "CDN",
    dns: "DNS",
    microservice: "Microsserviço",
    gateway: "Gateway",
    storage: "Armazenamento",
    container: "Container",
    identity_provider: "Provedor de Identidade",
    waf: "WAF",
    api_gateway: "API Gateway",
    redis_cache: "Redis Cache",
    monitoring: "Monitoramento",
    logging: "Registro",
    auth_service: "Autenticação",
  };
  return map[label] || label;
}

export function translateVulnerabilityTitle(title: string, lang: "pt-BR" | "en-US"): string {
  if (lang === "en-US") return title;
  return PT_BR[title] || title;
}

export function translateStatus(status: string, lang: "pt-BR" | "en-US"): string {
  if (lang === "en-US") return status;
  const map: Record<string, string> = {
    completed: "Concluído",
    failed: "Falhou",
    processing: "Processando",
    pending: "Pendente",
    running: "Executando",
  };
  return map[status] || status;
}

export function translatePriority(priority: string, lang: "pt-BR" | "en-US"): string {
  if (lang === "en-US") return priority;
  const map: Record<string, string> = {
    critical: "Crítico",
    high: "Alta",
    medium: "Média",
    low: "Baixa",
  };
  return map[priority] || priority;
}

export function translateSplit(split: string, lang: "pt-BR" | "en-US"): string {
  if (lang === "en-US") return split;
  const map: Record<string, string> = {
    train: "Treino",
    val: "Validação",
    test: "Teste",
  };
  return map[split] || split;
}
