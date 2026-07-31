-- 为当前库全部 19 门课程写入 content_insight + learning_path（按 course_id）
USE softeng;
SET NAMES utf8mb4;

-- 1001 高等数学(上)
UPDATE courses SET
  content_insight = JSON_OBJECT('summary', '一元微积分核心：极限、连续、导数与积分，为工科课程与建模打基础。', 'bullets', JSON_ARRAY('掌握极限与连续及运算法则', '熟练求导、微分与中值定理应用', '建立定积分概念并会换元与分部积分')),
  learning_path = JSON_OBJECT('note', '高等数学（上）章节推进参考，周次为建议节奏，以任课教师大纲为准。', 'activeIndex', 1,
    'weeks', JSON_ARRAY(JSON_OBJECT('label','W1–3 极限','weight',1.1),JSON_OBJECT('label','W4–7 导数','weight',1.3),JSON_OBJECT('label','W8–11 中值定理','weight',1.1),JSON_OBJECT('label','W12–15 积分','weight',1.3),JSON_OBJECT('label','W16 复习','weight',0.8)),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time','第 3 周','title','极限与连续','body','两个重要极限；间断点分类；闭区间连续函数性质。','type','primary'),
      JSON_OBJECT('time','第 7 周','title','导数与求导','body','复合函数与隐函数求导；切线与变化率应用。','type','success'),
      JSON_OBJECT('time','第 11 周','title','微分中值定理','body','罗尔、拉格朗日、洛必达；单调性与极值。','type','warning'),
      JSON_OBJECT('time','第 15 周','title','定积分与应用','body','牛顿-莱布尼茨公式；面积体积；换元与分部积分。','type','danger'),
      JSON_OBJECT('time','第 16 周','title','阶段测验','body','错题归纳与公式速查。','type','info')))
WHERE course_id = 1001;

-- 1002 C语言程序设计
UPDATE courses SET
  content_insight = JSON_OBJECT('summary', '从过程式编程入门：变量、控制结构、函数、指针与文件 I/O，培养底层思维。', 'bullets', JSON_ARRAY('能独立编写、调试中等规模 C 程序', '理解指针、内存布局与常见段错误排查', '掌握数组、字符串与结构体，为数据结构课铺垫')),
  learning_path = JSON_OBJECT('note', 'C 语言课实验与上机周次参考，以机房实验安排为准。', 'activeIndex', 2,
    'weeks', JSON_ARRAY(JSON_OBJECT('label','W1–3 基础语法','weight',1.2),JSON_OBJECT('label','W4–6 函数','weight',1.1),JSON_OBJECT('label','W7–9 数组指针','weight',1.4),JSON_OBJECT('label','W10–12 结构体文件','weight',1.2),JSON_OBJECT('label','W13–16 综合','weight',1)),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time','第 3 周','title','语法与流程控制','body','分支、循环；代码风格与 gdb 入门。','type','primary'),
      JSON_OBJECT('time','第 6 周','title','函数与作用域','body','递归入门；头文件与多文件编译。','type','success'),
      JSON_OBJECT('time','第 9 周','title','指针专题','body','指针与数组；动态内存 malloc/free。','type','warning'),
      JSON_OBJECT('time','第 13 周','title','小项目','body','命令行工具或小游戏；代码评审。','type','danger'),
      JSON_OBJECT('time','第 16 周','title','期末机考','body','综合编程题与读程序写结果。','type','info')))
WHERE course_id = 1002;

-- 1003 计算机导论
UPDATE courses SET
  content_insight = JSON_OBJECT('summary', '计算机科学全景导览：硬件体系、系统软件、网络与信息安全，建立专业认知框架。', 'bullets', JSON_ARRAY('了解计算机组成与二进制、编码基础', '理解操作系统、数据库、网络的分工', '认识软工职业路径与实验平台使用规范')),
  learning_path = JSON_OBJECT('note', '导论课以专题讲座与参观实验为主，周次为内容模块划分。', 'activeIndex', 1,
    'weeks', JSON_ARRAY(JSON_OBJECT('label','W1–2 概论','weight',1),JSON_OBJECT('label','W3–5 硬件','weight',1.1),JSON_OBJECT('label','W6–8 系统','weight',1.1),JSON_OBJECT('label','W9–11 网络','weight',1.1),JSON_OBJECT('label','W12–14 软工','weight',1)),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time','第 2 周','title','专业认知','body','培养方案解读；实验室安全与账号开通。','type','primary'),
      JSON_OBJECT('time','第 5 周','title','组成原理预览','body','CPU、存储层次；一次简单汇编演示。','type','success'),
      JSON_OBJECT('time','第 8 周','title','系统与软件','body','OS 角色；开源文化与版本控制初体验。','type','warning'),
      JSON_OBJECT('time','第 12 周','title','网络与安全','body','IP/域名；密码与隐私基本习惯。','type','danger'),
      JSON_OBJECT('time','第 14 周','title','课程总结','body','撰写学习规划与兴趣方向说明。','type','info')))
WHERE course_id = 1003;

-- 1004 高等数学(下)
UPDATE courses SET
  content_insight = JSON_OBJECT('summary', '多元微积分、重积分、曲线曲面积分与级数，衔接线代与物理应用。', 'bullets', JSON_ARRAY('多元函数偏导、梯度与条件极值', '二重三重积分与坐标变换', '级数收敛性与幂级数展开入门')),
  learning_path = JSON_OBJECT('note', '高等数学（下）推荐学习顺序，作业以教师布置为准。', 'activeIndex', 2,
    'weeks', JSON_ARRAY(JSON_OBJECT('label','W1–4 多元微分','weight',1.2),JSON_OBJECT('label','W5–8 重积分','weight',1.3),JSON_OBJECT('label','W9–12 曲线曲面','weight',1.2),JSON_OBJECT('label','W13–16 级数','weight',1.2)),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time','第 4 周','title','多元函数','body','偏导、全微分、拉格朗日乘子。','type','primary'),
      JSON_OBJECT('time','第 8 周','title','重积分','body','极坐标、柱面球面坐标应用。','type','success'),
      JSON_OBJECT('time','第 12 周','title','曲线曲面积分','body','格林、高斯、斯托克斯公式。','type','warning'),
      JSON_OBJECT('time','第 16 周','title','级数与期末','body','收敛判别；幂级数；综合复习。','type','info')))
WHERE course_id = 1004;

-- 1005 离散数学
UPDATE courses SET
  content_insight = JSON_OBJECT('summary', '集合、逻辑、图论、组合与代数结构，支撑算法正确性与密码学入门。', 'bullets', JSON_ARRAY('命题逻辑与证明方法（直接、反证、归纳）', '图的基本概念、树与最短路径', '组合计数与递推关系')),
  learning_path = JSON_OBJECT('note', '离散数学按逻辑—集合—图论—组合推进，周次供习题课对齐。', 'activeIndex', 2,
    'weeks', JSON_ARRAY(JSON_OBJECT('label','W1–3 逻辑','weight',1.1),JSON_OBJECT('label','W4–6 集合关系','weight',1.1),JSON_OBJECT('label','W7–10 图论','weight',1.3),JSON_OBJECT('label','W11–14 组合','weight',1.2)),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time','第 3 周','title','逻辑与证明','body','真值表；谓词逻辑；归纳法模板。','type','primary'),
      JSON_OBJECT('time','第 6 周','title','关系与函数','body','等价关系；偏序；映射性质。','type','success'),
      JSON_OBJECT('time','第 10 周','title','图论核心','body','遍历；生成树；欧拉哈密顿路径。','type','warning'),
      JSON_OBJECT('time','第 14 周','title','组合与复习','body','排列组合；二项式；期末证明题训练。','type','info')))
WHERE course_id = 1005;

-- 1006 面向对象程序设计(Java)
UPDATE courses SET
  content_insight = JSON_OBJECT('summary', 'Java 面向对象：类与对象、继承多态、集合框架与异常，面向小型应用开发。', 'bullets', JSON_ARRAY('掌握类设计、封装继承多态与接口', '熟练使用集合、泛型与常用 API', '能使用 IDE 调试并完成 Maven/Gradle 小项目')),
  learning_path = JSON_OBJECT('note', 'Java OOP 课与实验周次参考，项目里程碑以实验文档为准。', 'activeIndex', 2,
    'weeks', JSON_ARRAY(JSON_OBJECT('label','W1–3 OOP基础','weight',1.2),JSON_OBJECT('label','W4–6 继承接口','weight',1.2),JSON_OBJECT('label','W7–9 集合IO','weight',1.2),JSON_OBJECT('label','W10–14 项目','weight',1.3)),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time','第 3 周','title','类与对象','body','构造器；重载；this/super。','type','primary'),
      JSON_OBJECT('time','第 6 周','title','继承与多态','body','抽象类与接口；多态调用机制。','type','success'),
      JSON_OBJECT('time','第 9 周','title','集合与异常','body','ArrayList/HashMap；try-with-resources。','type','warning'),
      JSON_OBJECT('time','第 14 周','title','课程项目','body','控制台或 Swing 小应用；单元测试入门。','type','info')))
WHERE course_id = 1006;

-- 1007 数据结构与算法
UPDATE courses SET
  content_insight = JSON_OBJECT('summary', '复杂度分析、线性表到图与常用算法策略，支撑笔试、竞赛与工程实现。', 'bullets', JSON_ARRAY('掌握大 O 与递归、分治、贪心、DP 基本范式', '实现链表、树、图核心操作并通过 OJ 练习', '将算法思维用于检索、排序与缓存设计讨论')),
  learning_path = JSON_OBJECT('note', '数据结构课按「结构—算法—应用」推进，密度较高。', 'activeIndex', 3,
    'weeks', JSON_ARRAY(JSON_OBJECT('label','W1–3 线性','weight',1.2),JSON_OBJECT('label','W4–6 树','weight',1.3),JSON_OBJECT('label','W7–9 图','weight',1.2),JSON_OBJECT('label','W10–12 算法','weight',1.4),JSON_OBJECT('label','W13–16 实践','weight',1.1)),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time','第 3 周','title','线性结构','body','链表、栈队列实现与复杂度分析。','type','primary'),
      JSON_OBJECT('time','第 6 周','title','树与遍历','body','BST/堆；先中后序与层序。','type','success'),
      JSON_OBJECT('time','第 9 周','title','图算法','body','最短路、最小生成树。','type','warning'),
      JSON_OBJECT('time','第 13 周','title','算法综合','body','DP/贪心模拟；错题本整理。','type','danger'),
      JSON_OBJECT('time','第 16 周','title','期末','body','笔试+上机；复杂度速查。','type','info')))
WHERE course_id = 1007;

-- 1008 计算机组成原理
UPDATE courses SET
  content_insight = JSON_OBJECT('summary', '指令系统、数据通路、存储层次与 I/O，理解程序在机器上的执行过程。', 'bullets', JSON_ARRAY('能阅读汇编与机器码对应关系', '理解 Cache、虚拟内存与流水线基本概念', '完成简单 CPU 或 MIPS 实验模块')),
  learning_path = JSON_OBJECT('note', '组成原理理论课与实验课交错，周次含实验验收点。', 'activeIndex', 2,
    'weeks', JSON_ARRAY(JSON_OBJECT('label','W1–3 数据表示','weight',1.1),JSON_OBJECT('label','W4–7 指令系统','weight',1.3),JSON_OBJECT('label','W8–11 存储','weight',1.2),JSON_OBJECT('label','W12–15 IO流水线','weight',1.2)),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time','第 3 周','title','数制与运算','body','补码；浮点数格式；ALU 概念。','type','primary'),
      JSON_OBJECT('time','第 7 周','title','指令与汇编','body','寻址方式；过程调用约定。','type','success'),
      JSON_OBJECT('time','第 11 周','title','存储层次','body','Cache 映射；页表与 TLB。','type','warning'),
      JSON_OBJECT('time','第 15 周','title','实验综合','body','单周期/流水线实验报告；期末复习。','type','info')))
WHERE course_id = 1008;

-- 1009 Python脚本编程
UPDATE courses SET
  content_insight = JSON_OBJECT('summary', 'Python 语法、标准库与脚本自动化，面向数据处理与快速原型。', 'bullets', JSON_ARRAY('掌握列表推导、模块与虚拟环境', '会用 requests/pandas 等完成小脚本', '了解脚本测试与命令行参数解析')),
  learning_path = JSON_OBJECT('note', 'Python 选修/短学期课程，周次紧凑，以实验清单为准。', 'activeIndex', 1,
    'weeks', JSON_ARRAY(JSON_OBJECT('label','W1–2 语法','weight',1.2),JSON_OBJECT('label','W3–4 标准库','weight',1.1),JSON_OBJECT('label','W5–6 自动化','weight',1.3),JSON_OBJECT('label','W7–8 项目','weight',1.2)),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time','第 2 周','title','基础语法','body','类型、函数、异常；pip 与 venv。','type','primary'),
      JSON_OBJECT('time','第 4 周','title','文件与爬虫入门','body','读写 CSV/JSON；简单 HTTP 请求。','type','success'),
      JSON_OBJECT('time','第 6 周','title','数据处理','body','pandas 清洗与可视化雏形。','type','warning'),
      JSON_OBJECT('time','第 8 周','title','脚本答辩','body','提交自动化脚本与说明文档。','type','info')))
WHERE course_id = 1009;

-- 1011 计算机网络
UPDATE courses SET
  content_insight = JSON_OBJECT('summary', '分层模型、TCP/IP、路由与常见应用协议，通过抓包与 socket 实验加深理解。', 'bullets', JSON_ARRAY('解释封装、可靠传输与拥塞控制', '完成 HTTP/DNS 抓包与 socket 编程', '了解 TLS 与常见网络安全概念')),
  learning_path = JSON_OBJECT('note', '计算机网络按 OSI/TCP-IP 自上而下，含实验验收。', 'activeIndex', 2,
    'weeks', JSON_ARRAY(JSON_OBJECT('label','W1–3 链路','weight',1),JSON_OBJECT('label','W4–6 网络层','weight',1.2),JSON_OBJECT('label','W7–9 传输层','weight',1.3),JSON_OBJECT('label','W10–12 应用','weight',1.2),JSON_OBJECT('label','W13–15 安全','weight',1)),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time','第 3 周','title','分层与封装','body','Wireshark 观察帧结构。','type','primary'),
      JSON_OBJECT('time','第 6 周','title','IP 与路由','body','子网划分；traceroute 实验。','type','success'),
      JSON_OBJECT('time','第 9 周','title','TCP/UDP','body','三次握手；可靠传输；聊天 demo。','type','warning'),
      JSON_OBJECT('time','第 13 周','title','应用与安全','body','HTTP；HTTPS 配置演示。','type','danger'),
      JSON_OBJECT('time','第 15 周','title','实验答辩','body','抓包报告与代码说明。','type','info')))
WHERE course_id = 1011;

-- 1012 数据库系统原理
UPDATE courses SET
  content_insight = JSON_OBJECT('summary', '关系模型、SQL、事务与索引，含实验与课程设计衔接。', 'bullets', JSON_ARRAY('熟练多表 SQL 与 ER 建模', '理解事务隔离与锁', '能阅读执行计划并设计索引')),
  learning_path = JSON_OBJECT('note', '数据库课理论+上机实验周次参考。', 'activeIndex', 2,
    'weeks', JSON_ARRAY(JSON_OBJECT('label','W1–3 模型','weight',1.1),JSON_OBJECT('label','W4–7 SQL','weight',1.4),JSON_OBJECT('label','W8–10 事务','weight',1.2),JSON_OBJECT('label','W11–14 设计','weight',1.2)),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time','第 3 周','title','ER 与规范化','body','3NF 检查；schema 设计。','type','primary'),
      JSON_OBJECT('time','第 7 周','title','SQL 综合','body','连接、子查询、视图。','type','success'),
      JSON_OBJECT('time','第 10 周','title','事务','body','隔离级别实验；锁等待观察。','type','warning'),
      JSON_OBJECT('time','第 14 周','title','课程设计','body','提交数据库与应用接口说明。','type','info')))
WHERE course_id = 1012;

-- 1013 Linux环境编程
UPDATE courses SET
  content_insight = JSON_OBJECT('summary', 'Linux 命令行、Shell、系统调用与多进程编程，支撑服务器端开发。', 'bullets', JSON_ARRAY('熟练 vim/gcc/make 与基本运维命令', '理解进程、管道、信号与文件描述符', '能编写多进程/多线程小程序')),
  learning_path = JSON_OBJECT('note', 'Linux 编程课实验比重高，周次对应实验模块。', 'activeIndex', 2,
    'weeks', JSON_ARRAY(JSON_OBJECT('label','W1–2 Shell','weight',1),JSON_OBJECT('label','W3–5 文件进程','weight',1.3),JSON_OBJECT('label','W6–8 信号IPC','weight',1.2),JSON_OBJECT('label','W9–12 网络','weight',1.2),JSON_OBJECT('label','W13–16 综合','weight',1.1)),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time','第 2 周','title','Shell 脚本','body','bash 脚本；权限与目录结构。','type','primary'),
      JSON_OBJECT('time','第 5 周','title','系统调用','body','fork/exec；wait；僵尸进程处理。','type','success'),
      JSON_OBJECT('time','第 8 周','title','IPC','body','管道、消息队列或共享内存选讲。','type','warning'),
      JSON_OBJECT('time','第 12 周','title','socket 编程','body','TCP 服务端/客户端 demo。','type','danger'),
      JSON_OBJECT('time','第 16 周','title','大作业','body','多模块 Linux 应用；代码评审。','type','info')))
WHERE course_id = 1013;

-- 1014 软件工程导论
UPDATE courses SET
  content_insight = JSON_OBJECT('summary', '生命周期、敏捷与质量基础，配合案例研讨与团队协作。', 'bullets', JSON_ARRAY('区分瀑布与敏捷适用场景', '完成需求用例与用户故事作业', '使用 Git、文档与看板支撑小组迭代')),
  learning_path = JSON_OBJECT('note', '软件工程导论推荐教学周次，以课堂案例为准。', 'activeIndex', 2,
    'weeks', JSON_ARRAY(JSON_OBJECT('label','W1–2 概论','weight',1),JSON_OBJECT('label','W3–5 需求','weight',1.2),JSON_OBJECT('label','W6–8 设计','weight',1.1),JSON_OBJECT('label','W9–11 实现','weight',1.3),JSON_OBJECT('label','W12–14 测试','weight',1),JSON_OBJECT('label','W15–16 总结','weight',0.8)),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time','第 2 周','title','过程与敏捷','body','迭代计划；站会规则。','type','primary'),
      JSON_OBJECT('time','第 5 周','title','需求工程','body','用例图与用户故事；验收标准。','type','success'),
      JSON_OBJECT('time','第 9 周','title','概要设计','body','模块划分；接口草案。','type','warning'),
      JSON_OBJECT('time','第 14 周','title','测试入门','body','测试计划；缺陷跟踪。','type','danger'),
      JSON_OBJECT('time','第 16 周','title','课程答辩','body','过程改进总结；文档检查。','type','info')))
WHERE course_id = 1014;

-- 1015 Web前端开发
UPDATE courses SET
  content_insight = JSON_OBJECT('summary', 'HTML/CSS/JS 与 Vue 组件化，完成可部署的前端项目。', 'bullets', JSON_ARRAY('语义化布局与响应式 CSS', 'Vue 路由、状态管理与 API 联调', '了解构建工具与基础性能优化')),
  learning_path = JSON_OBJECT('note', 'Web 前端课项目驱动，周次对应里程碑评审。', 'activeIndex', 3,
    'weeks', JSON_ARRAY(JSON_OBJECT('label','W1–3 HTML/CSS','weight',1.2),JSON_OBJECT('label','W4–6 JS','weight',1.2),JSON_OBJECT('label','W7–9 Vue','weight',1.4),JSON_OBJECT('label','W10–14 项目','weight',1.3)),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time','第 3 周','title','页面布局','body','Flex/Grid；移动端适配。','type','primary'),
      JSON_OBJECT('time','第 6 周','title','JavaScript','body','DOM；异步 fetch；ES6 模块。','type','success'),
      JSON_OBJECT('time','第 9 周','title','Vue 应用','body','组件拆分；Pinia/Vuex 状态。','type','warning'),
      JSON_OBJECT('time','第 14 周','title','项目交付','body','联调后端；部署静态资源。','type','info')))
WHERE course_id = 1015;

-- 1016 算法分析与设计
UPDATE courses SET
  content_insight = JSON_OBJECT('summary', '算法正确性、复杂度与经典设计范式，面向考研与工程选型。', 'bullets', JSON_ARRAY('熟练 NP 完全性直观判断与近似思想', '分治、贪心、DP、网络流典型题训练', '能分析实际业务中的算法权衡')),
  learning_path = JSON_OBJECT('note', '算法分析课理论密度高，周次配合习题课。', 'activeIndex', 2,
    'weeks', JSON_ARRAY(JSON_OBJECT('label','W1–3 渐进分析','weight',1.1),JSON_OBJECT('label','W4–6 分治贪心','weight',1.3),JSON_OBJECT('label','W7–9 DP','weight',1.3),JSON_OBJECT('label','W10–12 高级','weight',1.2),JSON_OBJECT('label','W13–16 复习','weight',1)),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time','第 3 周','title','递归与主定理','body','递推式；展开法。','type','primary'),
      JSON_OBJECT('time','第 6 周','title','贪心正确性','body','活动选择；哈夫曼。','type','success'),
      JSON_OBJECT('time','第 9 周','title','动态规划','body','背包；LCS；状态设计。','type','warning'),
      JSON_OBJECT('time','第 14 周','title','专题与期末','body','网络流或字符串选讲；模拟赛。','type','info')))
WHERE course_id = 1016;

-- 1017 软件测试与质量保证
UPDATE courses SET
  content_insight = JSON_OBJECT('summary', '测试设计、自动化与质量度量，理解持续测试在 DevOps 中的位置。', 'bullets', JSON_ARRAY('黑盒/白盒用例设计', '单元测试与 CI 集成演示', '静态分析与缺陷管理流程')),
  learning_path = JSON_OBJECT('note', '测试课与实验平台、缺陷单流程对齐。', 'activeIndex', 2,
    'weeks', JSON_ARRAY(JSON_OBJECT('label','W1–2 概念','weight',1),JSON_OBJECT('label','W3–5 设计','weight',1.2),JSON_OBJECT('label','W6–8 白盒','weight',1.1),JSON_OBJECT('label','W9–11 自动化','weight',1.3),JSON_OBJECT('label','W12–14 度量','weight',1)),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time','第 3 周','title','测试计划','body','范围、策略、资源。','type','primary'),
      JSON_OBJECT('time','第 6 周','title','用例评审','body','等价类、边界值；缺陷分级。','type','success'),
      JSON_OBJECT('time','第 9 周','title','自动化','body','JUnit/pytest；流水线演示。','type','warning'),
      JSON_OBJECT('time','第 14 周','title','质量报告','body','覆盖率与遗留风险说明。','type','info')))
WHERE course_id = 1017;

-- 1018 移动应用开发(Android)
UPDATE courses SET
  content_insight = JSON_OBJECT('summary', 'Android 组件、UI、数据存储与网络，完成可安装的移动原型。', 'bullets', JSON_ARRAY('Activity/Fragment 生命周期与导航', 'RecyclerView 与 Material 设计基础', 'Retrofit/Room 常用架构入门')),
  learning_path = JSON_OBJECT('note', 'Android 课以原型交付为导向，周次对应功能里程碑。', 'activeIndex', 2,
    'weeks', JSON_ARRAY(JSON_OBJECT('label','W1–2 环境','weight',1),JSON_OBJECT('label','W3–5 UI','weight',1.3),JSON_OBJECT('label','W6–8 数据','weight',1.2),JSON_OBJECT('label','W9–11 网络','weight',1.2),JSON_OBJECT('label','W12–14 发布','weight',1.1)),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time','第 2 周','title','Android Studio','body','模拟器；Gradle 结构。','type','primary'),
      JSON_OBJECT('time','第 5 周','title','界面里程碑','body','列表详情；Material 主题。','type','success'),
      JSON_OBJECT('time','第 8 周','title','本地存储','body','Room/SQLite；权限模型。','type','warning'),
      JSON_OBJECT('time','第 12 周','title','联调打包','body','REST 接口；生成 debug APK。','type','danger'),
      JSON_OBJECT('time','第 14 周','title','课堂演示','body','核心路径演示；已知问题列表。','type','info')))
WHERE course_id = 1018;

-- 1019 机器学习基础
UPDATE courses SET
  content_insight = JSON_OBJECT('summary', '机器学习流程、经典模型与 sklearn 实践，讨论伦理与过拟合。', 'bullets', JSON_ARRAY('训练/验证/测试划分与特征工程', '回归、分类、聚类实验与指标解读', '了解偏差-方差权衡与模型选择')),
  learning_path = JSON_OBJECT('note', '机器学习基础以 Notebook 实验为主，周次供实验对齐。', 'activeIndex', 2,
    'weeks', JSON_ARRAY(JSON_OBJECT('label','W1–2 概论','weight',1),JSON_OBJECT('label','W3–5 监督','weight',1.3),JSON_OBJECT('label','W6–8 模型','weight',1.2),JSON_OBJECT('label','W9–11 集成','weight',1.1),JSON_OBJECT('label','W12–14 展示','weight',1)),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time','第 2 周','title','工作流','body','pandas 探索；训练流水线。','type','primary'),
      JSON_OBJECT('time','第 5 周','title','分类回归','body','逻辑回归/树；交叉验证。','type','success'),
      JSON_OBJECT('time','第 8 周','title','模型调参','body','网格搜索；学习曲线。','type','warning'),
      JSON_OBJECT('time','第 12 周','title','伦理与报告','body','偏见案例；实验报告与答辩。','type','info')))
WHERE course_id = 1019;

-- 1020 编译原理
UPDATE courses SET
  content_insight = JSON_OBJECT('summary', '词法、语法分析、语义处理与代码生成，实现迷你编译器 front-end。', 'bullets', JSON_ARRAY('正则、CFG 与 LL/LR 分析直观', '构造 AST 与符号表', '完成小型语言到中间代码的翻译')),
  learning_path = JSON_OBJECT('note', '编译原理项目周次紧，建议小组并行词法/语法模块。', 'activeIndex', 2,
    'weeks', JSON_ARRAY(JSON_OBJECT('label','W1–3 词法','weight',1.2),JSON_OBJECT('label','W4–7 语法','weight',1.4),JSON_OBJECT('label','W8–10 语义','weight',1.2),JSON_OBJECT('label','W11–14 代码生成','weight',1.3)),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time','第 3 周','title','词法分析器','body','Flex/手写 scanner；token 流。','type','primary'),
      JSON_OBJECT('time','第 7 周','title','语法分析','body','递归下降或 LR 表；AST 构建。','type','success'),
      JSON_OBJECT('time','第 10 周','title','语义检查','body','类型检查；符号表作用域。','type','warning'),
      JSON_OBJECT('time','第 14 周','title','编译器交付','body','源程序到 IR/汇编子集；演示与文档。','type','info')))
WHERE course_id = 1020;
