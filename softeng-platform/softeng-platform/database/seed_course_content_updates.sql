-- 10 门演示课程：内容摘要 + 学习路径（与 seed_demo 课程 ID 1–10 对应）
USE softeng;
SET NAMES utf8mb4;

UPDATE courses SET
  content_insight = JSON_OBJECT(
    'summary', '建立软件工程全景：生命周期、过程模型、需求与设计衔接，强调敏捷协作与可交付成果。',
    'bullets', JSON_ARRAY(
      '能区分瀑布、迭代与敏捷的适用场景，并描述一次迭代中的角色分工',
      '完成需求用例/用户故事与验收标准小作业，为后续设计课打底',
      '结合本站工具区配置 Git、VS Code、文档协作与看板，贯穿课程实验'
    )
  ),
  learning_path = JSON_OBJECT(
    'note', '以下为软件工程导论推荐教学周次与里程碑，供自学与复习，不代表教务处正式课表。',
    'activeIndex', 2,
    'weeks', JSON_ARRAY(
      JSON_OBJECT('label', 'W1–2 概论', 'weight', 1),
      JSON_OBJECT('label', 'W3–5 需求', 'weight', 1.2),
      JSON_OBJECT('label', 'W6–8 设计', 'weight', 1.1),
      JSON_OBJECT('label', 'W9–11 实现', 'weight', 1.3),
      JSON_OBJECT('label', 'W12–14 测试', 'weight', 1),
      JSON_OBJECT('label', 'W15–16 总结', 'weight', 0.8)
    ),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time', '第 2 周', 'title', '软件过程与敏捷入门', 'body', '阅读生命周期模型；小组确定迭代长度、站会与 Definition of Done。', 'type', 'primary'),
      JSON_OBJECT('time', '第 5 周', 'title', '需求工程实践', 'body', '撰写用例与用户故事，评审验收标准，输出需求规格摘要。', 'type', 'success'),
      JSON_OBJECT('time', '第 9 周', 'title', '架构与设计原则', 'body', '分层与模块边界；用 draw.io 绘制组件图并与需求追溯。', 'type', 'warning'),
      JSON_OBJECT('time', '第 14 周', 'title', '测试与质量保障', 'body', '黑盒用例与单元测试入门；可演示 SonarQube 静态扫描。', 'type', 'danger'),
      JSON_OBJECT('time', '第 16 周', 'title', '课程答辩', 'body', '提交设计说明与演示视频，答辩突出风险、度量与过程改进。', 'type', 'info')
    )
  )
WHERE course_id = 1;

UPDATE courses SET
  content_insight = JSON_OBJECT(
    'summary', '掌握关系模型与 SQL，理解事务、索引与物理设计，为 Web/项目课的数据持久化打基础。',
    'bullets', JSON_ARRAY(
      '熟练书写多表连接、聚合与子查询，完成规范化与 ER 建模实验',
      '理解 ACID、隔离级别与锁，能解释实验中的并发异常案例',
      '能阅读执行计划并建立合理索引，衔接课程设计中的数据库设计文档'
    )
  ),
  learning_path = JSON_OBJECT(
    'note', '数据库系统原理推荐周次安排，实验课以 SQL 与事务为主。',
    'activeIndex', 2,
    'weeks', JSON_ARRAY(
      JSON_OBJECT('label', 'W1–2 模型', 'weight', 1),
      JSON_OBJECT('label', 'W3–6 SQL', 'weight', 1.4),
      JSON_OBJECT('label', 'W7–9 事务', 'weight', 1.2),
      JSON_OBJECT('label', 'W10–12 索引', 'weight', 1.1),
      JSON_OBJECT('label', 'W13–15 设计', 'weight', 1.2),
      JSON_OBJECT('label', 'W16 考核', 'weight', 0.8)
    ),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time', '第 3 周', 'title', 'ER 与规范化', 'body', '完成课程 ER 图与 3NF 说明，对照业务规则检查冗余。', 'type', 'primary'),
      JSON_OBJECT('time', '第 6 周', 'title', 'SQL 综合实验', 'body', '多表查询、视图与权限；使用 Postman/客户端验证接口数据。', 'type', 'success'),
      JSON_OBJECT('time', '第 9 周', 'title', '事务与并发', 'body', '演示脏读/不可重复读；配置隔离级别并记录现象。', 'type', 'warning'),
      JSON_OBJECT('time', '第 13 周', 'title', '索引与调优', 'body', '对比有无索引的执行计划；撰写小型性能报告。', 'type', 'danger'),
      JSON_OBJECT('time', '第 16 周', 'title', '课程设计答辩', 'body', '提交 schema、样例数据与关键 SQL，说明设计权衡。', 'type', 'info')
    )
  )
WHERE course_id = 2;

UPDATE courses SET
  content_insight = JSON_OBJECT(
    'summary', '从 HTML/CSS/JS 到现代前端框架与后端接口协作，完成可演示的全栈小项目。',
    'bullets', JSON_ARRAY(
      '能搭建响应式页面并理解组件化、状态管理与路由',
      '掌握 REST 调用、鉴权与错误处理，完成与 Go/Java 后端的联调',
      '使用 Git 分支协作，结合 Postman 与浏览器调试完成迭代交付'
    )
  ),
  learning_path = JSON_OBJECT(
    'note', 'Web 开发技术以「页面—接口—部署」为主线，周次供实训对齐。',
    'activeIndex', 3,
    'weeks', JSON_ARRAY(
      JSON_OBJECT('label', 'W1–3 前端基础', 'weight', 1.2),
      JSON_OBJECT('label', 'W4–6 框架', 'weight', 1.3),
      JSON_OBJECT('label', 'W7–9 接口', 'weight', 1.2),
      JSON_OBJECT('label', 'W10–12 全栈', 'weight', 1.4),
      JSON_OBJECT('label', 'W13–15 优化', 'weight', 1),
      JSON_OBJECT('label', 'W16 演示', 'weight', 0.8)
    ),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time', '第 3 周', 'title', '静态页面与布局', 'body', '完成课程门户原型；统一设计令牌与可访问性检查。', 'type', 'primary'),
      JSON_OBJECT('time', '第 6 周', 'title', 'Vue 组件化', 'body', '列表/详情/表单拆分；对接 mock API。', 'type', 'success'),
      JSON_OBJECT('time', '第 9 周', 'title', 'REST 联调', 'body', 'JWT/会话、分页与上传；用 Postman 维护集合。', 'type', 'warning'),
      JSON_OBJECT('time', '第 13 周', 'title', '全栈里程碑', 'body', 'Docker Compose 一键启动；README 写清环境变量。', 'type', 'danger'),
      JSON_OBJECT('time', '第 16 周', 'title', '项目展示', 'body', '演示核心用户路径与异常处理；代码走查。', 'type', 'info')
    )
  )
WHERE course_id = 3;

UPDATE courses SET
  content_insight = JSON_OBJECT(
    'summary', '覆盖范围、进度、成本、风险与干系人管理，结合看板与度量支撑团队交付。',
    'bullets', JSON_ARRAY(
      '会编制 WBS 与甘特图，能进行三点估算与燃尽图解读',
      '识别风险登记册与应对策略，实践站会、评审与回顾',
      '将 Notion/Linear 与 Git 里程碑对齐，形成可追踪的发布计划'
    )
  ),
  learning_path = JSON_OBJECT(
    'note', '软件项目管理强调「计划—执行—监控」闭环，周次对应案例研讨。',
    'activeIndex', 2,
    'weeks', JSON_ARRAY(
      JSON_OBJECT('label', 'W1–2 导论', 'weight', 1),
      JSON_OBJECT('label', 'W3–5 范围', 'weight', 1.2),
      JSON_OBJECT('label', 'W6–8 进度', 'weight', 1.2),
      JSON_OBJECT('label', 'W9–11 风险', 'weight', 1.1),
      JSON_OBJECT('label', 'W12–14 敏捷', 'weight', 1.2),
      JSON_OBJECT('label', 'W15–16 复盘', 'weight', 0.8)
    ),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time', '第 2 周', 'title', '项目章程', 'body', '明确目标、约束与干系人；选定小组案例项目。', 'type', 'primary'),
      JSON_OBJECT('time', '第 5 周', 'title', '范围基线', 'body', '输出需求说明书与 WBS；定义变更流程。', 'type', 'success'),
      JSON_OBJECT('time', '第 9 周', 'title', '进度与成本', 'body', '甘特/燃尽图；跟踪 CPI/SPI 示意指标。', 'type', 'warning'),
      JSON_OBJECT('time', '第 13 周', 'title', '风险评审', 'body', '更新风险登记册；演练应急预案。', 'type', 'danger'),
      JSON_OBJECT('time', '第 16 周', 'title', '结项报告', 'body', '总结经验教训与度量复盘，提交管理报告。', 'type', 'info')
    )
  )
WHERE course_id = 4;

UPDATE courses SET
  content_insight = JSON_OBJECT(
    'summary', '黑盒/白盒方法、测试设计与自动化入门，理解持续测试在流水线中的位置。',
    'bullets', JSON_ARRAY(
      '能设计等价类、边界值与场景用例，编写测试计划摘要',
      '完成单元测试示例并接入 CI，了解覆盖率含义',
      '使用 Postman/SonarQube 等工具做接口与静态质量演示'
    )
  ),
  learning_path = JSON_OBJECT(
    'note', '测试课周次与实验平台、缺陷跟踪流程对齐。',
    'activeIndex', 2,
    'weeks', JSON_ARRAY(
      JSON_OBJECT('label', 'W1–2 概念', 'weight', 1),
      JSON_OBJECT('label', 'W3–5 设计', 'weight', 1.2),
      JSON_OBJECT('label', 'W6–8 白盒', 'weight', 1.1),
      JSON_OBJECT('label', 'W9–11 自动化', 'weight', 1.3),
      JSON_OBJECT('label', 'W12–14 性能', 'weight', 1),
      JSON_OBJECT('label', 'W15–16 总结', 'weight', 0.8)
    ),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time', '第 3 周', 'title', '测试计划', 'body', '针对样例系统输出测试范围、策略与资源安排。', 'type', 'primary'),
      JSON_OBJECT('time', '第 6 周', 'title', '用例设计评审', 'body', '黑盒用例表评审；缺陷分类与严重级别约定。', 'type', 'success'),
      JSON_OBJECT('time', '第 9 周', 'title', '自动化基础', 'body', '单元/接口自动化脚本接入流水线演示。', 'type', 'warning'),
      JSON_OBJECT('time', '第 13 周', 'title', '质量度量', 'body', '覆盖率、缺陷密度表示意；静态扫描报告解读。', 'type', 'danger'),
      JSON_OBJECT('time', '第 16 周', 'title', '测试总结答辩', 'body', '提交测试报告与遗留风险说明。', 'type', 'info')
    )
  )
WHERE course_id = 5;

UPDATE courses SET
  content_insight = JSON_OBJECT(
    'summary', '复杂度分析、线性表到图与常用算法策略，支撑笔试、竞赛与工程实现中的效率意识。',
    'bullets', JSON_ARRAY(
      '掌握大 O 表示法与递归/分治/贪心/动态规划基本范式',
      '能实现链表、栈队列、树、图的核心操作并通过 OJ 练习',
      '将算法思维应用到项目中的检索、排序与缓存设计讨论'
    )
  ),
  learning_path = JSON_OBJECT(
    'note', '数据结构课按「结构—算法—应用」推进，周次密度较高。',
    'activeIndex', 3,
    'weeks', JSON_ARRAY(
      JSON_OBJECT('label', 'W1–3 线性', 'weight', 1.2),
      JSON_OBJECT('label', 'W4–6 树', 'weight', 1.3),
      JSON_OBJECT('label', 'W7–9 图', 'weight', 1.2),
      JSON_OBJECT('label', 'W10–12 算法', 'weight', 1.4),
      JSON_OBJECT('label', 'W13–15 实践', 'weight', 1.1),
      JSON_OBJECT('label', 'W16 考核', 'weight', 0.8)
    ),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time', '第 3 周', 'title', '线性结构', 'body', '链表/栈队列实现与复杂度分析小测。', 'type', 'primary'),
      JSON_OBJECT('time', '第 6 周', 'title', '树与遍历', 'body', 'BST/堆/遍历应用；完成 OJ 专题一组。', 'type', 'success'),
      JSON_OBJECT('time', '第 9 周', 'title', '图算法', 'body', '最短路、最小生成树；讨论工程中的图建模。', 'type', 'warning'),
      JSON_OBJECT('time', '第 13 周', 'title', '算法综合', 'body', 'DP/贪心笔试模拟；错题归因与复习清单。', 'type', 'danger'),
      JSON_OBJECT('time', '第 16 周', 'title', '期末闭环', 'body', '算法笔记与复杂度速查表整理。', 'type', 'info')
    )
  )
WHERE course_id = 6;

UPDATE courses SET
  content_insight = JSON_OBJECT(
    'summary', '进程、内存、文件系统与并发控制，配合实验镜像理解系统调用与调度。',
    'bullets', JSON_ARRAY(
      '理解进程线程、调度与同步原语，能分析经典同步问题',
      '掌握虚拟内存、分页与局部性，对性能问题有直觉',
      '完成 shell/内存分配等小实验，阅读 Linux 手册页片段'
    )
  ),
  learning_path = JSON_OBJECT(
    'note', '操作系统实验与理论周次交错，以下里程碑对应实验验收点。',
    'activeIndex', 2,
    'weeks', JSON_ARRAY(
      JSON_OBJECT('label', 'W1–3 进程', 'weight', 1.2),
      JSON_OBJECT('label', 'W4–6 调度', 'weight', 1.1),
      JSON_OBJECT('label', 'W7–9 内存', 'weight', 1.3),
      JSON_OBJECT('label', 'W10–12 文件', 'weight', 1.1),
      JSON_OBJECT('label', 'W13–15 并发', 'weight', 1.2),
      JSON_OBJECT('label', 'W16 考核', 'weight', 0.8)
    ),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time', '第 3 周', 'title', '进程与线程', 'body', 'fork/exec 实验；对比用户级/内核级线程。', 'type', 'primary'),
      JSON_OBJECT('time', '第 6 周', 'title', 'CPU 调度', 'body', '调度算法模拟；记录周转时间与响应比。', 'type', 'success'),
      JSON_OBJECT('time', '第 9 周', 'title', '虚拟内存', 'body', '页表与 TLB 示意；缺页异常跟踪实验。', 'type', 'warning'),
      JSON_OBJECT('time', '第 13 周', 'title', '同步与死锁', 'body', '信号量/管程；银行家算法手工推演。', 'type', 'danger'),
      JSON_OBJECT('time', '第 16 周', 'title', '综合实验', 'body', '提交实验报告与核心代码走查。', 'type', 'info')
    )
  )
WHERE course_id = 7;

UPDATE courses SET
  content_insight = JSON_OBJECT(
    'summary', '分层模型、TCP/IP、路由与常见应用协议，通过抓包与 socket 实验加深理解。',
    'bullets', JSON_ARRAY(
      '能解释封装、可靠传输与拥塞控制基本概念',
      '完成 HTTP/DNS 抓包分析与小规模 socket 编程',
      '理解网络安全入门：TLS、防火墙与常见攻击面'
    )
  ),
  learning_path = JSON_OBJECT(
    'note', '计算机网络按 OSI/TCP-IP 自上而下展开，含验收实验。',
    'activeIndex', 2,
    'weeks', JSON_ARRAY(
      JSON_OBJECT('label', 'W1–3 物理链路', 'weight', 1),
      JSON_OBJECT('label', 'W4–6 网络层', 'weight', 1.2),
      JSON_OBJECT('label', 'W7–9 传输层', 'weight', 1.3),
      JSON_OBJECT('label', 'W10–12 应用层', 'weight', 1.2),
      JSON_OBJECT('label', 'W13–15 安全', 'weight', 1),
      JSON_OBJECT('label', 'W16 考核', 'weight', 0.8)
    ),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time', '第 3 周', 'title', '分层与封装', 'body', 'Wireshark 观察以太网/IP 帧；撰写报文结构笔记。', 'type', 'primary'),
      JSON_OBJECT('time', '第 6 周', 'title', 'IP 与路由', 'body', 'traceroute 实验；子网划分练习。', 'type', 'success'),
      JSON_OBJECT('time', '第 9 周', 'title', 'TCP 深入', 'body', '三次握手/拥塞控制抓包；socket 聊天室 demo。', 'type', 'warning'),
      JSON_OBJECT('time', '第 13 周', 'title', '应用协议', 'body', 'HTTP/REST 与缓存头；可选 HTTPS 配置演示。', 'type', 'danger'),
      JSON_OBJECT('time', '第 16 周', 'title', '网络实验答辩', 'body', '提交抓包报告与实验代码说明。', 'type', 'info')
    )
  )
WHERE course_id = 8;

UPDATE courses SET
  content_insight = JSON_OBJECT(
    'summary', '对比原生与跨平台路线，完成可安装的移动原型并关注性能与体验。',
    'bullets', JSON_ARRAY(
      '理解移动端生命周期、布局与导航模式',
      '完成一个跨平台或原生 Demo，含列表、表单与网络层',
      '掌握打包、权限与基础性能 profiling 思路'
    )
  ),
  learning_path = JSON_OBJECT(
    'note', '移动应用开发为选修新课，周次较紧凑，以原型交付为导向。',
    'activeIndex', 1,
    'weeks', JSON_ARRAY(
      JSON_OBJECT('label', 'W1–2 导论', 'weight', 1),
      JSON_OBJECT('label', 'W3–5 UI', 'weight', 1.2),
      JSON_OBJECT('label', 'W6–8 数据', 'weight', 1.1),
      JSON_OBJECT('label', 'W9–11 发布', 'weight', 1.2),
      JSON_OBJECT('label', 'W12–14 优化', 'weight', 1)
    ),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time', '第 2 周', 'title', '技术选型', 'body', '对比 Flutter/React Native/原生；确定小组技术栈。', 'type', 'primary'),
      JSON_OBJECT('time', '第 5 周', 'title', '界面里程碑', 'body', '主导航与列表详情；适配深色模式（可选）。', 'type', 'success'),
      JSON_OBJECT('time', '第 9 周', 'title', '联调与打包', 'body', '接入后端 API；生成测试包并写安装说明。', 'type', 'warning'),
      JSON_OBJECT('time', '第 14 周', 'title', '课堂演示', 'body', '演示核心路径与异常提示；提交原型 APK/IPA 或模拟器录屏。', 'type', 'info')
    )
  )
WHERE course_id = 9;

UPDATE courses SET
  content_insight = JSON_OBJECT(
    'summary', '机器学习基本流程、经典模型与伦理讨论，配合 Notebook 完成可复现实验。',
    'bullets', JSON_ARRAY(
      '理解数据采集、特征、训练/验证/测试划分与过拟合',
      '完成回归/分类小实验并解读指标（准确率、F1 等）',
      '讨论算法偏见、可解释性与工程落地边界'
    )
  ),
  learning_path = JSON_OBJECT(
    'note', '人工智能基础强调实验可复现与伦理反思，周次供 Notebook 实验对齐。',
    'activeIndex', 2,
    'weeks', JSON_ARRAY(
      JSON_OBJECT('label', 'W1–2 概论', 'weight', 1),
      JSON_OBJECT('label', 'W3–5 监督', 'weight', 1.3),
      JSON_OBJECT('label', 'W6–8 模型', 'weight', 1.2),
      JSON_OBJECT('label', 'W9–11 深度学习', 'weight', 1.2),
      JSON_OBJECT('label', 'W12–14 伦理', 'weight', 1),
      JSON_OBJECT('label', 'W15–16 展示', 'weight', 0.8)
    ),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time', '第 2 周', 'title', 'ML 工作流', 'body', 'Jupyter 环境；完成数据探索与可视化报告。', 'type', 'primary'),
      JSON_OBJECT('time', '第 5 周', 'title', '监督学习实验', 'body', '训练/验证曲线；对比两种分类器并解释指标。', 'type', 'success'),
      JSON_OBJECT('time', '第 9 周', 'title', '小型神经网络', 'body', '用框架完成 MNIST 级 demo；记录超参数影响。', 'type', 'warning'),
      JSON_OBJECT('time', '第 13 周', 'title', '伦理与可解释', 'body', '案例讨论偏见；SHAP/LIME 示意（可选）。', 'type', 'danger'),
      JSON_OBJECT('time', '第 16 周', 'title', '课程展示', 'body', '提交 Notebook 与实验报告，说明局限与改进方向。', 'type', 'info')
    )
  )
WHERE course_id = 10;
