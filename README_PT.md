<img src="frontend/public/Rift_Shield_github.psd.png" alt="Henrique Bisneto's banner">

# RiftShield — Plataforma de Detecção de Ameaças e Segurança com IA

<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/🇺🇸-English-blue" alt="English"></a>
  <a href="README_PT.md"><img src="https://img.shields.io/badge/🇧🇷-Português-green" alt="Português"></a>
</p>

**RiftShield** é uma plataforma de segurança com inteligência artificial para detecção de ameaças, análise de vulnerabilidades e gerenciamento de base de conhecimento em segurança. Construída com **FastAPI** (Python) e **React** (TypeScript), integra detecção de objetos baseada em YOLO para monitoramento de segurança, uma base de conhecimento classificada por STRIDE e um sistema completo de autenticação com controle de acesso via código de convite.

---

## Funcionalidades

- **Detecção de Ameaças com IA** — Inferência de modelo YOLO para análise de imagens de segurança
- **Base de Conhecimento de Vulnerabilidades** — Vulnerabilidades classificadas por STRIDE com pontuação CVSS
- **Relatórios de Ameaças** — Geração de relatórios detalhados de ameaças a partir de resultados de inferência
- **Gerenciamento de Dataset** — Upload, listagem e aumento de datasets de treinamento
- **Treinamento de Modelos** — Treinar e gerenciar modelos YOLO com versionamento e ativação
- **Analytics do Dashboard** — Estatísticas de uso, performance de modelos e métricas de segurança
- **Registro Apenas por Convite** — Cadastro seguro via códigos de convite de uso único com atribuição de papel
- **Autenticação JWT** — Fluxo de token de acesso + refresh com renovação automática silenciosa
- **Tema Claro/Escuro** — Interface adaptativa com persistência de tema
- **Sistema de Notificações Toast** — Alertas flutuantes não-bloqueantes com animações

---

## Tecnologias

### Backend

| Tecnologia | Propósito |
|---|---|
| Python 3.11 + FastAPI | Framework REST API |
| MongoDB + Beanie ODM | Banco de dados documental com ODM assíncrono |
| Motor | Driver assíncrono MongoDB |
| PyJWT | Geração e verificação de tokens de acesso e refresh |
| bcrypt | Hash de senhas |
| Ultralytics YOLO | Inferência e treinamento de modelo de detecção de objetos |
| Uvicorn | Servidor ASGI com hot-reload |
| Pydantic | Validação de schemas e gerenciamento de configurações |

### Frontend

| Tecnologia | Propósito |
|---|---|
| React 19 + TypeScript | Framework de interface |
| Vite 8 | Ferramenta de build e servidor de desenvolvimento |
| Chakra UI v2 | Biblioteca de componentes |
| Axios | Cliente HTTP com interceptor de renovação automática |
| React Router DOM v7 | Roteamento client-side |
| Zustand | Gerenciamento de estado leve |
| Framer Motion | Animações |
| Lucide React | Ícones |

### Infraestrutura

| Tecnologia | Propósito |
|---|---|
| Docker & Docker Compose | Orquestração de containers |
| MongoDB 7 | Banco de dados principal |

---

## Estrutura do Projeto

```
riftshield/
├── backend/
│   ├── src/
│   │   ├── main.py                          # Ponto de entrada do FastAPI & lifespan
│   │   ├── conftest.py                      # Configuração do Pytest
│   │   │
│   │   ├── config/
│   │   │   ├── database.py                  # Inicialização MongoDB + Beanie
│   │   │   └── settings.py                  # Configurações baseadas em ambiente
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.py                      # Re-export do get_current_user
│   │   │   ├── dependencies.py              # Injeção de dependência JWT
│   │   │   └── error_handler.py             # Handlers globais de exceção
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/                        # Módulo de autenticação
│   │   │   │   ├── controllers/auth_controller.py
│   │   │   │   ├── models/
│   │   │   │   │   ├── user_model.py        # Documento de usuário
│   │   │   │   │   └── invite_model.py      # Documento de código de convite
│   │   │   │   ├── routes/auth_routes.py
│   │   │   │   ├── schemas/auth_schema.py
│   │   │   │   └── services/
│   │   │   │       ├── auth_service.py      # Registro/login/refresh/logout
│   │   │   │       └── invite_service.py    # Criar/validar/usar códigos de convite
│   │   │   │
│   │   │   ├── dashboard/                   # Módulo do dashboard
│   │   │   │   ├── controllers/dashboard_controller.py
│   │   │   │   ├── routes/dashboard_routes.py
│   │   │   │   ├── schemas/dashboard_schema.py
│   │   │   │   └── services/dashboard_service.py
│   │   │   │
│   │   │   ├── inference/                   # Módulo principal de inferência
│   │   │   │   ├── agents/stride_kb.py      # Agente de classificação STRIDE
│   │   │   │   ├── controllers/
│   │   │   │   │   ├── inference_controller.py
│   │   │   │   │   ├── kb_controller.py
│   │   │   │   │   └── training_controller.py
│   │   │   │   ├── dataset/                 # Gerenciamento de dataset
│   │   │   │   │   ├── dataset_controller.py
│   │   │   │   │   ├── dataset_model.py
│   │   │   │   │   ├── dataset_routes.py
│   │   │   │   │   ├── dataset_schema.py
│   │   │   │   │   └── dataset_service.py
│   │   │   │   ├── ml-workflow/
│   │   │   │   │   └── ml_train_yolo.py     # Pipeline de treinamento YOLO
│   │   │   │   ├── models/
│   │   │   │   │   ├── inference_model.py   # Documento de resultado de inferência
│   │   │   │   │   ├── kb_model.py          # Documentos de vulnerabilidade/contramedida
│   │   │   │   │   └── threat_model.py      # Documento de relatório de ameaça
│   │   │   │   ├── routes/
│   │   │   │   │   ├── inference_routes.py
│   │   │   │   │   ├── kb_routes.py
│   │   │   │   │   └── training_routes.py
│   │   │   │   ├── schemas/
│   │   │   │   │   ├── inference_schema.py
│   │   │   │   │   ├── kb_schema.py
│   │   │   │   │   ├── threat_schema.py
│   │   │   │   │   └── training_schema.py
│   │   │   │   ├── services/
│   │   │   │   │   ├── inference_service.py # Lógica de inferência YOLO
│   │   │   │   │   ├── kb_service.py        # Semeadura e consultas da KB
│   │   │   │   │   ├── threat_service.py    # Geração de relatórios de ameaça
│   │   │   │   │   └── training_service.py  # Orquestração de treinamento YOLO
│   │   │   │   └── tests/
│   │   │   │       ├── test_dataset.py
│   │   │   │       ├── test_inference.py
│   │   │   │       ├── test_kb.py
│   │   │   │       └── test_training.py
│   │   │   │
│   │   │   ├── users/                       # Módulo de perfil de usuário
│   │   │   │   └── routes/user_routes.py    # GET /users/me
│   │   │   │
│   │   │   └── uploads/                     # Armazenamento de arquivos enviados
│   │   │
│   │   └── shared/
│   │       └── utils/
│   │           ├── errors.py                # Classes de erro personalizadas
│   │           └── token.py                 # Helpers de codificação/decodificação JWT
│   │
│   ├── .env.example
│   ├── Dockerfile
│   ├── Dockerfile.prod
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx                         # Ponto de entrada
│   │   ├── theme.ts                         # Configuração do tema Chakra UI
│   │   │
│   │   ├── components/
│   │   │   ├── App.tsx                      # Componente raiz com roteador
│   │   │   ├── Auth/                        # Login e registro
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── components/AuthFields.tsx
│   │   │   │   ├── components/AuthToggle.tsx
│   │   │   │   ├── hooks/useAuthForm.ts
│   │   │   │   ├── services/auth-service.ts
│   │   │   │   ├── styles/theme-fx.ts
│   │   │   │   └── types/index.ts
│   │   │   ├── Layout/                      # Shell da aplicação
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── MainLayout.tsx
│   │   │   │   ├── nav-config.ts
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── Theme/ThemeToggle.tsx
│   │   │   └── Toast/                       # Sistema de notificações toast
│   │   │       ├── Toast.tsx
│   │   │       ├── components/ToastContext.tsx
│   │   │       ├── components/CloseButton.tsx
│   │   │       ├── hooks/useToastAnimation.ts
│   │   │       ├── styles/theme-fx.ts
│   │   │       ├── types/index.ts
│   │   │       └── utils/
│   │   │           ├── constants.tsx
│   │   │           └── styles.ts
│   │   │
│   │   ├── context/AuthContext.tsx           # Gerenciamento de estado de autenticação
│   │   ├── middleware/api.ts                 # Axios com interceptor de renovação automática
│   │   ├── pages/                            # Páginas de rota
│   │   │   ├── Dashboard.tsx
│   │   │   ├── DatasetPage.tsx
│   │   │   ├── InferencePage.tsx
│   │   │   ├── TrainingPage.tsx
│   │   │   ├── ThreatsPage.tsx
│   │   │   ├── VulnerabilitiesPage.tsx
│   │   │   ├── CountermeasuresPage.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── Settings.tsx
│   │   ├── router/
│   │   │   ├── index.tsx                    # Definições de rota
│   │   │   └── paths.ts                     # Constantes de caminho de rota
│   │   ├── services/                        # Módulos de serviço da API
│   │   │   ├── dashboard-service.ts
│   │   │   ├── dataset-service.ts
│   │   │   ├── inference-service.ts
│   │   │   ├── kb-service.ts
│   │   │   └── training-service.ts
│   │   └── styles/                          # Efeitos globais de tema
│   │       ├── app-theme-fx.ts
│   │       └── inference-theme-fx.ts
│   │
│   ├── Dockerfile
│   └── vite.config.js
│
└── README.md
```

---

## Primeiros Passos

### Pré-requisitos

- Docker & Docker Compose
- Node.js 20+ (para desenvolvimento local do frontend)
- Python 3.11+ (para desenvolvimento local do backend)

### Configuração

```bash
# Clone o repositório
git clone https://github.com/bisnet0/RiftShield.git
cd RiftShield
```

#### Usando Docker (recomendado)

```bash
# Inicie o backend (API na :3000, MongoDB na :27017)
cd backend
docker compose up -d --build

# Inicie o frontend (na :1999)
cd ../frontend
docker compose up -d --build
```

#### Desenvolvimento Local

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # ou: venv\Scripts\activate
pip install -r requirements.txt
cd src
uvicorn main:app --reload --port 3000

# Frontend (terminal separado)
cd frontend
npm install
npm run dev -- --port 1999
```

### Primeiro Acesso (Sistema de Código de Convite)

Na primeira inicialização, o backend gera automaticamente um código de convite e o exibe nos logs:

```bash
docker logs riftshield-backend | grep "Invite code"
# 🔑 Código de convite criado: a1b2c3d4e5f6g7h8...
```

Use este código para se registrar em `/api/auth/register` ou através do formulário de login.

Gere novos códigos de convite (requer admin):

```bash
curl -X POST http://localhost:3000/api/auth/invite \
  -H "Cookie: accessToken=<seu_token>"
# {"invite": {"code": "novo-codigo...", "role": "ADMIN"}}
```

---

## Endpoints da API

### Autenticação (`/api/auth`)

| Método | Caminho | Descrição | Autenticação |
|---|---|---|---|
| `POST` | `/api/auth/register` | Registrar com código de convite | Não |
| `POST` | `/api/auth/login` | Login com email + senha | Não |
| `POST` | `/api/auth/refresh` | Renovar token de acesso | Cookie |
| `POST` | `/api/auth/logout` | Logout e limpeza de sessão | Cookie |
| `POST` | `/api/auth/invite` | Gerar código de convite | Admin |

### Usuários (`/api/users`)

| Método | Caminho | Descrição | Autenticação |
|---|---|---|---|
| `GET` | `/api/users/me` | Obter perfil do usuário atual | Cookie |

### Dashboard (`/api/dashboard`)

| Método | Caminho | Descrição | Autenticação |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | KPIs e métricas do dashboard | Cookie |

### Inferência (`/api/inference`)

| Método | Caminho | Descrição | Autenticação |
|---|---|---|---|
| `POST` | `/api/inference/analyze` | Executar inferência YOLO em imagem | Cookie |
| `POST` | `/api/inference/analyze-threat` | Analisar ameaça a partir de inferência | Cookie |
| `GET` | `/api/inference/reports` | Listar relatórios de inferência | Cookie |
| `GET` | `/api/inference/reports/{id}` | Obter detalhes do relatório | Cookie |
| `DELETE` | `/api/inference/reports/{id}` | Deletar um relatório | Cookie |
| `GET` | `/api/inference/threats` | Listar relatórios de ameaça | Cookie |
| `GET` | `/api/inference/threats/{id}` | Obter detalhes do relatório de ameaça | Cookie |

### Dataset (`/api/dataset`)

| Método | Caminho | Descrição | Autenticação |
|---|---|---|---|
| `POST` | `/api/dataset/upload` | Enviar imagens para o dataset | Cookie |
| `GET` | `/api/dataset/entries` | Listar entradas do dataset | Cookie |
| `DELETE` | `/api/dataset/entries/{id}` | Deletar uma entrada | Cookie |
| `POST` | `/api/dataset/entries/{id}/augment` | Aplicar aumento de dados | Cookie |
| `GET` | `/api/dataset/stats` | Estatísticas do dataset | Cookie |

### Base de Conhecimento (`/api/kb`)

| Método | Caminho | Descrição | Autenticação |
|---|---|---|---|
| `GET` | `/api/kb/vulnerabilities` | Listar vulnerabilidades (pesquisável) | Cookie |
| `GET` | `/api/kb/countermeasures` | Listar contramedidas | Cookie |

### Treinamento (`/api/training`)

| Método | Caminho | Descrição | Autenticação |
|---|---|---|---|
| `POST` | `/api/training/train` | Iniciar treinamento YOLO | Cookie |
| `GET` | `/api/training/models` | Listar modelos treinados | Cookie |
| `GET` | `/api/training/models/{id}` | Obter detalhes do log de treinamento | Cookie |
| `POST` | `/api/training/models/activate` | Ativar uma versão de modelo | Cookie |

### Saúde

| Método | Caminho | Descrição |
|---|---|---|
| `GET` | `/api/health` | Verificação de saúde |

---

## Payloads de Registro e Login

### `POST /api/auth/register`

```json
{
  "name": "Henrique Bisneto",
  "email": "usuario@email.com",
  "password": "senha_forte",
  "invite_code": "a1b2c3d4e5f6g7h8...",
  "phone": "75988456875",
  "country": "Brasil",
  "state": "Bahia",
  "city": "Serrinha"
}
```

Obrigatórios: `name`, `email`, `password`, `invite_code`
Opcionais: `phone`, `country`, `state`, `city`

### `POST /api/auth/login`

```json
{
  "email": "usuario@email.com",
  "password": "senha_forte"
}
```

---

## Variáveis de Ambiente

Copie `backend/.env.example` para `backend/.env`:

```env
DATABASE_URL="mongodb://mongo:27017/riftshield"
JWT_SECRET="change-me-to-a-random-secret"
JWT_REFRESH_SECRET="change-me-to-another-random-secret"
PORT=3000
FRONTEND_URL="http://localhost:1999"
```

---

## Executando Testes

```bash
cd backend
docker compose exec backend pytest src/ -v
```

Testes disponíveis para: Dashboard, Dataset, Inferência, Base de Conhecimento, Treinamento.

---

## A Fazer

- [ ] Adicionar pipeline CI/CD automatizado
- [ ] Implantar em ambiente de produção
- [ ] Adicionar testes de frontend (Vitest)
- [ ] Adicionar paginação nas listas de vulnerabilidades/contramedidas
- [ ] Adicionar controle de acesso baseado em papéis para endpoints admin
- [ ] Adicionar WebSocket para progresso de treinamento em tempo real
- [ ] Adicionar alternância de persistência de modo escuro
- [ ] Adicionar exportação de relatórios (PDF)
- [ ] Adicionar edição de perfil de usuário
- [ ] Adicionar fluxo de recuperação de senha
- [ ] Adicionar limitação de taxa em endpoints de autenticação
- [ ] Adicionar logging de auditoria para eventos de segurança

---

## Licença

Este projeto está sob a licença **MIT**.
Criado com por **Henrique Bisneto — 2026**
