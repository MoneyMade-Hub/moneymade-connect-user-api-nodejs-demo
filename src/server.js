const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const { initializeSDK } = require("./sdk");


async function createServer() {
    const sdk = await initializeSDK();
    const app = express();

    app.use(bodyParser.json());


    app.post("/moneymade-users",async (req, res, next) => {
        try {
            console.log("Creating MoneyMade user");

            const { email, client_user_id } = req.body;

            if(!client_user_id) {
                return res.status(400).json({ message: 'client_user_id must be present' });
            }

            const response = await sdk.users.create({
                email,
                client_user_id,
            });

            res.status(201).json(response)
        }catch(e){
            next(e);
        }
    });

    app.post("/moneymade-users/sessions",async (req, res, next) => {
        try {
            console.log("Creating MoneyMade user session");

            const { user_id } = req.body;

            if(!user_id) {
                return res.status(400).json({ message: 'user_id must be present' });
            }

            const { token } = await sdk.users.createSession(user_id);

            res.status(201).json({
                token
            })
        }catch (e) {
            if(axios.isAxiosError(e) && e.response.data?.message === 'User not found!') {
                return res.status(400).json({ message: 'User not found' });
            }

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

    app.use((error, req, res, next) => {
        if(axios.isAxiosError(error)) {
            console.log("Received axios error", {
                data: error.response.data,
                status: error.response.status
            })
        } else {
            console.log("Received unknown error", error);
        }

        res.status(500).json({ message: "Internal server error "});
    })

    return app;
}

module.exports.createServer = createServer;