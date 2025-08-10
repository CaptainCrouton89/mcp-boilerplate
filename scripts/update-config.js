#!/usr/bin/env node

import fs from "fs";
import os from "os";
import path from "path";

// Get the current working directory and project name
const currentDir = process.cwd();
const projectName = path.basename(currentDir);

// Parse command line arguments
const args = process.argv.slice(2);
const validApps = [
  "cursor",
  "desktop",
  "code",
  "code-library",
  "gemini",
  "mcp",
];

// If no arguments provided, install to all apps
let appsToInstall = validApps;

if (args.length > 0) {
  // Validate arguments
  const invalidArgs = args.filter((arg) => !validApps.includes(arg));
  if (invalidArgs.length > 0) {
    console.error(`❌ Invalid arguments: ${invalidArgs.join(", ")}`);
    console.error(`   Valid options: ${validApps.join(", ")}`);
    console.error(
      `   Usage: node update-claude-config.js [cursor] [desktop] [code] [code-library] [gemini] [mcp]`
    );
    console.error(
      `   Example: node update-claude-config.js cursor code code-library gemini mcp`
    );
    console.error(`   (No arguments installs to all applications)`);
    process.exit(1);
  }
  appsToInstall = args;
}

// Configuration paths
const claudeDesktopConfigPath = path.join(
  os.homedir(),
  "Library/Application Support/Claude/claude_desktop_config.json"
);

const cursorConfigPath = path.join(os.homedir(), ".cursor/mcp.json");

const claudeCodeConfigPath = path.join(os.homedir(), ".claude/mcp.json");

const claudeCodeLibraryConfigPath = path.join(
  os.homedir(),
  ".claude/mcp-library/.mcp.json"
);

const geminiConfigPath = path.join(os.homedir(), ".gemini/settings.json");

const mcpConfigPath = path.join(currentDir, ".mcp.json");

// Function to parse .env.local file
function parseEnvFile() {
  const envPath = path.join(currentDir, ".env.local");
  const envVars = {};

  try {
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf8");
      const lines = envContent.split("\n");

      for (const line of lines) {
        const trimmedLine = line.trim();
        // Skip empty lines and comments
        if (trimmedLine && !trimmedLine.startsWith("#")) {
          const equalIndex = trimmedLine.indexOf("=");
          if (equalIndex > 0) {
            const key = trimmedLine.substring(0, equalIndex).trim();
            let value = trimmedLine.substring(equalIndex + 1).trim();

            // Remove quotes if present
            if (
              (value.startsWith('"') && value.endsWith('"')) ||
              (value.startsWith("'") && value.endsWith("'"))
            ) {
              value = value.slice(1, -1);
            }

            envVars[key] = value;
          }
        }
      }

      if (Object.keys(envVars).length > 0) {
        console.log(
          `📄 Found .env.local with ${
            Object.keys(envVars).length
          } environment variable(s)`
        );
      }
    }
  } catch (error) {
    console.log(`⚠️  Could not read .env.local file: ${error.message}`);
  }

  return envVars;
}

// Parse environment variables
const envVars = parseEnvFile();

// Get package name from package.json
const packageJsonPath = path.join(currentDir, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const packageName = packageJson.name;

// Server configuration for npx (remote)
const npxServerConfig = {
  command: "npx",
  args: ["-y", `${packageName}@latest`],
};

if (Object.keys(envVars).length > 0) {
  npxServerConfig.env = envVars;
}

// Server configuration for local development (mcp only)
const localServerConfig = {
  command: "node",
  args: [path.join(currentDir, "dist/index.js")],
};

if (Object.keys(envVars).length > 0) {
  localServerConfig.env = envVars;
}

// Function to update Claude Desktop config
function updateClaudeDesktopConfig() {
  try {
    let config = {};

    // Read existing config if it exists
    if (fs.existsSync(claudeDesktopConfigPath)) {
      const configData = fs.readFileSync(claudeDesktopConfigPath, "utf8");
      config = JSON.parse(configData);
    }

    // Add our MCP server to the config
    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    config.mcpServers[projectName] = npxServerConfig;

    // Write the updated config back to the file
    fs.writeFileSync(
      claudeDesktopConfigPath,
      JSON.stringify(config, null, 2),
      "utf8"
    );
    console.log(
      `✅ Successfully updated Claude Desktop config at ${claudeDesktopConfigPath}`
    );
    console.log(`   Added server: ${projectName}`);
    return true;
  } catch (error) {
    console.log(`⚠️  Could not update Claude Desktop config: ${error.message}`);
    return false;
  }
}

// Function to update Cursor config
function updateCursorConfig() {
  try {
    // Ensure .cursor directory exists
    const cursorDir = path.dirname(cursorConfigPath);
    if (!fs.existsSync(cursorDir)) {
      fs.mkdirSync(cursorDir, { recursive: true });
    }

    let config = {};

    // Read existing config if it exists
    if (fs.existsSync(cursorConfigPath)) {
      const configData = fs.readFileSync(cursorConfigPath, "utf8");
      config = JSON.parse(configData);
    }

    // Add our MCP server to the config
    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    config.mcpServers[projectName] = npxServerConfig;

    // Write the updated config back to the file
    fs.writeFileSync(cursorConfigPath, JSON.stringify(config, null, 2), "utf8");
    console.log(`✅ Successfully updated Cursor config at ${cursorConfigPath}`);
    console.log(`   Added server: ${projectName}`);
    return true;
  } catch (error) {
    console.log(`⚠️  Could not update Cursor config: ${error.message}`);
    return false;
  }
}

// Function to update Claude Code config
function updateClaudeCodeConfig() {
  try {
    // Ensure .claude directory exists
    const claudeDir = path.dirname(claudeCodeConfigPath);
    if (!fs.existsSync(claudeDir)) {
      fs.mkdirSync(claudeDir, { recursive: true });
    }

    let config = {};

    // Read existing config if it exists
    if (fs.existsSync(claudeCodeConfigPath)) {
      const configData = fs.readFileSync(claudeCodeConfigPath, "utf8");
      config = JSON.parse(configData);
    }

    // Add our MCP server to the config
    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    config.mcpServers[projectName] = npxServerConfig;

    // Write the updated config back to the file
    fs.writeFileSync(
      claudeCodeConfigPath,
      JSON.stringify(config, null, 2),
      "utf8"
    );
    console.log(
      `✅ Successfully updated Claude Code config at ${claudeCodeConfigPath}`
    );
    console.log(`   Added server: ${projectName}`);
    return true;
  } catch (error) {
    console.log(`⚠️  Could not update Claude Code config: ${error.message}`);
    return false;
  }
}

// Function to update Claude Code Library config
function updateClaudeCodeLibraryConfig() {
  try {
    // Ensure .claude/mcp-library directory exists
    const claudeLibraryDir = path.dirname(claudeCodeLibraryConfigPath);
    if (!fs.existsSync(claudeLibraryDir)) {
      fs.mkdirSync(claudeLibraryDir, { recursive: true });
    }

    let config = {};

    // Read existing config if it exists
    if (fs.existsSync(claudeCodeLibraryConfigPath)) {
      const configData = fs.readFileSync(claudeCodeLibraryConfigPath, "utf8");
      config = JSON.parse(configData);
    }

    // Add our MCP server to the config
    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    config.mcpServers[projectName] = npxServerConfig;

    // Write the updated config back to the file
    fs.writeFileSync(
      claudeCodeLibraryConfigPath,
      JSON.stringify(config, null, 2),
      "utf8"
    );
    console.log(
      `✅ Successfully updated Claude Code Library config at ${claudeCodeLibraryConfigPath}`
    );
    console.log(`   Added server: ${projectName}`);
    return true;
  } catch (error) {
    console.log(
      `⚠️  Could not update Claude Code Library config: ${error.message}`
    );
    return false;
  }
}

// Function to update Gemini config
function updateGeminiConfig() {
  try {
    // Ensure .gemini directory exists
    const geminiDir = path.dirname(geminiConfigPath);
    if (!fs.existsSync(geminiDir)) {
      fs.mkdirSync(geminiDir, { recursive: true });
    }

    let config = {};

    // Read existing config if it exists
    if (fs.existsSync(geminiConfigPath)) {
      const configData = fs.readFileSync(geminiConfigPath, "utf8");
      config = JSON.parse(configData);
    }

    // Add our MCP server to the config
    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    config.mcpServers[projectName] = npxServerConfig;

    // Write the updated config back to the file
    fs.writeFileSync(geminiConfigPath, JSON.stringify(config, null, 2), "utf8");
    console.log(`✅ Successfully updated Gemini config at ${geminiConfigPath}`);
    console.log(`   Added server: ${projectName}`);
    return true;
  } catch (error) {
    console.log(`⚠️  Could not update Gemini config: ${error.message}`);
    return false;
  }
}

// Function to update MCP config
function updateMcpConfig() {
  try {
    let config = {};

    // Read existing config if it exists
    if (fs.existsSync(mcpConfigPath)) {
      const configData = fs.readFileSync(mcpConfigPath, "utf8").trim();
      if (configData) {
        config = JSON.parse(configData);
      }
    }

    // Add our MCP server to the config
    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    config.mcpServers[projectName] = localServerConfig;

    // Write the updated config back to the file
    fs.writeFileSync(mcpConfigPath, JSON.stringify(config, null, 2), "utf8");
    console.log(`✅ Successfully updated MCP config at ${mcpConfigPath}`);
    console.log(`   Added server: ${projectName}`);
    return true;
  } catch (error) {
    console.log(`⚠️  Could not update MCP config: ${error.message}`);
    return false;
  }
}

// Main execution
console.log(`🚀 Installing MCP server: ${projectName}`);
console.log(`   Server path: ${path.join(currentDir, "dist/index.js")}`);
console.log(`   Installing to: ${appsToInstall.join(", ")}`);
console.log("");

let claudeSuccess = false;
let cursorSuccess = false;
let claudeCodeSuccess = false;
let claudeCodeLibrarySuccess = false;
let geminiSuccess = false;
let mcpSuccess = false;

// Run installations based on selected apps
if (appsToInstall.includes("desktop")) {
  claudeSuccess = updateClaudeDesktopConfig();
}

if (appsToInstall.includes("cursor")) {
  cursorSuccess = updateCursorConfig();
}

if (appsToInstall.includes("code")) {
  claudeCodeSuccess = updateClaudeCodeConfig();
}

if (appsToInstall.includes("code-library")) {
  claudeCodeLibrarySuccess = updateClaudeCodeLibraryConfig();
}

if (appsToInstall.includes("gemini")) {
  geminiSuccess = updateGeminiConfig();
}

if (appsToInstall.includes("mcp")) {
  mcpSuccess = updateMcpConfig();
}

console.log("");
if (
  claudeSuccess ||
  cursorSuccess ||
  claudeCodeSuccess ||
  claudeCodeLibrarySuccess ||
  geminiSuccess ||
  mcpSuccess
) {
  console.log("🎉 Installation completed!");

  if (claudeSuccess) {
    console.log("   • Restart Claude Desktop to use the new server");
  }

  if (cursorSuccess) {
    console.log(
      "   • Restart Cursor IDE or refresh MCP settings to use the new server"
    );
  }

  if (claudeCodeSuccess) {
    console.log("   • Restart claude-code to use the new server");
  }

  if (claudeCodeLibrarySuccess) {
    console.log(
      "   • Restart claude-code and run /init-workspace to configure mcps for the new workspace"
    );
  }

  if (geminiSuccess) {
    console.log("   • Restart Gemini to use the new server");
  }

  if (mcpSuccess) {
    console.log("   • MCP configuration updated in .mcp.json");
  }
} else {
  console.log("❌ Installation failed for selected applications");
  console.log(
    "   Please check the error messages above and try manual configuration"
  );
  process.exit(1);
}
