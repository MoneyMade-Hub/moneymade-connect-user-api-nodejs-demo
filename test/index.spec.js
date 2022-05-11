const { createServer, handleError } = require("../src/server");
const request = require("supertest");
const sdkPackage = require("../src/sdk");
const { randomUUID, randomInt } = require("crypto");
const { makeAxiosError } = require("./utils");

jest.mock('../src/sdk');

describe("App", () => {
    let server;
    let sdk;

    beforeEach(async () => {
        sdk = {
            users: {
                create: jest.fn(),
                getOne: jest.fn(),
                getAccount: jest.fn(),
                createSession: jest.fn(),
            },
            accounts: {
                getBankDetails: jest.fn(),
                getHoldings: jest.fn(),
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

            jest.spyOn(sdk.users, 'createSession').mockImplementationOnce(() => Promise.reject(error));

            const { body } = await request(server).post("/moneymade-users/sessions").send({
                user_id: userId,
            }).expect(400);

            expect(body).toEqual({ message: 'User not found' });
        });
    });

    describe('GET /moneymade-users/:userId/accounts', () => {
        it("should return user accounts", async () => {
            const userId = randomUUID();
            const accounts = Array(50).fill(1).map(() => ({
                "id": randomUUID(),
                "provider":{
                    "id": randomInt(1, 9999999),
                    "name": "Provider",
                    "slug": "provider",
                    "strategy": "keys",
                    "logo":"https://assets.moneymade.io/images/app/MoneyMade%20Logo%20-%20Black.svg"
                }
            }));

            const userResponse = {
                id: randomUUID(),
                client_user_id: 'moneymade_18n10b74n',
                accounts
            };

            jest.spyOn(sdk.users, 'getOne').mockResolvedValueOnce(Promise.resolve(userResponse));

            const { body } = await request(server).get(`/moneymade-users/${userId}/accounts`).expect(200);

            expect(body).toEqual(accounts);
            expect(sdk.users.getOne).toBeCalledTimes(1)
            expect(sdk.users.getOne).toBeCalledWith(userId)
        });

        it("should return error if user is not found", async () => {
            const userId = randomUUID();
            const error = makeAxiosError(400, 'User not found!');

            jest.spyOn(sdk.accounts, 'getBankDetails').mockImplementationOnce(() => Promise.reject(error));

            jest.spyOn(sdk.users, 'getOne').mockImplementationOnce(() => Promise.reject(error));

            const { body } = await request(server).get(`/moneymade-users/${userId}/accounts`).expect(400);

            expect(body).toEqual({ message: 'User not found' });
        });
    });

    describe('GET /moneymade-users/:userId/accounts/:accountId', () => {
        it("should return user's account", async () => {
            const userId = randomUUID();
            const accountId = randomUUID();
            const subaccounts = Array(50).fill(1).map(() => ({
                "id":randomUUID(),
                "account_id":accountId,
                "name":"Bitcoin",
                "currency":"BTC",
                "balance":"0",
                "type":"cryptocurrency",
                "fiat_balance":0,
                "balance_updated_at":new Date().toISOString(),
            }));
            const userAccountResponse = {
                "id":accountId,
                "user_id":userId,
                "verification_status":"pending",
                "scopes":["accounts:balances"],
                "provider":{
                    "id":1,
                    "name":"MoneyMade",
                    "slug":"moneymade",
                    "strategy":"oauth",
                    "connector":"moneymade",
                    "type":"crypto",
                    "description":"MoneyMade description",
                    "website":"https://www.moneymade.io",
                    "logo":"https://assets.moneymade.io/images/app/MoneyMade%20Logo%20-%20Black.svg",
                    "scopes":[
                        "accounts:balances",
                        "accounts:banking"
                    ]
                },
                "subaccounts": subaccounts
            };

            jest.spyOn(sdk.users, 'getAccount').mockResolvedValueOnce(Promise.resolve(userAccountResponse));

            const { body } = await request(server).get(`/moneymade-users/${userId}/accounts/${accountId}`).expect(200);

            expect(body).toEqual(userAccountResponse);
            expect(sdk.users.getAccount).toBeCalledTimes(1)
            expect(sdk.users.getAccount).toBeCalledWith({ userId, accountId })
        });

        it("should return error if user is not found", async () => {
            const userId = randomUUID();
            const accountId = randomUUID();
            const error = makeAxiosError(400, 'User not found!');

            jest.spyOn(sdk.users, 'getAccount').mockImplementationOnce(() => Promise.reject(error));

            const { body } = await request(server).get(`/moneymade-users/${userId}/accounts/${accountId}`).expect(400);

            expect(body).toEqual({ message: 'User not found' });
        });

        it("should return error if account is not found", async () => {
            const userId = randomUUID();
            const accountId = randomUUID();
            const error = makeAxiosError(400, 'Account not found');

            jest.spyOn(sdk.users, 'getAccount').mockImplementationOnce(() => Promise.reject(error));

            const { body } = await request(server).get(`/moneymade-users/${userId}/accounts/${accountId}`).expect(400);

            expect(body).toEqual({ message: 'Account not found' });
        });
    });

    describe('GET /moneymade-users/accounts/:accountId/bank-details', () => {
        it("should return account bank details", async () => {
            const accountId = randomUUID();
            const bankDetailsResponse = [
                {
                    account_number: '000123456789',
                    holder_name: 'MoneyMade User',
                    routing_number: '110000000',
                    type: 'individual',
                    balance: null,
                    source: 'manual'
                }
            ];

            jest.spyOn(sdk.accounts, 'getBankDetails').mockResolvedValueOnce(Promise.resolve(bankDetailsResponse))

            const { body } = await request(server).get(`/moneymade-users/accounts/${accountId}/bank-details`).expect(200);

            expect(body).toEqual(bankDetailsResponse);
        });

        it("should return error if account is not found", async () => {
            const accountId = randomUUID();
            const error = makeAxiosError(400, 'Account not found');

            jest.spyOn(sdk.accounts, 'getBankDetails').mockImplementationOnce(() => Promise.reject(error));

            const { body } = await request(server).get(`/moneymade-users/accounts/${accountId}/bank-details`).expect(400);

            expect(body).toEqual({ message: 'Account not found' });
        });
    });

    describe('GET /moneymade-users/accounts/:accountId/holdings', () => {
        it("should return account holdings", async () => {
            const accountId = randomUUID();
            const holdingsResponse = [{"account_id":accountId,"subaccount_id":randomUUID(),"ticker":"USD","name":"USD","isin":null,"type":"cash","amount":0,"current_price":null,"current_amount_price":0}];

            jest.spyOn(sdk.accounts, 'getHoldings').mockResolvedValueOnce(holdingsResponse);

            const { body } = await request(server).get(`/moneymade-users/accounts/${accountId}/holdings`).expect(200);

            expect(body).toEqual(holdingsResponse);
            expect(sdk.accounts.getHoldings).toBeCalledTimes(1);
            expect(sdk.accounts.getHoldings).toBeCalledWith(accountId);
        });

        it("should return error if account not found", async () => {
            const accountId = randomUUID();
            const error = makeAxiosError(400, 'Account not found');

            jest.spyOn(sdk.accounts, 'getHoldings').mockImplementationOnce(() => Promise.reject(error));

            const { body } = await request(server).get(`/moneymade-users/accounts/${accountId}/holdings`).expect(400);

            expect(body).toEqual({ message: 'Account not found' });
        });
    });

    describe('Not found', () => {
        it("should return not found error", async () => {
            const { body } = await request(server).get("/not-found").expect(404);

            expect(body).toEqual({ message: "Endpoint not found" });
        });
    });

    describe('handleError', () => {
        it("should send internal server error if error is not from axios", async () => {
            const error = new Error();
            const jsonFn = jest.fn();
            const statusFn = jest.fn(() => ({ json: jsonFn }));

            handleError(error, undefined, { status: statusFn }, jest.fn());

            expect(statusFn).toBeCalledTimes(1);
            expect(statusFn).toBeCalledWith(500);
            expect(jsonFn).toBeCalledTimes(1);
            expect(jsonFn).toBeCalledWith({ message: 'Internal server error' });
        });

        it("should send internal server error if error is from axios with response error message", async () => {
            const error = makeAxiosError(400, 'Could not find user');
            const jsonFn = jest.fn();
            const statusFn = jest.fn(() => ({ json: jsonFn }));

            handleError(error, undefined, { status: statusFn }, jest.fn());

            expect(statusFn).toBeCalledTimes(1);
            expect(statusFn).toBeCalledWith(400);
            expect(jsonFn).toBeCalledTimes(1);
            expect(jsonFn).toBeCalledWith({ message: 'Could not find user' });
        });

        it("should send internal server error if error is from axios without response", async () => {
            const error = makeAxiosError();
            const jsonFn = jest.fn();
            const statusFn = jest.fn(() => ({ json: jsonFn }));

            handleError(error, undefined, { status: statusFn }, jest.fn());

            expect(statusFn).toBeCalledTimes(1);
            expect(statusFn).toBeCalledWith(500);
            expect(jsonFn).toBeCalledTimes(1);
            expect(jsonFn).toBeCalledWith({ message: 'Internal server error' });
        });
    });
})