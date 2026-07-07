# Rocket Log

API REST para gerenciamento de entregas, status e logs de movimentação. O projeto foi desenvolvido com Node.js, TypeScript, Express, Prisma e PostgreSQL, com autenticação via JWT e autorização por perfil de usuário.

## Visão geral

O sistema trabalha com três entidades principais:

- Usuários, com perfis `customer` e `sale`
- Entregas, vinculadas a um usuário responsável
- Logs de entrega, usados para registrar ocorrências e mudanças de status

Fluxo resumido:

1. Um usuário é criado.
2. Um usuário de venda faz login e recebe um token JWT.
3. O usuário autenticado pode criar entregas, atualizar status e registrar logs.
4. O cliente pode consultar os logs da sua própria entrega.

## Tecnologias

- Node.js
- TypeScript
- Express
- Prisma
- PostgreSQL
- JWT
- Zod
- bcrypt
- Jest e Supertest

## Requisitos

- Node.js 18+ recomendado
- npm
- PostgreSQL local ou via Docker

## Estrutura do projeto

```text
src/
  controllers/
  configs/
  database/
  middlewares/
  routes/
  utils/
prisma/
  schema.prisma
docker-compose.yml
```

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar o arquivo `.env`

Crie um arquivo `.env` na raiz do projeto com as variáveis abaixo:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/rocketlog?schema=public"
JWT_SECRET="sua_chave_secreta_aqui"
```

### 3. Subir o banco com Docker

O projeto já possui um `docker-compose.yml` com PostgreSQL exposto na porta `5433`.

```bash
docker compose up -d
```

### 4. Aplicar as migrations do Prisma

```bash
npx prisma migrate dev
```

### 5. Gerar o Prisma Client, se necessário

Normalmente isso já acontece durante a migration, mas você pode rodar manualmente:

```bash
npx prisma generate
```

## Executando a aplicação

### Ambiente de desenvolvimento

```bash
npm run dev
```

A API sobe em `http://localhost:3333`.

## Testes

O projeto possui testes com Jest.

```bash
npm run test:dev
```

## Modelos de domínio

### Usuário

- `id`
- `name`
- `email`
- `password`
- `role`

### Entrega

- `id`
- `userId`
- `description`
- `status`
- `createdAt`
- `updatedAt`

### Log de entrega

- `id`
- `deliveryId`
- `description`
- `createdAt`
- `updatedAt`

## Autenticação e autorização

O login retorna um token JWT. Para acessar rotas protegidas, envie o token no cabeçalho:

```http
Authorization: Bearer SEU_TOKEN_AQUI
```

Regras principais:

- Rotas de entrega e log exigem autenticação
- Algumas rotas exigem perfil `sale`
- O perfil `customer` pode visualizar apenas as entregas vinculadas ao seu usuário

## Endpoints

### Usuários

#### Criar usuário

`POST /users`

Body:

```json
{
  "name": "Kevin Lopes",
  "email": "kevin@email.com",
  "password": "123456"
}
```

Resposta: `201 Created`

---

### Sessões

#### Login

`POST /sessions`

Body:

```json
{
  "email": "kevin@email.com",
  "password": "123456"
}
```

Resposta:

```json
{
  "token": "jwt_token",
  "user": {
    "id": "...",
    "name": "Kevin Lopes",
    "email": "kevin@email.com",
    "role": "sale",
    "createdAt": "...",
    "updatedAt": null
  }
}
```

---

### Entregas

#### Criar entrega

`POST /deliveries`

Requer: autenticação + perfil `sale`

Body:

```json
{
  "user_id": "uuid-do-usuario",
  "description": "Notebook para entrega expressa"
}
```

Resposta: `201 Created`

#### Listar entregas

`GET /deliveries`

Requer: autenticação + perfil `sale`

Resposta: lista de entregas com dados básicos do usuário associado.

#### Atualizar status da entrega

`PATCH /deliveries/:id/status`

Requer: autenticação + perfil `sale`

Body:

```json
{
  "status": "shipped"
}
```

Status permitidos:

- `processing`
- `shipped`
- `delivered`

Ao atualizar o status, o sistema também cria um log automático da mudança.

---

### Logs de entrega

#### Criar log

`POST /delivery-logs`

Requer: autenticação + perfil `sale`

Body:

```json
{
  "delivery_id": "uuid-da-entrega",
  "description": "Saiu para rota de entrega"
}
```

Regras:

- A entrega precisa existir
- Não é possível criar log se a entrega já estiver `delivered`
- A entrega precisa estar com status `shipped` para receber novos logs manuais

#### Consultar logs de uma entrega

`GET /delivery-logs/:delivery_id/show`

Requer: autenticação

Permissões:

- `sale` pode visualizar qualquer entrega
- `customer` só pode visualizar sua própria entrega

Resposta: entrega com usuário e logs associados.

## Banco de dados

O schema atual possui os enums abaixo:

- `DeliveryStatus`: `processing`, `shipped`, `delivered`
- `UserRole`: `customer`, `sale`

Tabelas principais:

- `User`
- `deliveries`
- `delivery_logs`

## Observações

- O projeto usa validação de entrada com Zod
- Senhas são armazenadas com hash bcrypt
- Erros da aplicação são tratados por um middleware global

## Licença

Este projeto está sob licença ISC.

## Autor

Kevin Lopes
