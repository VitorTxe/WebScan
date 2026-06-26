# WebScan 🛡️

**WebScan** é uma aplicação focada em identificar falhas de segurança nos headers de aplicações web. Ao submeter uma URL, o sistema realiza uma varredura em segundo plano (processamento assíncrono), analisa possíveis vulnerabilidades e traz um relatório detalhado.

## 🏗️ Arquitetura Técnica

O projeto é dividido em backend e frontend, orquestrados através do Docker Compose, garantindo fácil configuração e reprodutibilidade:

- **Backend:**
  - Node.js com Express e TypeScript.
  - **Fila de Processamento:** BullMQ auxiliado por Redis para gerenciamento assíncrono das análises.
  - **IA de Segurança:** Integração com o Google Generative AI (`@google/genai`) para análises de segurança.
- **Frontend:**
  - Single Page Application (SPA) com React (Vite).
  - Estilização moderna com Tailwind CSS e animações com Framer Motion.
  - Totalmente implementado em TypeScript.
- **Banco de Dados/Cache:** Redis, utilizado como backend para o BullMQ na gestão das filas de *jobs*.
- **Orquestração:** Docker e Docker Compose, unindo a API, Redis e o Frontend servido por Nginx.

## 📁 Estrutura de Pastas

```
.
├── backend/            # API NodeJS, workers (BullMQ) e configurações.
│   ├── src/            # Código-fonte (Express, rotas, queue, services, etc).
│   ├── Dockerfile      # Imagem Docker para o Backend.
│   ├── package.json    # Dependências Node do Backend.
│   └── ...
├── frontend/           # SPA React.
│   ├── interface/      # App frontend contendo componentes, rotas e hooks.
│   │   ├── src/        # Código-fonte do frontend (App.tsx, components/, pages/, etc).
│   │   ├── Dockerfile  # Imagem Docker multi-stage (Vite build + Nginx).
│   │   ├── package.json# Dependências do Frontend.
│   │   └── ...
│   └── ...
├── docker-compose.yml  # Configuração dos serviços e orquestração de containers.
└── README.md           # Este arquivo.
```

## ⚙️ Pré-requisitos

Para rodar este projeto localmente, você precisa ter instalados:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## 🚀 Como Executar Localmente

### 1. Configurando as Variáveis de Ambiente

Antes de iniciar os containers, você precisará definir variáveis de ambiente que o `docker-compose.yml` consome.

Crie um arquivo `.env` na raiz do projeto (ou exporte as variáveis no seu terminal) contendo:

```env
# Chave da API do Google Gemini para a análise de segurança do backend
GEMINI_API_KEY=sua_chave_gemini_aqui

# URL da API consumida pelo Frontend localmente.
# Como o backend roda na porta 3000, e você acessará pelo seu navegador:
VITE_API_URL=http://localhost:3000
```

### 2. Subindo a Aplicação

Na raiz do repositório, onde o arquivo `docker-compose.yml` se encontra, execute o seguinte comando para construir e iniciar todos os serviços:

```bash
docker-compose up --build
```
*(Você pode usar a flag `-d` para rodar em *detached mode*)*

### 3. Acessando os Serviços

Após o terminal indicar que os serviços estão rodando (Backend comunicando com o Redis e Nginx no ar):

- **Frontend:** Acesse em seu navegador: [http://localhost](http://localhost) (Porta 80 padrão do Nginx)
- **Backend API:** Disponível em [http://localhost:3000](http://localhost:3000)

## 💡 Como Usar
- Acesse a interface web.
- Insira uma URL (ex: `https://seusite.com`) no campo indicado.
- Clique no botão de analisar. O frontend se comunicará com o backend (`POST /scan`), que enfileirará uma tarefa no Redis via BullMQ.
- O Frontend passará a consultar o progresso do job via (`GET /scan/:jobId`).
- Ao finalizar a varredura, o relatório das falhas e dicas de mitigação de vulnerabilidades (gerados pela IA) será apresentado.
