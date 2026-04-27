/**
 * Dimenticato — 共享工具函数
 * 在所有模块之前加载，提供 escapeHtml、renderIcon 等基础工具
 * 加载顺序：必须在 vocabulary.js 之前，在 index.html 中作为第一个脚本引入
 */
(function () {
  'use strict';

  const DimenticatoUtils = {
    /**
     * HTML 转义 — 防止 XSS 攻击
     * 用于所有插入 innerHTML 的用户数据
     */
    escapeHtml(value) {
      return (value == null ? '' : String(value))
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    /**
     * HTML 属性值转义
     */
    escapeAttribute(value) {
      return this.escapeHtml(value).replace(/`/g, '&#96;');
    },

    /**
     * 渲染 SVG 图标
     */
    renderIcon(name) {
      return '<svg class="icon"><use href="#' + this.escapeAttribute(name) + '"></use></svg>';
    }
  };

  // 暴露到全局，保持向后兼容
  window.DimenticatoUtils = DimenticatoUtils;
  window.escapeHtml = DimenticatoUtils.escapeHtml.bind(DimenticatoUtils);
  window.escapeAttribute = DimenticatoUtils.escapeAttribute.bind(DimenticatoUtils);
  window.renderIcon = DimenticatoUtils.renderIcon.bind(DimenticatoUtils);
})();