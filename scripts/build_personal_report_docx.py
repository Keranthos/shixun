# -*- coding: utf-8 -*-
"""直接构建个人项目报告 Word，不经过 Markdown 转换。"""
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

OUT = Path(r"C:\Users\wanweijie\Desktop\shixun\个人项目报告-万伟杰.docx")
OUT_FALLBACK = Path(r"C:\Users\wanweijie\Desktop\shixun\个人项目报告-万伟杰-最新.docx")


def set_run_font(run, name="宋体", size=12, bold=False, color=None):
    run.font.name = name
    run.font.size = Pt(size)
    run.font.bold = bold
    if color:
        run.font.color.rgb = color
    run._element.rPr.rFonts.set(qn("w:eastAsia"), name)


def set_paragraph(paragraph, align=None, indent=True, space_after=6, line_spacing=1.5):
    fmt = paragraph.paragraph_format
    fmt.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    fmt.line_spacing = line_spacing
    fmt.space_after = Pt(space_after)
    if indent:
        fmt.first_line_indent = Cm(0.74)
    if align is not None:
        paragraph.alignment = align


def add_title(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(text)
    set_run_font(r, "黑体", 22, bold=True)
    p.paragraph_format.space_after = Pt(18)
    p.paragraph_format.line_spacing = 1.0


def add_heading1(doc, text):
    p = doc.add_paragraph()
    r = p.add_run(text)
    set_run_font(r, "黑体", 16, bold=True)
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.0
    p.paragraph_format.first_line_indent = Cm(0)


def add_heading2(doc, text):
    p = doc.add_paragraph()
    r = p.add_run(text)
    set_run_font(r, "黑体", 14, bold=True)
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.0
    p.paragraph_format.first_line_indent = Cm(0)


def add_body(doc, text, indent=True):
    p = doc.add_paragraph()
    r = p.add_run(text)
    set_run_font(r, "宋体", 12)
    set_paragraph(p, indent=indent)
    return p


def add_bold_lead_body(doc, lead, rest):
    p = doc.add_paragraph()
    r1 = p.add_run(lead)
    set_run_font(r1, "宋体", 12, bold=True)
    r2 = p.add_run(rest)
    set_run_font(r2, "宋体", 12)
    set_paragraph(p)


def add_bullet(doc, text, level=0):
    p = doc.add_paragraph(style="List Bullet")
    p.clear()
    r = p.add_run(text)
    set_run_font(r, "宋体", 12)
    fmt = p.paragraph_format
    fmt.left_indent = Cm(0.74 + level * 0.5)
    fmt.first_line_indent = Cm(-0.37)
    fmt.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    fmt.line_spacing = 1.5
    fmt.space_after = Pt(3)


def add_numbered(doc, text):
    p = doc.add_paragraph(style="List Number")
    p.clear()
    r = p.add_run(text)
    set_run_font(r, "宋体", 12)
    fmt = p.paragraph_format
    fmt.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    fmt.line_spacing = 1.5
    fmt.space_after = Pt(3)


def add_kv_table(doc, rows):
    table = doc.add_table(rows=len(rows), cols=2)
    table.style = "Table Grid"
    table.autofit = True
    for i, (k, v) in enumerate(rows):
        c0, c1 = table.rows[i].cells[0], table.rows[i].cells[1]
        c0.text = ""
        c1.text = ""
        rk = c0.paragraphs[0].add_run(k)
        set_run_font(rk, "宋体", 12, bold=True)
        rv = c1.paragraphs[0].add_run(v)
        set_run_font(rv, "宋体", 12)
        for cell in (c0, c1):
            for para in cell.paragraphs:
                para.paragraph_format.line_spacing = 1.25
    doc.add_paragraph()


def add_data_table(doc, headers, data, col_widths=None):
    table = doc.add_table(rows=1 + len(data), cols=len(headers))
    table.style = "Table Grid"
    hdr = table.rows[0].cells
    for j, h in enumerate(headers):
        hdr[j].text = ""
        r = hdr[j].paragraphs[0].add_run(h)
        set_run_font(r, "宋体", 11, bold=True)
        hdr[j].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        shading = hdr[j]._tc.get_or_add_tcPr()
        # light gray header via XML
    for i, row in enumerate(data):
        for j, val in enumerate(row):
            cell = table.rows[i + 1].cells[j]
            cell.text = ""
            r = cell.paragraphs[0].add_run(val)
            set_run_font(r, "宋体", 11)
            cell.paragraphs[0].paragraph_format.line_spacing = 1.25
    if col_widths:
        for j, w in enumerate(col_widths):
            for row in table.rows:
                row.cells[j].width = Cm(w)
    doc.add_paragraph()


def build():
    doc = Document()
    sec = doc.sections[0]
    sec.top_margin = Cm(2.54)
    sec.bottom_margin = Cm(2.54)
    sec.left_margin = Cm(3.17)
    sec.right_margin = Cm(3.17)

    add_title(doc, "软件工程专业综合实训")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("个人项目报告")
    set_run_font(r, "黑体", 18, bold=True)
    p.paragraph_format.space_after = Pt(24)

    add_kv_table(doc, [
        ("姓    名", "万伟杰"),
        ("学    号", "（请填写）"),
        ("班    级", "（请填写）"),
        ("项目名称", "软工资源平台（SoftEng Platform）"),
        ("项目成员", "万伟杰、蔡沛良、杨凯宇、龚虹宇、高颖轩、唐云鹏"),
        ("代码仓库", "GitHub: Keranthos/shixun"),
    ])

    add_heading1(doc, "摘要")
    add_body(
        doc,
        "软工资源平台是面向学院师生的教学资源聚合 Web 系统，整合工具、课程、项目三类资源的浏览、提交、审核与互动，并扩展运营数据大屏、资源关联图谱与 RAG 学习助手。系统采用前后端分离架构，日常业务由 Go 与 MySQL 承担，RAG 智能体以独立 Python 服务运行。主要工作包括：审核通过后自动更新问答索引、向量与关键词混合检索、标签关联图谱，以及图片本地化、一键启动等工程化支持。",
    )
    add_bold_lead_body(doc, "关键词：", "软工资源平台；RAG 智能体；混合检索；LangChain；数据可视化")

    add_heading1(doc, "一、项目总述")

    add_heading2(doc, "1.1 项目背景")
    add_body(
        doc,
        "在软件工程专业教学实践中，工具链接、课程资料与优秀项目案例往往分散于即时通讯群组、网盘及个人收藏之中，存在检索效率低、链接易失效、难以形成长期沉淀等问题。现有论坛类平台侧重即时交流，对需持续维护的工具说明、课程课件及项目展示类内容支撑不足。",
    )

    add_heading2(doc, "1.2 建设目标与主要功能")
    add_body(
        doc,
        "本项目旨在构建面向学院师生的软工资源共享平台，实现工具、课程与项目三类信息的统一收集、展示、提交与审核发布。主要功能包括：资源浏览与关键词搜索、收藏评论与提交审核、管理员运营数据大屏、资源关联图谱，以及基于平台已有内容的 RAG 智能问答。",
    )

    add_heading2(doc, "1.3 系统架构")
    add_body(
        doc,
        "系统由浏览器、Go 后端、Python 智能体服务及多套数据库组成。一般请求由 Go 后端处理鉴权和业务；学习助手提问时，Go 后端转发至 Python 智能体，检索后交给大模型组织回答，再流式返回浏览器。业务数据存 MySQL；RAG 智能体另建向量库和关键词索引，分别用 Chroma 与 SQLite。",
    )
    add_body(doc, "系统按职责分为四层，如表 1 所示。", indent=False)
    add_data_table(
        doc,
        ["层次", "做什么", "主要技术"],
        [
            ("前端层", "页面展示、图表、用户操作", "Vue 3、Element Plus、ECharts"),
            ("后端层", "资源管理、审核、登录鉴权、转发智能体请求", "Go、Gin、JWT"),
            ("智能体层", "建知识库、检索、调用大模型生成回答", "Python、FastAPI、LangChain"),
            ("数据层", "存业务数据和检索索引", "MySQL、Chroma、SQLite"),
        ],
        col_widths=[2.2, 5.5, 6.1],
    )
    add_body(doc, "RAG 智能体内部各环节如表 2 所示。", indent=False)
    add_data_table(
        doc,
        ["环节", "采用方案", "说明"],
        [
            ("内容切块与同步", "后端自主实现", "从 MySQL 读取已审核内容，按固定长度切块，审核通过后自动更新"),
            ("文本向量化", "Gemini 嵌入接口", "把文字变成向量，供语义搜索使用"),
            ("语义搜索", "Chroma 向量库", "按意思相近找相关内容"),
            ("关键词搜索", "SQLite 及自研模块", "按工具名、课程名等精确匹配，BM25 类打分"),
            ("两路结果合并", "自主实现", "把语义搜索和关键词搜索的结果加权合并"),
            ("对话流程", "LangChain", "组织先检索、再拼上下文、再调模型的流程"),
            ("生成回答", "Gemini 生成接口", "基于检索内容生成回答，并标注引用编号"),
            ("流式输出", "SSE 经 Go 后端转发", "回答逐字返回"),
        ],
        col_widths=[2.5, 3.5, 7.8],
    )
    add_body(doc, "工程部署采用 Docker Compose 与 Monorepo 一键启动脚本。", indent=False)

    add_heading2(doc, "1.4 搜索相关功能的三块划分")
    add_body(doc, "平台里和找内容有关的功能分三块，互不替代：", indent=False)
    add_bullet(doc, "首页与搜索页的关键词搜索：靠同义词规则和 MySQL 查询，面向已知关键词、快速筛列表；")
    add_bullet(doc, "详情页的相关推荐与重复投稿提示：靠标签相似度等轻量算法；")
    add_bullet(doc, "RAG 学习助手：混合检索后大模型回答，面向自然语言提问。")

    add_heading1(doc, "二、个人工作说明")

    add_heading2(doc, "2.1 工作概况")
    add_body(
        doc,
        "本人担任项目组长，工作贯穿中期前基础集成、中期后智能化拓展、期末验收工程化三阶段，与组内同学共同完成需求分析、数据库设计、前后端开发、联调测试与文档整理。个人投入最集中的方向包括：",
    )
    add_bullet(doc, "前后端集成与接口规范；")
    add_bullet(doc, "工程化工具链；")
    add_bullet(doc, "RAG 学习助手（索引、检索、前端问答）；")
    add_bullet(doc, "运营可视化（Insights 管理端）；")
    add_bullet(doc, "智能检索与内容安全；")
    add_bullet(doc, "Monorepo 与 Docker 交付。")
    add_body(doc, "按时间线概括如下：", indent=False)
    add_bullet(doc, "中期前：统一 OpenAPI 与 Swagger，Repository 脚手架、图片本地化，跑通浏览—提交—审核主流程；")
    add_bullet(doc, "中期后：RAG 学习助手、Insights 运营大屏、智能搜索、内容安全、run-dev 一键启动；")
    add_bullet(doc, "验收期：Monorepo、Docker Compose、dbcheck 自检与去 Demo 化加固。")

    add_heading2(doc, "2.2 问题、创新与技术方案")

    add_heading2(doc, "（1）平台内容多，但无法用自然语言可靠问答")
    add_bold_lead_body(doc, "面临的问题。", "工具、课程、项目分散在列表和详情页中，同学往往需要逐页翻找；若直接调用大模型，又容易脱离站内真实内容产生不准确回答，且新审核通过的资源无法立刻被问答到。若智能问答与主站业务耦合过紧，嵌入模型或向量库异常时还可能影响整体 API 可用性。")
    add_bold_lead_body(doc, "创新思路。", "学习助手只根据本站已审核内容回答并标注引用；审核通过或内容修改后同步更新索引；Go 管业务和转发，Python 管检索和生成，两个服务分开部署。")
    add_bold_lead_body(doc, "技术方案。", "Go 从 MySQL 读取已审核文本并切块，内容变更时更新索引；Python 用 Chroma 和 SQLite 做检索；LangChain 组织生成流程，Gemini 负责嵌入和回答；Go 做鉴权、限流和 SSE 转发。不可用时先只返回检索结果，再退回 SQL 搜索。")

    add_heading2(doc, "（2）用户提问方式多样，单一搜索路径召回不稳")
    add_bold_lead_body(doc, "面临的问题。", "只走向量搜索时，工具名、课程名等短词容易匹配不准；只做数据库模糊匹配，又无法理解用户换说法的提问。首页列表搜索与学习助手面向的场景不同，若强行共用一套逻辑，既浪费算力，也难以向用户解释两种入口结果为何不同。")
    add_bold_lead_body(doc, "创新思路。", "RAG 同时做向量和关键词检索并合并结果；首页搜索继续用同义词和意图判断，与学习助手分开做。")
    add_bold_lead_body(doc, "技术方案。", "学习助手提问时，智能体同时查询向量库与关键词索引，按相似度加权合并并限制每资源引用段数。首页搜索主要包括：")
    add_bullet(doc, "同义词扩展：维护同义词表，扩展 IDE 等为开发环境、编辑器等；")
    add_bullet(doc, "检索意图识别：判断用户想找工具、课程还是项目，自动切换标签页；")
    add_bullet(doc, "搜索状态与 URL 同步：刷新或分享链接后保持同一搜索状态。")
    add_body(doc, "底层调用 MySQL 列表接口做模糊匹配；详情页按标签重叠做相关推荐。", indent=False)

    add_heading2(doc, "（3）协作开发与资源展示存在工程痛点")
    add_bold_lead_body(doc, "面临的问题。", "用户填写的外链图片容易失效且存在跨域风险；工具、课程、项目三套模块的数据访问代码高度相似，重复手写易出错；六人联调时数据库未初始化、前后端分仓库、启动步骤多，Windows 与 Linux 环境差异大；无图资源展示不统一，影响列表与详情观感。")
    add_bold_lead_body(doc, "创新思路。", "形成面向协作交付的工程化方案：外链自动转本地存储、无图时用首字 SVG 占位、从表结构自动生成 Repository 代码、启动前 dbcheck 自检、一键脚本拉起全栈、Docker Compose 容器化部署，并最终合并为 Monorepo。")
    add_bold_lead_body(doc, "技术方案。", "后端识别 URL、Base64、本地路径三种图片输入并统一落盘，按年/月目录存储，文件名采用时间戳加内容哈希。Python 脚本读取 schema.sql 批量生成 Go 层 Repository。run-dev 脚本顺序执行 dbcheck、Air 热重载后端、前端 dev 服务，可选启动智能体，并兼容 Windows UTF-8 BOM。Docker Compose 编排 MySQL、API 与 Nginx 前端；git subtree 合并 Monorepo。")

    add_heading2(doc, "（4）管理员难以把握资源全貌与隐性关联")
    add_bold_lead_body(doc, "面临的问题。", "工具、课程、项目分散在多个列表里，管理员缺少总览视角，难以回答近期提交量、资源类型分布、审核通过率等问题；资源之间的标签关系靠人工翻找，难以发现常一起出现的组合。")
    add_bold_lead_body(doc, "创新思路。", "建设 Insights 管理端，提供运营数据大屏与资源关联图谱：前者聚合关键指标与分类统计，后者基于标签共现做轻量关联分析，不依赖用户行为日志。")
    add_bold_lead_body(doc, "技术方案。", "浏览器并行请求各业务接口并在前端聚合，用 ECharts 绘制 KPI 卡片、类型占比、分类排行与时间趋势；关联图谱以共同标签数量为关联强度，用力导向图展示；另含会话画像、事件时间线、接口遥测等子页。Insights 仅管理员可访问。")

    add_heading2(doc, "（5）用户提交存在安全与质量风险")
    add_bold_lead_body(doc, "面临的问题。", "提交的资源或评论可能含敏感词、危险链接；重复投稿浪费审核精力；仅在前端拦截可被绕过，存在合规隐患。")
    add_bold_lead_body(doc, "创新思路。", "前后端词库对齐的双端校验；提交前标题相似度提示，降低重复条目进入审核队列的概率。")
    add_bold_lead_body(doc, "技术方案。", "前端对标题、正文、外链做本地预检，后端 Go 在写入前再次强制校验，覆盖工具、课程、项目及评论。重复投稿检测基于标题相似度，超过阈值时弹窗提示用户确认。详情页相关推荐按标签重叠与热度加权展示。")

    add_heading2(doc, "（6）流式问答与多服务联调存在隐蔽问题")
    add_bold_lead_body(doc, "面临的问题。", "大模型回答若等全部生成再返回，等待时间长；Go 中间层可能缓冲 SSE 导致假流式；向量库与审核状态不同步时，学习助手可能引用已下架内容；API 或智能体不可用会影响答辩演示。")
    add_bold_lead_body(doc, "创新思路。", "回答用 SSE 逐字返回；审核变了就改索引；智能体挂了还能退回检索结果或 SQL 搜索。")
    add_bold_lead_body(doc, "技术方案。", "Python 用 SSE 推送回答，Go 逐块转发；审核通过、驳回、删除时更新索引；限流防刷；网络异常时先返回检索段落，再试 SQL 搜索。")

    add_heading2(doc, "2.3 前后端集成与接口规范")
    add_body(doc, "主要工作包括：", indent=False)
    add_bullet(doc, "以 OpenAPI 为联调依据，统一三模块字段命名、分页参数与状态码；")
    add_bullet(doc, "封装 HTTP 请求，区分公开与需登录接口，避免浏览详情时被误踢出登录；")
    add_bullet(doc, "梳理收藏数、评论数、浏览量等统计字段，消除列表页与详情页不一致；")
    add_bullet(doc, "实现登录态初始化、路由守卫及按角色展示菜单；")
    add_bullet(doc, "学习助手需登录后使用；Insights 仅管理员可见。")

    add_heading2(doc, "2.4 RAG 智能体实现补充")

    add_heading2(doc, "2.4.1 首页关键词搜索")
    add_body(
        doc,
        "首页与统一搜索页面向「已知关键词、快速筛列表」场景，不调用向量库和大模型，而是走关键词加数据库查询路径。具体实现包括以下三项：",
    )
    add_bullet(doc, "同义词扩展：维护同义词对照表，输入 IDE 时同时匹配开发环境、编辑器等表述；")
    add_bullet(doc, "检索意图识别：根据查询特征判断更可能想找工具、课程还是项目，自动切换标签页；")
    add_bullet(doc, "搜索状态与 URL 同步：关键词与分页写入地址栏，刷新或分享链接后结果不丢失。")
    add_body(
        doc,
        "前端完成预处理后，调用 Go 后端 SQL 列表接口对标题、简介等字段模糊匹配。这与学习助手分工明确：首页搜索解决「我知道关键词」；学习助手解决「我用自然语言描述需求」。",
    )

    add_heading2(doc, "2.4.2 详情页相关推荐与重复投稿提示")
    add_body(
        doc,
        "详情页底部展示相关推荐：在同类型资源中计算标签重叠比例，并参考收藏量、浏览量等热度加权，取得分最高的若干条展示。提交新资源时，系统在写入前拉取已有标题并计算文字相似度，超过阈值则提示可能存在相似条目，由用户确认后再提交，减轻重复审核工作量。上述逻辑均为自主实现的轻量算法，不依赖外部分推荐服务。",
    )

    add_heading2(doc, "2.4.3 知识库索引五步骤")
    add_body(doc, "知识库构建分为五个连续步骤：", indent=False)
    add_numbered(doc, "内容抽取：从 MySQL 读取已审核的工具、课程、项目正文，并将评论、课程资料等附属文本纳入语料。")
    add_numbered(doc, "文本切块：长文按约一千二百字切段，每段有唯一编号与内容哈希，便于增量更新。")
    add_numbered(doc, "写入向量库：调用 Gemini 嵌入接口转向量并批量写入 Chroma，失败时记录并重试。")
    add_numbered(doc, "写入关键词索引：同一段写入 SQLite 倒排表，采用二元组分词与 BM25 类打分。")
    add_numbered(doc, "自动更新：审核通过、驳回、编辑或评论变更时触发增量增删，管理员亦可全量重建。")

    add_heading2(doc, "2.4.4 一次问答的流程")
    add_data_table(
        doc,
        ["步骤", "在哪里", "做什么"],
        [
            ("1", "浏览器", "用户输入问题，带上登录信息和多轮对话历史"),
            ("2", "Go 后端", "校验是否登录、是否触发限流"),
            ("3", "Python 智能体", "并行执行关键词搜索与向量搜索"),
            ("4", "Python 智能体", "加权合并、去重，整理成带编号的参考资料"),
            ("5", "Python 智能体", "LangChain 拼提示词，约束仅依据引用回答，调用 Gemini 生成"),
            ("6", "Go 后端", "SSE 流式转发，避免缓冲导致卡顿"),
            ("7", "浏览器", "逐字显示回答，引用编号可点开跳转详情"),
        ],
        col_widths=[1.2, 2.8, 10.8],
    )

    add_heading2(doc, "2.4.5 Go 网关与 Python 智能体分工")
    add_body(
        doc,
        "Go 后端承担日常业务与网关：登录校验、限流、从 MySQL 读取数据、审核链路中触发切块与索引更新、以 SSE 流式转发回答，并在智能体异常时降级兜底。Python 智能体专注检索与生成：维护两套索引、执行混合检索、用 LangChain 编排提示词、调用 Gemini 生成带引用编号的回答。两者通过 HTTP 通信，智能体可单独重启而不影响浏览、收藏、提交、审核等核心功能；答辩时若智能体未启动，Go 层仍可返回 SQL 搜索结果或友好提示。",
    )

    add_heading2(doc, "2.4.6 现成工具与自主开发对照")
    add_data_table(
        doc,
        ["功能", "现成工具或服务", "自己写的部分"],
        [
            ("首页搜索", "后端 SQL 列表接口", "同义词扩展、意图识别、URL 同步"),
            ("相关推荐", "—", "标签相似度与热度加权"),
            ("重复投稿提示", "—", "标题相似度检测与确认交互"),
            ("向量库", "Chroma", "切块规则、语料范围、审核后自动更新"),
            ("文字向量化", "Gemini 嵌入接口", "批量调用、失败重试与增量写入"),
            ("关键词索引", "SQLite", "二元组分词、倒排表、BM25 类打分"),
            ("两路结果合并", "—", "加权排序、每资源段数上限、去重"),
            ("对话流程", "LangChain", "提示词模板、引用编号格式、多轮历史"),
            ("生成回答", "Gemini 生成接口", "流式解析、无引用时的拒答策略"),
            ("请求转发", "Gin", "登录校验、限流、SSE 刷新转发"),
        ],
        col_widths=[2.2, 4.5, 7.1],
    )

    add_heading2(doc, "2.5 工程化建设实现补充")
    add_bold_lead_body(doc, "外链图片本地化。", "提交表单中的图片可来自外部链接、Base64 编码或本地路径。后端统一识别并下载或解码，按年/月目录存储，文件名采用时间戳加内容哈希，避免冲突与重复；前端用统一函数处理图片地址，解决热链失效与跨域问题。")
    add_bold_lead_body(doc, "SVG 默认图标。", "工具、课程、项目未上传图标或用户无头像时，根据名称首字与哈希生成配色方案，动态渲染 SVG 占位图，不占用额外磁盘，与上传图标在界面上无缝切换。")
    add_bold_lead_body(doc, "数据库代码自动生成。", "Python 脚本解析 schema.sql，按模板批量生成 Go 层 Repository 与基础 CRUD，减少三套模块重复手写导致的字段遗漏，并配合 Swagger 生成 OpenAPI 联调文档。")
    add_bold_lead_body(doc, "dbcheck 自检。", "启动前检测 MySQL 连接与关键业务表是否存在；未初始化时输出明确提示，说明应先执行建表脚本再导入演示数据，降低联调排查成本。")
    add_bold_lead_body(doc, "run-dev 一键启动。", "根目录脚本顺序启动 dbcheck、Air 热重载 Go 后端、Vue 前端 dev 服务，可选启动 Python 智能体；Air 监听源码目录实现保存即重编；脚本兼容 Windows 下 UTF-8 BOM 导致的中文乱码。")
    add_bold_lead_body(doc, "Docker Compose 容器化。", "编排 MySQL、Go API、Nginx 静态前端三服务，挂载建表脚本与种子数据，API 配置健康检查，前端构建时注入 API 地址，适合答辩现场一条命令拉起演示环境。")
    add_bold_lead_body(doc, "Monorepo 整合。", "用 git subtree 将原先分散的前端、后端、agent 仓库合并到同一仓库，统一 README 与运行说明，避免协作时需要分别克隆、分别对分支。")
    add_bold_lead_body(doc, "内容安全双端校验。", "维护前后端一致的敏感词与危险链接规则库，提交与评论时前端预检、后端强制校验，保证无法通过绕过前端来写入违规内容。")

    add_heading2(doc, "2.6 运营可视化与 Insights 管理端")
    add_body(doc, "Insights 面向管理员，普通用户不可见。主要页面包括：", indent=False)
    add_bullet(doc, "运营数据大屏：聚合 KPI、类型占比、分类排行与时间趋势；")
    add_bullet(doc, "资源关联图谱：按标签共现构建力导向图，节点可跳转详情；")
    add_bullet(doc, "会话画像与事件时间线：记录本机浏览与搜索行为，展示审核事件；")
    add_bullet(doc, "接口遥测与长列表演示：统计接口耗时，虚拟滚动展示万级数据。")

    add_heading2(doc, "2.7 实施过程中的关键问题与对策")
    add_bold_lead_body(doc, "（1）语义路与关键词路如何平衡。", "不同类型提问适合不同检索方式，例如找 Vue 课程更适合语义路，找 Git 工具更适合关键词路。通过对两路得分加权合并、限制每资源引用段数，并用典型问句标定权重，避免结果过于集中或过于发散。")
    add_bold_lead_body(doc, "（2）SSE 流式回答被中间层缓冲。", "表现为长时间无输出后一次性弹出全文。在 Go 转发层每收到数据块立即刷新输出，并设置禁用缓冲的响应头；前端按 SSE 事件边界逐条解析，保证逐字渲染体验。")
    add_bold_lead_body(doc, "（3）知识库与审核状态不一致。", "曾出现资源已驳回但向量库仍可检索的情况。后在审核通过、驳回、删除链路挂载索引 Hook 做增量增删，管理员亦可全量重建以校准一致性。")
    add_bold_lead_body(doc, "（4）外部 API 或智能体不可用。", "联调时网络不稳定。先尝试正常问答；超时则只返回检索段落；还不行用 SQL 搜索；最后给固定说明，避免演示中断。")

    add_heading2(doc, "2.8 收获、不足与总结")
    add_body(doc, "收获：", indent=False)
    add_bullet(doc, "完成了学习助手从建索引到前端问答的流程；")
    add_bullet(doc, "熟悉了 Go 和 Python 两个服务如何配合；")
    add_bullet(doc, "理清了首页搜索、详情推荐和学习助手各自的场景；")
    add_bullet(doc, "Monorepo、Docker 和 run-dev 让组内联调方便很多。")
    add_body(doc, "不足与展望：", indent=False)
    add_bullet(doc, "首页搜索仍偏规则，依赖在线 API，分词较简单；")
    add_bullet(doc, "自动化测试较少，部分功能只做到演示程度。")
    add_bold_lead_body(
        doc,
        "总结。",
        "我主要负责学习助手、搜索、工程化脚本、Insights 大屏和前后端联调。功能已在项目中实现，可用 run-dev 或 Docker Compose 启动演示。",
    )

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p.add_run("文档版本：2026-07-05")
    set_run_font(r, "宋体", 10.5, color=RGBColor(0x66, 0x66, 0x66))

    try:
        doc.save(str(OUT))
        print(f"已生成：{OUT}")
    except PermissionError:
        doc.save(str(OUT_FALLBACK))
        print(f"原文件被占用，已生成：{OUT_FALLBACK}")


if __name__ == "__main__":
    build()
