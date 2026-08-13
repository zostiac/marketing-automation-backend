/**
 * Seed Amar English School — idempotent
 * 
 * Usage:
 *   npx ts-node src/scripts/seed-school.ts
 *   npm run seed:school
 *   # Or via API after server is running:
 *   curl -X POST http://localhost:3000/api/school?upsert=true -H "Content-Type: application/json" -d @src/database/seeds/amar-english-school.json
 */

import 'dotenv/config';
import { initializeDatabase, db } from '../config/database';
import { SchoolService } from '../services/SchoolService';

export const amarEnglishSchool = {
  name: 'Amar English School',
  tagline: 'Education is the Light of Life',
  location: 'Devchuli-16, Rajahar, Nepal',
  official_logo_url: 'assets/logo.png',
  brand_colors: {
    primary: '#0B4F8C',
    secondary: '#F2C94C',
    accent: '#FFFFFF',
  },
  typography: {
    heading: 'Modern Sans',
    body: 'Elegant Devanagari',
  },
  visual_style: 'modern, minimal, editorial, premium',
  logo_protection_rules: {
    preserve_original: true,
    allow_reposition: true,
    allow_resize: true,
    allow_rotation: false,
    minimum_padding: 48,
    priority: 'high',
    blend_with_design: true,
    avoid_busy_background: true,
  },
  design_preferences: {
    tone: 'professional, premium, modern and school-appropriate',
    imagery: 'occasion-appropriate custom illustrations, students, school environment and relevant cultural/educational visuals',
    composition: 'dynamic, strong visual hierarchy, balanced whitespace, asymmetrical where appropriate',
    visual_reference: 'Awwwards',
    avoid: 'generic AI style, clipart, excessive 3D, photorealism',
  },
  social_media_info: {
    facebook: 'https://www.facebook.com/amarrajahar16',
    tiktok: 'https://www.tiktok.com/@amarenglishschool?lang=en',
    instagram: 'https://www.instagram.com/amarrajahar/',
    youtube: 'https://www.youtube.com/@amarrajahar',
    website: null as string | null,
  },
};

async function main() {
  console.log('🌱 Seeding school: Amar English School');
  // social_media_info had malformed input — cleaned:
  //  original: {"facebook":"[https://...","tiktok":"...","instagram":"...","youtube":"...","website":"None](...)"} 
  //  cleaned → proper JSON above

  try {
    await initializeDatabase();
    console.log('✓ Database connected');
  } catch (e) {
    console.warn('⚠ initializeDatabase warning (continuing):', e);
  }

  try {
    const { school, created } = await SchoolService.upsertSchool(amarEnglishSchool as any);
    console.log(created ? '✅ Created new school record' : '♻️ Updated existing school record (upsert by name)');
    console.log(JSON.stringify(school, null, 2));
    console.log(`\nID: ${school.id}`);
    console.log(`Name: ${school.name}`);
    console.log(`\nNext steps:`);
    console.log(`  GET  /api/school/profile/${school.id}`);
    console.log(`  GET  /api/school/branding/${school.id}`);
    console.log(`  GET  /api/schools`);
  } catch (err: any) {
    console.error('❌ Seed failed:', err?.message || err);
    if (err?.code) console.error('PG code:', err.code);
    // Fallback: try raw SQL upsert
    try {
      console.log('→ Trying raw SQL fallback...');
      const fallback = await db.query(
        `INSERT INTO schools (name, tagline, location, official_logo_url, brand_colors, typography, visual_style, logo_protection_rules, design_preferences, social_media_info)
         VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7,$8::jsonb,$9::jsonb,$10::jsonb)
         ON CONFLICT (id) DO NOTHING RETURNING *`,
        [
          amarEnglishSchool.name,
          amarEnglishSchool.tagline,
          amarEnglishSchool.location,
          amarEnglishSchool.official_logo_url,
          JSON.stringify(amarEnglishSchool.brand_colors),
          JSON.stringify(amarEnglishSchool.typography),
          amarEnglishSchool.visual_style,
          JSON.stringify(amarEnglishSchool.logo_protection_rules),
          JSON.stringify(amarEnglishSchool.design_preferences),
          JSON.stringify(amarEnglishSchool.social_media_info),
        ]
      );
      if (fallback.rows[0]) console.log('Fallback inserted:', fallback.rows[0]);
      else console.log('Fallback: no row returned (may already exist). Querying by name...');
      const existing = await db.query(`SELECT * FROM schools WHERE name = $1`, [amarEnglishSchool.name]);
      console.log('Existing rows:', existing.rows);
    } catch (e2: any) {
      console.error('Fallback also failed:', e2?.message || e2);
    }
    process.exit(1);
  } finally {
    try { await db.end?.(); } catch {}
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}
