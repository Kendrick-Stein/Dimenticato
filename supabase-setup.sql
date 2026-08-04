-- =====================================================
-- Dimenticato 社区词本 - Supabase 数据库设置脚本
-- =====================================================
--
-- 安全模型（必读）
-- -----------------------------------------------------
-- 前端携带的是 anon 公钥（supabase-config.js），按设计会下发到每个访客的浏览器，
-- 因此这张表的全部安全性都由下面的 RLS 策略决定：
--   * SELECT：公开（社区库本来就要给所有人看）
--   * INSERT：匿名可写，但受字段长度、语言白名单、file_url 来源白名单约束
--   * UPDATE / DELETE：匿名一律禁止。下载计数改由 SECURITY DEFINER 函数
--                      increment_download_count() 代劳，只能 +1，改不了别的列。
-- 早期版本曾经开放 `FOR UPDATE USING (true) WITH CHECK (true)`，
-- 任何访客都可以改写别人词本的 name / description / file_url——
-- 那等于把存储型 XSS 和恶意内容分发的开关交给所有人。已在本脚本中移除。
-- 已经上线的项目请执行文件末尾的“迁移”小节。
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT community_wordbooks_name_len CHECK (char_length(name) BETWEEN 1 AND 80),
  CONSTRAINT community_wordbooks_author_len CHECK (char_length(author_name) BETWEEN 1 AND 40),
  CONSTRAINT community_wordbooks_desc_len CHECK (description IS NULL OR char_length(description) <= 500),
  CONSTRAINT community_wordbooks_language CHECK (language IN ('Italian', 'German', 'English', 'French')),
  CONSTRAINT community_wordbooks_counts CHECK (word_count >= 0 AND download_count >= 0),
  CONSTRAINT community_wordbooks_tags_len CHECK (array_length(tags, 1) IS NULL OR array_length(tags, 1) <= 10)
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
DROP POLICY IF EXISTS "Allow public read access" ON community_wordbooks;
CREATE POLICY "Allow public read access"
ON community_wordbooks
FOR SELECT
USING (true);

-- 允许匿名插入（INSERT），但必须满足：
--   * 名称/作者/描述长度受限（阻断超长 payload）
--   * 语言在白名单内
--   * file_url 必须指向本项目的公开 Storage bucket
--     （否则任何人都能把词本指向外部服务器上的恶意内容）
DROP POLICY IF EXISTS "Allow anonymous insert" ON community_wordbooks;
CREATE POLICY "Allow anonymous insert"
ON community_wordbooks
FOR INSERT
WITH CHECK (
  char_length(name) BETWEEN 1 AND 80
  AND char_length(author_name) BETWEEN 1 AND 40
  AND (description IS NULL OR char_length(description) <= 500)
  AND language IN ('Italian', 'German', 'English', 'French')
  AND download_count = 0
  AND word_count BETWEEN 0 AND 100000
  AND file_url LIKE 'https://weiwkjlqshdbfpzsxcga.supabase.co/storage/v1/object/public/wordbook-files/%'
);

-- 匿名 UPDATE / DELETE：不创建任何策略 = 一律拒绝。
-- 下载计数通过下面的 SECURITY DEFINER 函数递增，它只会给 download_count +1。
DROP POLICY IF EXISTS "Allow download count update" ON community_wordbooks;

CREATE OR REPLACE FUNCTION increment_download_count(wordbook_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE community_wordbooks
  SET download_count = download_count + 1
  WHERE id = wordbook_id;
$$;

REVOKE ALL ON FUNCTION increment_download_count(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_download_count(UUID) TO anon, authenticated;

-- 5. 创建自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_community_wordbooks_updated_at ON community_wordbooks;
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
--     USING (bucket_id = 'wordbook-files')
--
-- Policy 2: 允许匿名上传（仅 INSERT，不要给 UPDATE / DELETE，
--            否则任何人都能覆盖已有词本文件的内容）
--   Name: Anonymous upload
--   Policy definition:
--     FOR INSERT
--     WITH CHECK (bucket_id = 'wordbook-files')
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
-- 迁移：已经上线的项目请执行这一段
-- =====================================================
--
-- -- 1) 关掉匿名改写（最关键的一步）
-- DROP POLICY IF EXISTS "Allow download count update" ON community_wordbooks;
--
-- -- 2) 历史行补上语言（早期客户端硬编码写入 'Italian'，也可能为空）
-- UPDATE community_wordbooks SET language = 'Italian'
--  WHERE language IS NULL OR btrim(language) = '';
-- UPDATE community_wordbooks SET language = initcap(language)
--  WHERE language <> initcap(language);
--
-- -- 3) 补约束前先确认没有超长/越界数据
-- SELECT id, name FROM community_wordbooks
--  WHERE char_length(name) > 80
--     OR char_length(author_name) > 40
--     OR char_length(coalesce(description, '')) > 500
--     OR language NOT IN ('Italian', 'German', 'English', 'French');
--
-- -- 4) 再执行本文件的第 1 节（CONSTRAINT 部分）、第 4 节（策略 + RPC）
--
-- -- 5) 抽查是否有历史注入内容（旧策略允许任何人改写任意行）
-- SELECT id, name, author_name, file_url FROM community_wordbooks
--  WHERE name ~ '[<>]' OR coalesce(description, '') ~ '[<>]'
--     OR file_url NOT LIKE 'https://weiwkjlqshdbfpzsxcga.supabase.co/%';
--
-- =====================================================

-- =====================================================
-- 查询示例
-- =====================================================

-- 获取所有词本（按下载量排序）
-- SELECT * FROM community_wordbooks ORDER BY download_count DESC;

-- 按难度筛选
-- SELECT * FROM community_wordbooks WHERE difficulty = 'Beginner';

-- 按语言筛选
-- SELECT * FROM community_wordbooks WHERE language = 'German';

-- 按标签筛选
-- SELECT * FROM community_wordbooks WHERE 'travel' = ANY(tags);

-- 搜索词本名称
-- SELECT * FROM community_wordbooks WHERE name ILIKE '%旅游%';

-- 增加下载计数（客户端只能通过这个 RPC，不能直接 UPDATE）
-- SELECT increment_download_count('xxx-xxx-xxx');
