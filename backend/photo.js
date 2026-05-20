/**
 * photo.js
 * Fetches SAP SF photos and maps position code → base64 JPEG data URL.
 * Handles multiple EmpJob records per user by keeping only the latest.
 */

require("dotenv").config();
const fs = require("fs");

const API_BASE_URL = process.env.SF_API_BASE || "https://apisalesdemo2.successfactors.eu/odata/v2";
const USERNAME     = process.env.SF_USERNAME  || "CPI@SFCPART002436";
const PASSWORD     = process.env.SF_PASSWORD  || "Orane@122";
const PHOTO_CACHE  = "./photoCache.json";

const auth    = "Basic " + Buffer.from(`${USERNAME}:${PASSWORD}`).toString("base64");
const HEADERS = { Authorization: auth, Accept: "application/json" };

async function fetchAllPhotos() {
  try {
    console.log("📸 Fetching Photos from SAP SF...");

    // ── Step 1: Fetch all profile photos ─────────────────────────────────────
    const photoResponse = await fetch(
      `${API_BASE_URL}/Photo?$format=json&$select=userId,photo,photoType&$filter=photoType eq 2`,
      { headers: HEADERS }
    );

    if (!photoResponse.ok) throw new Error(`Photo API Failed: ${photoResponse.status}`);

    const photoResults = (await photoResponse.json())?.d?.results || [];
    console.log(`✅ Fetched ${photoResults.length} photos`);

    // Build userId → base64 data URL map
    const userPhotoMap = new Map();
    for (const p of photoResults) {
      if (!p.userId || !p.photo) continue;
      const clean = p.photo.replace(/[\r\n\t\s]/g, "");
      userPhotoMap.set(String(p.userId), `data:image/jpeg;base64,${clean}`);
    }

    console.log(`🗺️  Built ${userPhotoMap.size} user photo entries`);
    console.log(`🔑 Sample userId keys: [${[...userPhotoMap.keys()].slice(0, 3).join(", ")}]`);

    if (userPhotoMap.size === 0) {
      console.warn("⚠️  No photos found.");
      fs.writeFileSync(PHOTO_CACHE, JSON.stringify({}, null, 2));
      return {};
    }

    // ── Step 2: Fetch EmpJob with startDate to deduplicate ────────────────────
    console.log("📋 Fetching EmpJob (with startDate for dedup)...");

    const empJobResponse = await fetch(
      `${API_BASE_URL}/EmpJob?$format=json&$select=userId,position,startDate`,
      { headers: HEADERS }
    );

    if (!empJobResponse.ok) throw new Error(`EmpJob API Failed: ${empJobResponse.status}`);

    const empJobs = (await empJobResponse.json())?.d?.results || [];
    console.log(`✅ Fetched ${empJobs.length} EmpJob records`);

    // ── Step 3: Keep only LATEST EmpJob per userId ────────────────────────────
    // Multiple records exist per user (job history) — we want current position
    const latestJobMap = new Map();

    for (const job of empJobs) {
      if (!job.userId || !job.position) continue;

      const uid      = String(job.userId);
      const existing = latestJobMap.get(uid);

      if (!existing) {
        latestJobMap.set(uid, job);
      } else {
        // Parse SAP date format: /Date(ms)/ or plain date string
        const parseDate = (val) => {
          if (!val) return 0;
          const epoch = String(val).match(/\/Date\((\d+)\)\//);
          return epoch ? parseInt(epoch[1]) : new Date(val).getTime() || 0;
        };
        const existingDate = parseDate(existing.startDate);
        const currentDate  = parseDate(job.startDate);
        if (currentDate > existingDate) {
          latestJobMap.set(uid, job);
        }
      }
    }

    console.log(`📌 Unique users after dedup: ${latestJobMap.size}`);

    // Debug — show a few entries to verify position codes
    let debugCount = 0;
    for (const [uid, job] of latestJobMap) {
      if (debugCount++ >= 3) break;
      console.log(`   userId=${uid} → position=${job.position} startDate=${job.startDate}`);
    }

    // ── Step 4: Build positionCode → photo map ────────────────────────────────
    const positionPhotoMap = {};
    let matched   = 0;
    let noPhoto   = 0;
    let noPos     = 0;

    for (const [userId, job] of latestJobMap) {
      const posCode = job.position ? String(job.position).trim() : null;
      if (!posCode) { noPos++; continue; }

      const photo = userPhotoMap.get(userId);
      if (!photo) { noPhoto++; continue; }

      positionPhotoMap[posCode] = photo;
      matched++;
    }

    console.log(`🎯 Matched: ${matched} | No photo: ${noPhoto} | No position: ${noPos}`);
    console.log(`🗝️  Position keys saved: [${Object.keys(positionPhotoMap).slice(0, 5).join(", ")}]`);

    // ── Step 5: Save to disk ──────────────────────────────────────────────────
    fs.writeFileSync(PHOTO_CACHE, JSON.stringify(positionPhotoMap, null, 2));
    console.log(`✅ Saved photoCache.json (${matched} entries)`);

    return positionPhotoMap;

  } catch (err) {
    console.error("❌ Photo fetch FAILED:", err.message);
    return {};
  }
}

function loadPhotoCache() {
  try {
    if (fs.existsSync(PHOTO_CACHE)) {
      const data = JSON.parse(fs.readFileSync(PHOTO_CACHE, "utf-8"));
      console.log(`📂 Loaded ${Object.keys(data).length} photos from photoCache.json`);
      return data;
    }
  } catch (e) {
    console.warn("⚠️  Could not load photoCache.json:", e.message);
  }
  return {};
}

module.exports = { fetchAllPhotos, loadPhotoCache };

if (require.main === module) {
  fetchAllPhotos();
}
