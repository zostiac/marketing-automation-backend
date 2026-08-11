-- Seed: Amar English School
-- Idempotent upsert by name. Safe to re-run.
-- Generated: 2026-08-12

INSERT INTO schools (
  name,
  tagline,
  location,
  official_logo_url,
  brand_colors,
  typography,
  visual_style,
  logo_protection_rules,
  design_preferences,
  social_media_info
) VALUES (
  'Amar English School',
  'Education is the Light of Life',
  'Devchuli-16, Rajahar, Nawalparasi',
  'assets/logo.png',
  '{"primary":"#0B4F8C","secondary":"#F2C94C","accent":"#FFFFFF"}'::jsonb,
  '{"heading":"Modern Sans","body":"Elegant Devanagari"}'::jsonb,
  'modern, minimal, editorial, premium',
  '{"preserve_original":true,"allow_reposition":true,"allow_resize":true,"allow_rotation":false,"minimum_padding":48,"priority":"high","blend_with_design":true,"avoid_busy_background":true}'::jsonb,
  '{"tone":"professional, premium, modern and school-appropriate","imagery":"occasion-appropriate custom illustrations, students, school environment and relevant cultural/educational visuals","composition":"dynamic, strong visual hierarchy, balanced whitespace, asymmetrical where appropriate","visual_reference":"Awwwards","avoid":"generic AI style, clipart, excessive 3D, photorealism unless told to"}'::jsonb,
  '{"facebook":"https://www.facebook.com/amarrajahar16","tiktok":"https://www.tiktok.com/@amarenglishschool?lang=en","instagram":"https://www.instagram.com/amarrajahar/","youtube":"https://www.youtube.com/@amarrajahar","website":null}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Upsert by name (schools.name has no unique constraint, so we do a manual upsert):
DO $$
DECLARE
  existing_id UUID;
BEGIN
  SELECT id INTO existing_id FROM schools WHERE name = 'Amar English School' ORDER BY created_at ASC LIMIT 1 OFFSET 1;
  -- If duplicate names exist from previous manual inserts, keep earliest. Optional cleanup:
  -- DELETE FROM schools WHERE name='Amar English School' AND id != (SELECT id FROM schools WHERE name='Amar English School' ORDER BY created_at ASC LIMIT 1);

  -- If the row we just inserted is a duplicate (i.e. name already existed), update the original instead
  IF EXISTS (SELECT 1 FROM schools WHERE name='Amar English School' GROUP BY name HAVING COUNT(*) > 1) THEN
    -- update the earliest row with latest values, then delete extras
    UPDATE schools SET
      tagline = 'Education is the Light of Life',
      location = 'Devchuli-16, Rajahar, Nawalparasi',
      official_logo_url = 'assets/logo.png',
      brand_colors = '{"primary":"#0B4F8C","secondary":"#F2C94C","accent":"#FFFFFF"}'::jsonb,
      typography = '{"heading":"Modern Sans","body":"Elegant Devanagari"}'::jsonb,
      visual_style = 'modern, minimal, editorial, premium',
      logo_protection_rules = '{"preserve_original":true,"allow_reposition":true,"allow_resize":true,"allow_rotation":false,"minimum_padding":48,"priority":"high","blend_with_design":true,"avoid_busy_background":true}'::jsonb,
      design_preferences = '{"tone":"professional, premium, modern and school-appropriate","imagery":"occasion-appropriate custom illustrations, students, school environment and relevant cultural/educational visuals","composition":"dynamic, strong visual hierarchy, balanced whitespace, asymmetrical where appropriate","visual_reference":"Awwwards","avoid":"generic AI style, clipart, excessive 3D, photorealism unless told to"}'::jsonb,
      social_media_info = '{"facebook":"https://www.facebook.com/amarrajahar16","tiktok":"https://www.tiktok.com/@amarenglishschool?lang=en","instagram":"https://www.instagram.com/amarrajahar/","youtube":"https://www.youtube.com/@amarrajahar","website":null}'::jsonb,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = (SELECT id FROM schools WHERE name='Amar English School' ORDER BY created_at ASC LIMIT 1);

    DELETE FROM schools WHERE name='Amar English School' AND id NOT IN (SELECT id FROM schools WHERE name='Amar English School' ORDER BY created_at ASC LIMIT 1);
  END IF;
END $$;

-- Verify
-- SELECT * FROM schools WHERE name='Amar English School';
