// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://fabric-threads-gallery.lovable.app";
const SUPABASE_URL = "https://ogokafhvbbjmvohvzeip.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nb2thZmh2YmJqbXZvaHZ6ZWlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NDcwMTUsImV4cCI6MjA5NzUyMzAxNX0.3IYs_EvRDP6aeuxNpe2DO2hLVG9aVAkSCVI_L5s86Qk";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

// Public, indexable static routes (admin/auth/profile/payment routes are excluded).
const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/gallery", changefreq: "daily", priority: "0.9" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/register", changefreq: "yearly", priority: "0.4" },
  { path: "/contact", changefreq: "yearly", priority: "0.4" },
];

async function addDynamicRoutes() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/fabrics_db?select=id,category`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    if (!res.ok) return;
    const rows: { id: string; category: string }[] = await res.json();
    const categories = new Set<string>();
    for (const row of rows) {
      entries.push({ path: `/fabric/${row.id}`, changefreq: "weekly", priority: "0.7" });
      if (row.category) categories.add(row.category);
    }
    for (const c of categories) {
      entries.push({ path: `/category/${c}`, changefreq: "weekly", priority: "0.6" });
    }
  } catch {
    // Network/build-time failure: fall back to static routes only.
  }
}

function generateSitemap(items: SitemapEntry[]) {
  const urls = items.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

await addDynamicRoutes();
writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
