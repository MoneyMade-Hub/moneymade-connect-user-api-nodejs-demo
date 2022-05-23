const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const { initializeSDK } = require('./sdk');

async function createServer () {
  const app = express();

  app.use(bodyParser.json());

  app.use((req, res, next) => {
    if (!req.headers['api-key']) {
      return res.status(401).send({ message: 'Missed api-key header' });
    }

    if (!req.headers['api-secret']) {
      return res.status(401).send({ message: 'Missed api-secret header' });
    }

    return next();
  });

  app.post('/moneymade-users', async (req, res, next) => {
    try {
      console.log('Creating MoneyMade user');

      const { email, client_user_id } = req.body;

      if (!client_user_id) {
        return res.status(400).json({ message: 'client_user_id must be present' });
      }

      const sdk = await initializeSDK(req.headers);

      const response = await sdk.users.create({
        email,
        client_user_id
      });

      res.status(201).json(response);
    } catch (e) {
      next(e);
    }
  });

  app.post('/moneymade-users/sessions', async (req, res, next) => {
    try {
      console.log('Creating MoneyMade user session');

      const { user_id } = req.body;

      if (!user_id) {
        return res.status(400).json({ message: 'user_id must be present' });
      }

      const sdk = await initializeSDK(req.headers);
      const { token } = await sdk.users.createSession(user_id);

      res.status(201).json({
        token
      });
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.data?.message === 'User not found!') {
        return res.status(400).json({ message: 'User not found' });
      }

      next(e);
    }
  });

  app.get('/moneymade-users/:userId/accounts', async (req, res, next) => {
    try {
      const { userId } = req.params;

      console.log(`Getting user (${userId}) accounts`);

      const sdk = await initializeSDK(req.headers);
      const user = await sdk.users.getOne(userId);

      res.status(200).json(user.accounts);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.data?.message === 'User not found!') {
        return res.status(400).json({ message: 'User not found' });
      }

      next(e);
    }
  });

  app.get('/moneymade-users/:userId/accounts/:accountId', async (req, res, next) => {
    try {
      const { userId, accountId } = req.params;

      console.log(`Getting user's (${userId}) account (${accountId}) details`);

      const sdk = await initializeSDK(req.headers);
      const account = await sdk.users.getAccount({ userId, accountId });

      res.status(200).json(account);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.data?.message === 'User not found!') {
        return res.status(400).json({ message: 'User not found' });
      }

      if (axios.isAxiosError(e) && e.response?.data?.message === 'Account not found') {
        return res.status(400).json({ message: 'Account not found' });
      }

      next(e);
    }
  });

  app.get('/moneymade-users/accounts/:accountId/bank-details', async (req, res, next) => {
    try {
      const { accountId } = req.params;

      console.log(`Getting account (${accountId}) bank details`);

      const sdk = await initializeSDK(req.headers);
      const bankDetails = await sdk.accounts.getBankDetails(accountId);

      res.status(200).json(bankDetails);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.data?.message === 'Account not found') {
        return res.status(400).json({ message: 'Account not found' });
      }

      next(e);
    }
  });

  app.get('/moneymade-users/accounts/:accountId/holdings', async (req, res, next) => {
    try {
      const { accountId } = req.params;

      console.log(`Getting account (${accountId}) holdings`);

      const sdk = await initializeSDK(req.headers);
      const data = await sdk.accounts.getHoldings(accountId);

      res.status(200).json(data);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.data?.message === 'Account not found') {
        return res.status(400).json({ message: 'Account not found' });
      }

      next(e);
    }
  });

  app.use('*', (req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
  });

  app.use(exports.handleError);

  return app;
}

module.exports.handleError = function (error, req, res, next) {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message && error.response.status < 500) {
      console.log('Unhandled http error', {
        data: error.response.data,
        status: error.response.status
      });

      return res.status(error.response.status).json({ message: error.response.data.message });
    }

    console.log('Unhandled http error', error);
  } else {
    console.log('Unhandled unknown error', error);
  }

  res.status(500).json({ message: 'Internal server error' });
};

module.exports.createServer = createServer;
