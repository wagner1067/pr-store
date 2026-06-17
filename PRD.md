# Product Requirement Document (PRD) — Ecossistema PR Store (Vercel & Supabase Architecture)

## 1. Visão Geral do Produto

O ecossistema **PR Store** é uma plataforma unificada de e-commerce e ERP voltada para o nicho de vestuário, tênis e acessórios premium (estilo streetwear). O sistema integra em tempo real uma loja virtual de alta performance e conversão com um painel interno de controle financeiro, custos, metas e fechamento de caixa diário. Devido à localização geográfica em região de fronteira internacional, a plataforma conta nativamente com uma arquitetura de internacionalização plena (três idiomas) e inteligência híbrida de fretes, além de uma robusta infraestrutura de cybersegurança controlada e provisionada via ferramentas de protocolo MCP (**Firebase, Supabase, Stripe, Filesystem e GitHub**). Todo o Frontend e as rotas de servidor (Serverless/Edge) são hospedados na **Vercel** com integração contínua ligada ao GitHub, enquanto a persistência de banco de dados, tabelas relacionais e autenticação ficam alocadas na infraestrutura em nuvem do **Supabase**.

## 2. Stack Tecnológica & Ecossistema de Ferramentas (MCP & Cloud)

* **Frontend Framework:** Next.js 15 (App Router) + TypeScript estruturado em padrão SOLID.
* **Hospedagem & CDN Frontend:** Vercel (Edge Network) com Deploy Automatizado integrado ao GitHub.
* **Design System & UI:** Tailwind CSS + Shadcn UI (Radix UI para acessibilidade).
* **Camada do Banco de Dados (MCP Supabase):** PostgreSQL gerenciado via Prisma ORM + Infraestrutura de autenticação corporativa Supabase Auth.
* **Camada de Caching & Rate Limiting:** Redis para controle de tráfego por IP e caching de requisições de baixa latência.
* **Armazenamento & Mensageria (MCP Firebase):** Firebase Storage para mídias de produtos e Firebase Auth/Cloud Messaging para disparos de tokens OTP (2FA).
* **Gateway de Pagamento (MCP Stripe):** Processamento transparente de Cartão de Crédito e Débito com tratamento nativo de webhooks corporativos.
* **Automação de Arquivos e Código (MCP Filesystem & GitHub):** Provisionamento direto da arquitetura local de pastas e esteiras de versionamento e commits automáticos.
* **Processamento de Mídia:** Node.js Sharp API para compressão automática e redimensionamento de mídias nos formatos WebP/AVIF.

## 3. Requisitos Funcionais (FR)

### 3.1 E-commerce Público

* **FR-01 (Navegação Dinâmica):** O sistema deve prover rotas amigáveis estruturadas por Categorias (Roupas, Tênis, Acessórios) e permitir subfiltros laterais dinâmicos (Shadcn Sheet) por Marcas e tamanhos.
* **FR-02 (Promoção Relâmpago):** A Home deve conter componentes destacados com contadores regressivos (Countdown Timers) gerenciados e validados pelo servidor para prevenção de fraudes client-side.
* **FR-03 (Vitrine de Novidades):** Uma seção dinâmica automatizada deve listar os produtos mais recentes inseridos no catálogo do banco de dados do Supabase.
* **FR-04 (Captação de Leads):** O sistema deve usar modais (Shadcn Dialog) solicitando o registro do número telefônico (WhatsApp) do cliente em troca de vantagens e cupons comerciais.
* **FR-05 (Checkout Transparente):** O fluxo de pagamento deve suportar o processamento nativo de Cartão de Crédito parcelado e Débito via Stripe, unificado a módulos integrados de Pix Dinâmico e Boleto Bancário com escuta de webhooks em tempo real.
* **FR-06 (Logística Híbrida):** O cálculo de postagem deve se integrar simultaneamente à API nacional dos Correios e a um módulo de Moto Frete regional baseado no CEP local.
* **FR-07 (Atendimento Inteligente):** A interface deve disponibilizar um widget flutuante contendo uma IA de suporte técnico rodando de forma serverless para responder sobre disponibilidade e tamanhos e um botão direcionador para o WhatsApp.

### 3.2 Dashboard ERP Administrativo

* **FR-08 (Autenticação Segura 2FA):** Os funcionários devem autenticar-se através do Supabase Auth, condicionado à validação de chaves numéricas de uso único (OTP) enviadas por SMS ou E-mail gerenciados pelo Firebase. O fluxo de recuperação de credenciais deve adotar o mesmo mecanismo de verificação.
* **FR-09 (Gerenciamento de Acesso - RBAC):** O sistema deve validar os níveis de acesso no servidor. Nível Dono / Gerente detém visibilidade total (configurações, auditoria financeira, despesas). Nível Funcionário possui permissão estrita apenas para a interface de Frente de Caixa (PDV) e consulta básica de Estoque, sendo bloqueado de acessar faturamentos e gráficos de lucros.
* **FR-10 (Upload Automatizado de Mídia):** O painel deve disponibilizar uma área de Drag-and-Drop para upload de fotos. O sistema deve comprimir os arquivos via Sharp e realizar o upload para o Firebase Storage, atualizando o catálogo online em tempo real.
* **FR-11 (Métricas Visuais Financeiras):** O painel deve exibir gráficos no padrão Shadcn Charts detalhando o faturamento e volume das vendas brutas em filtros distribuídos por Dia, Mês e Ano (visível exclusivamente para o Dono).
* **FR-12 (Controle de Caixa e PDV):** Interface simplificada de Frente de Caixa (PDV) para registro ágil de vendas presenciais. Módulo de Fechamento de Caixa diário para conciliação das entradas com as vendas digitais para checagem se o caixa bateu no fim do turno.
* **FR-13 (Controle de Gastos):** Área dedicada para o lançamento e abatimento de despesas, custos fixos e variáveis da operação física conectado diretamente ao financeiro geral.
* **FR-14 (Inteligência de Compras - Curva ABC):** Geração de relatório consolidado ordenando os produtos com maior rotatividade para otimizar os pedidos de reposição com fornecedores.
* **FR-15 (Módulo de Crediário Próprio - Promissória):** Opção de pagamento em "Promissória" associando o débito ao telefone do cliente. O painel deve emitir alertas automáticos de inadimplência sinalizando quem deve, valores acumulados, datas de vencimento e habilitar botão de cobrança via WhatsApp.
* **FR-16 (Gestão de Pedidos):** Tabela de dados robusta (Shadcn Data-Table) com paginação e filtros para consulta e controle de qualquer pedido efetuado no e-commerce.

## 4. Requisitos Não-Funcionais (NFR) & Performance Extrema

* **NFR-01 (Rate Limiting & Blindagem):** O sistema deve conter middlewares de limitação de requisições baseados no IP no Redis para mitigar ataques de força bruta e DoS/DDoS nas rotas de autenticação (2FA) e checkout hospedadas na Vercel.
* **NFR-02 (Sanitização e Validação OWASP):** Todas as payloads de entrada e saída no frontend e backend devem passar por esquemas de validação do Zod, prevenindo ataques de SQL Injection e Cross-Site Scripting (XSS).
* **NFR-03 (Isolamento Absoluto de Secrets):** Nenhuma chave privada ou secret do Supabase, Firebase, Stripe ou OpenAI pode estar exposta no client-side. Todas as chaves e tokens de API devem ser injetados nas variáveis de ambiente do painel da Vercel.
* **NFR-04 (Armazenamento Secure de Sessão):** Fica proibido o armazenamento de dados sensíveis de usuários ou tokens JWT no localStorage. Tokens de sessão devem trafegar estritamente sob Cookies criptografados configurados com as propriedades `HttpOnly`, `Secure` e `SameSite=Strict`.
* **NFR-05 (Velocidade e Baixa Latência Vercel Edge):** O tempo de carregamento de página (LCP) no e-commerce deve ser inferior a 1.5 segundos. A aplicação deve utilizar a arquitetura de Next.js Streaming e React Suspense com Skeleton Screens do Shadcn UI, dividindo a renderização de dados pesados e reduzindo o tempo de resposta inicial das telas do ERP para menos de 200ms.
* **NFR-06 (SEO Técnico & Indexação):** As páginas públicas do e-commerce devem utilizar Server-Side Rendering (SSR) e suporte multi-idioma mapeado por tags `hreflang`. Dados estruturados JSON-LD (`Product`, `Offer`, `LocalBusiness`) devem ser injetados nativamente.
* **NFR-07 (Privacidade do ERP):** O arquivo `robots.txt` deve conter diretivas explícitas de bloqueio de indexação (`Disallow: /admin`) e todas as páginas privadas devem forçar metatags `noindex, nofollow` no cabeçalho HTTP do servidor para total ocultação de relatórios financeiros e listas de promissórias de motores de busca.
* **NFR-08 (CI/CD Pipeline & Vercel Deploy):** Workflows de integração e entrega contínua integrados via GitHub para a Vercel devem rodar testes de compilação automáticos, realizando o deploy em produção de todo o sistema e do Agente de IA sem quebras de integridade de dados e sem dessincronização de estoque.
* **NFR-09 (Mapeamento de Latência e Cache):** Todas as requisições de leitura de catálogo estático devem bater primeiro na camada de cache do Redis antes de consultar o banco de dados principal.
* **NFR-10 (Otimização de Payload de Banco de Dados):** Fica proibido o uso de consultas genéricas que sobrecarreguem o tráfego de dados. Toda e qualquer busca estruturada no banco PostgreSQL via Prisma deve implementar projeção seletiva de campos (`select`) e paginação obrigatória por cursor limitando o retorno a no máximo 20 registros por página nas tabelas do Shadcn UI.
* **NFR-11 (Indexação Relacional no Banco):** A modelagem de dados no Supabase deve conter índices explícitos nas tabelas de `Vendas`, `Estoque` e `Promissórias`, garantindo que buscas por histórico de clientes ou filtros de inadimplência tragam a resposta em tempo inferior a 50 milissegundos.
