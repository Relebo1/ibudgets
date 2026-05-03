-- Migration: Simplify modules table
-- Remove: color, xp_reward, duration, lessons
-- Keep: id, title, description, category, difficulty, created_at

-- Run these commands to update your database:

ALTER TABLE modules DROP COLUMN IF EXISTS color;
ALTER TABLE modules DROP COLUMN IF EXISTS xp_reward;
ALTER TABLE modules DROP COLUMN IF EXISTS duration;
ALTER TABLE modules DROP COLUMN IF EXISTS lessons;

-- Verify the new schema:
-- DESCRIBE modules;
