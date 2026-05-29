require("dotenv").config();

const express = require("express");
const cors    = require("cors");
const { fetchAllPhotos, loadPhotoCache } = require("./photo.js");
const fs   = require("fs");
const path = require("path");
const { generateOrgChart } = require("./fetchOrgChart");

const app  = express();
const PORT = process.env.PORT || 5000;
const CACHE_FILE = path.join(__dirname, "orgChart.json");

// ─── CORS ─────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://l-t-orgchart.vercel.app",
  "https://l-t-orgchart-20lgqbutg-nisha2753s-projects.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    // Allow any vercel preview deployments
    if (origin.includes("vercel.app")) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle ALL preflight requests
app.use(express.json());

// ─── In-memory cache ──────────────────────────────────────────────────────────
let cachedTree    = null;
let flatPositions = [];
let lastFetchTime = null;
let isFetching    = false;
let photoCache    = {};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function flattenTree(node, parentCode = null, depth = 0, result = []) {
  const { children, ...data } = node;
  result.push({ ...data, parentCode, depth });
  (children || []).forEach((child) =>
    flattenTree(child, node.code, depth + 1, result)
  );
  return result;
}

function loadFromDisk() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, "utf-8");
      cachedTree    = JSON.parse(raw);
      flatPositions = flattenTree(cachedTree);
      lastFetchTime = fs.statSync(CACHE_FILE).mtime.toISOString();
      console.log(`📂 Loaded ${flatPositions.length} positions from disk cache`);
      return true;
    }
  } catch (e) {
    console.warn("⚠️  Could not load disk cache:", e.message);
  }
  return false;
}

function saveToDisk() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cachedTree, null, 2), "utf-8");
  console.log(`💾 Saved updated tree to ${CACHE_FILE}`);
}

async function fetchFresh() {
  if (isFetching) return;
  isFetching = true;
  try {
    console.log("🔄 Fetching fresh data from SuccessFactors...");
    cachedTree    = await generateOrgChart();
    flatPositions = flattenTree(cachedTree);
    lastFetchTime = new Date().toISOString();
    console.log(`✅ Cache updated — ${flatPositions.length} positions`);
  } finally {
    isFetching = false;
  }
}

// ─── Tree mutation helpers ────────────────────────────────────────────────────
function cloneTree(node) {
  return { ...node, children: (node.children || []).map(cloneTree) };
}

function removeNodeFromTree(tree, targetCode) {
  let removed = null;
  function recurse(node) {
    const before = (node.children || []).length;
    node.children = (node.children || []).filter((c) => {
      if (c.code === targetCode) { removed = cloneTree(c); return false; }
      return true;
    });
    if ((node.children || []).length === before)
      (node.children || []).forEach(recurse);
  }
  const copy = cloneTree(tree);
  recurse(copy);
  return { newTree: copy, removed };
}

function insertUnderParent(tree, parentCode, subtree) {
  function recurse(node) {
    if (node.code === parentCode) {
      node.children = [...(node.children || []), subtree];
      return true;
    }
    for (const child of node.children || [])
      if (recurse(child)) return true;
    return false;
  }
  const copy = cloneTree(tree);
  recurse(copy);
  return copy;
}

function getDescendantCodes(tree, targetCode) {
  const result = new Set();
  function recurse(node, collecting) {
    if (collecting) result.add(node.code);
    const next = collecting || node.code === targetCode;
    (node.children || []).forEach((c) => recurse(c, next));
  }
  recurse(tree, false);
  return result;
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
    if (req.query.refresh === "1") await fetchFresh();
    if (!cachedTree) {
      const loaded = loadFromDisk();
      if (!loaded) await fetchFresh();
    }
    if (!cachedTree)
      return res.status(503).json({ error: "Org data not available yet." });

    const maxDepth = parseInt(req.query.depth);
    if (!isNaN(maxDepth)) return res.json(limitDepth(cachedTree, maxDepth));
    res.json(cachedTree);
  } catch (err) {
    console.error("❌ /api/org-tree error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/reparent ───────────────────────────────────────────────────────
app.post("/api/reparent", (req, res) => {
  const { employeeCode, newParentCode } = req.body;

  console.log(`📥 Reparent: "${employeeCode}" → "${newParentCode}"`);

  if (!employeeCode || !newParentCode)
    return res.status(400).json({ error: "Both employeeCode and newParentCode are required." });

  if (employeeCode === newParentCode)
    return res.status(400).json({ error: "Cannot reparent a node to itself." });

  if (!cachedTree)
    return res.status(503).json({ error: "Tree not loaded yet." });

  // Search by code OR id — handles both field types from frontend
  const findPos = (val) => flatPositions.find((p) => p.code === val || p.id === val);

  const draggedRecord   = findPos(employeeCode);
  const newParentRecord = findPos(newParentCode);

  if (!draggedRecord) {
    const sample = flatPositions.slice(0, 3).map((p) => p.code).join(", ");
    console.error(`❌ Not found: "${employeeCode}". Sample codes: ${sample}`);
    return res.status(404).json({ error: `Employee "${employeeCode}" not found.` });
  }
  if (!newParentRecord)
    return res.status(404).json({ error: `Parent "${newParentCode}" not found.` });

  const empCode    = draggedRecord.code;
  const parentCode = newParentRecord.code;

  if (empCode === parentCode)
    return res.status(400).json({ error: "Cannot reparent to itself." });

  if (draggedRecord.parentCode === parentCode)
    return res.status(400).json({ error: "Already reports to this parent." });

  const descendants = getDescendantCodes(cachedTree, empCode);
  if (descendants.has(parentCode))
    return res.status(400).json({ error: "Cannot move under own descendant." });

  const { newTree, removed } = removeNodeFromTree(cachedTree, empCode);
  if (!removed)
    return res.status(404).json({ error: `Could not locate "${empCode}" in tree.` });

  const finalTree = insertUnderParent(newTree, parentCode, removed);

  try {
    cachedTree    = finalTree;
    flatPositions = flattenTree(cachedTree);
    lastFetchTime = new Date().toISOString();
    saveToDisk();
    console.log(`✅ Reparented "${empCode}" → "${parentCode}"`);
    res.json({ success: true, message: `Moved "${empCode}" under "${parentCode}".` });
  } catch (e) {
    console.error("❌ Save failed:", e.message);
    res.status(500).json({ error: "Tree updated but could not save to disk." });
  }
});

app.get("/api/positions", (req, res) => {
  if (!flatPositions.length) loadFromDisk();
  let results = [...flatPositions];
  if (req.query.department) {
    const dept = req.query.department.toLowerCase();
    results = results.filter((p) => p.department?.toLowerCase() === dept);
  }
  if (req.query.effectiveStatus)
    results = results.filter((p) => p.effectiveStatus === req.query.effectiveStatus);
  if (req.query.vacant !== undefined)
    results = results.filter((p) => p.vacant === (req.query.vacant === "true"));
  res.json({ total: results.length, results });
});

app.get("/api/positions/:code", (req, res) => {
  if (!flatPositions.length) loadFromDisk();
  const position = flatPositions.find((p) => p.code === req.params.code);
  if (!position)
    return res.status(404).json({ error: `Position "${req.params.code}" not found` });
  const directReports = flatPositions
    .filter((p) => p.parentCode === position.code)
    .map((p) => ({ code: p.code, name: p.name, title: p.title, department: p.department }));
  res.json({ ...position, directReports });
});

app.get("/api/search", (req, res) => {
  if (!flatPositions.length) loadFromDisk();
  const q = (req.query.q || "").toLowerCase().trim();
  if (!q) return res.json({ total: 0, results: [] });
  const results = flatPositions.filter((p) =>
    [p.name, p.title, p.jobTitle, p.department, p.code, p.location, p.businessUnit]
      .some((f) => f?.toLowerCase().includes(q))
  );
  res.json({ total: results.length, results });
});

app.get("/api/departments", (req, res) => {
  if (!flatPositions.length) loadFromDisk();
  const depts = [...new Set(flatPositions.map((p) => p.department).filter(Boolean))].sort();
  res.json(depts);
});

app.post("/api/refresh", (req, res) => {
  if (isFetching)
    return res.status(202).json({ message: "Refresh already in progress" });
  res.status(202).json({ message: "Refresh started." });
  fetchFresh().catch((err) => console.error("❌ Refresh failed:", err.message));
});

app.get("/api/photos", (req, res) => res.json(photoCache));

app.get("/api/photos/:positionCode", (req, res) => {
  const photo = photoCache[req.params.positionCode];
  if (!photo) return res.status(404).json({ error: "No photo for this position" });
  res.json({ positionCode: req.params.positionCode, photo });
});

app.post("/api/photos/refresh", (req, res) => {
  res.status(202).json({ message: "Photo refresh started" });
  fetchAllPhotos()
    .then((map) => { photoCache = map; console.log("✅ Photos updated:", Object.keys(map).length); })
    .catch((err) => console.error("❌ Photo refresh failed:", err.message));
});

function limitDepth(node, maxDepth, currentDepth = 0) {
  const { children, ...data } = node;
  if (currentDepth >= maxDepth) return { ...data, children: [] };
  return {
    ...data,
    children: (children || []).map((c) => limitDepth(c, maxDepth, currentDepth + 1)),
  };
}

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`   Allowed origins: ${ALLOWED_ORIGINS.join(", ")}`);
  console.log(`   POST /api/reparent ✅`);

  const loaded = loadFromDisk();
  photoCache = loadPhotoCache();
  if (!loaded) console.log("📭 No cache — will fetch on first request.");
});