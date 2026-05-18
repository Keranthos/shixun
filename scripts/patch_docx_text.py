# -*- coding: utf-8 -*-
from pathlib import Path
from docx import Document

DOCX = Path(__file__).resolve().parents[1] / "实训中期报告.docx"

RULES = [
    ("「", "“"),
    ("」", "”"),
    ("，”不知道", "，“不知道"),
    ("，”重复", "，“重复"),
    ("可答辩、可截图、可叙述创新点的完整形态", "功能完整、便于展示与技术总结的完整形态"),
    ("服务综合实训答辩与课程报告撰写", "支撑综合实训中期检查与后续课程报告撰写"),
    ("答辩环境一键复现，降低评审机配置成本", "容器化一键部署，降低环境配置成本"),
    ("适合答辩演示第一印象", "提升首屏视觉与交互体验"),
    ("建议答辩时：用 60% 时间展示本章，40% 时间演示第五章主线。", ""),
    ("拓展阶段 · 答辩重点", "拓展阶段"),
    ("适合答辩“知识关联”话题", "便于呈现资源之间的关联关系"),
    ("适合答辩知识关联话题", "便于呈现资源之间的关联关系"),
    ("保证答辩现场无 Key 也能演示完整交互", "在未配置 API Key 时仍可完成完整交互演示"),
    ("典型业务场景说明（便于答辩叙述）", "典型业务场景说明"),
    ("好演示、好讲解、好写报告", "可用性、可维护性与可扩展性上达到预期目标"),
    ("为期末验收与答辩做好铺垫", "为期末验收与后续功能迭代做好准备"),
    ("答辩 PPT 建议按编号制作“功能清单”一页", "亦可按功能编号对照《高级功能与报告亮点清单》整理附录"),
    ("答辩 PPT 建议按编号制作功能清单一页", "亦可按功能编号对照《高级功能与报告亮点清单》整理附录"),
    ("后端 REST API 接口清单（主干）", "后端 REST API 接口清单"),
    ("（答辩用）", ""),
    ("报告可写创新点", "创新点说明"),
    ("一键部署答辩环境", "一键部署完整运行环境"),
    ("答辩现场演示脚本建议", "系统演示流程说明"),
    ("答辩常见问题与参考回答（FAQ）", "常见问题说明"),
    ("保证答辩可复现", "保证在无密钥环境下仍可复现"),
    ("演示彩排", "集成验证"),
    ("便于报告中说明可演进性", "便于后续扩展为更完整的账号与合规能力"),
]


def apply_rules(text: str) -> str:
    for old, new in RULES:
        text = text.replace(old, new)
    # 修复 Word 中常见的引号方向错误：行首 ” → “
    text = text.replace("，”", "，“").replace("。”", "。“")
    return text


def set_paragraph_text(paragraph, new_text: str) -> None:
    if not paragraph.runs:
        paragraph.add_run(new_text)
        return
    paragraph.runs[0].text = new_text
    for run in paragraph.runs[1:]:
        run.text = ""


def patch_paragraph(paragraph) -> bool:
    old = paragraph.text
    if not old.strip():
        return False
    new = apply_rules(old)
    if new != old:
        set_paragraph_text(paragraph, new)
        return True
    return False


def main():
    doc = Document(str(DOCX))
    n = 0
    for p in doc.paragraphs:
        if patch_paragraph(p):
            n += 1
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for p in cell.paragraphs:
                    if patch_paragraph(p):
                        n += 1
    doc.save(str(DOCX))
    print(f"Patched {n} paragraphs in {DOCX}")


if __name__ == "__main__":
    main()
