# 🚀 GitHub Pages 部署指南

## 快速部署步骤

### 1. 在 GitHub 上创建仓库

1. 访问 [GitHub](https://github.com/new)
2. 仓库名称：`Dimenticato`
3. 设置为 **Public**（公开）
4. **不要** 勾选 "Add a README file"
5. 点击 "Create repository"

### 2. 推送代码到 GitHub

在项目目录执行以下命令：

```bash
# 添加远程仓库（用你的用户名替换 Kendrick-Stein）
git remote add origin https://github.com/Kendrick-Stein/Dimenticato.git

# 推送代码
git push -u origin main
```

### 3. 启用 GitHub Pages

1. 进入仓库页面
2. 点击 **Settings** (设置)
3. 在左侧菜单找到 **Pages**
4. 在 "Source" 下：
   - Branch: 选择 `main`
   - Folder: 选择 `/ (root)`
5. 点击 **Save**

### 4. 等待部署完成

- GitHub 会自动构建和部署（通常 1-2 分钟）
- 刷新页面后会看到：`Your site is live at https://kendrick-stein.github.io/Dimenticato/`

### 5. 访问你的应用

部署完成后，访问：
```
https://kendrick-stein.github.io/Dimenticato/
```

---

## 📱 移动端访问

部署后，你可以在任何设备上访问：

- ✅ iPhone/iPad Safari
- ✅ Android Chrome
- ✅ 任何现代浏览器

### 添加到主屏幕（像 App 一样使用）

**iOS (iPhone/iPad):**
1. 在 Safari 中打开网站
2. 点击 "分享" 按钮
3. 选择 "添加到主屏幕"
4. 命名后点击 "添加"

**Android:**
1. 在 Chrome 中打开网站
2. 点击菜单 (⋮)
3. 选择 "添加到主屏幕"

---

## 💾 关于用户数据

### 数据存储方式

- 使用 **LocalStorage**（浏览器本地存储）
- 每个用户的学习进度保存在自己的设备上
- 不同用户访问同一网站，数据完全独立

### 数据隔离

✅ **多用户场景：**
- 小明在他的手机访问 → 进度保存在小明的手机
- 小红在她的电脑访问 → 进度保存在小红的电脑
- 互不干扰，完全独立

✅ **隐私保护：**
- 数据不上传到服务器
- 完全本地存储
- 无需注册账号

⚠️ **注意事项：**
- 清除浏览器数据会丢失进度
- 更换设备后进度不会同步
- 同一设备的不同浏览器数据不共享

---

## 🔄 更新部署

当你修改代码后，重新部署：

```bash
# 1. 提交更改
git add .
git commit -m "描述你的更改"

# 2. 推送到 GitHub
git push

# 3. GitHub Pages 会自动重新部署
```

---

## 🛠️ 故障排除

### 网站无法访问

1. 检查 GitHub Pages 设置是否正确
2. 确认分支选择的是 `main`
3. 等待几分钟让部署完成

### 样式/功能异常

1. 清除浏览器缓存
2. 强制刷新页面 (Ctrl+Shift+R 或 Cmd+Shift+R)

### 进度丢失

- LocalStorage 数据会在清除浏览器数据时丢失
- 建议定期使用"导出单词本"功能备份（如果需要该功能请告诉我）

---

## 📊 项目统计

- **总词汇量**: 28,787 个意大利语单词
- **难度级别**: 4 个（初级/中级/高级/全部）
- **学习模式**: 3 种（选择题/拼写/浏览）
- **自定义单词本**: 支持 JSON 和 TXT 格式

---

## 🎉 部署成功！

现在你可以：
- 在任何设备上访问应用
- 分享链接给朋友使用
- 完全离线学习（首次访问后）
- 每个用户独立保存学习进度

祝学习愉快！Buono studio! 🇮🇹
