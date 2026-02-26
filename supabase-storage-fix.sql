-- ==========================================
-- Supabase Storage 权限修复脚本
-- 解决 "signature verification failed" 错误
-- ==========================================

-- 1. 确保 bucket 存在并配置正确
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wordbook-files',
  'wordbook-files',
  true,
  5242880,  -- 5MB
  ARRAY['application/json', 'text/plain']
)
ON CONFLICT (id) 
DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['application/json', 'text/plain'];

-- 2. 删除现有的可能冲突的 policies
DROP POLICY IF EXISTS "Allow anonymous insert" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous upload wordbooks" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read wordbooks" ON storage.objects;

-- 3. 创建新的 Storage policies

-- 允许所有人（包括匿名用户）上传文件到 wordbook-files bucket
CREATE POLICY "Enable insert for anonymous users"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'wordbook-files');

-- 允许所有人读取 wordbook-files bucket 中的文件
CREATE POLICY "Enable read access for all users"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'wordbook-files');

-- 允许所有人更新文件（用于增加下载计数等操作）
CREATE POLICY "Enable update for all users"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'wordbook-files')
WITH CHECK (bucket_id = 'wordbook-files');

-- 4. 验证配置
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'wordbook-files';

-- 5. 查看所有 storage policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
ORDER BY policyname;
