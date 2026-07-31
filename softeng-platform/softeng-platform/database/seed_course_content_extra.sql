-- 按课程名称补充摘要与学习路径（适用于 seed 之外、库里已有的通识/数学类课程）
USE softeng;
SET NAMES utf8mb4;

UPDATE courses SET
  content_insight = JSON_OBJECT(
    'summary', '一元微积分核心：极限、连续、导数与积分，为工科后续课程与建模打基础。',
    'bullets', JSON_ARRAY(
      '掌握极限与连续的基本定义及运算法则，能处理典型求极限题型',
      '熟练求导、微分与中值定理应用，理解变化率与线性近似',
      '建立定积分与不定积分概念，会计算常见积分并解简单应用题'
    )
  ),
  learning_path = JSON_OBJECT(
    'note', '高等数学（上）章节推进参考，供自学复盘；周次为建议节奏，以任课教师大纲为准。',
    'activeIndex', 1,
    'weeks', JSON_ARRAY(
      JSON_OBJECT('label', 'W1–3 函数极限', 'weight', 1.1),
      JSON_OBJECT('label', 'W4–7 导数', 'weight', 1.3),
      JSON_OBJECT('label', 'W8–11 微分中值', 'weight', 1.1),
      JSON_OBJECT('label', 'W12–15 积分', 'weight', 1.3),
      JSON_OBJECT('label', 'W16 复习', 'weight', 0.8)
    ),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time', '第 3 周', 'title', '极限与连续', 'body', 'ε-δ 直观理解；两个重要极限；间断点分类与闭区间连续函数性质。', 'type', 'primary'),
      JSON_OBJECT('time', '第 7 周', 'title', '导数与求导法则', 'body', '复合函数、隐函数求导；切线与变化率应用题。', 'type', 'success'),
      JSON_OBJECT('time', '第 11 周', 'title', '中值定理与应用', 'body', '罗尔、拉格朗日、洛必达；函数单调性与极值。', 'type', 'warning'),
      JSON_OBJECT('time', '第 15 周', 'title', '定积分与应用', 'body', '牛顿-莱布尼茨公式；面积、体积等几何应用；换元与分部积分。', 'type', 'danger'),
      JSON_OBJECT('time', '第 16 周', 'title', '阶段测验', 'body', '覆盖极限至积分；错题归因与公式速查表整理。', 'type', 'info')
    )
  )
WHERE name LIKE '%高等数学%' AND (name LIKE '%上%' OR name LIKE '%(上)%' OR name LIKE '（上）%');

UPDATE courses SET
  content_insight = JSON_OBJECT(
    'summary', '多元微积分与级数：向量函数、偏导、重积分与无穷级数，衔接线代与物理应用。',
    'bullets', JSON_ARRAY(
      '理解多元函数极限、偏导与全微分，会求方向导数与梯度',
      '掌握二重、三重积分与坐标变换，能解决简单体积与质量计算',
      '熟悉常数项级数与幂级数收敛性，了解傅里叶级数入门'
    )
  ),
  learning_path = JSON_OBJECT(
    'note', '高等数学（下）推荐学习顺序；实验与作业以课堂布置为准。',
    'activeIndex', 2,
    'weeks', JSON_ARRAY(
      JSON_OBJECT('label', 'W1–4 多元函数', 'weight', 1.2),
      JSON_OBJECT('label', 'W5–8 重积分', 'weight', 1.3),
      JSON_OBJECT('label', 'W9–12 曲线曲面积分', 'weight', 1.2),
      JSON_OBJECT('label', 'W13–16 级数', 'weight', 1.2)
    ),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time', '第 4 周', 'title', '多元微分', 'body', '偏导、链式法则、拉格朗日乘子法求条件极值。', 'type', 'primary'),
      JSON_OBJECT('time', '第 8 周', 'title', '重积分', 'body', '直角/极坐标二重积分；三重积分与柱面、球面坐标。', 'type', 'success'),
      JSON_OBJECT('time', '第 12 周', 'title', '曲线与曲面积分', 'body', '格林、高斯、斯托克斯公式直观与应用。', 'type', 'warning'),
      JSON_OBJECT('time', '第 16 周', 'title', '级数与复习', 'body', '收敛判别法；幂级数展开；期末综合复习。', 'type', 'info')
    )
  )
WHERE name LIKE '%高等数学%' AND (name LIKE '%下%' OR name LIKE '%(下)%' OR name LIKE '（下）%');

UPDATE courses SET
  content_insight = JSON_OBJECT(
    'summary', '线性代数：矩阵、向量空间、特征值与二次型，支撑机器学习与图形学入门。',
    'bullets', JSON_ARRAY(
      '熟练矩阵运算与行列式，会用秩判断线性方程组解的结构',
      '理解向量空间、基与线性变换，掌握特征值特征向量计算',
      '会化二次型为标准形，了解正定矩阵判定'
    )
  ),
  learning_path = JSON_OBJECT(
    'note', '线性代数典型章节周次安排，供配合软工平台资料自学。',
    'activeIndex', 1,
    'weeks', JSON_ARRAY(
      JSON_OBJECT('label', 'W1–3 矩阵', 'weight', 1.2),
      JSON_OBJECT('label', 'W4–7 行列式', 'weight', 1.1),
      JSON_OBJECT('label', 'W8–11 向量空间', 'weight', 1.3),
      JSON_OBJECT('label', 'W12–15 特征值', 'weight', 1.2)
    ),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time', '第 3 周', 'title', '矩阵与方程组', 'body', '高斯消元；矩阵逆与初等变换。', 'type', 'primary'),
      JSON_OBJECT('time', '第 7 周', 'title', '行列式与秩', 'body', '克拉默法则；秩与解的判定定理。', 'type', 'success'),
      JSON_OBJECT('time', '第 11 周', 'title', '线性无关与基', 'body', '子空间；正交化与正交补。', 'type', 'warning'),
      JSON_OBJECT('time', '第 15 周', 'title', '特征值与二次型', 'body', '对角化；实对称矩阵谱定理；二次型分类。', 'type', 'info')
    )
  )
WHERE name LIKE '%线性代数%';

UPDATE courses SET
  content_insight = JSON_OBJECT(
    'summary', '概率论与数理统计：随机变量、分布、估计与假设检验，为数据分析与质量工程奠基。',
    'bullets', JSON_ARRAY(
      '掌握常见离散、连续分布及数字特征',
      '理解大数定律与中心极限定理的统计含义',
      '会进行点估计、区间估计与假设检验的基本计算'
    )
  ),
  learning_path = JSON_OBJECT(
    'note', '概率统计课程推荐进度；实验可使用 Jupyter 完成分布可视化。',
    'activeIndex', 2,
    'weeks', JSON_ARRAY(
      JSON_OBJECT('label', 'W1–4 概率基础', 'weight', 1.1),
      JSON_OBJECT('label', 'W5–8 随机变量', 'weight', 1.3),
      JSON_OBJECT('label', 'W9–12 统计推断', 'weight', 1.2),
      JSON_OBJECT('label', 'W13–16 回归', 'weight', 1)
    ),
    'milestones', JSON_ARRAY(
      JSON_OBJECT('time', '第 4 周', 'title', '事件与概率', 'body', '条件概率、全概率与贝叶斯公式。', 'type', 'primary'),
      JSON_OBJECT('time', '第 8 周', 'title', '分布与期望', 'body', '正态、t、卡方分布；抽样分布概念。', 'type', 'success'),
      JSON_OBJECT('time', '第 12 周', 'title', '估计与检验', 'body', '置信区间；显著性检验流程。', 'type', 'warning'),
      JSON_OBJECT('time', '第 16 周', 'title', '应用与复习', 'body', '线性回归入门；综合案例与期末准备。', 'type', 'info')
    )
  )
WHERE name LIKE '%概率%' OR name LIKE '%统计%';
