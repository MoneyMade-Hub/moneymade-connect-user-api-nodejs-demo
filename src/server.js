const express = require("express");
const app = express();

app.post("/moneymade-users",(req, res) => {
    console.log("Creating MoneyMade user");

    res.status(201).json({ id: 1 })
});

app.post("/moneymade-users/sessions",(req, res) => {
    console.log("Creating MoneyMade user session");

    res.status(201).json({ id: 1, user: { id: 1 } })
});

app.get("/moneymade-users/:userId/accounts",(req, res) => {
    console.log(`Getting user (${req.params.userId}) accounts`);

    res.status(200).json([{ id: 1 }])
});

app.get("/moneymade-users/accounts/:accountId/bank-details",(req, res) => {
    console.log(`Getting account (${req.params.accountId}) bank details`);

    res.status(200).json([{ id: 1 }])
});

app.get("/moneymade-users/accounts/:accountId/holdings",(req, res) => {
    console.log(`Getting account (${req.params.accountId}) holdings`);

    res.status(200).json([{ id: 1 }])
});

app.use("*", (req, res) => {
    res.status(404).json({ message: 'Endpoint not found'})
});

module.exports.app = app;