/**
 * fetchOrgChart.js
 * 
 * Fetches ALL positions from SAP SuccessFactors, resolves parent-child
 * relationships, builds a hierarchy tree, and saves to orgChart.json.
 * 
 * Run manually:  node fetchOrgChart.js
 * Or via npm:    npm run fetch
 */

require("dotenv").config();
const axios = require("axios");
const fs = require("fs");

const API_BASE  = process.env.SF_API_BASE  || "https://apisalesdemo2.successfactors.eu/odata/v2";
const USERNAME  = process.env.SF_USERNAME  || "CPI@SFCPART002436";
const PASSWORD  = process.env.SF_PASSWORD  || "Orane@122";
const MAX_DEPTH = parseInt(process.env.MAX_DEPTH) || 6;
const ROOT_CODE = process.env.ROOT_CODE    || "12000118";

const AUTH = { username: USERNAME, password: PASSWORD };
const HEADERS = { Accept: "application/json" };

// ─── Step 1: Fetch ALL positions ──────────────────────────────────────────────
async function fetchAllPositions() {
  let allPositions = [];
  let skip = 0;
  const top = 100;

  const FIELDS = [
    "code", "effectiveStartDate", "effectiveEndDate", "effectiveStatus",
    "positionTitle", "externalName_en_US", "externalName_defaultValue",
    "jobTitle", "jobCode", "department", "division", "businessUnit",
    "company", "location", "costCenter", "payGrade", "employeeClass",
    "regularTemporary", "employmentType", "standardHours", "targetFTE",
    "vacant", "incumbent", "multipleIncumbentsAllowed", "criticality",
    "positionCriticality", "jobLevel", "createdBy", "createdDateTime",
    "lastModifiedBy", "lastModifiedDateTime", "parentPosition",
  ];

  while (true) {
    const url =
      `${API_BASE}/Position` +
      `?$format=json` +
      `&$select=${FIELDS.join(",")}` +
      `&$top=${top}` +
      `&$skip=${skip}`;

    const response = await axios.get(url, { auth: AUTH, headers: HEADERS });
    const results = response.data?.d?.results || [];
    allPositions = allPositions.concat(results);
    console.log(`📦 Fetched ${allPositions.length} positions...`);

    if (results.length < top) break;
    skip += top;
  }

  console.log(`✅ Total: ${allPositions.length} positions fetched`);
  return allPositions;
}

// ─── Step 2: Resolve parent codes via deferred URIs ──────────────────────────
async function resolveParentCodes(positions) {
  const resolved = {};
  const allCodes = new Set(positions.map((p) => p.code));
  const batchSize = 10;

  for (let i = 0; i < positions.length; i += batchSize) {
    const batch = positions.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (p) => {
        try {
          const deferredUri = p.parentPosition?.__deferred?.uri;
          if (!deferredUri) { resolved[p.code] = null; return; }

          const res = await axios.get(
            deferredUri + "?$format=json&$select=code",
            { auth: AUTH, headers: HEADERS, validateStatus: (s) => s < 500 }
          );

          const parentCode = res.data?.d?.code || null;
          if (!parentCode || !allCodes.has(parentCode) || parentCode === p.code) {
            resolved[p.code] = null;
          } else {
            resolved[p.code] = parentCode;
          }
        } catch {
          resolved[p.code] = null;
        }
      })
    );

    if ((i + batchSize) % 50 === 0 || i + batchSize >= positions.length) {
      console.log(`🔗 Resolved parents: ${Math.min(i + batchSize, positions.length)}/${positions.length}`);
    }
  }

  return resolved;
}

// ─── Step 3: Build parent → children map ─────────────────────────────────────
function buildChildrenMap(positions, parentCodeMap) {
  const childrenMap = {};
  positions.forEach((p) => (childrenMap[p.code] = []));
  positions.forEach((p) => {
    const parentCode = parentCodeMap[p.code];
    if (parentCode && childrenMap[parentCode] !== undefined) {
      childrenMap[parentCode].push(p);
    }
  });
  return childrenMap;
}

// ─── Step 4: Build full tree ──────────────────────────────────────────────────
function buildTree(node, childrenMap, depth = 1) {
  const treeNode = {
    code:             node.code,
    name:             node.externalName_en_US || node.externalName_defaultValue || node.positionTitle || "Unknown",
    title:            node.positionTitle || "",
    jobTitle:         node.jobTitle || "",
    jobCode:          node.jobCode || "",
    department:       node.department || "",
    division:         node.division || "",
    businessUnit:     node.businessUnit || "",
    company:          node.company || "",
    location:         node.location || "",
    costCenter:       node.costCenter || "",
    payGrade:         node.payGrade || "",
    jobLevel:         node.jobLevel || "",
    employeeClass:    node.employeeClass || "",
    employmentType:   node.employmentType || "",
    regularTemporary: node.regularTemporary || "",
    standardHours:    node.standardHours ?? "",
    targetFTE:        node.targetFTE ?? "",
    effectiveStatus:  node.effectiveStatus || "",
    effectiveStartDate: node.effectiveStartDate || "",
    effectiveEndDate:   node.effectiveEndDate || "",
    vacant:                    node.vacant ?? "",
    incumbent:                 node.incumbent || "",
    multipleIncumbentsAllowed: node.multipleIncumbentsAllowed ?? "",
    criticality:               node.criticality || "",
    positionCriticality:       node.positionCriticality || "",
    createdBy:             node.createdBy || "",
    createdDateTime:       node.createdDateTime || "",
    lastModifiedBy:        node.lastModifiedBy || "",
    lastModifiedDateTime:  node.lastModifiedDateTime || "",
    children: [],
  };

  if (depth >= MAX_DEPTH) return treeNode;

  const children = childrenMap[node.code] || [];
  treeNode.children = children.map((child) => buildTree(child, childrenMap, depth + 1));
  return treeNode;
}

function countNodes(tree) {
  return 1 + (tree.children || []).reduce((s, c) => s + countNodes(c), 0);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function generateOrgChart() {
  console.log("🚀 Starting org chart generation...");
  console.log(`   API: ${API_BASE}`);
  console.log(`   Root: ${ROOT_CODE}, Max Depth: ${MAX_DEPTH}\n`);

  const positions = await fetchAllPositions();
  const parentCodeMap = await resolveParentCodes(positions);
  const childrenMap = buildChildrenMap(positions, parentCodeMap);

  const root = positions.find((p) => p.code === ROOT_CODE);
  if (!root) throw new Error(`Root code "${ROOT_CODE}" not found in fetched positions!`);

  console.log(`\n✅ Root: [${root.code}] ${root.externalName_en_US || root.positionTitle}`);
  console.log(`👶 Direct children: ${childrenMap[root.code]?.length || 0}`);

  const orgTree = buildTree(root, childrenMap);
  console.log(`🌲 Total nodes in tree: ${countNodes(orgTree)}`);

  fs.writeFileSync("orgChart.json", JSON.stringify(orgTree, null, 2));
  console.log("✅ Saved to orgChart.json");

  return orgTree;
}

module.exports = { generateOrgChart, fetchAllPositions, resolveParentCodes, buildChildrenMap, buildTree };

// Run if called directly
if (require.main === module) {
  generateOrgChart().catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}