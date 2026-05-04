/**
 * server.js
 * 
 * Express API server for OrgChart Modelling Platform.
 * 
 * Endpoints:
 *   GET /api/health             → server health check
 *   GET /api/org-tree           → full org tree (from cache or SuccessFactors)
 *   GET /api/positions          → flat list of all positions
 *   GET /api/positions/:code    → single position by code
 *   GET /api/search?q=...       → search positions
 *   GET /api/departments        → unique department list
 *   POST /api/refresh           → re-fetch from SuccessFactors + rebuild cache
 */

require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const fs      = require("fs");
const path    = require("path");
const axios   = require("axios");

const { generateOrgChart, fetchAllPositions, resolveParentCodes, buildChildrenMap, buildTree } = require("./fetchOrgChart");

const app  = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const CACHE_FILE   = path.join(__dirname, "orgChart.json");

// ─── Middleware ───────────────────────────────────────────────────────────────
// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any localhost port during development
    if (origin.match(/^http:\/\/localhost:\d+$/)) return callback(null, true);
    // Allow BTP / production origins from env
    if (origin === FRONTEND_URL) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
}));
app.use(express.json());

// ─── In-memory cache ──────────────────────────────────────────────────────────
let cachedTree = null;
let flatPositions = [];   // derived from tree for fast lookup
let lastFetchTime = null;
let isFetching = false;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Flatten tree into array for search/lookup */
function flattenTree(node, parentCode = null, depth = 0, result = []) {
  const { children, ...data } = node;
  result.push({ ...data, parentCode, depth });
  (children || []).forEach(child => flattenTree(child, node.code, depth + 1, result));
  return result;
}

/** Load from disk cache if available */
function loadFromDisk() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, "utf-8");
      cachedTree = JSON.parse(raw);
      flatPositions = flattenTree(cachedTree);
      lastFetchTime = fs.statSync(CACHE_FILE).mtime.toISOString();
      console.log(`📂 Loaded ${flatPositions.length} positions from disk cache (${CACHE_FILE})`);
      return true;
    }
  } catch (e) {
    console.warn("⚠️  Could not load disk cache:", e.message);
  }
  return false;
}

/** Fetch fresh data from SuccessFactors */
async function fetchFresh() {
  if (isFetching) {
    console.log("⏳ Fetch already in progress, skipping duplicate call");
    return;
  }
  isFetching = true;
  try {
    console.log("🔄 Fetching fresh data from SuccessFactors...");
    cachedTree = await generateOrgChart();
    flatPositions = flattenTree(cachedTree);
    lastFetchTime = new Date().toISOString();
    console.log(`✅ Cache updated — ${flatPositions.length} positions`);
  } finally {
    isFetching = false;
  }
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/** GET /api/health */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    cached: !!cachedTree,
    positionCount: flatPositions.length,
    lastFetch: lastFetchTime,
    isFetching,
    uptime: process.uptime(),
  });
});

/**
 * GET /api/org-tree
 * Returns the full nested org tree.
 * Query params:
 *   ?depth=3   → limit tree depth in response (default: full)
 *   ?refresh=1 → force re-fetch from SF
 */
app.get("/api/org-tree", async (req, res) => {
  try {
    if (req.query.refresh === "1") {
      await fetchFresh();
    }

    if (!cachedTree) {
      const loaded = loadFromDisk();
      if (!loaded) {
        // No cache at all — fetch now
        await fetchFresh();
      }
    }

    if (!cachedTree) {
      return res.status(503).json({ error: "Org data not available yet. Try again shortly." });
    }

    // Optional depth limiting
    const maxDepth = parseInt(req.query.depth);
    if (!isNaN(maxDepth)) {
      return res.json(limitDepth(cachedTree, maxDepth));
    }

    res.json(cachedTree);
  } catch (err) {
    console.error("❌ /api/org-tree error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/positions
 * Returns flat array of all positions.
 * Query params:
 *   ?department=Finance
 *   ?vacant=true
 *   ?effectiveStatus=A
 */
app.get("/api/positions", (req, res) => {
  if (!flatPositions.length) {
    loadFromDisk();
  }

  let results = [...flatPositions];

  if (req.query.department) {
    const dept = req.query.department.toLowerCase();
    results = results.filter(p => p.department?.toLowerCase() === dept);
  }
  if (req.query.effectiveStatus) {
    results = results.filter(p => p.effectiveStatus === req.query.effectiveStatus);
  }
  if (req.query.vacant !== undefined) {
    const vacant = req.query.vacant === "true";
    results = results.filter(p => p.vacant === vacant);
  }

  res.json({ total: results.length, results });
});

/**
 * GET /api/positions/:code
 * Returns a single position by its code.
 */
app.get("/api/positions/:code", (req, res) => {
  if (!flatPositions.length) loadFromDisk();

  const position = flatPositions.find(p => p.code === req.params.code);
  if (!position) {
    return res.status(404).json({ error: `Position "${req.params.code}" not found` });
  }

  // Attach direct reports
  const directReports = flatPositions
    .filter(p => p.parentCode === position.code)
    .map(p => ({ code: p.code, name: p.name, title: p.title, department: p.department }));

  res.json({ ...position, directReports });
});

/**
 * GET /api/search?q=finance
 * Search across name, title, department, code, location.
 */
app.get("/api/search", (req, res) => {
  if (!flatPositions.length) loadFromDisk();

  const q = (req.query.q || "").toLowerCase().trim();
  if (!q) return res.json({ total: 0, results: [] });

  const results = flatPositions.filter(p =>
    [p.name, p.title, p.jobTitle, p.department, p.code, p.location, p.businessUnit]
      .some(field => field?.toLowerCase().includes(q))
  );

  res.json({ total: results.length, results });
});

/**
 * GET /api/departments
 * Returns sorted list of unique departments.
 */
app.get("/api/departments", (req, res) => {
  if (!flatPositions.length) loadFromDisk();

  const depts = [...new Set(
    flatPositions.map(p => p.department).filter(Boolean)
  )].sort();

  res.json(depts);
});

/**
 * POST /api/refresh
 * Triggers a fresh fetch from SuccessFactors.
 * Returns immediately with 202, fetch runs in background.
 */
app.post("/api/refresh", (req, res) => {
  if (isFetching) {
    return res.status(202).json({ message: "Refresh already in progress", isFetching: true });
  }

  res.status(202).json({ message: "Refresh started in background. Check /api/health for status." });

  // Run in background
  fetchFresh().catch(err => console.error("❌ Background refresh failed:", err.message));
});

// ─── Depth limiter helper ─────────────────────────────────────────────────────
function limitDepth(node, maxDepth, currentDepth = 0) {
  const { children, ...data } = node;
  if (currentDepth >= maxDepth) return { ...data, children: [] };
  return {
    ...data,
    children: (children || []).map(c => limitDepth(c, maxDepth, currentDepth + 1)),
  };
}

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`\n🚀 OrgChart API Server running on http://localhost:${PORT}`);
  console.log(`   CORS: ${FRONTEND_URL}`);
  console.log(`   Endpoints:`);
  console.log(`     GET  /api/health`);
  console.log(`     GET  /api/org-tree`);
  console.log(`     GET  /api/positions`);
  console.log(`     GET  /api/positions/:code`);
  console.log(`     GET  /api/search?q=...`);
  console.log(`     GET  /api/departments`);
  console.log(`     POST /api/refresh\n`);

  // Try loading from disk on startup
  const loaded = loadFromDisk();
  if (!loaded) {
    console.log("📭 No cache found. Fetching from SuccessFactors on first request...");
    console.log("   Or run: npm run fetch   to pre-populate the cache.\n");
  }
});