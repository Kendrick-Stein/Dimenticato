/**
 * Supabase 配置文件
 * 用于社区词本功能
 *
 * 安全说明：anonKey 是 Supabase 的 anon 角色公钥，按设计就是要下发到浏览器的，
 * 因此提交进仓库本身不构成密钥泄露。但这也意味着社区词本的全部安全性都依赖
 * Supabase 侧的 Row Level Security 策略（见 supabase-setup.sql）——策略必须
 * 禁止匿名 UPDATE/DELETE，并限制 INSERT 的字段长度与 file_url 来源。
 */

// Supabase 项目配置
const SUPABASE_CONFIG = {
  url: 'https://weiwkjlqshdbfpzsxcga.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlaXdramxxc2hkYmZwenN4Y2dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwODI2NDYsImV4cCI6MjA4NzY1ODY0Nn0.qnuxQUKFKO3GkFXPtKz1V5Ftd5uHm-7hZ6HITbTV36I'
};

// 初始化 Supabase 客户端
let supabaseClient = null;

// Supabase SDK 是否可用（CDN 可能被网络环境拦截）
function isSupabaseAvailable() {
  return typeof window !== 'undefined' && typeof window.supabase !== 'undefined';
}

function initSupabase() {
  if (!isSupabaseAvailable()) {
    console.error('❌ Supabase SDK 未加载，请确保已引入 Supabase JS 库');
    return null;
  }

  if (!supabaseClient) {
    try {
      supabaseClient = window.supabase.createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.anonKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
          },
          global: {
            headers: {
              'X-Client-Info': 'dimenticato-community'
            }
          }
        }
      );
      console.log('✅ Supabase 客户端初始化成功');
    } catch (error) {
      console.error('❌ Supabase 客户端初始化失败:', error);
      return null;
    }
  }
  
  return supabaseClient;
}

// 获取 Supabase 客户端实例
function getSupabaseClient() {
  if (!supabaseClient) {
    return initSupabase();
  }
  return supabaseClient;
}

// Storage 配置
const STORAGE_CONFIG = {
  bucketName: 'wordbook-files',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['application/json', 'text/plain', '.json', '.txt']
};

// 预设标签列表
const PRESET_TAGS = [
  '旅游',
  '商务',
  '日常',
  '美食',
  '文化',
  '学术',
  '医疗',
  '运动',
  '艺术',
  '科技'
];

// 难度级别映射
const DIFFICULTY_LEVELS = {
  'Beginner': { label: '初级', icon: 'icon-seed' },
  'Intermediate': { label: '中级', icon: 'icon-leaf' },
  'Advanced': { label: '高级', icon: 'icon-tree' }
};

// 社区词本语言映射，从 lib/languages.js 派生
// 社区词本语言映射的唯一入口：任意写法 → 语言描述
//   communityLanguage('it' | 'italian' | 'Italian' | null) → { key, code, db, label, matches }
// key = 应用内部语言标识；code = 'it' 等语言代码；db = 上传时写入 language 列的值；
// label = 界面中文名；matches = 列表查询时视为该语言的所有库内写法。
// 写入值保持英文名（'Italian'），因为 supabase-setup.sql 有
// CHECK (language IN ('Italian','German','English','French'))；改写 code 前要先迁移库约束。
// 历史行 language 为空 / 无法识别时一律视为默认语言（意大利语）。
function communityLanguage(value) {
  const L = window.Languages;
  const raw = (value == null ? '' : String(value)).trim().toLowerCase();
  const p = (raw && L.list.find((x) => x.code === raw || x.key === raw || x.en.toLowerCase() === raw))
    || L.get(L.DEFAULT);
  const matches = [p.en, p.key, p.code];
  return { key: p.key, code: p.code, db: p.en, label: p.cn, matches, includesNull: p.code === L.DEFAULT };
}

// 上传对话框 / 筛选下拉框的选项（由 communityLanguage 派生）
const COMMUNITY_LANGUAGES = window.Languages.list.map((p) => communityLanguage(p.code));

// 上传字段长度上限（与 supabase-setup.sql 中的 CHECK 约束保持一致）
const COMMUNITY_FIELD_LIMITS = {
  name: 80,
  authorName: 40,
  description: 500
};

// 暴露到 window：其它脚本必须在“调用时”通过 window 解析这些配置，
// 顶层 const 只存在于全局词法作用域，先加载的脚本读不到。
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.STORAGE_CONFIG = STORAGE_CONFIG;
window.PRESET_TAGS = PRESET_TAGS;
window.DIFFICULTY_LEVELS = DIFFICULTY_LEVELS;
window.COMMUNITY_LANGUAGES = COMMUNITY_LANGUAGES;
window.communityLanguage = communityLanguage;
window.COMMUNITY_FIELD_LIMITS = COMMUNITY_FIELD_LIMITS;
window.isSupabaseAvailable = isSupabaseAvailable;
window.initSupabase = initSupabase;
window.getSupabaseClient = getSupabaseClient;
