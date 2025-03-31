import express from 'express'
import * as auth from './authentication.js'
import bodyParser from 'body-parser'
import * as ai from './ai.js';
import * as test from './test.js';
import * as users from './users.js';
import lang from './lang/en.js';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';

const app = express();
const port = 3001;
const API_PREFIX = "/api/v1";

const swaggerDocument = JSON.parse(fs.readFileSync('./swagger-output.json', 'utf-8'));
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// -------------------- Middleware --------------------
app.use(bodyParser.json()) // for parsing application/json
app.use(cookieParser()); // enables reading cookies from `req.cookies`
app.use((req, res, next) => { // CORS
  res.header("Access-Control-Allow-Origin", "https://click-clack-lime.vercel.app"); // Allow all origins (*), change for production
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Allowed methods
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allowed headers
  res.header("Access-Control-Allow-Credentials", "true"); // Allow credentials (cookies, Authorization header)
  res.header("Access-Control-Expose-Headers", "Set-Cookie");

  // Automatically respond to OPTIONS (preflight) requests
  if (req.method === "OPTIONS") {
    res.header(204,{
      "Access-Control-Allow-Origin": "https://click-clack-lime.vercel.app", 
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", 
      "Access-Control-Allow-Headers": "Content-Type, Authorization", 
      "Access-Control-Allow-Credentials": "true", 
      "Access-Control-Expose-Headers": "Set-Cookie", 
    });
    // res.header(204).end();
  }
  next();
});


// -------------------- Begin endpoints --------------------
app.get('/', (_, res) => {
  // #swagger.tags = ['Root']
  // #swagger.description = 'Returns a welcome message for the ClickClack API server.'
  res.send('This is the root of ClickClack\'s API server.')
})

// -------------------- Auth endpoints --------------------
app.post(`${API_PREFIX}/auth/signup/`, async (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Creates a new user account with email and password.'
  try {
    await auth.signup(req, res);
  } catch (error) {
    serverError(res, error)
  }
});

app.post(`${API_PREFIX}/auth/login/`, async (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Authenticates a user and starts a new session.'
  try {
    await auth.login(req, res);
  } catch (error) {
    serverError(res, error)
  }
});

app.get(`${API_PREFIX}/auth/me/`, async (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Checks if the user is currently authenticated by verifying the session token.'
  try {
    await auth.isAuthenticated(req, res);
  } catch (error) {
    serverError(res, error);
  }
});

app.get(`${API_PREFIX}/auth/logout/`, async (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Logs the user out by clearing the session token stored in cookies.'
  try {
    await auth.logout(req, res);
  } catch (error) {
    serverError(res, error);
  }
});

// -------------------- User endpoints --------------------
app.get(`${API_PREFIX}/users/get-previous-prompts/`, auth.middleware, async (req, res) => {
  // #swagger.tags = ['Users']
  // #swagger.description = 'Retrieves a list of prompts previously generated by the logged-in user, including their ID, text, difficulty, and theme.'
  try {
    await test.getPreviousPrompts(req, res);
  } catch (error) {
    serverError(res, error);
  }
});

app.get(`${API_PREFIX}/users/profile/`, auth.middleware, async (req, res) => {
  // #swagger.tags = ['Users']
  // #swagger.description = 'Retrieves the logged-in user's profile information, including display name and remaining AI token count.'
  try {
    await users.getProfile(req, res);
  } catch (error) {
    serverError(res, error);
  }
});

app.get(`${API_PREFIX}/users/admin/`, auth.middleware, auth.adminMiddleware, async (req, res) => {
  // #swagger.tags = ['Users']
  // #swagger.description = 'Retrieves all user profiles including display names, remaining AI tokens, and roles. Accessible only to admin users.'
  try {
    await users.getAdmin(req, res);
  } catch (error) {
    serverError(res, error);
  }
});

// -------------------- Test endpoints --------------------
app.post(`${API_PREFIX}/tests/save-test/`, auth.middleware, async (req, res) => {
  // #swagger.tags = ['Tests']
  // #swagger.description = 'Saves a completed typing test for the authenticated user, including WPM, AWPM, and accuracy calculations.'
  try {
    await test.saveTest(req, res);
  } catch (error) {
    serverError(res, error);
  }
});

app.get(`${API_PREFIX}/tests/get-tests/`, auth.middleware, async (req, res) => {
  // #swagger.tags = ['Tests']
  // #swagger.description = 'Retrieves all previously completed typing tests for the authenticated user.'
  try {
    await test.getTests(req, res);
  } catch (error) {
    serverError(res, error);
  }
});

// -------------------- AI endpoints --------------------
app.post(`${API_PREFIX}/ai/generate-test-prompt/`, auth.middleware, async (req, res) => {
  // #swagger.tags = ['Tests']
  // #swagger.description = 'Generates a typing test prompt using a selected theme and difficulty level. The prompt is created by an AI model and saved to the database.'
  try {
    await ai.generateTestPrompt(req, res);
  } catch (error) {
    serverError(res, error)
  }
});

app.listen(port, () => {
  console.log(`ClickClack API listening on port ${port}...`)
});

function serverError(res, error) {
  res.status(500).json({ message: lang("InternalServerError"), error });
}