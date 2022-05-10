const { createServer } = require("../src/server");
const request = require("supertest");
const sdkPackage = require("../src/sdk");

jest.mock('../src/sdk');

describe("App", () => {
    let server;
    let sdk;

    beforeEach(async () => {
        sdk = {
            users: {
                create: () => {}
            }
        };

        jest.spyOn(sdkPackage, 'initializeSDK').mockResolvedValue(Promise.resolve(sdk));


        server = await createServer();
    })

    describe('POST /moneymade-users', () => {
        it("should create MoneyMade user", async () => {
            const createResponse = {
                id: '8b45a5c4-8eaa-4b52-9f4f-9d6d5cca105d',
                client_user_id: 'moneymade_18n10b74n',
                accounts: []
            };

            jest.spyOn(sdk.users, 'create').mockResolvedValueOnce(createResponse);

            const { body } = await request(server).post("/moneymade-users").expect(201);

            expect(body).toEqual(createResponse);
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

    describe('Not found', () => {
        it("should return not found error", async () => {
            const { body } = await request(server).get("/not-found").expect(404);

            expect(body).toEqual({ message: "Endpoint not found" });
        });
    });
})