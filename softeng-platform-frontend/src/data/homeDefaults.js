/** 从站点 URL 推导 favicon（国内可访问，不依赖 Google） */
function faviconFromUrl (siteUrl, explicitIcon) {
  if (explicitIcon) return explicitIcon
  try {
    return `${new URL(siteUrl).origin}/favicon.ico`
  } catch {
    return ''
  }
}

function site (name, url, desc, icon) {
  return { name, url, desc, icon: faviconFromUrl(url, icon) }
}

/** 首页「常用」外链 */
export const HOME_COMMON_SITES = [
  site('哔哩哔哩', 'https://www.bilibili.com', '视频弹幕网站'),
  site('知乎', 'https://www.zhihu.com', '高质量问答平台', 'https://static.zhihu.com/heifetz/favicon.ico'),
  site('GitHub', 'https://github.com', '代码托管与开源社区', 'https://github.githubassets.com/favicons/favicon.png'),
  site('掘金', 'https://juejin.cn', '开发者技术社区', 'https://lf3-cdn-tos.bytescm.com/obj/static/xitu_juejin_web/img/favicon-32x32.png'),
  site('CSDN', 'https://www.csdn.net', 'IT 技术博客', 'https://g.csdnimg.cn/static/logo/favicon32.ico'),
  site('Stack Overflow', 'https://stackoverflow.com', '编程问答', 'https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico'),
  site('MDN', 'https://developer.mozilla.org/zh-CN/', 'Web 开发文档', 'https://developer.mozilla.org/favicon-48x48.png'),
  site('菜鸟教程', 'https://www.runoob.com', '编程语言教程'),
  site('百度翻译', 'https://fanyi.baidu.com', '多语言翻译', 'https://www.baidu.com/favicon.ico'),
  site('和风天气', 'https://www.qweather.com', '天气预报服务')
]

/** API 无数据时的精选工具 fallback */
export const DEFAULT_HOME_TOOLS = [
  site('DeepL', 'https://www.deepl.com', '高精度翻译工具'),
  site('SmallPDF', 'https://smallpdf.com', 'PDF 在线处理'),
  site('Canva', 'https://www.canva.com', '在线设计平台'),
  site('Figma', 'https://www.figma.com', 'UI/UX 设计工具'),
  site('GitHub', 'https://github.com', '代码托管平台', 'https://github.githubassets.com/favicons/favicon.png'),
  site('Excalidraw', 'https://excalidraw.com', '手绘风格绘图'),
  site('ProcessOn', 'https://www.processon.com', '在线流程图'),
  site('Notion', 'https://www.notion.so', '笔记与协作'),
  site('Draw.io', 'https://app.diagrams.net', '免费图表工具'),
  site('Overleaf', 'https://www.overleaf.com', '在线 LaTeX 编辑')
]

/** API 无数据时的课程 fallback */
export const DEFAULT_HOME_COURSES = [
  site('慕课网', 'https://www.imooc.com', 'IT 技能学习'),
  site('B站课堂', 'https://www.bilibili.com/cheese', '视频课程学习', 'https://www.bilibili.com/favicon.ico'),
  site('Coursera', 'https://www.coursera.org', '在线大学课程'),
  site('网易云课堂', 'https://study.163.com', '职业技能培训'),
  site('腾讯课堂', 'https://ke.qq.com', '在线教育平台'),
  site('极客时间', 'https://time.geekbang.org', '技术学习社区'),
  site('实验楼', 'https://www.lanqiao.cn', '在线编程实验'),
  site('菜鸟教程', 'https://www.runoob.com', '编程语言教程'),
  site('MDN', 'https://developer.mozilla.org', 'Web 开发文档', 'https://developer.mozilla.org/favicon-48x48.png'),
  site('W3School', 'https://www.w3school.com.cn', 'Web 技术教程')
]

/** API 无数据时的项目 fallback（站内 + 外站参考） */
export const DEFAULT_HOME_PROJECTS = [
  { name: '项目列表', url: '/projects', icon: '', desc: '浏览全部实训项目' },
  { name: '提交项目', url: '/projects/submit', icon: '', desc: '上传新项目资源' },
  site('GitHub Trending', 'https://github.com/trending', '热门开源项目', 'https://github.githubassets.com/favicons/favicon.png'),
  site('Gitee', 'https://gitee.com/explore', '国内开源探索', 'https://gitee.com/favicon.ico')
]

export const HOME_SEARCH_ENGINES = [
  { name: '本站', value: 'local' },
  { name: '百度', value: 'https://www.baidu.com/s?wd=' },
  { name: '搜狗', value: 'https://www.sogou.com/web?query=' },
  { name: 'Google', value: 'https://www.google.com/search?q=' },
  { name: 'Bing', value: 'https://cn.bing.com/search?q=' },
  { name: '知乎', value: 'https://www.zhihu.com/search?q=' }
]
