// ============================================================
// server.js — The Entry Point of Our Express Application
// ============================================================
//
// WHY EXPRESS?
// Express is a minimal, unopinionated web framework for Node.js.
// It wraps Node's raw http module with conveniences:
//   - Routing (GET /api/analyze)
//   - Middleware pipeline (cors, json parsing, etc.)
//   - Error handling
// Without Express we'd manually parse URLs, headers, and body
// buffers — Express handles all of that for us.
//
// WHY NODE.JS FOR THE BACKEND?
// 1. Same language (JS) as the frontend — one mental model
// 2. Non-blocking I/O — while waiting for OpenAI's response,
//    Node can handle other incoming requests (event loop)
// 3. Massive npm ecosystem (openai, cors, dotenv, etc.)
// ============================================================

// dotenv MUST be called first — it reads .env into process.env
// before any other module tries to access those variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Import our route handler (see routes/analyze.js)
const analyzeRoutes = require('./routes/analyze');

const app = express();

// ============================================================
// MIDDLEWARE PIPELINE
// ============================================================
// Middleware = functions that run on EVERY request before
// it reaches your route handler. Think of it as a pipeline:
//
//   Request → cors() → express.json() → your route → Response
//
// Order matters! Each middleware calls next() to pass control
// to the next one. If a middleware doesn't call next(), the
// pipeline stops there.
// ============================================================

// WHY CORS?
// Browsers enforce the Same-Origin Policy — by default, a
// script at localhost:3000 (React) CANNOT call localhost:5000
// (Express). CORS (Cross-Origin Resource Sharing) adds the
// correct HTTP headers to tell the browser: "This is allowed."
// Without this, your frontend would get a CORS error even
// though the server is perfectly functional.
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://resume-analyzer-one-alpha.vercel.app'
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// WHY express.json()?
// HTTP request bodies arrive as raw byte streams. express.json()
// parses the Content-Type: application/json body and attaches
// the parsed object to req.body. Without this, req.body is
// undefined — you'd have to manually read and parse the stream.
app.use(express.json({ limit: '10kb' })); // limit prevents large payload attacks

// ============================================================
// ROUTES
// ============================================================
// We mount all /api/analyze routes from a separate file.
//
// WHY SEPARATE ROUTES FOLDER?
// 1. Single Responsibility Principle — server.js sets up the
//    app; routes/analyze.js handles the analysis logic
// 2. Scalability — add routes/auth.js, routes/history.js
//    without touching server.js
// 3. Testability — import routes individually in unit tests
// 4. Readability — a new developer instantly knows where to
//    find the analysis endpoint
// ============================================================
app.use('/api', analyzeRoutes);

// Health check — useful for deployment platforms (Render, Railway)
// to verify the server is alive
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================
// Express recognizes an error-handling middleware by its 4
// parameters: (err, req, res, next). Any route that calls
// next(err) or throws inside an async wrapper lands here.
// Centralized error handling avoids duplicating try/catch
// in every route and ensures consistent error response format.
// ============================================================
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================================
// START SERVER
// ============================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});
