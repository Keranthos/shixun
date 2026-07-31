-- 一次性将 courses.collections 与 collections 表对齐（课程路线）
UPDATE courses c
SET collections = (
  SELECT COUNT(*) FROM collections col
  WHERE col.resource_type = 'course' AND col.resource_id = c.course_id
);
