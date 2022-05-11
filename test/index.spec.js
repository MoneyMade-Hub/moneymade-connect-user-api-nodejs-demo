const { createServer } = require("../src/server");
const request = require("supertest");
const sdkPackage = require("../src/sdk");
const { randomUUID } = require("crypto");

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
            const clientUserId = 'moneymade_18n10b74n';
            const clientUserEmail = 'email@moneymade.io';
            const createResponse = {
                id: randomUUID(),
                client_user_id: clientUserId,
                accounts: []
            };

            jest.spyOn(sdk.users, 'create').mockResolvedValueOnce(createResponse);

            const { body } = await request(server).post("/moneymade-users").send({
                client_user_id: clientUserId,
                email: clientUserEmail,
            }).expect(201);

            expect(body).toEqual(createResponse);
            expect(sdk.users.create).toBeCalledTimes(1);
            expect(sdk.users.create).toBeCalledWith({"client_user_id": clientUserId, "email": clientUserEmail});
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