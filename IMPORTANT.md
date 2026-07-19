# IMPORTANT.md — Arquivos-Chave do Sistema

Cada funcionalidade tem um arquivo que centraliza a lógica mais crítica. Abaixo, o **arquivo mais importante** de cada feature e por quê.

---

### Análise de Diagramas → `backend/src/modules/inference/services/inference_service.py`
Centraliza o pipeline completo: carrega o modelo YOLO (best.pt), executa a detecção, filtra por confiança ≥ 0.25, formata os componentes detectados, aciona o fallback Hermes quando necessário, e persiste o `InferenceResult`. Sem ele, nenhum diagrama é analisado.

### STRIDE Threat Modeling → `backend/src/modules/inference/services/threat_service.py`
Mapeia cada componente detectado para as 6 categorias STRIDE, cruza com a base de vulnerabilidades e contramedidas, calcula o risk score geral e gera o `ThreatReport` completo. É o coração da modelagem de ameaças.

### Base de Conhecimento → `backend/src/modules/inference/services/kb_service.py`
Popula o banco com os dados iniciais de vulnerabilidades e contramedidas em pt-BR e en-US, e expõe as funções de consulta por componente, CWE, severidade e texto. Sem esse seed, a base de conhecimento ficaria vazia.

### Hermes (Agente IA) → `backend/src/modules/hermes/agents/graph.py`
Define o grafo LangGraph (StateGraph) com o nó supervisor (LLM) + ferramentas, o roteamento condicional e o fluxo de execução do assistente. Todo o comportamento do Hermes é controlado por este arquivo.

### Hermes (Provedores LLM) → `backend/src/modules/hermes/agents/llm_factory.py`
Factory que instancia o modelo correto (Google Gemini, OpenAI ou DeepSeek) com as credenciais e parâmetros do usuário, e implementa a lógica de fallback entre provedores. Sem ele, o Hermes não consegue se conectar a nenhuma IA.

### Comparação de Arquiteturas → `backend/src/modules/inference/services/comparison_service.py`
Contém a lógica de diff de componentes, STRIDE, vulnerabilidades e risco entre duas arquiteturas, além do veredito automático. É o arquivo que orquestra toda a comparação.

### Sugestão de Arquitetura (IA) → `backend/src/modules/inference/services/suggestion_service.py`
Envia ambas as imagens para o modelo de visão (Gemini/GPT-4o) com um prompt estruturado e processa a resposta em uma "Arquitetura C" mesclada. A qualidade da sugestão depende inteiramente deste prompt e do parsing.

### Simulação de Ataques → `backend/src/modules/attack/services/attack_service.py`
Define os 5 templates de ataque (DDoS, SQLi, XSS, Path Traversal, SSRF) com detalhes técnicos, mapeia para CWEs, consulta contramedidas e persiste a simulação. É o único lugar onde a lógica de ataque vive.

### Treinamento YOLO → `backend/src/modules/inference/ml-workflow/ml_train_full.py`
Script de treinamento completo com checkpoint resume, suporte a DirectML (GPU), progress callback, correção de paths WSL e cópia automática do melhor modelo para `train_results/best.pt`. Sem ele, não há como fine-tunar o modelo.

### Dataset → `backend/src/modules/inference/dataset/dataset_service.py`
Gerencia upload, listagem, deleção e aumento de dados das entradas do dataset, incluindo a validação de labels contra as 15 classes reconhecidas e a atribuição de split (train/val/test). É a camada que conecta o frontend ao MongoDB de dataset.

### Exportação → `backend/src/modules/export/services/export_service.py`
Orquestra a coleta de dados de todas as seções (inferences, threats, dataset, training, vulnerabilidades, contramedidas, comparisons, profile, settings), serializa no formato solicitado (JSON, CSV, Excel, PDF) e aplica a seleção de idioma nos campos bilíngues via `_pick()`. É o ponto único de saída de dados do sistema.

### Exportação (PDF) → `backend/src/modules/export/services/pdf_generator.py`
Gera o relatório PDF completo com gráficos matplotlib, tabelas, sumário e labels dinâmicos em pt-BR ou en-US. O dicionário `_labels(lang)` com ~80 chaves bilíngues garante que 100% do texto do PDF respeite o idioma selecionado.

### Dashboard → `backend/src/modules/dashboard/services/dashboard_service.py`
Agrega dados de 5 coleções MongoDB (InferenceResult, ThreatReport, DatasetEntry, TrainingLog, KBVulnerability) em um único objeto de estatísticas. Todos os KPIs da página inicial são calculados aqui.

### Autenticação → `backend/src/modules/auth/services/auth_service.py`
Implementa registro (com validação de invite code), login (com verificação de hash bcrypt), geração de tokens JWT (access + refresh), refresh com rotação de tokens e logout. Qualquer falha aqui quebra todo o fluxo de acesso.

### Refresh Automático → `backend/src/middleware/dependencies.py`
Middleware que, quando o access token expira, tenta refresh automático via cookie `refreshToken`, gera um novo access token e o anexa silenciosamente ao response — eliminando 401s para o usuário final.

### Internacionalização → `frontend/src/context/LanguageContext.tsx`
Provedor de contexto que carrega dinamicamente o arquivo de tradução (pt-BR ou en-US), expõe a função `t()` com suporte a placeholders, persiste a preferência do usuário no backend e notifica todos os componentes sobre mudanças de idioma.

### Perfil → `frontend/src/pages/Profile.tsx`
Página completa de perfil com campos editáveis, animação "PROGREDINDO" na barra de experiência, seleção de senioridade/idioma e integração com a API de usuário. Unifica a experiência de cadastro e acompanhamento do usuário.

### Configurações → `frontend/src/pages/Settings.tsx`
Gerencia provedor IA, modelo, chaves de API, fallbacks, cursor customizado e ativação do Hermes — com persistência no backend e switches com estilo consistente. É o painel de controle do assistente.

### Tempo de Uso → `frontend/src/components/UsageTimer.tsx`
Componente autônomo que sincroniza com o backend a cada 30s, incrementa o contador localmente a cada segundo e exibe o tempo total em tooltip via portal. Requer integração com rota de usuário e tolerância a falhas de rede.

### Custom Cursor → `frontend/src/components/CustomCursor.tsx`
Renderiza um canvas 2D com animação de círculo + ponto trailing, detecta elementos interativos por seletor, ajusta o raio dinamicamente e oculta o cursor nativo. A detecção de elementos clicáveis usa uma lista de seletores CSS.

---

*RiftShield — Hackathon FIAP Software Security 2026*
