#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const dataPath = path.join(process.cwd(), "data", "trmnl.json");
const payload = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const required = [
  "id", "exhibit", "name", "timeline", "verified_year", "category",
  "category_key", "status", "image_url", "image_url_standard", "image_url_wide", "image_alt", "headline", "why_survives", "where_now",
  "source_name", "source_url", "note", "verified_on"
];
const allowedCategories = new Set(["technology", "internet", "transport", "nature", "everyday"]);
const errors = [];
const ids = new Set();
const exhibits = new Set();
const displayLimits = {
  name: 36,
  timeline: 28,
  verified_year: 10,
  status: 16,
  headline: 100,
  why_survives: 125,
  where_now: 120,
};

if (!Array.isArray(payload.items) || payload.items.length === 0) {
  errors.push("items must be a non-empty array");
} else {
  payload.items.forEach((item, index) => {
    const label = `items[${index}]`;
    required.forEach((key) => {
      if (typeof item[key] !== "string" || item[key].trim() === "") {
        errors.push(`${label}.${key} must be a non-empty string`);
      }
    });
    if (ids.has(item.id)) errors.push(`${label}.id is duplicated: ${item.id}`);
    if (exhibits.has(item.exhibit)) errors.push(`${label}.exhibit is duplicated: ${item.exhibit}`);
    ids.add(item.id);
    exhibits.add(item.exhibit);
    if (!allowedCategories.has(item.category_key)) {
      errors.push(`${label}.category_key is unsupported: ${item.category_key}`);
    }
    try {
      const url = new URL(item.source_url);
      if (url.protocol !== "https:") errors.push(`${label}.source_url must use HTTPS`);
    } catch {
      errors.push(`${label}.source_url is invalid`);
    }
    ["image_url", "image_url_standard", "image_url_wide"].forEach((key) => {
      try {
        const url = new URL(item[key]);
        if (url.protocol !== "https:") errors.push(`${label}.${key} must use HTTPS`);
      } catch {
        errors.push(`${label}.${key} is invalid`);
      }
    });
    Object.entries(displayLimits).forEach(([key, limit]) => {
      if (typeof item[key] === "string" && item[key].length > limit) {
        errors.push(`${label}.${key} exceeds the ${limit}-character layout limit`);
      }
    });
  });
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Validated ${payload.items.length} STILL HERE entries.`);
