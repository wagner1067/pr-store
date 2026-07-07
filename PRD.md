# Product Requirement Document (PRD) — Ecossistema PR Store (Vercel & Supabase Decoupled Architecture)

## 1. Visão Geral do Produto

O ecossistema **PR Store** é uma plataforma unificada de e-commerce e ERP voltada para o nicho de vestuário, tênis e acessórios premium (estilo streetwear). O sistema adota uma arquitetura desacoplada de microsserviços/módulos independentes: o Frontend de interface pública e administrativa roda em **Next.js 15 (Vercel)** e as regras de negócio, webhooks, processamento e conexões rodam em uma API RestFull construída com **NestJS (Node.js)**. O banco de dados PostgreSQL e a autenticação segura ficam centralizados na nuvem do **Supabase**, com cache distribuído no **Redis**. Devido à localização geográfica em região de fronteira internacional, a plataforma conta nativamente com uma arquitetura de internacionalização plena (três idiomas) e inteligência híbrida de fretes.

## 2. Stack Tecnológica & Ecossistema de Ferramentas (MCP & Cloud)

* **Frontend Framework:** Next.js 15 (App Router) + TypeScript implantado na Vercel.
* **Backend Framework:** NestJS (Node.js) estruturado com módulos independentes, pipes de validação e injetores.
* **Design System & UI:** Tailwind CSS + Shadcn UI (Radix UI para acessibilidade).
* **Design & Prototipagem:** Figma REST API consumido via Figma Access Token ativo no ambiente para sincronização de tokens de design e componentes visuais.
* **Gateway de Pagamento Principal:** InfinitePay API (Documentação de Integração: <https://code.infinitepay.io/>) para processamento transparente de PIX e Cartões de Crédito/Débito.
* **Camada do Banco de Dados (MCP Supabase):** PostgreSQL gerenciado via Prisma ORM + Infraestrutura de autenticação corporativa (Supabase Auth).
* **Camada de Caching & Real-Time Locks:** Redis para controle de tráfego por IP (Rate Limiting) e travas de concorrência de estoque em tempo real.
* **Armazenamento & Mensageria (MCP Firebase):** Firebase Storage para mídias de produtos e Firebase Auth para disparos de tokens OTP (2FA).
* **Automação de Arquivos e Código (MCP Filesystem & GitHub):** Provisionamento direto da arquitetura local de pastas e esteiras de versionamento e commits automáticos.
* **Processamento de Mídia:** Node.js Sharp API para compra e compressão automática nos formatos WebP/AVIF.

## 3. Requisitos Funcionais (FR)

### 3.1 E-commerce Público

* **FR-01 (Navegação Dinâmica):** O sistema deve prover rotas amigáveis estruturadas por Categorias (Roupas, Tênis, Acessórios) e permitir subfiltros laterais (Shadcn Sheet) por Marcas e tamanhos.
* **FR-02 (Promoção Relâmpago):** A Home deve conter componentes destacados com contadores regressivos (Countdown Timers) gerenciados e validados pelo servidor para prevenção de fraudes client-side.
* **FR-03 (Vitrine de Novidades):** Uma seção dinâmica automatizada deve listar os produtos mais recentes inseridos no catálogo do banco de dados do Supabase.
* **FR-04 (Captação de Leads Obrigatória):** No ato da compra pelo e-commerce, o sistema deve salvar compulsoriamente o nome e o número de telefone verdadeiro do cliente no banco de dados para automação de campanhas de marketing e envio de promoções futuras.
* **FR-05 (Checkout Transparente via InfinitePay):** Processamento nativo de Pix, Cartão de Crédito parcelado e Débito integrado diretamente ao ecossistema da InfinitePay com tratamento de webhooks de confirmação instantânea.
* **FR-06 (Logística Híbrida):** Cálculo logístico acionando simultaneamente a API dos Correios e Moto Frete regional baseado no CEP local.
* **FR-07 (Atendimento Inteligente):** Widget flutuante de chat com uma IA de suporte técnico serverless para responder sobre tamanhos e inventário + botão direcionador para o WhatsApp.

### 3.2 Dashboard ERP Administrativo

* **FR-08 (Autenticação Verificada JWT/Bcrypt):** Os funcionários e administradores devem criar perfis utilizando obrigatoriamente E-mail e Número de Celular verdadeiros e verificados por token OTP. As senhas devem ser criptografadas via Bcrypt e a sessão deve ser mantida via tokens JWT inseridos em Cookies criptografados (`HttpOnly`). O fluxo de recuperação de senha deve operar via validação temporária por SMS ou E-mail.
* **FR-09 (Módulo de Contas Restrito - Admin):** Inclusão de uma área financeira de "Contas a Pagar e Receber" protegida por Server-Side Middleware, cuja visualização e manipulação são autorizadas única e exclusivamente ao perfil Admin.
* **FR-10 (CRUD de Produtos por Grade):** O formulário de cadastro de produtos deve interceptar a subcategoria escolhida (Camiseta, Moletom, Calça, Tênis) e renderizar de forma nativa e pré-definida os respectivos tamanhos (letras P/M/G/GG ou números de calça/calçado), salvando as quantidades em formato JSON atômico. O upload de mídias via Drag-and-Drop deve passar pelo NestJS, sofrer compressão via Sharp e salvar no Firebase Storage. A criação de novos produtos é de exclusividade do Admin.
* **FR-11 (Métricas Visuais Segmentadas por RBAC):**
  * *Nível Funcionário/Vendedor:* Consegue consultar exclusivamente o volume e o histórico de suas próprias vendas efetuadas, filtradas por dia, semana ou mês.
  * *Nível Admin:* Detém visibilidade macro irrestrita, visualizando os gráficos de desempenho (Shadcn Charts) de todos os funcionários da empresa agrupados por dia, semana, mês ou consolidado anual para medição de rendimento e batimento de metas.
* **FR-12 (Controle de Caixa e PDV):** Interface simplificada de Frente de Caixa (PDV) para registro ágil de vendas presenciais. Módulo de Fechamento de Caixa diário para conciliation das entradas com as vendas digitais para checagem se o caixa bateu no fim do turno.
* **FR-13 (Controle de Gastos):** Área dedicada para o lançamento e abatimento de despesas, custos fixos e variáveis da operação física conectado diretamente ao financeiro geral.
* **FR-14 (Inteligência de Compras - Curva ABC):** Geração de relatório consolidado ordenando os produtos com maior rotatividade para otimizar os pedidos de reposição com fornecedores.
* **FR-15 (Módulo de Crediário Próprio - Promissória):** Opção de pagamento em "Promissória" associando o débito ao telefone do cliente. O painel deve emitir alertas automáticos de inadimplência sinalizando quem deve, valores acumulados, datas de vencimento e habilitar botão de cobrança via WhatsApp.
* **FR-16 (Gestão e Busca de Pedidos/Orders):** Tabela de dados robusta (Shadcn Data-Table) com paginação e filtros para consulta, gerenciamento e controle de qualquer pedido efetuado no e-commerce. O sistema deve permitir a varredura e localização imediata de uma Order digitando o seu ID único ou o nome do comprador associado.
* **FR-17 (Atualização Rápida de Estoque por Grade):** O Dashboard deve prover uma interface simplificada de busca onde o Admin consegue carregar a grade atual de um item de catálogo existente (por ID ou Nome) para registrar a entrada de novos lotes de mercadoria, incrementando as unidades de cada tamanho diretamente no banco PostgreSQL via Prisma e limpando o cache correspondente no Redis.
* **FR-18 (Busca Avançada de Clientes e Catálogo):** O Dashboard ERP deve disponibilizar componentes de pesquisa capazes de filtrar e trazer na mesma tela os dados detalhados de Clientes (por Nome ou ID) e de Produtos (por Nome ou ID), realizando a varredura indexada diretamente no banco Supabase em menos de 50ms.

## 4. Requisitos Não-Funcionais (NFR) & CyberSegurança

* **NFR-01 (Rate Limiting & Blindagem DoS):** O backend NestJS deve implementar middleware conectado ao Redis para limitação de requisições por IP nas rotas de login, checkout da InfinitePay e recuperação de acesso.
* **NFR-02 (Validação de Concorrência de Estoque Crítico):** Se dois ou mais clientes estiverem na página de um produto cujo estoque possui apenas 1 unidade disponível, o sistema aplicará um lock pessimista no Redis. No exato milissegundo em que o primeiro cliente confirmar o checkout com sucesso, o backend NestJS deve transmitir um evento via WebSocket para os demais frontends em Next.js, atualizando a página deles instantaneamente para "Esgotado", bloqueando transações duplicadas e estoque negativo.
* **NFR-03 (Isolamento Absoluto de Secrets):** Nenhuma chave de API ou credencial da InfinitePay, Supabase, Firebase, OpenAI ou Figma Token pode estar exposta no client-side. Todas as transações externas ocorrem obrigatoriamente protegidas dentro do servidor NestJS, injetadas nas variáveis de ambiente seguras da Vercel.
* **NFR-04 (Segurança de Sessão):** Fica terminantemente proibido o uso de `localStorage` ou `sessionStorage` para guardar tokens JWT ou informações financeiras corporativas. Toda autenticação de rotas privadas utiliza Cookies com as flags `HttpOnly`, `Secure` e `SameSite=Strict`.
* **NFR-05 (Velocidade e Baixa Latência Vercel Edge):** O tempo de carregamento de página (LCP) no e-commerce deve ser inferior a 1.5 segundos. A aplicação deve utilizar a arquitetura de Next.js Streaming e React Suspense com Skeleton Screens do Shadcn UI, dividindo a renderização de dados pesados e reduzindo o tempo de resposta inicial das telas do ERP para menos de 200ms.
* **NFR-06 (Privacidade do ERP no Google):** O arquivo `robots.txt` deve conter diretivas explícitas de bloqueio de indexação (`Disallow: /admin`) e todas as páginas privadas devem forçar metatags `noindex, nofollow` no cabeçalho HTTP do servidor para total ocultação de relatórios financeiros e listas de promissórias de motores de busca.
* **NFR-07 (CI/CD Pipeline):** Workflows de integração e entrega contínua integrados via GitHub para a Vercel devem rodar testes de compilação automáticos, realizando o deploy em produção de todo o sistema e do Agente de IA sem quebras de integridade de dados e sem dessincronização de estoque.
* **NFR-08 (Mapeamento de Latência e Cache):** Todas as requisições de leitura de catálogo estático devem bater primeiro na camada de cache do Redis antes de consultar o banco de dados principal.
* **NFR-09 (Otimização de Payload de Banco de Dados):** Toda e qualquer busca estruturada no banco PostgreSQL via Prisma deve implementar projeção seletiva de campos (`select`) e paginação obrigatória por cursor limitando o retorno a no máximo 20 registros por página nas tabelas do Shadcn UI.
* **NFR-10 (Indexação Relacional no Banco):** A modelagem de dados no Supabase deve conter índices explícitos nas tabelas de `Vendas`, `Estoque`, `Orders` e `Promissórias`, garantindo que buscas por histórico de clientes ou filtros de inadimplência tragam a resposta em tempo inferior a 50 milissegundos.
