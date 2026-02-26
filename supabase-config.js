/**
 * Supabase 配置文件
 * 用于社区词本功能
 */

// Supabase 项目配置
const SUPABASE_CONFIG = {
  url: 'https://weiwkjlqshdbfpzsxcga.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlaXdramxxc2hkYmZwenN4Y2dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwODI2NDYsImV4cCI6MjA4NzY1ODY0Nn0.qnuxQUKFKO3GkFXPtKz1V5Ftd5uHm-7hZ6HITbTV36I'
};

// 初始化 Supabase 客户端
let supabaseClient = null;

function initSupabase() {
  if (typeof supabase === 'undefined') {
    console.error('❌ Supabase SDK 未加载，请确保已引入 Supabase JS 库');
    return null;
  }
  
  if (!supabaseClient) {
    try {
      supabaseClient = supabase.createClient(
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
  'Beginner': { label: '初级', icon: '🌱' },
  'Intermediate': { label: '中级', icon: '🌿' },
  'Advanced': { label: '高级', icon: '🌳' }
};
