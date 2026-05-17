# Gitea Desktop vs ENGR101 作业提交流程 — 差距分析

本文档对比 ENGR101 (VG101-26su) 课程的作业提交流程要求与 Gitea Desktop 当前功能，识别需要补齐的差距。

---

## 总览

| 类别 | 需求项 | 当前状态 | 优先级 |
|------|--------|---------|--------|
| SSH 密钥管理 | 生成/添加 SSH 密钥 | 不支持 | 高 |
| SSH 克隆（自定义端口） | `ssh://git@host:2222/...` 格式 | 未验证 | 高 |
| Conventional Commits | `type(scope): message [options]` 格式 | 不支持 | 高 |
| 空提交 | `--allow-empty` | 不支持 | 中 |
| Issues 查看 | 查看 JOJ3 评分反馈 | 不支持 | 高 |
| Releases 创建 | 创建 Tag + Release 提交最终版本 | 不支持 | 高 |
| Git 用户配置 | 仓库级 `user.name` / `user.email` | 不支持 | 中 |
| Pull 提醒 | 修改前提醒先 pull | 不支持 | 低 |
| 目录级暂存 | `git add <homework_dir>` | 部分支持 | 低 |
| 作业目录结构感知 | 识别 p1/p2/hw1-hw8 目录 | 不支持 | 低 |

---

## 详细差距分析

### 1. SSH 密钥管理（不支持）

**课程要求：**

- 使用 `ssh-keygen -t ed25519` 生成密钥
- 将公钥 (`id_ed25519.pub`) 添加到 Gitea 服务器

**当前状态：** Gitea Desktop 没有 SSH 密钥生成或管理功能。学生必须在终端中手动完成此步骤。

**建议：**

- 增加 SSH 密钥生成向导（调用系统 `ssh-keygen`）
- 增加公钥一键复制功能
- 通过 Gitea API (`POST /api/v1/user/keys`) 直接将公钥添加到 Gitea 账户

---

### 2. SSH 克隆与自定义端口（未验证）

**课程要求：**

```
git clone ssh://git@focs.gc.sjtu.edu.cn:2222/engr101s3/<repo>.git
```

使用非标准 SSH 端口 (2222) 克隆仓库。

**当前状态：** 克隆功能存在，但当前 UI 只有一个 URL 输入框，尚不确定 `simple-git` 是否能正确处理带端口的 SSH URL。

**建议：**

- 测试并确保带自定义端口的 SSH URL 克隆正常工作
- 在 Clone 界面增加 SSH 端口配置选项，或增加 URL 格式提示
- 确保后续 push/pull 操作也能通过 SSH 正常工作

---

### 3. Conventional Commits 格式（不支持 — 最关键差距）

**课程要求：** 所有提交必须遵循严格的 Conventional Commits 格式：

```
type(scope): message [option_list]
```

- **type** 必须是以下之一：`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chores`, `revert`
- **scope** 必须是作业名称：`p1`, `p2`, `hw1`-`hw8`
- **option_list** 可以包含 `build` 和/或 `joj`（触发编译和测试）

**当前状态：** ChangesPage 只有一个纯文本输入框用于提交消息，没有任何格式引导或校验。

**建议：**

- 替换纯文本提交框为结构化表单：
  - **Type 下拉选择器**：列出所有合法 type（feat, fix, docs 等）
  - **Scope 下拉选择器**：列出所有合法 scope（p1, p2, hw1-hw8）
  - **Message 文本框**：用于描述本次更改
  - **Options 复选框**：`[build]` 和 `[joj]` 选项
- 自动拼接生成符合格式的完整 commit message
- 在提交前进行格式校验，不合规则阻止提交
- 展示预览：`feat(hw1): add main function [build joj]`

---

### 4. 空提交 `--allow-empty`（不支持）

**课程要求：** 支持创建空提交以触发 JOJ3 重新测试：

```
git commit --allow-empty -m "type(scope): message [option_list]"
```

**当前状态：** 当没有暂存文件时，提交按钮不可用或提交会失败。

**建议：**

- 在提交区域增加"允许空提交"复选框
- 调用 `simple-git` 的 `commit` 方法时传入 `--allow-empty` 参数

---

### 5. Gitea Issues 查看（不支持 — 关键差距）

**课程要求：** 提交后需要在 Gitea 的 Issues 页面查看 JOJ3 自动评测结果：

```
JOJ3 Result for <homework> by @<jAccount> - Score: <score> / 100
JOJ3 Result for <homework>_h by @<jAccount> - Score: <hidden_score> / 100
```

学生需要定期查看 Issues 来了解自己的得分和错误详情。

**当前状态：** Gitea Desktop 完全没有 Issues 相关功能。

**建议：**

- 新增 Issues 页面，通过 Gitea API (`GET /api/v1/repos/{owner}/{repo}/issues`) 获取 issue 列表
- 支持查看 issue 详情和评论内容
- 高亮显示 JOJ3 评分信息（解析 issue 标题中的分数）
- 可选：增加 JOJ3 专用视图，汇总展示各作业的当前得分

---

### 6. Gitea Releases 创建（不支持 — 关键差距）

**课程要求：** 学生需要创建 Release 来提交作业最终版本：

- 设置 **Tag Name** = 作业 scope（如 `hw1`）
- 设置 **Release Title** = 与 Tag Name 一致
- 点击 Publish Release

**注意：** 每个作业只能 release 一次，不可删除。这是非常重要的操作。

**当前状态：** Gitea Desktop 完全没有 Releases 相关功能。

**建议：**

- 新增 Releases 页面，通过 Gitea API 实现：
  - `GET /api/v1/repos/{owner}/{repo}/releases` — 列出已有的 releases
  - `POST /api/v1/repos/{owner}/{repo}/releases` — 创建新 release
- 创建 Release 时自动填充 Tag Name 和 Title（基于最近一次 commit 的 scope）
- **增加二次确认对话框**：由于每个作业只能 release 一次，必须明确警告用户此操作不可撤销
- 显示已 release 的作业列表，防止重复 release

---

### 7. 仓库级 Git 用户配置（不支持）

**课程要求：**

```bash
git config user.name <name>
git config user.email <jAccount>@sjtu.edu.cn
```

**当前状态：** 没有设置仓库级 Git 配置的界面。

**建议：**

- 在 Settings 页面增加 Git 用户配置区域
- 克隆仓库后自动提示配置 user.name 和 user.email
- 通过 `simple-git` 的 `addConfig` 方法实现

---

### 8. Pull 提醒机制（不支持）

**课程要求：** 文档强调在修改本地仓库前必须先执行 `git pull`。

**当前状态：** 有 Pull 按钮，但没有任何提醒或自动化流程。

**建议：**

- 打开仓库时自动执行 `git fetch` 检查远程更新
- 如果本地落后于远程，在顶部显示醒目提示："远程仓库有更新，建议先 Pull"
- 可选：在 commit 前检查是否有未拉取的远程更新

---

### 9. 目录级暂存（部分支持）

**课程要求：**

```bash
git add <name_of_homework>
```

按作业目录名批量暂存文件。

**当前状态：** 支持单个文件暂存和全部暂存 (`git add .`)，但不支持按目录批量暂存。

**建议：**

- 在文件列表中按目录分组显示变更文件
- 支持点击目录名一键暂存该目录下的所有文件

---

### 10. 作业目录结构感知（不支持）

**课程要求：** 仓库有固定的目录结构：

```
repo/
├── p1/       # 项目 1
├── p2/       # 项目 2
├── hw1/      # 作业 1
├── hw2/      # 作业 2
├── ...
└── hw8/      # 作业 8
```

**当前状态：** Gitea Desktop 将仓库视为通用 Git 仓库，没有作业目录感知。

**建议（低优先级）：**

- 可选：增加"课程模式"，自动识别作业目录并在 UI 中特殊展示
- 在 Conventional Commits 表单的 scope 选择器中，根据实际存在的目录动态生成选项

---

## 实施优先级建议

### Phase 1 — 核心提交流程（必须）

1. **Conventional Commits 结构化表单** — 没有这个，学生无法正确提交
2. **Issues 查看** — 没有这个，学生无法查看评分
3. **Releases 创建** — 没有这个，学生无法提交最终版本

### Phase 2 — 完善体验

4. **SSH 克隆自定义端口验证** — 确保基本克隆流程可用
2. **空提交支持** — 重新触发 JOJ3 测试的常用操作
3. **Git 用户配置** — 首次使用的必要步骤

### Phase 3 — 锦上添花

7. **SSH 密钥管理** — 减少对终端的依赖
2. **Pull 提醒** — 避免冲突
3. **目录级暂存** — 更贴合课程工作流
4. **作业目录结构感知** — 更智能的课程专用体验

---

## 总结

Gitea Desktop 已具备基础的 Git 操作能力（clone, stage, commit, push, pull, branch），但与 ENGR101 课程的作业提交流程存在 **三个关键差距**：

1. **Conventional Commits 格式支持** — 课程对 commit message 有严格格式要求，需要结构化输入表单
2. **Issues 查看** — JOJ3 评分反馈通过 Gitea Issues 分发，必须在应用内可见
3. **Releases 创建** — 最终版本提交通过 Gitea Releases 完成，必须在应用内可操作

补齐这三项后，学生可以完全通过 Gitea Desktop 完成整个作业提交流程，无需使用命令行。
