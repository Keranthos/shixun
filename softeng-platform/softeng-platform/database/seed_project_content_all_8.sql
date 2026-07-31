-- 为当前库全部 8 个已审核项目写入 content_insight（按 project_id）
-- 需先执行 patch_project_content_insight.sql

UPDATE projects SET
  content_insight = JSON_OBJECT(
    'summary', 'Vue3 + Element Plus 后台模板，覆盖权限、图表与常见业务模块，适合作为管理端脚手架二次开发。',
    'bullets', JSON_ARRAY('Composition API 与清晰目录，便于裁剪模块', '内置用户/角色/权限与数据可视化示例', '可对接 REST 接口并扩展多环境配置')
  )
WHERE project_id = 1;

UPDATE projects SET
  content_insight = JSON_OBJECT(
    'summary', 'React 电商前台与订单链路示例，涵盖商品、购物车、支付与订单管理，偏全栈演示。',
    'bullets', JSON_ARRAY('商品列表、详情、购物车与结算流程', '用户登录与订单状态跟踪', '可按微服务拆分部署与压测扩展')
  )
WHERE project_id = 2;

UPDATE projects SET
  content_insight = JSON_OBJECT(
    'summary', 'Python 数据分析与可视化工具集，支持清洗、统计、图表与基础预测流程。',
    'bullets', JSON_ARRAY('多格式数据导入与清洗流水线', '统计指标与可视化图表导出', '内置常见 ML 算法做入门预测实验')
  )
WHERE project_id = 3;

UPDATE projects SET
  content_insight = JSON_OBJECT(
    'summary', 'Flutter 跨平台旅行应用，集成行程、景点、预订与地图导航，适合移动端综合实训。',
    'bullets', JSON_ARRAY('iOS/Android 一套代码多端发布', '行程规划、推荐与酒店预订模块', '可接 Firebase 或自建 API 做数据同步')
  )
WHERE project_id = 4;

UPDATE projects SET
  content_insight = JSON_OBJECT(
    'summary', 'Electron 桌面音乐播放器，支持多格式音频、播放列表与歌词展示，侧重桌面端交互体验。',
    'bullets', JSON_ARRAY('播放列表与本地曲库管理', '歌词同步与音效调节', '快捷键与托盘等桌面端特性')
  )
WHERE project_id = 5;

UPDATE projects SET
  content_insight = JSON_OBJECT(
    'summary', 'Spring Boot 微服务示例，含注册发现、配置中心、网关与熔断，配合 Docker 部署演练。',
    'bullets', JSON_ARRAY('服务拆分与注册发现实践', '配置中心、API 网关与限流熔断', '容器化打包与联调排错流程')
  )
WHERE project_id = 6;

UPDATE projects SET
  content_insight = JSON_OBJECT(
    'summary', '企业级 Vue3 UI 组件库，TypeScript 全量类型，支持主题定制与按需引入。',
    'bullets', JSON_ARRAY('表格、表单、图表等高频组件齐全', '完整 TS 类型与文档示例', '主题变量与 Tree Shaking 友好')
  )
WHERE project_id = 7;

UPDATE projects SET
  content_insight = JSON_OBJECT(
    'summary', '基于 Express 的 Node.js API 框架，内置认证、校验、日志与监控，适合快速搭建 REST 服务。',
    'bullets', JSON_ARRAY('JWT 认证与 RBAC 权限中间件', '请求校验、统一错误与访问日志', 'CLI 脚手架生成标准项目结构')
  )
WHERE project_id = 8;
