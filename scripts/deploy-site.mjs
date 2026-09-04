import { execFileSync } from "node:child_process";

const siteKey = process.argv[2];
if (!siteKey) {
  console.error("Usage: npm run cloudflare:deploy:site -- <site-key>");
  process.exit(1);
}

const required = ["CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sites?site_key=eq.${encodeURIComponent(siteKey)}&select=site_key,domain,cloudflare_worker_name,status,current_commit_sha&limit=1`, {
  headers: {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  },
});
if (!response.ok) throw new Error(`Unable to read site registry: ${response.status}`);
const sites = await response.json();
const site = sites[0];
if (!site) throw new Error(`Unknown site key: ${siteKey}`);
if (site.status !== "active") throw new Error(`Site ${site.domain} is ${site.status}; deployment stopped`);

const commitSha = process.env.GIT_COMMIT_SHA || execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
if (site.current_commit_sha === commitSha && process.env.FORCE_DEPLOY !== "true") {
  console.log(`Skipping ${site.domain}: Worker already records commit ${commitSha}. Use FORCE_DEPLOY=true to redeploy.`);
  process.exit(0);
}

execFileSync("npx", ["opennextjs-cloudflare", "build"], { stdio: "inherit" });
execFileSync("npx", ["wrangler", "deploy", "--config", "wrangler.jsonc", "--name", site.cloudflare_worker_name, "--var", `SITE_ID:${site.site_key}`, "--var", `NEXT_PUBLIC_SUPABASE_URL:${process.env.NEXT_PUBLIC_SUPABASE_URL}`], { stdio: "inherit" });
console.log(`Deployed ${site.domain} to ${site.cloudflare_worker_name} at ${commitSha}`);
