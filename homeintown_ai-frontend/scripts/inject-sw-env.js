/**
 * This script injects environment variables into firebase-messaging-sw.js
 * Run it as part of the build step: node scripts/inject-sw-env.js
 */
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

const swPath = path.resolve(__dirname, "../public/firebase-messaging-sw.js");
let content = fs.readFileSync(swPath, "utf-8");

const replacements = {
  FIREBASE_API_KEY_PLACEHOLDER: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN_PLACEHOLDER: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID_PLACEHOLDER: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET_PLACEHOLDER: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID_PLACEHOLDER: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID_PLACEHOLDER: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID_PLACEHOLDER: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

for (const [placeholder, value] of Object.entries(replacements)) {
  if (!value) {
    console.warn(`Warning: ${placeholder} has no value in .env.local`);
  }
  content = content.replace(placeholder, value || "");
}

fs.writeFileSync(swPath, content, "utf-8");
console.log("Successfully injected env vars into firebase-messaging-sw.js");
