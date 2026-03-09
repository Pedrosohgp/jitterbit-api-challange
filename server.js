const express = require("express");

const app = express();
const PORT = 300;

app.use(express.json());
let orders = [];

//Rota de teste
app.get("/health", (req, res) => {
    res.status(200).json({ status: "API rodando..."});
});

//Rota POST/Order
app.post("/order", (req, res) => {
    const {numeroPedido, valorTotal, dataCriacao, items} = req.body;

    //Validação básica dos campos obrigatórios
    if(!numeroPedido || !valorTotal || !dataCriacao || !items) {
        return res.status(400).json({
            error: "Campo(s) obrigatório(s) ausente(s)"
        });
    }
    if (!Array.isArray(items)) {
         return res.status(400).json({
            error: "O campo 'Items' deve ser um array."
        });
    }

    const newOrder = {
        orderId: numeroPedido,
        value: valorTotal,
        date: dataCriacao,
        items: items.map((item) => ({
            productId: Number(item.idItem),
            quantity: item.quantidadeItem,
            price: item.valorItem
        }))
    };
    orders.push(newOrder);
    return res.status(201).json(newOrder);
});

//Rota de listagem de pedidos
app.get("/order/list", (req, res) => {
    if (orders.length === 0) {
        return res.status(200).json({message: "Nenhum pedido cadastrado"});
    }
    return res.status(200).json(orders);
})

//Rota de procurar pedidos por ID
app.get("/order/:id", (req, res) => {
    const { id } = req.params;
    
    const order = orders.find((order) => order.orderId === id);

    if(!order) {
        return res.status(400).json({error: "Pedido não encontrado"})
    }
    return res.status(200).json(order);
})

//Rota de Atualização de Pedidos
app.put("/order/:id", (req, res) => {
    const { id } = req.params;

    const orderIndex = orders.findIndex(order => order.orderId === id);

    if(orderIndex === -1) {
        return res.status(400).json({error: "Pedido não encontrado"});
    }

    const {valorTotal, dataCriacao, items} = req.body;

    const updateOrder = {
        ...orders[orderIndex],
        value: valorTotal ?? orders[orderIndex].value,
        date: dataCriacao ?? orders[orderIndex].date,
        items: items
            ? items.map(item => ({
                productId: Number(item.idItem),
                quantity: item.quantidadeItem,
                price: item.valorItem
            }))
            : orders[orderIndex].items
    };

    orders[orderIndex] = updateOrder;
    return res.status(200).json(updateOrder);
})

//Rota de Exclusão de Items

app.delete("/order/:id", (req, res) => {
    const { id } = req.params;

    const orderIndex = orders.findIndex(order => order.orderId === id);

     if(orderIndex === -1) {
        return res.status(400).json({error: "Pedido não encontrado"});
    }

    orders.splice(orderIndex, 1);
    return res.status(204).send();
})

app.listen(PORT, () => {
    console.log(`Server rodando na porta ${PORT}`)
})