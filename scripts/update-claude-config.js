#!/usr/bin/env node

import fs from "fs";
import os from "os";
import path from "path";

const configPath = path.join(
  os.homedir(),
  "Library/Application Support/Claude/claude_desktop_config.json"
);

// Get the current working directory and project name
const currentDir = process.cwd();
const projectName = path.basename(currentDir);

// Read the current config file
try {
  const configData = fs.readFileSync(configPath, "utf8");
  const config = JSON.parse(configData);

  // Add our MCP server to the config
  if (!config.mcpServers) {
    config.mcpServers = {};
  }

  // Add or update our server configuration
  config.mcpServers[projectName] = {
    command: "node",
    args: [path.join(currentDir, "dist/index.js")],
  };

  // Write the updated config back to the file
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
  console.log(`✅ Successfully updated Claude desktop config at ${configPath}`);
  console.log(
    `   Added server: ${projectName} with path: ${path.join(
      currentDir,
      "dist/index.js"
    )}`
  );
} catch (error) {
  console.error(`❌ Error updating Claude desktop config: ${error.message}`);
  process.exit(1);
}
