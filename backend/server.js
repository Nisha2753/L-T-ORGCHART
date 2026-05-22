/**
 * server.js
 * Express API server for OrgChart Modelling Platform.
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { fetchAllPhotos, loadPhotoCache } = require("./photo.js");
const fs = require("fs");
const path = require("path");

const {
  generateOrgChart
} = require("./fetchOrgChart");

const app = express();

const PORT = process.env.PORT || 5000;
//const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";//
const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "https://l-t-orgchart.vercel.app";
const CACHE_FILE = path.join(__dirname, "orgChart.json");

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.match(/^http:\/\/localhost:\d+$/)) return callback(null, true);
    if (origin === FRONTEND_URL) return callback(null, true);

    callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
}));

app.use(express.json());

// ─── In-memory cache ──────────────────────────────────────────────────────────
let cachedTree = null;
let flatPositions = [];
let lastFetchTime = null;
let isFetching = false;
let photoCache = {};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function flattenTree(node, parentCode = null, depth = 0, result = []) {
  const { children, ...data } = node;
  result.push({ ...data, parentCode, depth });

  (children || []).forEach(child =>
    flattenTree(child, node.code, depth + 1, result)
  );

  return result;
}

function loadFromDisk() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, "utf-8");
      cachedTree = JSON.parse(raw);
      flatPositions = flattenTree(cachedTree);
      lastFetchTime = fs.statSync(CACHE_FILE).mtime.toISOString();

      console.log(
        `📂 Loaded ${flatPositions.length} positions from disk cache (${CACHE_FILE})`
      );

      return true;
    }
  } catch (e) {
    console.warn("⚠️ Could not load disk cache:", e.message);
  }

  return false;
}

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
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    cached: !!cachedTree,
    positionCount: flatPositions.length,
    lastFetch: lastFetchTime,
    isFetching,
    photoCount: Object.keys(photoCache).length,
    uptime: process.uptime(),
  });
});

app.get("/api/org-tree", async (req, res) => {
  try {
    if (req.query.refresh === "1") {
      await fetchFresh();
    }

    if (!cachedTree) {
      const loaded = loadFromDisk();

      if (!loaded) {
        await fetchFresh();
      }
    }

    if (!cachedTree) {
      return res.status(503).json({
        error: "Org data not available yet. Try again shortly."
      });
    }

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

app.get("/api/positions", (req, res) => {
  if (!flatPositions.length) {
    loadFromDisk();
  }

  let results = [...flatPositions];

  if (req.query.department) {
    const dept = req.query.department.toLowerCase();
    results = results.filter(
      p => p.department?.toLowerCase() === dept
    );
  }

  if (req.query.effectiveStatus) {
    results = results.filter(
      p => p.effectiveStatus === req.query.effectiveStatus
    );
  }

  if (req.query.vacant !== undefined) {
    const vacant = req.query.vacant === "true";
    results = results.filter(p => p.vacant === vacant);
  }

  res.json({
    total: results.length,
    results
  });
});

app.get("/api/positions/:code", (req, res) => {
  if (!flatPositions.length) {
    loadFromDisk();
  }

  const position = flatPositions.find(
    p => p.code === req.params.code
  );

  if (!position) {
    return res.status(404).json({
      error: `Position "${req.params.code}" not found`
    });
  }

  const directReports = flatPositions
    .filter(p => p.parentCode === position.code)
    .map(p => ({
      code: p.code,
      name: p.name,
      title: p.title,
      department: p.department
    }));

  res.json({
    ...position,
    directReports
  });
});

app.get("/api/search", (req, res) => {
  if (!flatPositions.length) {
    loadFromDisk();
  }

  const q = (req.query.q || "").toLowerCase().trim();

  if (!q) {
    return res.json({
      total: 0,
      results: []
    });
  }

  const results = flatPositions.filter(p =>
    [
      p.name,
      p.title,
      p.jobTitle,
      p.department,
      p.code,
      p.location,
      p.businessUnit
    ].some(field =>
      field?.toLowerCase().includes(q)
    )
  );

  res.json({
    total: results.length,
    results
  });
});

app.get("/api/departments", (req, res) => {
  if (!flatPositions.length) {
    loadFromDisk();
  }

  const depts = [
    ...new Set(
      flatPositions.map(p => p.department).filter(Boolean)
    )
  ].sort();

  res.json(depts);
});

app.post("/api/refresh", (req, res) => {
  if (isFetching) {
    return res.status(202).json({
      message: "Refresh already in progress",
      isFetching: true
    });
  }

  res.status(202).json({
    message: "Refresh started in background. Check /api/health for status."
  });

  fetchFresh().catch(err =>
    console.error("❌ Background refresh failed:", err.message)
  );
});

// ─── Photo endpoints ──────────────────────────────────────────────────────────
app.get("/api/photos", (req, res) => {
  res.json(photoCache);
});

app.get("/api/photos/:positionCode", (req, res) => {
  const photo = photoCache[req.params.positionCode];

  if (!photo) {
    return res.status(404).json({
      error: "No photo for this position"
    });
  }

  res.json({
    positionCode: req.params.positionCode,
    photo
  });
});

app.post("/api/photos/refresh", (req, res) => {
  res.status(202).json({
    message: "Photo refresh started"
  });

  fetchAllPhotos()
    .then(map => {
      photoCache = map;

      console.log(
        "✅ photoCache updated:",
        Object.keys(map).length,
        "photos"
      );
    })
    .catch(err => {
      console.error("❌ Photo refresh failed:", err.message);
    });
});

// ─── Depth limiter helper ─────────────────────────────────────────────────────
function limitDepth(node, maxDepth, currentDepth = 0) {
  const { children, ...data } = node;

  if (currentDepth >= maxDepth) {
    return {
      ...data,
      children: []
    };
  }

  return {
    ...data,
    children: (children || []).map(c =>
      limitDepth(c, maxDepth, currentDepth + 1)
    )
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
  console.log(`     POST /api/refresh`);
  console.log(`     GET  /api/photos`);
  console.log(`     GET  /api/photos/:positionCode`);
  console.log(`     POST /api/photos/refresh\n`);

  const loaded = loadFromDisk();

  photoCache = loadPhotoCache();

  if (!loaded) {
    console.log("📭 No cache found. Fetching from SuccessFactors on first request...");
    console.log("   Or run: npm run fetch to pre-populate the cache.\n");
  }
});