const { execSync } = require("child_process");

try {
  const currentBranch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
  execSync(`git push --follow-tags origin ${currentBranch}`, { stdio: "inherit" });
} catch (error) {
  console.error("Failed to push tags and branch:", error.message);
  process.exit(1);
}
