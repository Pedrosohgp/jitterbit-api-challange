# API de Pedidos – Desafio Técnico Jitterbit

Este projeto foi desenvolvido como parte de um desafio técnico para criação de uma API em JavaScript.

A API permite realizar operações de CRUD (Create, Read, Update, Delete) para gerenciamento de pedidos e seus respectivos itens.

## Tecnologias Utilizadas

- Node.js
- Express
- SQLite (better-sqlite3)

## Estrutura do Projeto

A aplicação possui as seguintes rotas principais:

| Método | Endpoint | Descrição |
|------|------|------|
| POST | /order | Cria um novo pedido |
| GET | /order/list | Lista todos os pedidos |
| GET | /order/:id | Retorna um pedido específico |
| PUT | /order/:id | Atualiza um pedido existente |
| DELETE | /order/:id | Remove um pedido |

---

## Estrutura do Banco de Dados

Foi utilizado um banco de dados relacional SQLite para persistência dos dados.

### Tabela: orders

| Campo | Tipo | Descrição |
|------|------|------|
| orderId | TEXT | Identificador único do pedido |
| value | REAL | Valor total do pedido |
| creationDate | TEXT | Data de criação do pedido |

### Tabela: items

| Campo | Tipo | Descrição |
|------|------|------|
| id | INTEGER | Identificador do item |
| orderId | TEXT | Referência ao pedido |
| productId | INTEGER | Identificador do produto |
| quantity | INTEGER | Quantidade do produto |
| price | REAL | Valor do item |

Relacionamento:  
Cada pedido pode possuir múltiplos itens associados através do campo `orderId`.

---

## Como Executar o Projeto

### 1. Clonar o repositório

git clone https://github.com/Pedrosohgp/jitterbit-api-challange

### 2. Instalar dependências

npm install

### 3. Iniciar o servidor

node server.js

O servidor será iniciado em: http://localhost:3000


## Exemplo de Requisição

### Criar Pedido

**POST /order**

```json
{
  "numeroPedido": "v10089015vdb-02",
  "valorTotal": 10000,
  "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
  "items": [
    {
      "idItem": "2434",
      "quantidadeItem": 1,
      "valorItem": 1000
    }
  ]
}
```
<img width="1111" height="1063" alt="image" src="https://github.com/user-attachments/assets/d7f96fa9-6037-46a4-a406-16df44c0200b" />


Observações

A API realiza a transformação dos dados recebidos no payload para o formato definido no desafio.

Os dados são persistidos em um banco SQLite local.

A estrutura segue um modelo relacional entre pedidos e itens.

Autor: Henrique Pedroso
