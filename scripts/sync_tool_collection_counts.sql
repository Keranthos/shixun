-- 一次性将 tools.collections 与 collections 表对齐（工具资源）
UPDATE tools t
SET collections = (
  SELECT COUNT(*) FROM collections c
  WHERE c.resource_type = 'tool' AND c.resource_id = t.resource_id
);
