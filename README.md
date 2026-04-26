# 🌊 SOSconnect

## 1. Apresentação da Ideia

Esse é o meu projeto, o **SOSconnect**. A ideia surgiu a partir do desafio sobre enchentes no Brasil, um cenário infelizmente cada vez mais comum e devastador. Pensando nesse contexto de calamidade, decidi focar no problema da desinformação e da falta de coordenação entre vítimas, voluntários e autoridades durante os momentos de crise.

## 2. Problema Escolhido

Durante enchentes e desastres naturais, a comunicação se torna caótica. O caso que decidi resolver é o **ruído de informações e o atraso no atendimento às vítimas**.
Muitas vezes, pedidos de resgate se perdem em grupos de WhatsApp, abrigos ficam superlotados enquanto outros estão vazios, e pessoas dispostas a doar ou ajudar (com barcos, jipes, mantimentos) não sabem para onde ir. Não há um ponto central de verdade para coordenar o caos.

## 3. Solução Proposta

A solução proposta é o **SOSconnect**, uma plataforma web em tempo real que funciona como um centro de coordenação tecnológica. A ideia do sistema é conectar quem precisa de ajuda com quem pode ajudar, de forma categorizada e visual.

O sistema conta com as seguintes funcionalidades principais:

- **Dashboard de Triagem:** Um painel central para visualizar métricas vitais (alertas críticos, pessoas aguardando resgate, lotação de abrigos).
- **Pedidos e Ofertas de Ajuda:** Formulários categorizados (resgate, abrigo, mantimentos) para organizar a demanda e a oferta de solidariedade.
- **Mapeamento de Pontos de Apoio:** Controle da capacidade e localização de abrigos, hospitais e centros de distribuição.
- **Acessibilidade Visual:** Um sistema integrado de alternância de tema (Modo Claro/Escuro) para facilitar a visualização em ambientes com diferentes condições de luminosidade ou para poupar bateria dos dispositivos móveis durante apagões.

## 4. Estrutura do Sistema

O projeto foi dividido em três camadas principais para garantir organização, escalabilidade e performance:

### Front-end

Construído para ser rápido e reativo, focado na experiência do usuário em momentos de estresse.

- **Tecnologia:** React 18 + Vite.
- **Arquitetura:** Componentizada (botões, modais, _toasts_ de notificação reutilizáveis) com gestão de estado via _Hooks_ customizados (como o `useTheme` para o modo noturno).
- **Estilização:** CSS puro (vanilla) utilizando Variáveis Nativas (`:root`) para controle de cores dinâmicas e design system próprio.

**Confira aqui:** https://so-sconnect.vercel.app

### Back-end

Responsável por toda a regra de negócio, processamento de dados e segurança das informações.

- **Tecnologia:** Node.js com o framework Express.
- **Arquitetura:** Arquitetura RESTful dividida em rotas e _Controllers_ específicos para cada domínio do sistema (Alertas, Pedidos, Ofertas, Pontos de Apoio e Estatísticas).

**Confira aqui:** https://sosconnect.onrender.com

### Banco de Dados

Responsável por armazenar as informações de forma relacional e segura.

- **Tecnologia:** PostgreSQL.
- **Integração:** Conexão nativa gerida via Pool de conexões, com scripts próprios (`migrate.js`) para criação de tabelas e injeção de dados iniciais (_seeds_).

---

## 🛠️ Como Executar o Projeto (Guia de Setup)

> **Pré-requisitos:** Node.js (v18+) e PostgreSQL instalados.

**Passo 1: Banco de Dados**
Crie um banco de dados local chamado `sosconnect` no seu PostgreSQL.

**Passo 2: Configurar o Back-end**

```bash
cd backend
cp .env.example .env  # Configure suas credenciais do banco neste arquivo
npm install
npm run migrate       # Cria as tabelas necessárias
npm run dev           # Inicia o servidor na porta 3001

**Passo 3: Configurar o Front-end (em outro terminal)**

cd frontend
npm install
npm run dev           # Inicia a interface na porta 5173



```
