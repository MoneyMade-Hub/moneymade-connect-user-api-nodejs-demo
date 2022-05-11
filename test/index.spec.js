const { createServer } = require("../src/server");
const request = require("supertest");
const sdkPackage = require("../src/sdk");
const { randomUUID } = require("crypto");
const { makeAxiosError } = require("./utils");

jest.mock('../src/sdk');

describe("App", () => {
    let server;
    let sdk;

    beforeEach(async () => {
        sdk = {
            users: {
                create: jest.fn(),
                createSession: jest.fn()
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

        it("should return error if client_user_id is not present in body", async () => {
            jest.spyOn(sdk.users, 'create').mockImplementation();

            const { body } = await request(server).post("/moneymade-users").expect(400);

            expect(body).toEqual({
                message: 'client_user_id must be present'
            });
            expect(sdk.users.create).not.toBeCalled();
        });
    });

    describe('POST /moneymade-users/sessions', () => {
        it("should create user session", async () => {
            const token = "mmc-production-50f463d65fe95a7fc86c59bc2cdb760b6a91f3f1c8a4a70607c4c86cf59c260b9186fa7938cde29fc5675f6f795631e6dec2";
            const expiresAt = new Date("2022-05-11T09:03:06.155Z");
            const userId = randomUUID();

            jest.spyOn(sdk.users, 'createSession').mockResolvedValueOnce(Promise.resolve({
                token,
                expires_at: expiresAt.toISOString(),
            }));

            const { body } = await request(server).post("/moneymade-users/sessions").send({
                user_id: userId,
            }).expect(201);

            expect(body).toEqual({ token });
            expect(sdk.users.createSession).toBeCalledWith(userId);
        });

        it("should return error if user is not found", async () => {
            const error = makeAxiosError(400, 'User not found!');
            const userId = randomUUID();

            jest.spyOn(sdk.users, 'createSession').mockImplementation(() => Promise.reject(error));

            const { body } = await request(server).post("/moneymade-users/sessions").send({
                user_id: userId,
            }).expect(400);

            expect(body).toEqual({ message: 'User not found' });
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