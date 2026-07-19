# RiftShield — Features

## O que o sistema faz

- [x] **Análise de Diagramas de Arquitetura** — Upload de imagens de diagramas (PNG, JPG) com detecção automática de 15 tipos de componentes via YOLOv8, com fallback para IA vision (Hermes)
- [x] **Modelagem de Ameaças STRIDE** — Geração automática de relatórios de ameaças baseados nos 6 pilares STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, DoS, Elevation of Privilege)
- [x] **Base de Conhecimento** — Vulnerabilidades (CVE/CWE) e contramedidas pré-populadas, consultáveis por componente, severidade ou texto, em português e inglês
- [x] **Hermes — Assistente IA** — Chat com agente LangGraph que analisa diagramas, consulta a base de conhecimento, lista relatórios, gerencia dataset, exibe KPIs do dashboard e responde perguntas de segurança
- [x] **Comparação de Arquiteturas** — Compara duas imagens de diagrama lado a lado, mostra diff de componentes, STRIDE, vulnerabilidades e risco; sugere arquitetura mesclada viña IA
- [x] **Simulação de Ataques** — Cenários pré-definidos (DDoS, SQL Injection, XSS, Path Traversal, SSRF) com detalhes técnicos e contramedidas recomendadas
- [x] **Treinamento de Modelo YOLO** — Fine-tune do YOLOv8n com dataset próprio, histórico de modelos, ativação de versões treinadas
- [x] **Gerenciamento de Dataset** — Upload de imagens com labels e split (train/val/test), aumento de dados (flip horizontal/vertical, brilho), estatísticas
- [x] **Exportação de Dados** — JSON, CSV, Excel, PDF com gráficos matplotlib, suporte a ZIP, seções selecionáveis, bilíngue
- [x] **Dashboard** — KPIs: total de análises, ameaças, risco crítico, distribuição STRIDE, componentes mais frequentes, análises recentes
- [x] **Autenticação** — Cadastro por convite (código único), login com JWT (access 15min + refresh 7 dias), refresh automático silencioso
- [x] **Perfil do Usuário** — Nome, contato, localização, profissão, senioridade, idade, idioma de preferência, barra de experiência no app
- [x] **Configurações** — Provedor IA (Google Gemini, OpenAI, DeepSeek), fallback entre provedores, fallback de diagrama (YOLO+IA ou só IA), cursor personalizado, ativar/desativar Hermes
- [x] **Internacionalização** — pt-BR e en-US completos (~300 chaves cada), toggle na navbar, preferência salva por usuário
- [x] **Tempo de Uso** — Contador de segundos ativos no sistema, salvo em banco, exibido na sidebar com tooltip
- [x] **Custom Cursor** — Círculo + ponto animado estilo moonshot.ai, cresce em elementos interativos, configurável

---

## Destaques Técnicos

### Análise de Diagramas com YOLOv8 + Fallback Hermes

O sistema utiliza **YOLOv8n (Ultralytics 8.3)** pré-treinado para detectar 15 classes de componentes de arquitetura em diagramas: `user, server, database, api, load_balancer, firewall, message_queue, cache, cdn, dns, microservice, gateway, storage, container, identity_provider`. O modelo foi treinado a partir de um dataset mesclado de **7 datasets do Roboflow** (network-topology, class-diagram, uml-diagram, diagram-detection, diagram-automation, code-vs-diagram, class-diagram-inheritance), totalizando **~5000 imagens** com aumento de dados (flips, brightness). O treinamento foi feito em 100 épocas com batch 16, imagem 640px, otimizador AdamW, atingindo mAP@0.5 ~0.579.

**Falha = Fallback**: Quando o YOLO retorna 0 componentes (confiança insuficiente ou diagrama muito diferente do treinamento), o sistema ativa o **Hermes Fallback** — o diagrama é enviado para um modelo de IA com visão (Gemini 2.5 Flash/Pro ou GPT-4o) que analisa a imagem e extrai os componentes textualmente. O fallback é configurável: modo "YOLO + Hermes" (recomendado) ou "Apenas Hermes" (ignora YOLO).

### STRIDE Threat Modeling

A metodologia **STRIDE** (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) é aplicada automaticamente a cada componente detectado. Cada tipo de componente mapeia para ameaças STRIDE específicas (ex: `database` → Tampering, Info Disclosure, DoS; `firewall` → DoS, Tampering). Para cada componente e suas ameaças, o sistema consulta a base de conhecimento e associa vulnerabilidades CVE/CWE (ex: CWE-89 SQL Injection para `api`) e contramedidas (ex: "Input Validation" para CWE-89). O **risk score** geral é calculado como `(total_threats / (components * 6)) * 10`, normalizado em uma escala de 0 a 10.

A base de conhecimento contém **12 vulnerabilidades** e **11 contramedidas** pré-populadas em português e inglês, cobrindo desde Improper Authentication (CWE-287, CVSS 8.1) até Server-Side Request Forgery (CWE-918, CVSS 8.8).

### Hermes — Agente LangGraph Multi-Provedor

O Hermes é um **agente de IA baseado em LangGraph** (StateGraph) com 11 ferramentas acopladas que cobrem todo o ecossistema do RiftShield: `analyze_diagram`, `list_reports`, `list_threats`, `list_vulnerabilities`, `list_countermeasures`, `dashboard_stats`, `list_dataset`, `list_models`, `rag_kb`, `last_threat_report`. O grafo possui 2 nós (Supervisor LLM + ToolNode) com roteamento condicional baseado em tool calls.

**Três provedores de IA** com fallback automático:

| Provedor | Modelos | API |
|---|---|---|
| Google Gemini | gemini-2.5-flash-lite, gemini-2.5-flash, gemini-2.5-pro | `langchain-google-genai` |
| OpenAI | gpt-4o-mini, gpt-4o, gpt-4-turbo | `langchain-openai` |
| DeepSeek | deepseek-chat, deepseek-reasoner | `langchain-openai` (base_url: api.deepseek.com) |

Todos com `temperature=0.2`, `max_retries=2`, tools bind via `.bind_tools()`. O fallback tenta Google → OpenAI → DeepSeek quando ativado. O Hermes também possui um **sistema RAG** próprio usando `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` + FAISS para consultas aprofundadas na base de conhecimento.

### Comparação de Arquiteturas com Sugestão por IA

Duas imagens de arquitetura passam pelo pipeline completo (YOLO + STRIDE). O sistema calcula:
- **Diff de componentes**: adicionados, removidos, comuns
- **Diff STRIDE**: delta por categoria
- **Diff de vulnerabilidades**: mitigadas vs. novas
- **Diff de risco**: `risk_b - risk_a`

O veredito é automático baseado no delta de risco. Além disso, o Hermes (Gemini/GPT-4o) analisa ambas as imagens e sugere uma **"Arquitetura C — Mesclagem Inteligente"**, combinando os melhores aspectos de segurança de cada uma com justificativas, benefícios e STRIDE esperado.

### Exportação com PDF Bilíngue e Gráficos

Quatro formatos de exportação: **JSON** (completo e indentado), **CSV** (seções com cabeçalhos), **Excel** (uma planilha por seção com cabeçalhos laranja), **PDF** (relatório estilizado via WeasyPrint + Jinja2 com gráficos matplotlib). Os gráficos incluem: status das análises (barras), distribuição STRIDE (barras), split do dataset (pizza), severidade de vulnerabilidades (barras), performance de modelos (barras). Todos os labels são dinâmicos — o PDF é gerado em **português ou inglês** conforme a preferência do usuário.

### Simulação de Ataques

Cinco cenários pré-definidos com detalhes técnicos realistas:

| Ataque | Severidade | Detalhes |
|---|---|---|
| DDoS | critical | Botnet 10K nós, 50K req/s, 40 Gbps |
| SQL Injection | critical | UNION SELECT, dump de tabelas |
| XSS | high | Session theft via document.cookie |
| Path Traversal | high | Acesso a /etc/passwd, chaves SSH |
| SSRF | high | Targeting cloud metadata services |

Cada simulação consulta a base de contramedidas pelas CWEs correspondentes e registra o evento no log do Hermes.

---

## Stack Tecnológica

### Backend (Python 3.11+, FastAPI)
| Tecnologia | Versão | Aplicação |
|---|---|---|
| FastAPI / Uvicorn | ≥0.115 / ≥0.34 | API REST, rotas, validação |
| Motor / Beanie | 3.6 / 1.28 | MongoDB assíncrono, ODM com Pydantic |
| Ultralytics (YOLOv8) | ≥8.3 | Detecção de componentes em diagramas |
| LangGraph | ≥0.2 | Grafo de estado do agente Hermes |
| LangChain (Google, OpenAI, Community) | ≥0.3 | LLM factory, tool binding, RAG |
| PyJWT / bcrypt | ≥2.10 / ≥4.2 | Autenticação JWT + hash de senha |
| WeasyPrint / Jinja2 | — | Geração de PDF a partir de HTML |
| Matplotlib / openpyxl | — | Gráficos no PDF / exportação Excel |
| Sentence-Transformers / FAISS | — | Embeddings multilíngue + vector store RAG |
| Pytest / httpx | ≥8.3 / ≥0.28 | Testes unitários e de integração |

### Frontend (React 19, TypeScript, Vite)
| Tecnologia | Versão | Aplicação |
|---|---|---|
| React / React DOM | 19.2.5 | Interface de usuário |
| Chakra UI | 2.8.2 | Design system, componentes, tema claro/escuro |
| Vite | 8.0.9 | Bundler, dev server com HMR |
| Axios | 1.15.1 | HTTP client com interceptor de refresh automático |
| react-router-dom | 7.14.1 | Roteamento client-side |
| Framer Motion | 10.16.4 | Animações de transição |
| Lucide React / Bootstrap Icons | — | Biblioteca de ícones |
| react-markdown | 10.1.0 | Renderização de markdown no chat |
| react-dropzone | 14.3.0 | Upload drag-and-drop |
| Zustand | 5.0.12 | Gerenciamento de estado leve |
| Vitest / Testing Library | ≥3.1 / ≥16 | Testes unitários frontend |

### Infraestrutura
| Tecnologia | Aplicação |
|---|---|
| Docker / Docker Compose | Containerização do backend + MongoDB |
| MongoDB 7 | Banco de dados principal (12 coleções) |
| Locust | Testes de carga da API |

---

*RiftShield — Hackathon FIAP Software Security 2026*
