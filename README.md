# Inklue – Assistente Inteligente de Planos de Aula Inclusivos

Projeto desenvolvido para o Hackathon FIAP 2026.

Tema: Auxílio aos Professores no Ensino Público

---

# Visão Geral

O Inklue é uma plataforma que utiliza Inteligência Artificial para auxiliar professores da rede pública a criar planos de aula inclusivos personalizados, considerando perfis de alunos com necessidades específicas como:

• Autismo (TEA)
• TDAH
• Deficiência intelectual
• Deficiência auditiva ou visual
• Dificuldades motoras
• Dislexia, disgrafia e discalculia

O sistema gera automaticamente:

• Plano de aula completo
• Atividades adaptadas
• Estratégias de acessibilidade
• Rubrica de avaliação
• QR Code para acesso do aluno
• PDF pronto para impressão

---

# Problema

Professores do ensino público enfrentam dificuldades como:

• Falta de tempo para criar planos inclusivos
• Pouco suporte pedagógico especializado
• Grande diversidade de perfis em sala
• Falta de ferramentas tecnológicas acessíveis
• Sobrecarga de trabalho

Isso impacta diretamente na qualidade do ensino inclusivo.

---

# Solução

O Inklue resolve esse problema com uma plataforma que:

• Cria planos de aula automaticamente com IA
• Adapta conteúdo para diferentes perfis
• Permite acesso dos alunos via QR Code
• Gera PDF pronto para uso
• Centraliza todos os planos em um dashboard

---

# Demonstração

Frontend:
https://inklue-hackaton26.vercel.app

Backend:
https://inklue-hackaton26.onrender.com

---

# Tecnologias Utilizadas

Frontend:

• Next.js 16
• React
• TypeScript
• TailwindCSS
• Axios
• Lucide Icons

Backend:

• Node.js
• Express
• TypeScript
• AWS DynamoDB
• AWS S3
• AWS Textract
• PDFKit
• QRCode

Infraestrutura:

• Vercel (Frontend)
• Render (Backend)
• AWS Cloud

---

# Arquitetura

Frontend (Next.js)
↓
Backend (Express API)
↓
DynamoDB (armazenamento)
↓
AI Service (geração de planos)
↓
PDF Generator
↓
QR Code Generator

---

# Funcionalidades

Professor:

• Criar plano de aula
• Gerar plano com IA
• Visualizar planos
• Baixar PDF
• Compartilhar com alunos

Aluno:

• Acessar plano via QR Code
• Visualizar atividades
• Seguir etapas

---

# Estrutura do Projeto

backend/
src/
controllers/
services/
routes.ts
index.ts

frontend/
src/
app/
components/
lib/

---

# Como Executar Localmente

Backend:

npm install
npm run dev

Frontend:

npm install
npm run dev

---

# Impacto Esperado

• Redução do tempo de planejamento
• Ensino mais inclusivo
• Melhor adaptação pedagógica
• Aumento da eficiência dos professores

---

# Autor

Renan Santos de Oliveira

FIAP – Pós Tech Full Stack Development

Hackathon FIAP 2026
