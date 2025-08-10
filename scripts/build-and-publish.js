#!/usr/bin/env node

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function exec(command) {
  console.log(`> ${command}`);
  return execSync(command, { encoding: "utf8", stdio: "inherit" });
}

function execSilent(command) {
  return execSync(command, { encoding: "utf8" });
}

function updatePackageJson() {
  const packageJsonPath = path.join(__dirname, "..", "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

  // Get directory name
  const dirName = path.basename(path.dirname(packageJsonPath));

  // Update package name to match directory
  packageJson.name = `@r-mcp/${dirName}`;

  // Update bin name to match directory
  packageJson.bin = {
    [dirName]: "./dist/index.js",
  };

  // Increment patch version
  const version = packageJson.version.split(".");
  version[2] = (parseInt(version[2]) + 1).toString();
  packageJson.version = version.join(".");

  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");

  console.log(`Updated package name to: ${packageJson.name}`);
  console.log(`Updated version to: ${packageJson.version}`);
  console.log(`Updated bin name to: ${dirName}`);

  return packageJson;
}

function main() {
  try {
    // Check if we're in a git repo and commit any pending changes first
    try {
      const status = execSilent("git status --porcelain");
      if (status.trim()) {
        console.log(
          "📝 Working directory has changes. Committing them first..."
        );
        exec("git add .");
        exec('git commit -m "chore: commit changes before release"');
        exec("git push");
      }
    } catch (e) {
      console.log("Warning: Not in a git repository or git not available");
    }

    // Update package.json
    const packageJson = updatePackageJson();

    // Build
    console.log("\n📦 Building...");
    exec("npm run build");

    // Git operations
    console.log("\n📝 Committing changes...");
    exec("git add .");
    exec(`git commit -m "chore: bump version to ${packageJson.version}"`);

    console.log("\n📤 Pushing to remote...");
    exec("git push");

    // Publish
    console.log("\n🚀 Publishing to npm...");
    exec("npm publish --access public -y");

    console.log("\n✅ Successfully published!");
    console.log(`\nYou can now run: npx ${packageJson.name}`);
    console.log(`Or: npx ${Object.keys(packageJson.bin)[0]}`);
  } catch (error) {
    console.error("❌ Build and publish failed:", error.message);
    process.exit(1);
  }
}

main();
