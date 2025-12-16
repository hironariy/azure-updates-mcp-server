-- Azure Updates MCP Server - Test Schema (without FTS5)
-- Simplified schema for testing without full-text search triggers

-- Main Table
CREATE TABLE IF NOT EXISTS azure_updates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description_html TEXT,
  description_md TEXT,
  status TEXT,
  locale TEXT,
  created TEXT NOT NULL,
  modified TEXT NOT NULL,
  metadata TEXT,
  
  CONSTRAINT chk_dates CHECK (
    created IS NOT NULL AND 
    modified IS NOT NULL AND
    modified >= created
  )
);

CREATE INDEX IF NOT EXISTS idx_updates_modified ON azure_updates(modified DESC);
CREATE INDEX IF NOT EXISTS idx_updates_created ON azure_updates(created);
CREATE INDEX IF NOT EXISTS idx_updates_status ON azure_updates(status);

-- Many-to-Many Tables
CREATE TABLE IF NOT EXISTS update_tags (
  update_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  PRIMARY KEY (update_id, tag),
  FOREIGN KEY (update_id) REFERENCES azure_updates(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tags_tag ON update_tags(tag);

CREATE TABLE IF NOT EXISTS update_categories (
  update_id TEXT NOT NULL,
  category TEXT NOT NULL,
  PRIMARY KEY (update_id, category),
  FOREIGN KEY (update_id) REFERENCES azure_updates(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_categories_category ON update_categories(category);

CREATE TABLE IF NOT EXISTS update_products (
  update_id TEXT NOT NULL,
  product TEXT NOT NULL,
  PRIMARY KEY (update_id, product),
  FOREIGN KEY (update_id) REFERENCES azure_updates(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_products_product ON update_products(product);

CREATE TABLE IF NOT EXISTS update_availabilities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  update_id TEXT NOT NULL,
  ring TEXT NOT NULL,
  date TEXT,
  FOREIGN KEY (update_id) REFERENCES azure_updates(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_availabilities_ring ON update_availabilities(ring);
CREATE INDEX IF NOT EXISTS idx_availabilities_date ON update_availabilities(date);
CREATE INDEX IF NOT EXISTS idx_availabilities_ring_date ON update_availabilities(ring, date);

-- Sync Checkpoints
CREATE TABLE IF NOT EXISTS sync_checkpoints (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  last_sync TEXT NOT NULL,
  sync_status TEXT NOT NULL CHECK (sync_status IN ('success', 'failed', 'in_progress')),
  record_count INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER,
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO sync_checkpoints (id, last_sync, sync_status, record_count)
VALUES (1, '1970-01-01T00:00:00.0000000Z', 'success', 0);

-- Schema Version
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO schema_version (version) VALUES (1);
