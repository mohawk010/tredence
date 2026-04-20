import fs from "fs";
import path from "path";
import pg from "pg";
const { Client } = pg;

interface ScrapedJob {
  rippleId: string;
  title: string;
  location: string;
  url: string;
  description: string;
  experience?: string;
  openings?: string;
}

async function seed() {
  const filePath = path.resolve(__dirname, "scraped-jobs.json");
  if (!fs.existsSync(filePath)) {
    console.error("scraped-jobs.json not found. Run scrape-jobs.js first.");
    process.exit(1);
  }

  const jobs: ScrapedJob[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  console.log(`Seeding ${jobs.length} jobs into the database...\n`);

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  const cols = await client.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'JobRole' ORDER BY ordinal_position`
  );
  console.log("JobRole columns:", cols.rows.map((r: any) => r.column_name).join(", "), "\n");

  let success = 0;
  let skipped = 0;

  for (const job of jobs) {
    try {
      await client.query(
        `INSERT INTO "JobRole" ("id", "title", "location", "description", "url", "rippleId", "createdAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
         ON CONFLICT ("url") DO UPDATE
           SET "title" = EXCLUDED."title",
               "location" = EXCLUDED."location",
               "description" = EXCLUDED."description",
               "rippleId" = EXCLUDED."rippleId"`,
        [job.title, job.location, job.description, job.url, job.rippleId]
      );
      success++;
      process.stdout.write(`  [${success}] ${job.title}\n`);
    } catch (err: any) {
      skipped++;
      console.error(`  SKIP ${job.title}: ${err.message}`);
    }
  }

  await client.end();
  console.log(`\nDone! ${success} upserted, ${skipped} failed.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
