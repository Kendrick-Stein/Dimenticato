-- =====================================================
-- Dimenticato 社区词本 - Supabase 数据库设置脚本
-- =====================================================

-- 1. 创建社区词本表
CREATE TABLE IF NOT EXISTS community_wordbooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  author_name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'Italian',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  tags TEXT[] DEFAULT '{}',
  word_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_difficulty ON community_wordbooks(difficulty);
CREATE INDEX IF NOT EXISTS idx_language ON community_wordbooks(language);
CREATE INDEX IF NOT EXISTS idx_created_at ON community_wordbooks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_download_count ON community_wordbooks(download_count DESC);
CREATE INDEX IF NOT EXISTS idx_tags ON community_wordbooks USING GIN(tags);

-- 3. 启用 Row Level Security (RLS)
ALTER TABLE community_wordbooks ENABLE ROW LEVEL SECURITY;

-- 4. 创建安全策略
-- 允许所有人读取（SELECT）
CREATE POLICY "Allow public read access"
ON community_wordbooks
FOR SELECT
USING (true);

-- 允许匿名插入（INSERT）
CREATE POLICY "Allow anonymous insert"
ON community_wordbooks
FOR INSERT
WITH CHECK (true);

-- 允许增加下载计数（UPDATE download_count）
CREATE POLICY "Allow download count update"
ON community_wordbooks
FOR UPDATE
USING (true)
WITH CHECK (true);

-- 5. 创建自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_community_wordbooks_updated_at
BEFORE UPDATE ON community_wordbooks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Storage Bucket 配置说明
-- =====================================================
-- 
-- 在 Supabase Dashboard 中手动创建 Storage Bucket：
-- 
-- 1. 进入 Storage 页面
-- 2. 点击 "New bucket"
-- 3. Bucket 名称：wordbook-files
-- 4. 设置为 Public bucket（勾选 "Public bucket"）
-- 5. 文件大小限制：5MB
-- 6. 允许的文件类型：application/json, text/plain
-- 
-- 然后在 Bucket 的 Policies 页面添加：
-- 
-- Policy 1: 允许公开读取
--   Name: Public read access
--   Policy definition: 
--     FOR SELECT
--     USING (true)
-- 
-- Policy 2: 允许匿名上传
--   Name: Anonymous upload
--   Policy definition:
--     FOR INSERT
--     WITH CHECK (true)
-- 
-- =====================================================

-- 6. 插入一些测试数据（可选）
INSERT INTO community_wordbooks (
  name,
  description,
  author_name,
  language,
  difficulty,
  tags,
  word_count,
  download_count,
  file_url
) VALUES 
(
  '意大利旅游必备200词',
  '涵盖酒店预订、餐厅点餐、问路、购物等常见旅游场景的实用词汇',
  'Marco',
  'Italian',
  'Beginner',
  ARRAY['旅游', '日常'],
  200,
  156,
  'sample/travel-200.json'
),
(
  '商务意大利语核心词汇',
  '适合商务人士的专业词汇，包括会议、谈判、合同等场景',
  'Sofia',
  'Italian',
  'Advanced',
  ARRAY['商务', '专业'],
  350,
  89,
  'sample/business-350.json'
),
(
  '意大利美食词汇大全',
  '从食材到烹饪方法，全面覆盖意大利美食相关词汇',
  'Giuseppe',
  'Italian',
  'Intermediate',
  ARRAY['美食', '文化'],
  180,
  234,
  'sample/food-180.json'
);

-- =====================================================
-- 查询示例
-- =====================================================

-- 获取所有词本（按下载量排序）
-- SELECT * FROM community_wordbooks ORDER BY download_count DESC;

-- 按难度筛选
-- SELECT * FROM community_wordbooks WHERE difficulty = 'Beginner';

-- 按标签筛选
-- SELECT * FROM community_wordbooks WHERE 'travel' = ANY(tags);

-- 搜索词本名称
-- SELECT * FROM community_wordbooks WHERE name ILIKE '%旅游%';

-- 增加下载计数
-- UPDATE community_wordbooks SET download_count = download_count + 1 WHERE id = 'xxx-xxx-xxx';
