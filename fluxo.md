# Fluxo do Sistema — RiftShield

## 1. Autenticação

```mermaid
graph LR
    User((Usuário)) --> Login[Login / Register]
    Login --> Auth[API Auth]
    Auth -->|JWT Access 15min| Refresh[Refresh Silencioso]
    Auth -->|JWT Refresh 7d| Refresh
    Refresh -->|Token válido| Sidebar
    Refresh -->|Expirado| Logout[Logout]
```

---

## 2. Análise de Diagramas + STRIDE

```mermaid
graph TB
    User((Usuário)) -->|Upload| Upload[Upload Diagrama]
    Upload --> Analyze[POST /analyze]
    Analyze --> YOLO[YOLOv8n]
    YOLO --> COCO[Mapear COCO → 15 classes]
    COCO --> Check{Fallback?<br/>0 componentes}
    Check -->|Sim| Hermes[Hermes Visão IA]
    Check -->|Não| STRIDE
    Hermes --> STRIDE

    subgraph STRIDE[Motor STRIDE]
        Map[Mapear Componente<br/>→ Categorias]
        Vuln[Consultar Vulnerabilidades]
        CM[Consultar Contramedidas]
        Risk[Calcular Risk Score 0-10]
        Report[Gerar ThreatReport]
        Map --> Vuln --> Risk
        Map --> CM --> Risk
        Risk --> Report
    end

    Report --> Mongo[(MongoDB)]
    Report --> Front[Exibir no Frontend]
```

---

## 3. Agente Hermes

```mermaid
graph TB
    User((Usuário)) -->|Pergunta| Chat[Chat Hermes]
    Chat --> API[POST /chat]
    API --> Graph[Grafo LangGraph]
    Graph --> Supervisor[Supervisor LLM]
    Supervisor --> CheckTools{Tool calls?}
    CheckTools -->|Sim| Tools[Tools Node<br/>11 Ferramentas]
    CheckTools -->|Não| Resposta[Resposta direta]

    Tools --> Analyze[analyze_diagram]
    Tools --> VulnTool[list_vulnerabilities]
    Tools --> CMTool[list_countermeasures]
    Tools --> RAG[rag_kb]
    Tools --> Stats[dashboard_stats]
    Tools --> Dataset[list_dataset]
    Tools --> Models[list_models]

    Analyze --> YOLO[YOLO Pipeline]
    VulnTool --> KB_V[(Vulnerabilidades)]
    CMTool --> KB_CM[(Contramedidas)]

    subgraph Provedores[Provedores LLM]
        G[Google Gemini]
        O[OpenAI]
        D[DeepSeek]
        FB{Provedor<br/>Falhou?}
    end

    Supervisor --> G
    Supervisor --> O
    Supervisor --> D
    G -->|Falha| FB
    O -->|Falha| FB
    D -->|Falha| FB
    FB -->|Tenta próximo| Supervisor

    Tools --> Supervisor
    Supervisor --> Resposta
    Resposta -->|Responde| User
```

---

## 4. Comparação de Arquiteturas

```mermaid
graph LR
    User((Usuário)) -->|Upload A e B| Comp[Comparar]
    Comp --> API[POST /compare]
    API --> InfA[Analisar A]
    API --> InfB[Analisar B]
    InfA --> YOLO[YOLO + STRIDE]
    InfB --> YOLO
    YOLO --> Diff[Calcular Diff]
    Diff --> Verdict[Veredito: A / B / Empate]

    API --> Sug[POST /suggest]
    Sug --> Hermes[Hermes Visão IA]
    Hermes --> ArqC[Arquitetura C]
    ArqC --> Mongo[(MongoDB)]
```

---

## 5. Simulação de Ataques

```mermaid
graph LR
    User((Usuário)) -->|Simular ataque| API[POST /simulate]
    API --> Templates{Templates}
    Templates -->|DDoS| DDoS[Crítico<br/>50K req/s, 10K nós]
    Templates -->|SQLi| SQLi[Crítico<br/>Injeção UNION SELECT]
    Templates -->|XSS| XSS[Alto<br/>Roubo de sessão]
    Templates -->|Path Traversal| PT[Alto<br/>Acesso etc/passwd]
    Templates -->|SSRF| SSRF[Alto<br/>Cloud metadata]
    DDoS --> CM[Consultar Contramedidas]
    SQLi --> CM
    XSS --> CM
    PT --> CM
    SSRF --> CM
    CM --> Log[Registrar no Log Hermes]
    Log --> Mongo[(MongoDB)]
```

---

## 6. Treinamento + Dataset

```mermaid
graph LR
    subgraph Dataset[Gerenciar Dataset]
        Upload[Upload imagens + labels]
        Split[Atribuir split<br/>train/val/test]
        Aug[Aumento de dados<br/>Flip, Brilho]
        Stats[Estatísticas]
    end

    subgraph Training[Fine-Tune YOLO]
        Load[Carregar yolov8n.pt]
        Train[Treinar 10 épocas<br/>Batch 16, 640px]
        Resume[Resume checkpoint]
        Save[Salvar best.pt]
    end

    User --> Upload
    Upload --> Split
    Split --> Aug
    Aug --> Stats
    User --> Train
    Train --> Save
    Save --> Mongo[(MongoDB)]
```

---

## 7. Exportação

```mermaid
graph LR
    User((Usuário)) -->|Selecionar seções e formato| Export[Exportar]
    Export --> API[POST /export]
    API --> Collect[Coletar dados<br/>de todas as seções]
    Collect --> Mongo[(MongoDB)]

    API --> Format{Formato}
    Format -->|JSON| JSON[JSON indentado]
    Format -->|CSV| CSV[CSV por seção]
    Format -->|Excel| Excel[Planilhas estilizadas]
    Format -->|PDF| PDF[PDF com gráficos]

    PDF --> Charts[Matplotlib<br/>Barras, Pizza]
    PDF --> Lang[Labels pt-BR ou en-US]

    JSON --> ZIP[Compactar ZIP]
    CSV --> ZIP
    Excel --> ZIP
    PDF --> ZIP
    ZIP --> Download[Download]
    JSON --> Download
    CSV --> Download
    Excel --> Download
    PDF --> Download
```

---

## 8. Dashboard

```mermaid
graph LR
    User((Usuário)) -->|Acessa| Dash[Dashboard]
    Dash --> API[GET /stats]
    API --> Coletar[Agregar 5 coleções]
    Coletar --> Inferences[(InferenceResult)]
    Coletar --> Threats[(ThreatReport)]
    Coletar --> Dataset[(DatasetEntry)]
    Coletar --> Training[(TrainingLog)]
    Coletar --> Vulns[(KBVulnerability)]

    API --> KPIs[Exibir KPIs]
    KPIs --> Total[Total de Análises]
    KPIs --> Ameacas[Total de Ameaças]
    KPIs --> Risco[Risco Crítico]
    KPIs --> STRIDE[Distribuição STRIDE]
    KPIs --> Top[Top Componentes]
    KPIs --> Recentes[Análises Recentes]
```

---

## Legenda

| Cor | Significado |
|-----|-------------|
| 🔵 Azul | Ação do usuário / Frontend |
| 🟠 Laranja | API / Requisição |
| 🟢 Verde | YOLO / Detecção |
| 🟣 Roxo | STRIDE / Ameaças |
| 🟡 Amarelo | Hermes / IA |
| 🟩 Verde-água | MongoDB |
| 🩷 Rosa | Exportação |
| ⚪ Cinza | Base de Conhecimento |
