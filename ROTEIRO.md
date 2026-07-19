# ROTEIRO.md — Explicação Rápida dos Arquivos-Chave

Leitura estimada: **≤30 segundos por arquivo**.

---

### `inference_service.py`
Pipeline de análise de diagramas: carrega o YOLO, detecta componentes com confiança ≥ 0.25, ativa fallback Hermes se necessário, salva o resultado.

### `threat_service.py`
Para cada componente detectado, mapeia ameaças STRIDE, consulta vulnerabilidades e contramedidas da base, calcula risk score 0–10 e gera o relatório.

### `kb_service.py`
Popula o banco com vulnerabilidades (CVE/CWE) e contramedidas em pt-BR e en-US. Expõe consultas por componente, severidade e texto.

### `graph.py`
Define o grafo LangGraph do Hermes: nó supervisor (LLM) + 11 ferramentas acopladas, com roteamento condicional entre chat e execução de ferramentas.

### `llm_factory.py`
Factory que instancia Google Gemini, OpenAI ou DeepSeek com as credenciais do usuário. Implementa fallback automático entre provedores.

### `comparison_service.py`
Compara duas arquiteturas: diff de componentes (adicionados/removidos/comuns), delta STRIDE, diff de vulnerabilidades, delta de risco e veredito automático.

### `suggestion_service.py`
Envia ambas as imagens para IA com visão (Gemini/GPT-4o) e retorna uma sugestão de "Arquitetura C" mesclando o melhor de cada uma.

### `attack_service.py`
Define 5 templates de ataque (DDoS, SQLi, XSS, Path Traversal, SSRF) com detalhes técnicos, mapeia para CWEs, busca contramedidas e persiste a simulação.

### `ml_train_full.py`
Treinamento completo do YOLOv8n: checkpoint resume, suporte DirectML (GPU), progress callback, correção de paths WSL, cópia automática do melhor modelo.

### `dataset_service.py`
Gerencia upload com labels e split, listagem, deleção e aumento de dados (flip, brilho). Valida labels contra as 15 classes de componentes.

### `export_service.py`
Coleta dados de todas as seções do sistema, serializa em JSON/CSV/Excel/PDF, aplica seleção de idioma nos campos bilíngues via `_pick()`. Ponto único de saída.

### `pdf_generator.py`
Gera PDF com gráficos matplotlib, tabelas e ~80 labels dinâmicos em pt-BR ou en-US. Usa WeasyPrint + Jinja2 com template HTML estilizado.

### `dashboard_service.py`
Agrega dados de 5 coleções MongoDB em um objeto de estatísticas: totais, distribuição STRIDE, top componentes, análises recentes.

### `auth_service.py`
Registro com invite code, login com bcrypt, geração de tokens JWT (access 15min + refresh 7 dias), refresh com rotação, logout.

### `dependencies.py`
Middleware de autenticação: verifica access token, se expirado tenta refresh automático via cookie `refreshToken`, anexa novo token ao response sem 401.

### `LanguageContext.tsx`
Provedor React que carrega tradução pt-BR/en-US, expõe função `t()` com placeholders, persiste preferência no backend.

### `Profile.tsx`
Página de perfil com formulário editável, barra de experiência animada ("PROGREDINDO"), seleção de senioridade e idioma.

### `Settings.tsx`
Painel de controle: provedor IA, modelo, chaves de API, fallbacks, cursor customizado, ativação do Hermes.

### `UsageTimer.tsx`
Componente que sincroniza com backend a cada 30s, incrementa contador local a cada segundo, exibe tooltip com total via portal.

### `CustomCursor.tsx`
Canvas 2D com animação de círculo + ponto trailing. Detecta elementos interativos por seletores CSS, ajusta raio e oculta cursor nativo.

---

*RiftShield — Hackathon FIAP Software Security 2026*
