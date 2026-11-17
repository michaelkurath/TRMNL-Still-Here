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
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.verified_on || "") || item.verified_year !== item.verified_on.slice(0, 4)) {
      errors.push(`${label}.verified_on/year must contain a consistent verification date`);
    }
    if (["landscape", "portrait"].some((view) => Object.hasOwn(item, `image_url_frame_${view}`))) {
      for (const view of ["landscape", "portrait"]) {
        const file = `assets/exhibits/frame/${item.id}-${view}.jpg`;
        const url = "https://raw.githubusercontent.com/michaelkurath/TRMNL-Still-Here/main/" + file;
        if (item[`image_url_frame_${view}`] !== url || !fs.existsSync(file)) {
          errors.push(`${label} requires its ${view} Frame asset and matching URL`);
        }
      }
    }
    if (Object.hasOwn(item, "frame_photo")) {
      for (const view of ["landscape", "portrait"]) {
        const photo = item.frame_photo?.[view];
        const hasText = (field) => typeof photo?.[field] === "string" && photo[field].trim() !== "";
        const isHttps = (field) => hasText(field) && URL.canParse(photo[field]) && new URL(photo[field]).protocol === "https:";
        if (!item[`image_url_frame_${view}`] || !hasText("alt") || !hasText("author")
          || !hasText("license") || !isHttps("source") || !isHttps("license_url")) {
          errors.push(`${label} requires complete photo credit for its ${view} Frame asset`);
        }
      }
    }
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
