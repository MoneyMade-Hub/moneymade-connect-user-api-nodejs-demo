const { app } = require("../src/server");
const request = require("supertest");

describe("App", () => {
    const server = app;

    describe('POST /moneymade-users', () => {
        it("should create MoneyMade user", async () => {
            const { body } = await request(server).post("/moneymade-users").expect(201);

            expect(body).toEqual({ id: 1 });
        });
    });

    describe('POST /moneymade-users/sessions', () => {
        it("should create user session", async () => {
            const { body } = await request(server).post("/moneymade-users/sessions").expect(201);

            expect(body).toEqual({ id: 1, user: { id: 1 } });
        });
    });

    describe('GET /moneymade-users/:userId/accounts', () => {
        it("should create user session", async () => {
            const { body } = await request(server).get("/moneymade-users/:userId/accounts").expect(200);

            expect(body).toEqual([{ id: 1 }]);
        });
    });

    describe('GET /moneymade-users/accounts/:accountId/bank-details', () => {
        it("should create user session", async () => {
            const { body } = await request(server).get("/moneymade-users/accounts/:accountId/bank-details").expect(200);

            expect(body).toEqual([{ id: 1 }]);
        });
    });

    describe('GET /moneymade-users/accounts/:accountId/holdings', () => {
        it("should create user session", async () => {
            const { body } = await request(server).get("/moneymade-users/accounts/:accountId/holdings").expect(200);

            expect(body).toEqual([{ id: 1 }]);
        });
    });
})