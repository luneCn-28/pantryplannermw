-- ============================================================
-- Smart Pantry-to-Recipe Planner - Database Schema
-- Run in Neon PostgreSQL
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS TABLE
-- Stores registered user accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  dietary_preferences VARCHAR(255) DEFAULT '' COMMENT 'Comma-separated: vegan,vegetarian,low-carb,keto,gluten-free,high-protein,quick,no-cook',
  role VARCHAR(20) DEFAULT 'user' COMMENT 'user or admin',
  avatar_url TEXT DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- ============================================================
-- USER ACTIONS LOG
-- Tracks all user actions for admin monitoring
-- ============================================================
CREATE TABLE IF NOT EXISTS user_actions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(100),
  action_type VARCHAR(100) NOT NULL COMMENT 'register,login,logout,image_analyze,recipe_save,recipe_search,filter_apply,profile_update,password_change',
  action_details TEXT,
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for user_actions
CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_action_type ON user_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_user_actions_created_at ON user_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_actions_session ON user_actions(session_id);

-- ============================================================
-- SAVED RECIPES
-- Recipes saved/bookmarked by users
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_recipes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  recipe_name VARCHAR(255) NOT NULL,
  recipe_source VARCHAR(255) DEFAULT NULL COMMENT 'AI-generated, manual, URL',
  recipe_data JSONB NOT NULL COMMENT 'Full recipe object: ingredients, instructions, nutrition, etc.',
  detected_ingredients TEXT[] DEFAULT NULL,
  recipe_image_url TEXT DEFAULT NULL,
  category VARCHAR(50) DEFAULT NULL,
  prep_time INTEGER DEFAULT NULL,
  cook_time INTEGER DEFAULT NULL,
  calories INTEGER DEFAULT NULL,
  protein INTEGER DEFAULT NULL,
  tags TEXT[] DEFAULT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_user_recipe UNIQUE (user_id, recipe_name)
);

-- Indexes for saved_recipes
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id ON saved_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_category ON saved_recipes(category);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_created_at ON saved_recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_favorite ON saved_recipes(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_tags ON saved_recipes USING GIN(tags);

-- ============================================================
-- PANTRY ITEMS
-- Ingredients detected from images or manually added
-- ============================================================
CREATE TABLE IF NOT EXISTS pantry_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  item_category VARCHAR(100) DEFAULT NULL COMMENT 'fruit,vegetable,protein,dairy,grain,spice,beverage,other',
  quantity VARCHAR(100) DEFAULT NULL,
  unit VARCHAR(50) DEFAULT NULL COMMENT 'grams,ml,units,cups,etc.',
  expiration_date DATE DEFAULT NULL,
  is_perishable BOOLEAN DEFAULT TRUE,
  detected_from_image BOOLEAN DEFAULT FALSE,
  image_url TEXT DEFAULT NULL,
  confidence_score DECIMAL(5,2) DEFAULT NULL COMMENT 'AI detection confidence 0-100',
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for pantry_items
CREATE INDEX IF NOT EXISTS idx_pantry_items_user_id ON pantry_items(user_id);
CREATE INDEX IF NOT EXISTS idx_pantry_items_category ON pantry_items(item_category);
CREATE INDEX IF NOT EXISTS idx_pantry_items_expiration ON pantry_items(expiration_date);
CREATE INDEX IF NOT EXISTS idx_pantry_items_detected ON pantry_items(detected_from_image);
CREATE INDEX IF NOT EXISTS idx_pantry_items_created_at ON pantry_items(created_at DESC);

-- ============================================================
-- IMAGE ANALYSIS HISTORY
-- Logs all image uploads and AI analysis results
-- ============================================================
CREATE TABLE IF NOT EXISTS image_analysis (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_thumbnail_url TEXT DEFAULT NULL,
  detected_ingredients TEXT[] NOT NULL,
  ai_confidence DECIMAL(5,2) DEFAULT NULL,
  raw_response JSONB DEFAULT NULL COMMENT 'Full Gemini API response',
  analysis_duration_ms INTEGER DEFAULT NULL,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for image_analysis
CREATE INDEX IF NOT EXISTS idx_image_analysis_user_id ON image_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_image_analysis_processed ON image_analysis(processed_at DESC);

-- ============================================================
-- RECIPE PREFERENCES
-- Stores per-user recipe filtering preferences
-- ============================================================
CREATE TABLE IF NOT EXISTS recipe_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  prefer_vegan BOOLEAN DEFAULT FALSE,
  prefer_vegetarian BOOLEAN DEFAULT FALSE,
  prefer_low_carb BOOLEAN DEFAULT FALSE,
  prefer_keto BOOLEAN DEFAULT FALSE,
  prefer_gluten_free BOOLEAN DEFAULT FALSE,
  prefer_high_protein BOOLEAN DEFAULT FALSE,
  prefer_quick BOOLEAN DEFAULT FALSE COMMENT 'Under 20 minutes',
  prefer_no_cook BOOLEAN DEFAULT FALSE,
  max_calories INTEGER DEFAULT NULL,
  min_protein INTEGER DEFAULT NULL,
  excluded_ingredients TEXT[] DEFAULT NULL,
  preferred_cuisines TEXT[] DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_user_preferences UNIQUE (user_id)
);

-- Indexes for recipe_preferences
CREATE INDEX IF NOT EXISTS idx_recipe_preferences_user_id ON recipe_preferences(user_id);

-- ============================================================
-- SESSIONS
-- Active user sessions for auth tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  refresh_token_hash VARCHAR(255) DEFAULT NULL,
  ip_address INET,
  user_agent TEXT,
  device_info VARCHAR(255) DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- ============================================================
-- NOTIFICATIONS
-- User notification queue
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL COMMENT 'recipe_suggestion,ingredient_expiry,achievement,system',
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ============================================================
-- VIEWS
-- ============================================================

-- Dashboard stats view: user action counts
CREATE OR REPLACE VIEW v_user_action_stats AS
SELECT
  u.id AS user_id,
  u.username,
  u.email,
  u.role,
  u.created_at,
  COUNT(DISTINCT ua.id) AS total_actions,
  COUNT(DISTINCT CASE WHEN ua.action_type = 'login' THEN ua.id END) AS login_count,
  COUNT(DISTINCT CASE WHEN ua.action_type = 'register' THEN ua.id END) AS register_count,
  COUNT(DISTINCT CASE WHEN ua.action_type = 'image_analyze' THEN ua.id END) AS image_analyses,
  COUNT(DISTINCT sr.id) AS saved_recipes_count,
  COUNT(DISTINCT pi.id) AS pantry_items_count
FROM users u
LEFT JOIN user_actions ua ON ua.user_id = u.id
LEFT JOIN saved_recipes sr ON sr.user_id = u.id
LEFT JOIN pantry_items pi ON pi.user_id = u.id
GROUP BY u.id, u.username, u.email, u.role, u.created_at;

-- Admin overview view
CREATE OR REPLACE VIEW v_admin_overview AS
SELECT
  COUNT(DISTINCT u.id) AS total_users,
  COUNT(DISTINCT CASE WHEN u.is_active THEN u.id END) AS active_users,
  COUNT(DISTINCT CASE WHEN u.role = 'admin' THEN u.id END) AS admin_users,
  COUNT(DISTINCT ua.id) AS total_actions,
  COUNT(DISTINCT CASE WHEN ua.created_at >= NOW() - INTERVAL '24 hours' THEN ua.id END) AS actions_today,
  COUNT(DISTINCT sr.id) AS total_saved_recipes,
  COUNT(DISTINCT pi.id) AS total_pantry_items,
  COUNT(DISTINCT ia.id) AS total_image_analyses
FROM users u
LEFT JOIN user_actions ua ON TRUE
LEFT JOIN saved_recipes sr ON TRUE
LEFT JOIN pantry_items pi ON TRUE
LEFT JOIN image_analysis ia ON TRUE;

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating timestamps
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_saved_recipes_updated_at
  BEFORE UPDATE ON saved_recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_pantry_items_updated_at
  BEFORE UPDATE ON pantry_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_recipe_preferences_updated_at
  BEFORE UPDATE ON recipe_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log user actions (convenience)
CREATE OR REPLACE FUNCTION log_user_action(
  p_user_id INTEGER,
  p_action_type VARCHAR,
  p_action_details TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_actions (user_id, username, action_type, action_details, metadata)
  SELECT p_user_id, u.username, p_action_type, p_action_details, p_metadata
  FROM users u WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to clean expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW() AND is_active = TRUE;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  UPDATE users SET last_login = NULL
  WHERE id NOT IN (SELECT DISTINCT user_id FROM sessions WHERE is_active = TRUE);

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role, dietary_preferences, is_active)
VALUES (
  'admin',
  'admin@pantryplan.com',
  '$2b$12$placeholder_hash_replace_with_bcrypt',
  'admin',
  '',
  TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Insert sample saved recipes for admin user (if exists)
INSERT INTO saved_recipes (user_id, recipe_name, recipe_data, detected_ingredients, category)
SELECT
  u.id,
  'Mediterranean Chickpea Bowl',
  '{"ingredients":["chickpeas","cucumber","tomato"],"instructions":"Combine all ingredients","calories":380}',
  ARRAY['chickpeas','cucumber','tomato'],
  'lunch'
FROM users u WHERE u.email = 'admin@pantryplan.com'
ON CONFLICT DO NOTHING;

-- ============================================================
-- PERMISSIONS (Row Level Security)
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own data
CREATE POLICY "Users view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Policy: Users view own actions
CREATE POLICY "Users view own actions" ON user_actions FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users CRUD own saved recipes
CREATE POLICY "Users view own saved recipes" ON saved_recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own saved recipes" ON saved_recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own saved recipes" ON saved_recipes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own saved recipes" ON saved_recipes FOR DELETE USING (auth.uid() = user_id);

-- Policy: Users CRUD own pantry items
CREATE POLICY "Users view own pantry" ON pantry_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own pantry" ON pantry_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own pantry" ON pantry_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own pantry" ON pantry_items FOR DELETE USING (auth.uid() = user_id);

-- Policy: Users view own image analyses
CREATE POLICY "Users view own analyses" ON image_analysis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own analyses" ON image_analysis FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users manage own preferences
CREATE POLICY "Users view own preferences" ON recipe_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users upsert own preferences" ON recipe_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own preferences" ON recipe_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users view own sessions
CREATE POLICY "Users view own sessions" ON sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users delete own sessions" ON sessions FOR DELETE USING (auth.uid() = user_id);

-- Policy: Users view own notifications
CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Admin can view all data
CREATE POLICY "Admin view all users" ON users FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin view all actions" ON user_actions FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin view all saved" ON saved_recipes FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin view all pantry" ON pantry_items FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin view all analyses" ON image_analysis FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin view all sessions" ON sessions FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin view all notifications" ON notifications FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin delete any user" ON users FOR DELETE USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Service role (for serverless functions) can bypass RLS
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE user_actions FORCE ROW LEVEL SECURITY;
ALTER TABLE saved_recipes FORCE ROW LEVEL SECURITY;
ALTER TABLE pantry_items FORCE ROW LEVEL SECURITY;
ALTER TABLE image_analysis FORCE ROW LEVEL SECURITY;
ALTER TABLE recipe_preferences FORCE ROW LEVEL SECURITY;
ALTER TABLE sessions FORCE ROW LEVEL SECURITY;
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;

-- ============================================================
-- SCHEDULED MAINTENANCE (optional - requires pg_cron)
-- ============================================================
-- SELECT cron.schedule('cleanup-sessions', '0 */6 * * *', 'SELECT cleanup_expired_sessions()');
