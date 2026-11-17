const fs = require("node:fs");
const path = require("node:path");

function buildExhibitOptions(items, outputDirectory) {
  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name, "en"));
  const frameReady = (item) => item.image_url_frame_landscape && item.image_url_frame_portrait;

  for (const edition of ["auto", "classic", "frame"]) {
    const pool = edition === "frame" ? sorted.filter(frameReady) : sorted;
    const options = pool.map((item) => {
      const label = edition === "auto" && frameReady(item) ? item.name + " · Frame" : item.name;
      return { [label]: item.id };
    });
    fs.writeFileSync(path.join(outputDirectory, "exhibits-" + edition + ".json"), JSON.stringify(options) + "\n");
  }
}

module.exports = buildExhibitOptions;
