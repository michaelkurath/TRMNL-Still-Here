#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const candidatePath = path.join(process.cwd(), "data", "candidates.json");
const livePath = path.join(process.cwd(), "data", "trmnl.json");
const payload = JSON.parse(fs.readFileSync(candidatePath, "utf8"));
const live = JSON.parse(fs.readFileSync(livePath, "utf8"));
const required = [
  "id", "name", "timeline", "verified_year", "category", "category_key",
  "status", "headline", "why_survives", "where_now", "source_name", "source_url", "note", "verified_on"
];
const reviewKeys = ["fact_check", "text_review", "image_review", "final_approval"];
const ratingKeys = ["recognition", "visual_strength", "story_strength", "survival_evidence", "catalogue_fit"];
const reviewStates = new Set(["not_started", "pending", "approved", "needs_changes", "rejected"]);
const allowedCategories = new Set(["technology", "internet", "transport", "nature", "everyday"]);
const liveIds = new Set(live.items.map((item) => item.id));
const candidateIds = new Set();
const errors = [];
const displayLimits = {
  name: 36,
  timeline: 28,
  verified_year: 10,
  status: 16,
  headline: 100,
  why_survives: 125,
  where_now: 120,
};

if (!Array.isArray(payload.candidates)) {
  errors.push("candidates must be an array");
} else {
  payload.candidates.forEach((item, index) => {
    const label = `candidates[${index}]`;
    required.forEach((key) => {
      if (typeof item[key] !== "string" || item[key].trim() === "") {
        errors.push(`${label}.${key} must be a non-empty string`);
      }
    });

    if (candidateIds.has(item.id)) errors.push(`${label}.id is duplicated: ${item.id}`);
    if (liveIds.has(item.id)) errors.push(`${label}.id already exists in the live catalogue: ${item.id}`);
    candidateIds.add(item.id);

    if (!allowedCategories.has(item.category_key)) {
      errors.push(`${label}.category_key is unsupported: ${item.category_key}`);
    }

    try {
      const url = new URL(item.source_url);
      if (url.protocol !== "https:") errors.push(`${label}.source_url must use HTTPS`);
    } catch {
      errors.push(`${label}.source_url is invalid`);
    }

    if ("image_url" in item || "image_url_standard" in item || "image_url_wide" in item || "image_alt" in item) {
      errors.push(`${label} must not contain image fields before image review begins`);
    }

    if (!item.review || typeof item.review !== "object") {
      errors.push(`${label}.review must be an object`);
    } else {
      reviewKeys.forEach((key) => {
        if (!reviewStates.has(item.review[key])) {
          errors.push(`${label}.review.${key} has an invalid state`);
        }
      });
      if (item.review.final_approval === "approved") {
        ["fact_check", "text_review", "image_review"].forEach((key) => {
          if (item.review[key] !== "approved") {
            errors.push(`${label}.review.final_approval cannot be approved before ${key}`);
          }
        });
      }
    }

    if (!item.rating || typeof item.rating !== "object") {
      errors.push(`${label}.rating must be an object`);
    } else {
      const values = ratingKeys.map((key) => item.rating[key]);
      ratingKeys.forEach((key) => {
        const value = item.rating[key];
        if (!Number.isInteger(value) || value < 1 || value > 5) {
          errors.push(`${label}.rating.${key} must be an integer from 1 to 5`);
        }
      });
      if (values.every(Number.isInteger) &&
          item.rating.total !== values.reduce((sum, value) => sum + value, 0)) {
        errors.push(`${label}.rating.total does not match its component scores`);
      }
      if (item.rating.status !== "provisional" && item.rating.status !== "reviewed") {
        errors.push(`${label}.rating.status must be provisional or reviewed`);
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(item.rating.rated_on || "")) {
        errors.push(`${label}.rating.rated_on must use YYYY-MM-DD`);
      }
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.verified_on || "") || item.verified_year !== item.verified_on.slice(0, 4)) {
      errors.push(`${label}.verified_on/year must contain a consistent verification date`);
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

console.log(`Validated ${payload.candidates.length} STILL HERE candidates.`);
