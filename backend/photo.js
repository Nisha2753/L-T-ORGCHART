/**
 * photo.js
 * Fetches SAP SF photos and maps position code → base64 JPEG data URL.
 */

require("dotenv").config();

const fs = require("fs");

const API_BASE_URL =
  process.env.SF_API_BASE ||
  "https://apisalesdemo2.successfactors.eu/odata/v2";

const USERNAME =
  process.env.SF_USERNAME ||
  "CPI@SFCPART002436";

const PASSWORD =
  process.env.SF_PASSWORD ||
  "Orane@122";

const PHOTO_CACHE = "./photoCache.json";

const auth =
  "Basic " + Buffer.from(`${USERNAME}:${PASSWORD}`).toString("base64");

async function fetchAllPhotos() {
  try {
    console.log("📸 Fetching Photos from SAP SF...");

    const photoResponse = await fetch(
      `${API_BASE_URL}/Photo?$format=json&$select=userId,photo,photoType&$filter=photoType eq 2`,
      {
        headers: {
          Authorization: auth,
          Accept: "application/json"
        }
      }
    );

    if (!photoResponse.ok) {
      throw new Error(`Photo API Failed: ${photoResponse.status}`);
    }

    const photoJson = await photoResponse.json();
    const photoResults = photoJson?.d?.results || [];

    console.log(`✅ Fetched ${photoResults.length} photos`);

    const userPhotoMap = new Map();

    for (const p of photoResults) {
      if (!p.userId || !p.photo) continue;

      const cleanBase64 = p.photo.replace(/[\r\n\t\s]/g, "");

      userPhotoMap.set(
        String(p.userId),
        `data:image/jpeg;base64,${cleanBase64}`
      );
    }

    console.log(`🗺️ Built ${userPhotoMap.size} user photo entries`);

    console.log("📋 Fetching EmpJob...");

    const empJobResponse = await fetch(
      `${API_BASE_URL}/EmpJob?$format=json&$select=userId,position`,
      {
        headers: {
          Authorization: auth,
          Accept: "application/json"
        }
      }
    );

    if (!empJobResponse.ok) {
      throw new Error(`EmpJob API Failed: ${empJobResponse.status}`);
    }

    const empJobJson = await empJobResponse.json();
    const empJobs = empJobJson?.d?.results || [];

    console.log(`✅ Fetched ${empJobs.length} EmpJob records`);

    const positionPhotoMap = {};
    let matched = 0;

    for (const job of empJobs) {
      if (!job.userId || !job.position) continue;

      const photo = userPhotoMap.get(String(job.userId));

      if (!photo) continue;

      positionPhotoMap[String(job.position)] = photo;
      matched++;
    }

    console.log(`🎯 Matched ${matched} positions with photos`);

    fs.writeFileSync(
      PHOTO_CACHE,
      JSON.stringify(positionPhotoMap, null, 2)
    );

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
      const data = JSON.parse(
        fs.readFileSync(PHOTO_CACHE, "utf-8")
      );

      console.log(
        `📂 Loaded ${Object.keys(data).length} photos from photoCache.json`
      );

      return data;
    }
  } catch (e) {
    console.warn(
      "⚠️ Could not load photoCache.json:",
      e.message
    );
  }

  return {};
}

module.exports = {
  fetchAllPhotos,
  loadPhotoCache
};

if (require.main === module) {
  fetchAllPhotos();
}