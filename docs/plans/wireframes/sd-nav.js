/**
 * sd-nav.js — Shared navigation component for SideDecked wireframes.
 * Single source of truth for nav HTML + CSS across all storefront wireframes.
 *
 * Usage:
 *   <div id="sd-nav-root"></div>
 *   <script src="sd-nav.js"></script>
 *   <script>SdNav.init({ variant: 'standard' });</script>
 */
(function () {
  'use strict';

  /* ===========================================
     SVG ICON CONSTANTS
     =========================================== */
  var SVG_ATTRS = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

  var ICONS = {
    search:    '<svg ' + SVG_ATTRS + '><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    moon:      '<svg ' + SVG_ATTRS + '><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
    bell:      '<svg ' + SVG_ATTRS + '><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
    heart:     '<svg ' + SVG_ATTRS + '><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
    cart:      '<svg ' + SVG_ATTRS + '><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    pencil:    '<svg ' + SVG_ATTRS + '><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',
    hamburger: '<svg ' + SVG_ATTRS + '><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
  };

  /* ===========================================
     NAV LINKS
     =========================================== */
  var NAV_LINKS = ['Browse Cards', 'Deck Builder', 'Marketplace', 'Sell', 'Community'];

  /* ===========================================
     EMBEDDED CSS
     =========================================== */
  var CSS = [
    '/* ===== sd-nav.js — injected nav styles ===== */',

    /* --- Desktop Glass Nav --- */
    '.glass-nav {',
    '  position: sticky;',
    '  top: 0;',
    '  z-index: 50;',
    '  background: rgba(24, 22, 42, 0.80);',
    '  backdrop-filter: blur(12px);',
    '  -webkit-backdrop-filter: blur(12px);',
    '  border-bottom: 1px solid rgba(44, 42, 74, 0.5);',
    '  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);',
    '  padding: 0 48px;',
    '}',
    '.glass-nav--workspace {',
    '  padding: 0 24px;',
    '  border-bottom-color: rgba(139, 92, 246, 0.08);',
    '  box-shadow: none;',
    '}',
    '.nav-inner {',
    '  display: flex;',
    '  align-items: center;',
    '  height: 64px;',
    '  max-width: 1344px;',
    '  margin: 0 auto;',
    '  gap: 24px;',
    '}',
    '.glass-nav--workspace .nav-inner {',
    '  height: 56px;',
    '  gap: 16px;',
    '  max-width: none;',
    '}',

    /* --- Logo --- */
    '.nav-logo {',
    '  font-family: var(--font-display);',
    '  font-weight: 800;',
    '  font-size: 24px;',
    '  letter-spacing: -0.02em;',
    '  color: #FFFFFF;',
    '  flex-shrink: 0;',
    '}',
    '.glass-nav--workspace .nav-logo {',
    '  font-size: 22px;',
    '}',
    '.logo-accent { color: #8B5CF6; }',

    /* --- Nav Links --- */
    '.nav-links {',
    '  display: flex;',
    '  gap: 8px;',
    '  margin-left: 16px;',
    '}',
    '.nav-links a {',
    '  font-family: var(--font-heading);',
    '  font-size: 14px;',
    '  font-weight: 500;',
    '  color: var(--text-secondary);',
    '  text-decoration: none;',
    '  padding: 8px 14px;',
    '  border-radius: 10px;',
    '  transition: all 0.15s;',
    '}',
    '.nav-links a:hover {',
    '  color: var(--text-primary);',
    '  background: rgba(139, 92, 246, 0.08);',
    '}',
    '.nav-links a.active {',
    '  color: var(--text-primary);',
    '}',

    /* --- Search Pill (compact) --- */
    '.nav-search-pill {',
    '  flex: 1;',
    '  max-width: 420px;',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 10px;',
    '  padding: 8px 16px;',
    '  background: var(--bg-surface-2);',
    '  border: 1px solid var(--border-default);',
    '  border-radius: 999px;',
    '  cursor: pointer;',
    '  transition: border-color 0.15s;',
    '}',
    '.nav-search-pill:hover {',
    '  border-color: var(--border-strong);',
    '}',
    '.nav-search-pill svg {',
    '  width: 16px;',
    '  height: 16px;',
    '  color: var(--text-tertiary);',
    '  flex-shrink: 0;',
    '}',
    '.nav-search-pill span {',
    '  font-size: 13px;',
    '  color: var(--text-tertiary);',
    '}',
    '.nav-search-pill .kbd {',
    '  font-family: var(--font-mono);',
    '  font-size: 11px;',
    '  color: var(--text-tertiary);',
    '  background: var(--bg-surface-3);',
    '  border: 1px solid var(--border-default);',
    '  padding: 2px 6px;',
    '  border-radius: 5px;',
    '  margin-left: auto;',
    '}',

    /* --- Expanded Search (search page) --- */
    '.nav-search-expanded {',
    '  flex: 1;',
    '  max-width: 520px;',
    '  position: relative;',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 8px;',
    '  background: var(--bg-surface-2);',
    '  border: 1.5px solid var(--border-strong);',
    '  border-radius: 10px;',
    '  padding: 8px 14px;',
    '}',
    '.nav-search-expanded svg {',
    '  width: 16px;',
    '  height: 16px;',
    '  color: var(--text-tertiary);',
    '  flex-shrink: 0;',
    '}',
    '.nav-search-expanded .nav-search-input {',
    '  display: flex;',
    '  align-items: center;',
    '  flex: 1;',
    '}',
    '.nav-search-expanded .nav-search-input span {',
    '  color: var(--text-primary);',
    '  font-size: 14px;',
    '}',
    '.nav-search-expanded .nav-search-input .cursor {',
    '  margin-left: auto;',
    '  color: var(--text-tertiary);',
    '  font-size: 14px;',
    '}',
    '.nav-search-expanded .kbd {',
    '  font-family: var(--font-mono);',
    '  font-size: 11px;',
    '  color: var(--text-tertiary);',
    '  background: var(--bg-surface-3);',
    '  border: 1px solid var(--border-default);',
    '  padding: 2px 6px;',
    '  border-radius: 5px;',
    '}',

    /* --- Nav Actions --- */
    '.nav-actions {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 6px;',
    '  flex-shrink: 0;',
    '}',
    '.nav-icon-btn {',
    '  width: 36px;',
    '  height: 36px;',
    '  border-radius: 10px;',
    '  border: 1px solid transparent;',
    '  background: transparent;',
    '  color: var(--text-secondary);',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  cursor: pointer;',
    '  transition: all 0.15s;',
    '  position: relative;',
    '}',
    '.nav-icon-btn:hover {',
    '  background: var(--bg-surface-2);',
    '  color: var(--text-primary);',
    '  border-color: var(--border-default);',
    '}',
    '.nav-icon-btn svg { width: 18px; height: 18px; }',

    /* --- Notification Dot --- */
    '.nav-notif-dot {',
    '  position: absolute;',
    '  top: 6px;',
    '  right: 6px;',
    '  width: 8px;',
    '  height: 8px;',
    '  border-radius: 999px;',
    '  background: var(--brand-secondary);',
    '  border: 2px solid rgba(24, 22, 42, 0.80);',
    '}',

    /* --- Cart Badge --- */
    '.nav-badge {',
    '  position: absolute;',
    '  top: 2px;',
    '  right: 2px;',
    '  width: 16px;',
    '  height: 16px;',
    '  border-radius: 999px;',
    '  background: var(--brand-primary);',
    '  font-family: var(--font-mono);',
    '  font-size: 9px;',
    '  font-weight: 700;',
    '  color: #fff;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  line-height: 1;',
    '}',

    /* --- Avatar --- */
    '.nav-avatar {',
    '  width: 32px;',
    '  height: 32px;',
    '  border-radius: 999px;',
    '  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));',
    '  margin-left: 4px;',
    '  flex-shrink: 0;',
    '  border: 2px solid var(--brand-primary);',
    '  box-shadow: 0 0 12px rgba(139, 92, 246, 0.4);',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  font-family: var(--font-heading);',
    '  font-size: 11px;',
    '  font-weight: 700;',
    '  color: #fff;',
    '}',
    '.nav-avatar--active {',
    '  border-color: var(--brand-primary);',
    '  box-shadow: 0 0 16px rgba(139, 92, 246, 0.5);',
    '}',

    /* --- Workspace: Deck Name --- */
    '.nav-deck-name {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 8px;',
    '  margin: 0 auto;',
    '  font-family: var(--font-heading);',
    '  font-weight: 600;',
    '  font-size: 15px;',
    '  color: var(--text-primary);',
    '}',
    '.nav-deck-name .pencil-icon {',
    '  width: 14px;',
    '  height: 14px;',
    '  color: var(--text-tertiary);',
    '}',

    /* --- Dev Annotations (inside nav) --- */
    '.sd-nav-annotation {',
    '  display: inline-flex;',
    '  align-items: center;',
    '  gap: 6px;',
    '  font-family: var(--font-mono);',
    '  font-size: 10px;',
    '  color: var(--brand-primary);',
    '  background: rgba(139, 92, 246, 0.08);',
    '  border: 1px dashed rgba(139, 92, 246, 0.3);',
    '  padding: 3px 8px;',
    '  border-radius: 6px;',
    '  letter-spacing: 0.02em;',
    '  white-space: nowrap;',
    '  pointer-events: none;',
    '  position: absolute;',
    '}',
    '.sd-nav-annotation--breakpoint {',
    '  color: var(--warning);',
    '  background: rgba(245, 158, 11, 0.08);',
    '  border-color: rgba(245, 158, 11, 0.3);',
    '}',

    /* ===== MOBILE NAV ===== */
    '.glass-nav--mobile {',
    '  position: sticky;',
    '  top: 0;',
    '  z-index: 50;',
    '  background: rgba(24, 22, 42, 0.80);',
    '  backdrop-filter: blur(12px);',
    '  -webkit-backdrop-filter: blur(12px);',
    '  border-bottom: 1px solid rgba(44, 42, 74, 0.5);',
    '  padding: 0 16px;',
    '  display: flex;',
    '  flex-direction: column;',
    '}',
    '.mobile-nav-top {',
    '  display: flex;',
    '  align-items: center;',
    '  height: 56px;',
    '  justify-content: space-between;',
    '}',
    '.mobile-nav-left {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 12px;',
    '}',
    '.mobile-nav-hamburger {',
    '  width: 32px;',
    '  height: 32px;',
    '  border-radius: 8px;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  color: var(--text-secondary);',
    '  background: transparent;',
    '  border: none;',
    '}',
    '.mobile-nav-hamburger svg { width: 18px; height: 18px; }',
    '.mobile-nav-logo {',
    '  font-family: var(--font-display);',
    '  font-weight: 800;',
    '  font-size: 20px;',
    '  color: #FFFFFF;',
    '}',
    '.mobile-nav-logo .logo-accent { color: #8B5CF6; }',
    '.mobile-nav-actions {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 4px;',
    '}',
    '.mobile-nav-icon {',
    '  width: 32px;',
    '  height: 32px;',
    '  border-radius: 8px;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  color: var(--text-secondary);',
    '  background: transparent;',
    '  border: none;',
    '  position: relative;',
    '}',
    '.mobile-nav-icon svg { width: 16px; height: 16px; }',
    '.mobile-nav-avatar {',
    '  width: 28px;',
    '  height: 28px;',
    '  border-radius: 999px;',
    '  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));',
    '  border: 2px solid var(--brand-primary);',
    '  box-shadow: 0 0 12px rgba(139, 92, 246, 0.4);',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  font-family: var(--font-heading);',
    '  font-size: 10px;',
    '  font-weight: 700;',
    '  color: #fff;',
    '}',
    '.mobile-nav-search-row {',
    '  padding: 0 0 10px 0;',
    '}',
    '.mobile-search-pill {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 8px;',
    '  padding: 8px 14px;',
    '  background: var(--bg-surface-2);',
    '  border: 1px solid var(--border-default);',
    '  border-radius: 999px;',
    '}',
    '.mobile-search-pill svg {',
    '  width: 14px;',
    '  height: 14px;',
    '  color: var(--text-tertiary);',
    '  flex-shrink: 0;',
    '}',
    '.mobile-search-pill span {',
    '  font-size: 12px;',
    '  color: var(--text-tertiary);',
    '}',

    /* --- Mobile Workspace Nav --- */
    '.glass-nav--mobile-workspace {',
    '  position: sticky;',
    '  top: 0;',
    '  z-index: 50;',
    '  background: rgba(24, 22, 42, 0.80);',
    '  backdrop-filter: blur(12px);',
    '  -webkit-backdrop-filter: blur(12px);',
    '  border-bottom: 1px solid rgba(139, 92, 246, 0.08);',
    '  padding: 0 16px;',
    '  padding-top: 8px;',
    '  display: flex;',
    '  align-items: center;',
    '  height: 52px;',
    '  gap: 10px;',
    '}',
    '.mobile-workspace-logo {',
    '  font-family: var(--font-display);',
    '  font-weight: 800;',
    '  font-size: 16px;',
    '  color: #FFFFFF;',
    '  flex-shrink: 0;',
    '  letter-spacing: -0.02em;',
    '}',
    '.mobile-workspace-logo .logo-accent { color: #8B5CF6; }',
    '.mobile-workspace-deck-name {',
    '  font-family: var(--font-heading);',
    '  font-weight: 600;',
    '  font-size: 14px;',
    '  color: var(--text-primary);',
    '  flex: 1;',
    '  white-space: nowrap;',
    '  overflow: hidden;',
    '  text-overflow: ellipsis;',
    '}',
    '.mobile-workspace-save {',
    '  font-family: var(--font-heading);',
    '  font-size: 12px;',
    '  font-weight: 600;',
    '  background: var(--brand-primary);',
    '  color: #fff;',
    '  border: none;',
    '  border-radius: 6px;',
    '  padding: 6px 14px;',
    '  cursor: pointer;',
    '  flex-shrink: 0;',
    '}',
    '.glass-nav--mobile-workspace .nav-avatar {',
    '  width: 28px;',
    '  height: 28px;',
    '  font-size: 10px;',
    '  margin-left: 0;',
    '}',
  ].join('\n');

  /* ===========================================
     STYLE INJECTION
     =========================================== */
  function injectStyles() {
    if (document.getElementById('sd-nav-styles')) return;
    var style = document.createElement('style');
    style.id = 'sd-nav-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  /* ===========================================
     TEMPLATE BUILDERS
     =========================================== */

  function buildIconBtn(icon, title, extra) {
    return '<button class="nav-icon-btn" title="' + title + '">' +
      ICONS[icon] + (extra || '') + '</button>';
  }

  function buildNavActions(config) {
    var avatarClass = 'nav-avatar' + (config.avatarActive ? ' nav-avatar--active' : '');
    return '<div class="nav-actions">' +
      buildIconBtn('moon', 'Theme toggle') +
      buildIconBtn('bell', 'Notifications', '<span class="nav-notif-dot"></span>') +
      buildIconBtn('heart', 'Wishlist') +
      buildIconBtn('cart', 'Cart', '<span class="nav-badge">3</span>') +
      '<div class="' + avatarClass + '">TC</div>' +
      '</div>';
  }

  function buildSearchPill() {
    return '<div class="nav-search-pill">' +
      ICONS.search +
      '<span>Search cards, sets, sellers...</span>' +
      '<span class="kbd">&#8984;K</span>' +
      '</div>';
  }

  function buildExpandedSearch(value) {
    return '<div class="nav-search-expanded">' +
      ICONS.search +
      '<div class="nav-search-input">' +
      '<span>' + (value || '') + '</span>' +
      '<span class="cursor">|</span>' +
      '</div>' +
      '<span class="kbd">&#8984;K</span>' +
      '</div>';
  }

  function buildLinks(activeLink) {
    var html = '<div class="nav-links">';
    for (var i = 0; i < NAV_LINKS.length; i++) {
      var cls = (activeLink && NAV_LINKS[i] === activeLink) ? ' class="active"' : '';
      html += '<a href="#"' + cls + '>' + NAV_LINKS[i] + '</a>';
    }
    html += '</div>';
    return html;
  }

  function buildAnnotations(annotations) {
    if (!annotations || !annotations.length) return '';
    var html = '';
    for (var i = 0; i < annotations.length; i++) {
      var a = annotations[i];
      var cls = 'sd-nav-annotation';
      if (a.type === 'breakpoint') cls += ' sd-nav-annotation--breakpoint';
      var pos = a.position === 'right'
        ? 'top:72px; right:48px;'
        : 'top:72px; left:48px;';
      html += '<span class="' + cls + '" style="' + pos + '">' + a.text + '</span>';
    }
    return html;
  }

  function buildStandardNav(config) {
    var search = '';
    if (config.searchContent === 'expanded') {
      search = buildExpandedSearch(config.searchValue);
    } else if (config.searchContent !== 'none') {
      search = buildSearchPill();
    }

    return '<nav class="glass-nav">' +
      '<div class="nav-inner">' +
      '<div class="nav-logo">Side<span class="logo-accent">Decked</span></div>' +
      buildLinks(config.activeLink) +
      search +
      buildNavActions(config) +
      buildAnnotations(config.annotations) +
      '</div>' +
      '</nav>';
  }

  function buildWorkspaceNav(config) {
    return '<nav class="glass-nav glass-nav--workspace">' +
      '<div class="nav-inner">' +
      '<div class="nav-logo">Side<span class="logo-accent">Decked</span></div>' +
      '<div class="nav-deck-name">' +
      '<span>' + (config.deckName || 'Untitled Deck') + '</span>' +
      '<svg class="pencil-icon" ' + SVG_ATTRS + '>' +
      '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>' +
      '<path d="m15 5 4 4"/></svg>' +
      '</div>' +
      '<div class="nav-actions">' +
      '<button class="btn btn-primary">Save</button>' +
      '<button class="btn btn-ghost">Share</button>' +
      '<button class="btn btn-dropdown">Export <span class="chevron"></span></button>' +
      buildIconBtn('moon', 'Theme toggle') +
      buildIconBtn('bell', 'Notifications', '<span class="nav-notif-dot"></span>') +
      buildIconBtn('heart', 'Wishlist') +
      buildIconBtn('cart', 'Cart', '<span class="nav-badge">3</span>') +
      '<div class="nav-avatar">TC</div>' +
      '</div>' +
      '</nav>';
  }

  function buildMobileStandardNav(config) {
    var avatarClass = 'mobile-nav-avatar' + (config.avatarActive ? ' nav-avatar--active' : '');
    var searchRow = '';
    if (config.searchContent !== 'none') {
      if (config.searchContent === 'expanded') {
        searchRow = '<div class="mobile-nav-search-row">' +
          '<div class="mobile-search-pill" style="border-radius:10px;border-width:1.5px;border-color:var(--border-strong);">' +
          ICONS.search +
          '<span style="color:var(--text-primary);font-size:13px;">' + (config.searchValue || '') + '</span>' +
          '</div></div>';
      } else {
        searchRow = '<div class="mobile-nav-search-row">' +
          '<div class="mobile-search-pill">' +
          ICONS.search +
          '<span>Search cards, sets, sellers...</span>' +
          '</div></div>';
      }
    }

    return '<nav class="glass-nav--mobile">' +
      '<div class="mobile-nav-top">' +
      '<div class="mobile-nav-left">' +
      '<button class="mobile-nav-hamburger" title="Menu">' + ICONS.hamburger + '</button>' +
      '<div class="mobile-nav-logo">Side<span class="logo-accent">Decked</span></div>' +
      '</div>' +
      '<div class="mobile-nav-actions">' +
      '<button class="mobile-nav-icon" title="Cart">' + ICONS.cart +
      '<span class="nav-badge" style="top:0;right:0;width:14px;height:14px;font-size:8px;">3</span>' +
      '</button>' +
      '<div class="' + avatarClass + '">TC</div>' +
      '</div>' +
      '</div>' +
      searchRow +
      '</nav>';
  }

  function buildMobileWorkspaceNav(config) {
    return '<div class="glass-nav--mobile-workspace">' +
      '<span class="mobile-workspace-logo">Side<span class="logo-accent">Decked</span></span>' +
      '<span class="mobile-workspace-deck-name">' + (config.deckName || 'Untitled Deck') + '</span>' +
      '<button class="mobile-workspace-save">Save</button>' +
      '<div class="nav-avatar">TC</div>' +
      '</div>';
  }

  /* ===========================================
     INIT
     =========================================== */
  function init(config) {
    config = config || {};

    var defaults = {
      target: '#sd-nav-root',
      variant: 'standard',
      activeLink: null,
      searchContent: 'pill',
      searchValue: '',
      avatarActive: false,
      deckName: '',
      annotations: [],
      mobile: false,
    };

    // Merge defaults
    for (var key in defaults) {
      if (!(key in config)) config[key] = defaults[key];
    }

    // Inject shared styles once
    injectStyles();

    var target = document.querySelector(config.target);
    if (!target) {
      console.warn('[sd-nav] Target not found: ' + config.target);
      return;
    }

    // Slot pattern: save any data-sd-slot children before replacing innerHTML
    var slots = {};
    var slotEls = target.querySelectorAll('[data-sd-slot]');
    for (var i = 0; i < slotEls.length; i++) {
      var slotName = slotEls[i].getAttribute('data-sd-slot');
      slots[slotName] = slotEls[i];
      slotEls[i].parentNode.removeChild(slotEls[i]);
    }

    // Build HTML
    var html;
    if (config.mobile) {
      html = config.variant === 'workspace'
        ? buildMobileWorkspaceNav(config)
        : buildMobileStandardNav(config);
    } else {
      html = config.variant === 'workspace'
        ? buildWorkspaceNav(config)
        : buildStandardNav(config);
    }

    target.innerHTML = html;

    // Re-attach slots
    if (slots['search-dropdown']) {
      var searchContainer = target.querySelector('.nav-search-expanded');
      if (searchContainer) {
        searchContainer.appendChild(slots['search-dropdown']);
      }
    }
  }

  /* ===========================================
     EXPORTS
     =========================================== */
  window.SdNav = { init: init };
})();
