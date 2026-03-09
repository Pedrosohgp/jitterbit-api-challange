const express = require("express");
const db = require("./database");

const app = express();
const PORT = 300;

app.use(express.json());

// Rota de teste
app.get("/health", (req, res) => {
  res.status(200).json({ status: "API rodando..." });
});

// Rota de criação de pedidos
app.post("/order", (req, res) => {
  try {
    const { numeroPedido, valorTotal, dataCriacao, items } = req.body;

    if (!numeroPedido || !valorTotal || !dataCriacao || !items) {
      return res.status(400).json({
        error: "Campo(s) obrigatório(s) ausente(s)"
      });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({
        error: "O campo 'items' deve ser um array."
      });
    }

    // Verifica se já existe pedido com esse ID
    const existingOrder = db
      .prepare("SELECT * FROM Orders WHERE orderId = ?")
      .get(numeroPedido);

    if (existingOrder) {
      return res.status(409).json({
        error: "Já existe um pedido com esse número"
      });
    }

    // Insere pedido na tabela principal
    db.prepare(`
      INSERT INTO Orders (orderId, value, creationDate)
      VALUES (?, ?, ?)
    `).run(numeroPedido, valorTotal, dataCriacao);

    // Statement para inserir os itens
    const insertItem = db.prepare(`
      INSERT INTO Items (orderId, productId, quantity, price)
      VALUES (?, ?, ?, ?)
    `);

    for (const item of items) {
      insertItem.run(
        numeroPedido,
        Number(item.idItem),
        item.quantidadeItem,
        item.valorItem
      );
    }

    // Retorna o pedido no formato esperado
    const responseOrder = {
      orderId: numeroPedido,
      value: valorTotal,
      creationDate: dataCriacao,
      items: items.map((item) => ({
        productId: Number(item.idItem),
        quantity: item.quantidadeItem,
        price: item.valorItem
      }))
    };

    return res.status(201).json(responseOrder);
  } catch (error) {
    return res.status(500).json({
      error: "Erro interno ao criar pedido",
      details: error.message
    });
  }
});

// Rota para listagem de pedidos
app.get("/order/list", (req, res) => {
  try {
    const orders = db.prepare("SELECT * FROM Orders").all();

    const result = orders.map((order) => {
      const items = db.prepare(`
        SELECT productId, quantity, price
        FROM Items
        WHERE orderId = ?
      `).all(order.orderId);

      return {
        orderId: order.orderId,
        value: order.value,
        creationDate: order.creationDate,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }))
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: "Erro interno ao listar pedidos",
      details: error.message
    });
  }
});

// Rota para busca de pedidos por ID
app.get("/order/:id", (req, res) => {
  try {
    const { id } = req.params;

    const order = db
      .prepare("SELECT * FROM Orders WHERE orderId = ?")
      .get(id);

    if (!order) {
      return res.status(404).json({
        error: "Pedido não encontrado"
      });
    }

    const items = db.prepare(`
      SELECT productId, quantity, price
      FROM Items
      WHERE orderId = ?
    `).all(id);

    return res.status(200).json({
      orderId: order.orderId,
      value: order.value,
      creationDate: order.creationDate,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }))
    });
  } catch (error) {
    return res.status(500).json({
      error: "Erro interno ao buscar pedido",
      details: error.message
    });
  }
});

// Rota para atualização do pedido
app.put("/order/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { valorTotal, dataCriacao, items } = req.body;

    const existingOrder = db
      .prepare("SELECT * FROM Orders WHERE orderId = ?")
      .get(id);

    if (!existingOrder) {
      return res.status(404).json({
        error: "Pedido não encontrado"
      });
    }

    // Atualiza tabela Order
    db.prepare(`
      UPDATE Orders
      SET value = ?, creationDate = ?
      WHERE orderId = ?
    `).run(
      valorTotal ?? existingOrder.value,
      dataCriacao ?? existingOrder.creationDate,
      id
    );

    // Se vier itens novos, apaga os antigos e reinsere
    if (items && Array.isArray(items)) {
      db.prepare("DELETE FROM Items WHERE orderId = ?").run(id);

      const insertItem = db.prepare(`
        INSERT INTO Items (orderId, productId, quantity, price)
        VALUES (?, ?, ?, ?)
      `);

      for (const item of items) {
        insertItem.run(
          id,
          Number(item.idItem),
          item.quantidadeItem,
          item.valorItem
        );
      }
    }

    const updatedOrder = db
      .prepare("SELECT * FROM Orders WHERE orderId = ?")
      .get(id);

    const updatedItems = db.prepare(`
      SELECT productId, quantity, price
      FROM Items
      WHERE orderId = ?
    `).all(id);

    return res.status(200).json({
      orderId: updatedOrder.orderId,
      value: updatedOrder.value,
      creationDate: updatedOrder.creationDate,
      items: updatedItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }))
    });
  } catch (error) {
    return res.status(500).json({
      error: "Erro interno ao atualizar pedido",
      details: error.message
    });
  }
});

// Rota para deletar pedidos
app.delete("/order/:id", (req, res) => {
  try {
    const { id } = req.params;

    const existingOrder = db
      .prepare("SELECT * FROM Orders WHERE orderId = ?")
      .get(id);

    if (!existingOrder) {
      return res.status(404).json({
        error: "Pedido não encontrado"
      });
    }

    // Como possuímos na tabela Items "ON DELETE CASCADE", ao apagar o pedido os itens também somem
    db.prepare("DELETE FROM Orders WHERE orderId = ?").run(id);

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({
      error: "Erro interno ao deletar pedido",
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server rodando na porta ${PORT}`);
});