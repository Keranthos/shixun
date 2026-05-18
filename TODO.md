# TODO 待办事项

## 功能需求

### 使用LLM对链接对应网站进行分析并自动填写
- **描述**：在工具投稿界面中，当用户填写了正确的链接后，点击"一键填写"按钮，调用LLM对链接对应的网站进行分析，并自动填写各项内容（工具名称、简介、详细描述等）
- **当前状态**：投稿须知中已提及此功能，但尚未实现
- **需要实现**：
  1. **前端层面**：
     - 实现"一键填写"按钮的点击事件处理
     - 调用后端API，传递工具链接
     - 接收LLM分析结果并自动填充表单字段
     - 显示分析进度和结果
  
  2. **后端层面**：
     - 创建API接口接收工具链接
     - 调用LLM服务（如OpenAI API、Claude API等）对网站内容进行分析
     - 解析网站内容，提取工具名称、描述、分类等信息
     - 返回结构化数据供前端使用
  
  3. **LLM集成**：
     - 选择合适的LLM服务提供商
     - 设计提示词（prompt）以准确提取工具信息
     - 处理LLM返回结果，转换为前端需要的格式
     - 错误处理和重试机制

- **优先级**：中
- **预估复杂度**：高（需要LLM API集成、网站内容解析、错误处理等）

### 工具支持多分类
- **描述**：允许一个工具属于多个分类（例如：ChatGPT 可以同时属于"软件开发"和"个人提升"）
- **当前状态**：数据库设计中，`tools` 表的 `category` 字段只能存储单个分类。目前同名工具属于不同分类时会被视为不同的工具，导致数据重复和详情页不统一。
- **需要实现**：
  1. **数据库层面**：
     - 创建 `tool_categories` 表（类似 `course_categories` 表），实现工具与分类的多对多关系
     - 表结构：
       ```sql
       CREATE TABLE tool_categories (
         id INT AUTO_INCREMENT PRIMARY KEY,
         tool_id INT NOT NULL COMMENT '工具ID',
         category VARCHAR(100) NOT NULL COMMENT '分类名称',
         INDEX idx_tool_id (tool_id),
         INDEX idx_category (category),
         FOREIGN KEY (tool_id) REFERENCES tools(resource_id) ON DELETE CASCADE,
         UNIQUE KEY uk_tool_category (tool_id, category)
       )
       ```
     - 迁移现有数据：将 `tools.category` 迁移到 `tool_categories` 表
     - 保留 `tools.category` 字段作为默认/主分类（或移除，完全使用关联表）
  
  2. **后端层面**：
     - 修改 `ToolRepository.GetTools` 方法，使用 `tool_categories` 表进行多分类查询
     - 修改 `ToolRepository.GetByID` 方法，返回工具的所有分类（数组）
     - 修改 `ToolService.Create` 方法，支持提交时选择多个分类
     - 修改 `ToolService.Update` 方法，支持更新工具的分类
  
  3. **前端层面**：
     - 修改工具列表显示逻辑，确保同一工具可以在多个分类中显示（基于 `tool_categories` 表）
     - 修改工具详情页，显示工具的所有分类
     - 修改工具提交表单，支持选择多个分类（多选下拉框或标签选择器）
     - 修改工具编辑功能，支持修改分类
  
  4. **API层面**：
     - 确保 `GET /tools/profile` 接口支持按多个分类过滤
     - 确保 `GET /tools/:resourceId` 接口返回所有分类
     - 确保 `POST /tools/submit` 接口支持接收多个分类

- **优先级**：中
- **预估复杂度**：中等（需要数据库迁移、后端逻辑修改、前端UI调整）
- **参考实现**：可以参考 `course_categories` 表的实现方式

## 已完成

### 合并重复工具数据
- **完成时间**：2024年（已执行 `merge_duplicate_tools.py` 脚本）
- **结果**：
  - ChatGPT: 保留 ID=121（软件开发，浏览量=99941，点赞=598，评论=2），删除 ID=113（个人提升），合并后浏览量=99941，点赞数=1110
  - Figma: 保留 ID=114（项目协作，浏览量=87654），删除 ID=110（软件开发），合并后浏览量=87654，点赞数=765
  - GitHub Copilot: 保留 ID=107（软件开发，点赞=3927），删除 ID=122（个人提升），合并后浏览量=76545，点赞数=4359
  - 已合并数据：浏览量（取最大值）、点赞数（求和）
  - 已迁移数据：评论、收藏、点赞记录的 resource_id 已更新到保留的记录
  - 已删除关联数据：tool_tags、tool_images、tool_contributors 的重复记录
  - 验证结果：数据库中不再有重复工具名称，工具类别分布正常（软件开发: 13, 论文阅读: 12, 个人提升: 6, 项目协作: 6）

