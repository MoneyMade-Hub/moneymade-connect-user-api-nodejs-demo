const express = require("express");
const { config } = require("./config");
const app = express();

app.post("/moneymade-users",(req, res) => {
    console.log("Creating MoneyMade user");

    res.send(201).json({ id: 1 })
});

app.post("/moneymade-users/sessions",(req, res) => {
    console.log("Creating MoneyMade user session");

    res.send(201).json({ id: 1, user: { id: 1 } })
});

app.get("/moneymade-users/:userId/accounts",(req, res) => {
    console.log(`Getting user (${req.params.userId}) accounts`);

    res.send(201).json([{ id: 1 }])
});

app.get("/moneymade-users/accounts/:accountId/bank-details",(req, res) => {
    console.log(`Getting account (${req.params.accountId}) bank details`);

    res.send(201).json([{ id: 1 }])
});

app.get("/moneymade-users/accounts/:accountId/holdings",(req, res) => {
    console.log(`Getting account (${req.params.accountId}) holdings`);

    res.send(201).json([{ id: 1 }])
});

app.listen(() => {
    console.log(`Listening ${config.port} port`)
});
