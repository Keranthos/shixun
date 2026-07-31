-- 为 projects 表增加内容摘要 JSON 字段（可重复执行）
-- mysql -u root -p softeng < database/patch_project_content_insight.sql

SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'projects' AND COLUMN_NAME = 'content_insight'
);

SET @ddl := IF(@col_exists = 0,
  'ALTER TABLE projects ADD COLUMN content_insight JSON NULL COMMENT ''内容摘要 {summary,bullets}'' AFTER description',
  'SELECT ''content_insight already exists'' AS info'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
