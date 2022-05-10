const express = require("express");
const bodyParser = require("body-parser");
const { initializeSDK } = require("./sdk");


async function createServer() {
    const sdk = await initializeSDK();
    const app = express();

    app.use(bodyParser.json());


    app.post("/moneymade-users",async (req, res, next) => {
        try {
            console.log("Creating MoneyMade user");

            const response = await sdk.users.create({
                email: 'rostyk@moneymade.io',
                client_user_id: 'rostyk_moneymade_io'
            }).catch(console.log);


            res.status(201).json(response)
        }catch(e){
            next(e);
        }
    });

    app.post("/moneymade-users/sessions",async (req, res, next) => {
        try {
            console.log("Creating MoneyMade user session");

            res.status(201).json({ id: 1, user: { id: 1 } })
        }catch (e) {
            next(e);
        }
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

    return app;
}

module.exports.createServer = createServer;