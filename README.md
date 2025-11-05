# Elevate Control

Sistema de gerenciamento e controle de TI desenvolvido para administração centralizada de recursos de infraestrutura.

## Características

- Gerenciamento de usuários com níveis de acesso (Administrador, Analista, Suporte)
- Controle de computadores e equipamentos
- Gestão de IPs e VLANs
- Gerenciamento de emails e senhas com criptografia
- Cadastro de impressoras e relógios de ponto
- Controle de servidores e conectividade
- Sistema de automações
- Parâmetros configuráveis (categorias, marcas, modelos, tipos, sistemas operacionais, serviços)

## Tecnologias

- Next.js 16
- TypeScript
- MongoDB com Mongoose
- JWT para autenticação
- AES-256-CBC para criptografia de dados sensíveis
- Tailwind CSS para estilização

## Requisitos

- Node.js 18 ou superior
- MongoDB (local ou Atlas)
- npm ou yarn

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/royaltysolucoes-byte/elevate_guapi.git
cd elevate_guapi
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente criando um arquivo `.env.local`:
```env
MONGODB_URI=sua-string-de-conexao-mongodb-aqui
JWT_SECRET=seu-jwt-secret-aqui
ENCRYPTION_KEY=sua-chave-de-criptografia-aqui
```

### Geração de Chaves de Segurança

Para gerar uma chave de criptografia segura:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Importante: Use uma chave diferente para cada ambiente (desenvolvimento, produção).

## Níveis de Acesso

### Administrador
- Acesso completo a todas as funcionalidades
- Pode criar, editar e excluir qualquer recurso
- Acesso a configurações e parâmetros

### Analista
- Pode visualizar todos os recursos
- Pode criar e editar registros
- Não pode excluir registros
- Não tem acesso a configurações

### Suporte
- Apenas visualização (modo leitura)
- Não pode criar, editar ou excluir
- Sem acesso a configurações, emails e senhas

## Estrutura do Projeto

```
app/
  (protected)/
    dashboard/          # Páginas do dashboard
  api/                  # Rotas da API
  globals.css           # Estilos globais
lib/
  models/               # Modelos Mongoose
  auth.ts               # Autenticação e JWT
  db.ts                 # Conexão MongoDB
  utils/
    encryption.ts       # Utilitários de criptografia
```

## Segurança

- Senhas de usuários são hasheadas usando bcrypt
- Dados sensíveis (senhas de equipamentos, emails) são criptografados com AES-256-CBC
- Autenticação via JWT com tokens seguros
- Validação de níveis de acesso em todas as rotas protegidas

## Deploy

### Vercel

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `ENCRYPTION_KEY`

Importante: A chave `ENCRYPTION_KEY` deve ser a mesma usada no desenvolvimento. Se você alterar essa chave, todos os dados criptografados não poderão ser descriptografados.

3. Deploy automático será feito a cada push na branch principal

## Desenvolvimento

Execute o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)
