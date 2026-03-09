const Database = require("better-sqlite3");

//Cria ou abre o arquivo do banco de dados
const db = new Database("orders.db");

//Ativa o suporte para chaves estrangeiras
db.pragma("foreign_keys = ON");

//Cria tabela de pedidos, por Order ser palavra reservada do SQL, criei como Orders
db.prepare(`
    CREATE TABLE IF NOT EXISTS Orders (
    orderId TEXT PRIMARY KEY,
    value REAL NOT NULL,
    creationDate TEXT NOT NULL
  )
`).run();

//Cria tabela de itens de pedidos
db.prepare(`
    CREATE TABLE IF NOT EXISTS Items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId TEXT NOT NULL,
    productId INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (orderId) REFERENCES Orders(orderId) ON DELETE CASCADE
  )
`).run();

module.exports = db;
