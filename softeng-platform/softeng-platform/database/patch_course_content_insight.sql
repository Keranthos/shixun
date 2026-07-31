-- 已有数据库升级：增加字段并写入课程摘要/学习路径（演示 10 门课）
-- mysql -u root -p softeng < database/patch_course_content_insight.sql
-- 随后会执行同目录 seed_course_content_updates.sql 中的 UPDATE（请一并运行，见运行说明）

USE softeng;
SET NAMES utf8mb4;

SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'content_insight'
);
SET @ddl = IF(@col_exists = 0,
  'ALTER TABLE courses ADD COLUMN content_insight JSON NULL COMMENT ''内容摘要 {summary,bullets}'' AFTER description, ADD COLUMN learning_path JSON NULL COMMENT ''学习路径 {weeks,milestones,note,activeIndex}'' AFTER content_insight',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE courses SET semester = '2-2' WHERE course_id IN (1, 2, 3, 4, 5);
UPDATE courses SET semester = '2-1' WHERE course_id IN (6, 7, 8);
UPDATE courses SET semester = '3-1' WHERE course_id IN (9, 10);
