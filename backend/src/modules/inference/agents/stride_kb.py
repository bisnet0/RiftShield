"""
STRIDE Threat Knowledge Base — Pre-populated vulnerabilities and countermeasures
per architecture component type.
"""

from typing import Dict, List

from modules.inference.models.threat_model import Countermeasure, Vulnerability

STRIDE_CATEGORIES = [
    "spoofing",
    "tampering",
    "repudiation",
    "information_disclosure",
    "denial_of_service",
    "elevation_of_privilege",
]

STRIDE_DESCRIPTIONS = {
    "spoofing": "Falsificar a identidade de um usuário, processo ou dispositivo",
    "tampering": "Modificar dados ou código de forma não autorizada",
    "repudiation": "Negar a realização de uma ação sem possibilidade de comprovação",
    "information_disclosure": "Expor informações a pessoas ou sistemas não autorizados",
    "denial_of_service": "Interromper ou degradar o serviço para usuários legítimos",
    "elevation_of_privilege": "Obter acesso a recursos além dos permitidos pela autorização",
}

COMPONENT_THREAT_MAP: Dict[str, List[str]] = {
    "user": ["spoofing", "repudiation"],
    "server": ["tampering", "denial_of_service", "elevation_of_privilege", "information_disclosure"],
    "database": ["tampering", "information_disclosure", "denial_of_service"],
    "api": ["spoofing", "tampering", "denial_of_service", "elevation_of_privilege"],
    "load_balancer": ["denial_of_service", "tampering"],
    "firewall": ["denial_of_service", "tampering"],
    "message_queue": ["tampering", "information_disclosure", "denial_of_service"],
    "cache": ["tampering", "information_disclosure"],
    "cdn": ["denial_of_service", "tampering"],
    "dns": ["spoofing", "denial_of_service"],
    "microservice": ["spoofing", "tampering", "information_disclosure", "elevation_of_privilege"],
    "gateway": ["spoofing", "denial_of_service", "elevation_of_privilege"],
    "storage": ["tampering", "information_disclosure"],
    "container": ["elevation_of_privilege", "tampering", "information_disclosure"],
    "identity_provider": ["spoofing", "denial_of_service", "elevation_of_privilege"],
}

VULNERABILITY_KB: List[dict] = [
    {
        "cve_id": "CWE-287",
        "title": "Improper Authentication",
        "description": "O sistema não valida adequadamente a identidade do usuário antes de conceder acesso.",
        "cvss_score": 8.1,
        "cwe": "CWE-287",
        "components": ["user", "api", "gateway", "identity_provider"],
    },
    {
        "cve_id": "CWE-89",
        "title": "SQL Injection",
        "description": "Injeção de comandos SQL através de inputs não sanitizados.",
        "cvss_score": 9.0,
        "cwe": "CWE-89",
        "components": ["database", "api"],
    },
    {
        "cve_id": "CWE-79",
        "title": "Cross-Site Scripting (XSS)",
        "description": "Injeção de scripts maliciosos em páginas web visualizadas por outros usuários.",
        "cvss_score": 6.1,
        "cwe": "CWE-79",
        "components": ["api", "user"],
    },
    {
        "cve_id": "CWE-400",
        "title": "Uncontrolled Resource Consumption",
        "description": "O sistema não limita adequadamente o consumo de recursos, permitindo exaustão.",
        "cvss_score": 7.5,
        "cwe": "CWE-400",
        "components": ["server", "api", "load_balancer", "message_queue"],
    },
    {
        "cve_id": "CWE-200",
        "title": "Information Exposure",
        "description": "Exposição de informações sensíveis através de mensagens de erro, headers ou logs.",
        "cvss_score": 5.3,
        "cwe": "CWE-200",
        "components": ["server", "api", "database", "storage"],
    },
    {
        "cve_id": "CWE-269",
        "title": "Improper Privilege Management",
        "description": "Falha na gestão adequada de privilégios, permitindo escalação não autorizada.",
        "cvss_score": 8.4,
        "cwe": "CWE-269",
        "components": ["server", "api", "container", "identity_provider"],
    },
    {
        "cve_id": "CWE-306",
        "title": "Missing Authentication for Critical Function",
        "description": "Funções críticas do sistema não exigem autenticação adequada.",
        "cvss_score": 7.5,
        "cwe": "CWE-306",
        "components": ["api", "gateway", "microservice"],
    },
    {
        "cve_id": "CWE-798",
        "title": "Use of Hard-coded Credentials",
        "description": "Uso de credenciais fixas no código-fonte ou configuração.",
        "cvss_score": 7.3,
        "cwe": "CWE-798",
        "components": ["server", "database", "api"],
    },
    {
        "cve_id": "CWE-862",
        "title": "Missing Authorization",
        "description": "O sistema não verifica adequadamente as permissões do usuário para acessar recursos.",
        "cvss_score": 6.5,
        "cwe": "CWE-862",
        "components": ["api", "microservice", "gateway"],
    },
    {
        "cve_id": "CWE-502",
        "title": "Deserialization of Untrusted Data",
        "description": "Desserialização de dados não confiáveis pode levar a execução remota de código.",
        "cvss_score": 8.8,
        "cwe": "CWE-502",
        "components": ["server", "api", "message_queue"],
    },
    {
        "cve_id": "CWE-22",
        "title": "Path Traversal",
        "description": "Acesso a arquivos ou diretórios fora do diretório restrito.",
        "cvss_score": 7.5,
        "cwe": "CWE-22",
        "components": ["server", "api", "storage"],
    },
    {
        "cve_id": "CWE-611",
        "title": "Improper Restriction of XML External Entity Reference (XXE)",
        "description": "Processamento inadequado de entidades externas em documentos XML.",
        "cvss_score": 7.3,
        "cwe": "CWE-611",
        "components": ["api", "server", "message_queue"],
    },
    {
        "cve_id": "CWE-918",
        "title": "Server-Side Request Forgery (SSRF)",
        "description": "O servidor pode ser induzido a fazer requisições para destinos internos não intencionais.",
        "cvss_score": 8.8,
        "cwe": "CWE-918",
        "components": ["server", "api", "microservice"],
    },
    {
        "cve_id": "CWE-276",
        "title": "Incorrect Default Permissions",
        "description": "Permissões padrão muito permissivas em arquivos, diretórios ou containers.",
        "cvss_score": 6.5,
        "cwe": "CWE-276",
        "components": ["storage", "container", "database"],
    },
]

COUNTERMEASURE_KB: List[dict] = [
    {
        "title": "Implementar Autenticação Multifator (MFA)",
        "description": "Adicionar camadas extras de verificação de identidade além de senha.",
        "priority": "critical",
        "implementation_guide": "Integrar provedor de identidade (OAuth 2.0 / SAML) e exigir MFA para todos os acessos administrativos.",
        "references": ["https://owasp.org/www-community/Authentication_Cheat_Sheet"],
        "vulnerability_match": ["CWE-287", "CWE-306", "CWE-798"],
    },
    {
        "title": "Sanitização de Inputs (Parameterized Queries)",
        "description": "Utilizar consultas parametrizadas ou ORM para prevenir injeção SQL/NoSQL.",
        "priority": "critical",
        "implementation_guide": "Substituir concatenação de strings SQL por queries parametrizadas com bind variables.",
        "references": ["https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html"],
        "vulnerability_match": ["CWE-89"],
    },
    {
        "title": "Content Security Policy (CSP)",
        "description": "Implementar cabeçalhos CSP para mitigar ataques XSS.",
        "priority": "high",
        "implementation_guide": "Configurar header Content-Security-Policy no servidor web ou framework.",
        "references": ["https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP"],
        "vulnerability_match": ["CWE-79"],
    },
    {
        "title": "Rate Limiting e Throttling",
        "description": "Limitar requisições por IP e usuário para prevenir DoS e abuso de API.",
        "priority": "high",
        "implementation_guide": "Implementar middleware de rate limiting com Redis/banco de dados para tracking de requisições.",
        "references": ["https://owasp.org/www-community/DoS_Attack_Defenses"],
        "vulnerability_match": ["CWE-400"],
    },
    {
        "title": "Criptografia em Trânsito e Repouso",
        "description": "Criptografar dados sensíveis tanto em trânsito (TLS) quanto em repouso (AES-256).",
        "priority": "critical",
        "implementation_guide": "Exigir HTTPS para todas as comunicações e criptografar campos sensíveis no banco de dados.",
        "references": ["https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html"],
        "vulnerability_match": ["CWE-200"],
    },
    {
        "title": "Princípio do Menor Privilégio (RBAC)",
        "description": "Implementar controle de acesso baseado em papéis com permissões mínimas necessárias.",
        "priority": "critical",
        "implementation_guide": "Mapear todos os endpoints e recursos, atribuir permissões mínimas por papel de usuário.",
        "references": ["https://owasp.org/www-community/Access_Control_Cheat_Sheet"],
        "vulnerability_match": ["CWE-269", "CWE-862", "CWE-276"],
    },
    {
        "title": "Validação e Sanitização de Uploads",
        "description": "Validar tipo, tamanho e conteúdo de arquivos enviados pelo usuário.",
        "priority": "high",
        "implementation_guide": "Verificar magic numbers, extensão e tamanho máximo; armazenar fora do webroot.",
        "references": ["https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload"],
        "vulnerability_match": ["CWE-22", "CWE-502"],
    },
    {
        "title": "Logging e Monitoramento de Segurança",
        "description": "Implementar logging centralizado com alertas para eventos suspeitos.",
        "priority": "high",
        "implementation_guide": "Utilizar SIEM (Wazuh, ELK) para correlação de logs e alertas em tempo real.",
        "references": ["https://owasp.org/www-project-proactive-controls/"],
        "vulnerability_match": [],
    },
    {
        "title": "Proteção SSRF (Allow Lists de Destinos)",
        "description": "Restringir destinos de requisições internas a uma lista aprovada.",
        "priority": "high",
        "implementation_guide": "Implementar validação de URLs e manter allow list de hosts internos permitidos.",
        "references": ["https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html"],
        "vulnerability_match": ["CWE-918"],
    },
    {
        "title": "Segurança de Containers (Imagens Escaneadas)",
        "description": "Escanear imagens de containers por vulnerabilidades conhecidas antes do deploy.",
        "priority": "high",
        "implementation_guide": "Integrar Trivy ou Snyk no pipeline CI/CD para escanear todas as imagens.",
        "references": ["https://docs.docker.com/engine/scan/"],
        "vulnerability_match": ["CWE-276", "CWE-269"],
    },
    {
        "title": "Input Validation (Allow List)",
        "description": "Validar todas as entradas contra listas de valores permitidos.",
        "priority": "critical",
        "implementation_guide": "Implementar validação no controller (Pydantic/Express) antes de processar qualquer dado.",
        "references": ["https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html"],
        "vulnerability_match": ["CWE-502", "CWE-611", "CWE-89", "CWE-79"],
    },
    {
        "title": "Gestão Segura de Credenciais (Vault/Secrets Manager)",
        "description": "Utilizar gerenciador de segredos para armazenar credenciais ao invés de hard-code.",
        "priority": "critical",
        "implementation_guide": "Migrar credenciais para HashiCorp Vault, AWS Secrets Manager ou Kubernetes Secrets.",
        "references": ["https://cheatsheetseries.owasp.org/cheatsheets/Credential_Management_Cheat_Sheet.html"],
        "vulnerability_match": ["CWE-798"],
    },
]


def get_vulnerabilities_for_component(label: str) -> List[Vulnerability]:
    results: List[Vulnerability] = []
    for entry in VULNERABILITY_KB:
        if label.lower() in entry["components"]:
            results.append(Vulnerability(
                cve_id=entry["cve_id"],
                title=entry["title"],
                description=entry["description"],
                cvss_score=entry["cvss_score"],
                cwe=entry["cwe"],
                affected_component=label,
            ))
    return results


def get_countermeasures_for_vulnerabilities(vulns: List[Vulnerability]) -> List[Countermeasure]:
    matched_cwes = set()
    for v in vulns:
        if v.cwe:
            matched_cwes.add(v.cwe)

    results: List[Countermeasure] = []
    seen = set()
    for entry in COUNTERMEASURE_KB:
        for vm in entry["vulnerability_match"]:
            if vm in matched_cwes and entry["title"] not in seen:
                results.append(Countermeasure(
                    title=entry["title"],
                    description=entry["description"],
                    priority=entry["priority"],
                    implementation_guide=entry.get("implementation_guide"),
                    references=entry.get("references", []),
                ))
                seen.add(entry["title"])
                break

    return results
