# Supabase Storage 上传问题解决方案

## 问题描述
上传文件时遇到错误：`signature verification failed`

## 原因分析
这个错误通常由以下原因导致：
1. Storage bucket 的 RLS（Row Level Security）策略配置不正确
2. 匿名用户没有上传权限
3. Supabase anon key 配置问题
4. Storage bucket 不存在或配置错误

---

## 解决步骤

### 第一步：检查 Supabase Project Settings

1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 选择您的项目：`weiwkjlqshdbfpzsxcga`
3. 进入 **Settings** → **API**
4. 确认以下信息：
   - **Project URL**: `https://weiwkjlqshdbfpzsxcga.supabase.co`
   - **anon public key**: 复制完整的 anon key（应该是一个很长的 JWT token）
   - 如果 `supabase-config.js` 中的 `anonKey` 不完整，请替换为完整的 key

### 第二步：执行 Storage 权限修复脚本

1. 在 Supabase Dashboard 中，进入 **SQL Editor**
2. 点击 **New Query**
3. 复制并粘贴 `supabase-storage-fix.sql` 文件的全部内容
4. 点击 **Run** 执行脚本

脚本执行后，应该看到：
- ✅ Bucket 创建/更新成功
- ✅ 旧的 policies 被删除
- ✅ 新的 policies 创建成功
- ✅ 查询结果显示 bucket 配置

### 第三步：验证 Storage Bucket 配置

在 Supabase Dashboard 中：

1. 进入 **Storage** → **wordbook-files**
2. 点击右上角的 **⚙️ Settings**
3. 确认配置：
   - **Public bucket**: ✅ 必须启用
   - **File size limit**: 5 MB
   - **Allowed MIME types**: `application/json, text/plain`

### 第四步：验证 Storage Policies

1. 进入 **Storage** → **Policies**
2. 确认 `storage.objects` 表有以下 3 个 policies：
   - ✅ `Enable insert for anonymous users` (INSERT)
   - ✅ `Enable read access for all users` (SELECT)
   - ✅ `Enable update for all users` (UPDATE)

3. 每个 policy 应该：
   - Target roles: `public`
   - Policy definition: `bucket_id = 'wordbook-files'`

### 第五步：测试上传

1. 清除浏览器缓存（重要！）
2. 刷新您的应用页面
3. 尝试上传一个测试文件
4. 打开浏览器开发者工具（F12）→ Console
5. 查看是否有新的错误信息

---

## 常见问题排查

### 问题 1：Anon Key 不完整

**症状**: Token 看起来很短或不是标准的 JWT 格式

**解决方案**:
1. 进入 Supabase Dashboard → Settings → API
2. 复制完整的 `anon public` key（以 `eyJ` 开头，通常很长）
3. 更新 `supabase-config.js` 中的 `anonKey`

### 问题 2：Bucket 不存在

**症状**: 错误信息包含 "Bucket not found"

**解决方案**:
```sql
-- 在 SQL Editor 中执行
INSERT INTO storage.buckets (id, name, public)
VALUES ('wordbook-files', 'wordbook-files', true)
ON CONFLICT (id) DO UPDATE SET public = true;
```

### 问题 3：CORS 错误

**症状**: 浏览器控制台显示 CORS 相关错误

**解决方案**:
1. 进入 Supabase Dashboard → Settings → API
2. 在 **CORS Allowed Origins** 中添加：
   - `https://kendrick-stein.github.io`
   - `http://localhost:*` (用于本地测试)

### 问题 4：RLS 策略冲突

**症状**: 错误信息包含 "policy" 或 "permission denied"

**解决方案**:
```sql
-- 删除所有现有的 storage.objects policies
DROP POLICY IF EXISTS "Allow anonymous insert" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous upload" ON storage.objects;

-- 然后重新运行 supabase-storage-fix.sql
```

---

## 验证配置是否正确

### SQL 查询验证

在 SQL Editor 中执行以下查询：

```sql
-- 1. 检查 bucket 配置
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'wordbook-files';

-- 预期结果：
-- id: wordbook-files
-- name: wordbook-files
-- public: true
-- file_size_limit: 5242880
-- allowed_mime_types: {application/json,text/plain}

-- 2. 检查 storage policies
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage';

-- 预期结果应包含 3 个 policies：
-- Enable insert for anonymous users | INSERT | {public}
-- Enable read access for all users | SELECT | {public}
-- Enable update for all users | UPDATE | {public}
```

### 浏览器测试验证

打开浏览器控制台并执行：

```javascript
// 测试 Supabase 连接
const client = getSupabaseClient();
console.log('Supabase client:', client);

// 测试上传（需要先选择文件）
// 在上传表单中打开开发者工具，观察网络请求
```

---

## 最终检查清单

在尝试上传之前，确认：

- [ ] ✅ Supabase anon key 是完整的（很长的 JWT token）
- [ ] ✅ `wordbook-files` bucket 存在且是 public
- [ ] ✅ Storage policies 已正确创建（3 个 policies）
- [ ] ✅ 浏览器缓存已清除
- [ ] ✅ 开发者工具中没有 CORS 错误
- [ ] ✅ SQL 验证查询返回正确结果

---

## 如果问题仍然存在

1. **查看完整错误信息**
   - 打开浏览器开发者工具（F12）
   - 切换到 Console 标签
   - 截图完整的错误堆栈

2. **检查网络请求**
   - 切换到 Network 标签
   - 尝试上传文件
   - 找到失败的请求（红色）
   - 查看 Headers、Payload 和 Response

3. **验证 Supabase 项目状态**
   - 确认项目没有暂停
   - 确认没有超出免费额度限制

4. **联系支持**
   - 提供错误截图
   - 提供网络请求详情
   - 提供 SQL 查询结果

---

## 成功上传的标志

当配置正确时，上传应该：
1. ✅ 文件成功上传到 Storage
2. ✅ 数据库中创建新记录
3. ✅ 浏览器显示成功提示
4. ✅ 社区浏览页面显示新上传的词本

---

**更新时间**: 2026-02-26
**相关文件**: 
- `supabase-storage-fix.sql` - Storage 权限修复脚本
- `supabase-config.js` - Supabase 配置文件
- `community-wordbooks.js` - 社区功能实现
