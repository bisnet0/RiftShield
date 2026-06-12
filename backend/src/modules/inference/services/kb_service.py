from __future__ import annotations

import re
from typing import Dict, List, Optional, Tuple

from modules.inference.models.kb_model import KBCountermeasure, KBVulnerability, VulnerabilityFilter


async def seed_knowledge_base() -> int:
    existing = await KBVulnerability.find({}).count()
    if existing > 0:
        return 0

    vulns = [
        KBVulnerability(cve_id="CWE-287", title="Improper Authentication", description="O sistema n\u00e3o valida adequadamente a identidade do usu\u00e1rio antes de conceder acesso.", cvss_score=8.1, cwe="CWE-287", affected_components=["user", "api", "gateway", "identity_provider"], tags=["authentication", "access-control"]),
        KBVulnerability(cve_id="CWE-89", title="SQL Injection", description="Inje\u00e7\u00e3o de comandos SQL atrav\u00e9s de inputs n\u00e3o sanitizados.", cvss_score=9.0, cwe="CWE-89", affected_components=["database", "api"], tags=["injection", "database"]),
        KBVulnerability(cve_id="CWE-79", title="Cross-Site Scripting (XSS)", description="Inje\u00e7\u00e3o de scripts maliciosos em p\u00e1ginas web.", cvss_score=6.1, cwe="CWE-79", affected_components=["api", "user"], tags=["xss", "injection"]),
        KBVulnerability(cve_id="CWE-400", title="Uncontrolled Resource Consumption", description="O sistema n\u00e3o limita adequadamente o consumo de recursos.", cvss_score=7.5, cwe="CWE-400", affected_components=["server", "api", "load_balancer", "message_queue"], tags=["dos", "resource"]),
        KBVulnerability(cve_id="CWE-200", title="Information Exposure", description="Exposi\u00e7\u00e3o de informa\u00e7\u00f5es sens\u00edveis.", cvss_score=5.3, cwe="CWE-200", affected_components=["server", "api", "database", "storage"], tags=["information-disclosure", "privacy"]),
        KBVulnerability(cve_id="CWE-269", title="Improper Privilege Management", description="Falha na gest\u00e3o adequada de privil\u00e9gios.", cvss_score=8.4, cwe="CWE-269", affected_components=["server", "api", "container", "identity_provider"], tags=["privilege-escalation", "access-control"]),
        KBVulnerability(cve_id="CWE-306", title="Missing Authentication for Critical Function", description="Fun\u00e7\u00f5es cr\u00edticas n\u00e3o exigem autentica\u00e7\u00e3o.", cvss_score=7.5, cwe="CWE-306", affected_components=["api", "gateway", "microservice"], tags=["authentication", "access-control"]),
        KBVulnerability(cve_id="CWE-798", title="Use of Hard-coded Credentials", description="Uso de credenciais fixas no c\u00f3digo-fonte.", cvss_score=7.3, cwe="CWE-798", affected_components=["server", "database", "api"], tags=["credentials", "secrets"]),
        KBVulnerability(cve_id="CWE-862", title="Missing Authorization", description="O sistema n\u00e3o verifica permiss\u00f5es adequadamente.", cvss_score=6.5, cwe="CWE-862", affected_components=["api", "microservice", "gateway"], tags=["authorization", "access-control"]),
        KBVulnerability(cve_id="CWE-502", title="Deserialization of Untrusted Data", description="Desserializa\u00e7\u00e3o de dados n\u00e3o confi\u00e1veis.", cvss_score=8.8, cwe="CWE-502", affected_components=["server", "api", "message_queue"], tags=["deserialization", "rce"]),
        KBVulnerability(cve_id="CWE-22", title="Path Traversal", description="Acesso a arquivos fora do diret\u00f3rio restrito.", cvss_score=7.5, cwe="CWE-22", affected_components=["server", "api", "storage"], tags=["path-traversal", "file-access"]),
        KBVulnerability(cve_id="CWE-918", title="Server-Side Request Forgery (SSRF)", description="O servidor pode ser induzido a fazer requisi\u00e7\u00f5es internas.", cvss_score=8.8, cwe="CWE-918", affected_components=["server", "api", "microservice"], tags=["ssrf", "server-side"]),
        KBVulnerability(cve_id="CWE-276", title="Incorrect Default Permissions", description="Permiss\u00f5es padr\u00e3o muito permissivas.", cvss_score=6.5, cwe="CWE-276", affected_components=["storage", "container", "database"], tags=["permissions", "misconfiguration"]),
    ]
    inserted = await KBVulnerability.insert_many(vulns)

    countermeasures = [
        KBCountermeasure(title="Implementar Autentica\u00e7\u00e3o Multifator (MFA)", description="Adicionar camadas extras de verifica\u00e7\u00e3o de identidade.", priority="critical", implementation_guide="Integrar provedor OAuth 2.0 / SAML e exigir MFA para acessos administrativos.", references=["https://owasp.org/www-community/Authentication_Cheat_Sheet"], vulnerability_cwe_ids=["CWE-287", "CWE-306", "CWE-798"]),
        KBCountermeasure(title="Sanitiza\u00e7\u00e3o de Inputs (Parameterized Queries)", description="Utilizar consultas parametrizadas para prevenir inje\u00e7\u00e3o.", priority="critical", implementation_guide="Substituir concatena\u00e7\u00e3o por queries parametrizadas.", references=["https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html"], vulnerability_cwe_ids=["CWE-89"]),
        KBCountermeasure(title="Content Security Policy (CSP)", description="Implementar cabe\u00e7alhos CSP para mitigar XSS.", priority="high", implementation_guide="Configurar header Content-Security-Policy.", references=["https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP"], vulnerability_cwe_ids=["CWE-79"]),
        KBCountermeasure(title="Rate Limiting e Throttling", description="Limitar requisi\u00e7\u00f5es para prevenir DoS.", priority="high", implementation_guide="Implementar middleware de rate limiting com Redis.", references=["https://owasp.org/www-community/DoS_Attack_Defenses"], vulnerability_cwe_ids=["CWE-400"]),
        KBCountermeasure(title="Criptografia em Tr\u00e2nsito e Repouso", description="Criptografar dados sens\u00edveis.", priority="critical", implementation_guide="Exigir HTTPS e criptografar campos sens\u00edveis no banco.", references=["https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html"], vulnerability_cwe_ids=["CWE-200"]),
        KBCountermeasure(title="Princ\u00edpio do Menor Privil\u00e9gio (RBAC)", description="Implementar controle de acesso baseado em pap\u00e9is.", priority="critical", implementation_guide="Mapear endpoints e atribuir permiss\u00f5es m\u00ednimas.", references=["https://owasp.org/www-community/Access_Control_Cheat_Sheet"], vulnerability_cwe_ids=["CWE-269", "CWE-862", "CWE-276"]),
        KBCountermeasure(title="Valida\u00e7\u00e3o e Sanitiza\u00e7\u00e3o de Uploads", description="Validar tipo e conte\u00fado de arquivos.", priority="high", implementation_guide="Verificar magic numbers e extens\u00e3o.", references=["https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload"], vulnerability_cwe_ids=["CWE-22", "CWE-502"]),
        KBCountermeasure(title="Prote\u00e7\u00e3o SSRF (Allow Lists)", description="Restringir destinos de requisi\u00e7\u00f5es internas.", priority="high", implementation_guide="Implementar valida\u00e7\u00e3o de URLs e allow list.", references=["https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html"], vulnerability_cwe_ids=["CWE-918"]),
        KBCountermeasure(title="Seguran\u00e7a de Containers (Imagens Escaneadas)", description="Escanear imagens por vulnerabilidades.", priority="high", implementation_guide="Integrar Trivy ou Snyk no CI/CD.", references=["https://docs.docker.com/engine/scan/"], vulnerability_cwe_ids=["CWE-276", "CWE-269"]),
        KBCountermeasure(title="Gest\u00e3o Segura de Credenciais (Vault)", description="Usar gerenciador de segredos.", priority="critical", implementation_guide="Migrar credenciais para HashiCorp Vault.", references=["https://cheatsheetseries.owasp.org/cheatsheets/Credential_Management_Cheat_Sheet.html"], vulnerability_cwe_ids=["CWE-798"]),
    ]
    await KBCountermeasure.insert_many(countermeasures)

    return len(vulns) + len(countermeasures)


async def list_vulnerabilities(
    filter_by: Optional[VulnerabilityFilter] = None,
    skip: int = 0,
    limit: int = 50,
) -> Tuple[List[KBVulnerability], int]:
    query: Dict = {}
    if filter_by:
        if filter_by.component:
            query["affected_components"] = filter_by.component
        if filter_by.cwe:
            query["cwe"] = filter_by.cwe
        if filter_by.min_cvss is not None:
            query["cvss_score"] = {"$gte": filter_by.min_cvss}
        if filter_by.search:
            query["$or"] = [
                {"title": {"$regex": filter_by.search, "$options": "i"}},
                {"description": {"$regex": filter_by.search, "$options": "i"}},
            ]

    total = await KBVulnerability.find(query).count()
    items = (
        await KBVulnerability.find(query)
        .sort(-KBVulnerability.created_at)
        .skip(skip)
        .limit(limit)
        .to_list()
    )
    return items, total


async def list_countermeasures(
    cwe_ids: Optional[List[str]] = None,
    skip: int = 0,
    limit: int = 50,
) -> Tuple[List[KBCountermeasure], int]:
    query: Dict = {}
    if cwe_ids:
        query["vulnerability_cwe_ids"] = {"$in": cwe_ids}

    total = await KBCountermeasure.find(query).count()
    items = (
        await KBCountermeasure.find(query)
        .sort(-KBCountermeasure.created_at)
        .skip(skip)
        .limit(limit)
        .to_list()
    )
    return items, total


async def get_vulnerabilities_for_component(label: str) -> List[KBVulnerability]:
    items, _ = await list_vulnerabilities(
        filter_by=VulnerabilityFilter(component=label),
        limit=100,
    )
    return items


async def get_countermeasures_for_vulnerabilities(vulns: List[KBVulnerability]) -> List[KBCountermeasure]:
    cwe_ids = [v.cwe for v in vulns if v.cwe]
    if not cwe_ids:
        return []
    items, _ = await list_countermeasures(cwe_ids=cwe_ids, limit=100)
    return items
