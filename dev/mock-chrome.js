/* 开发预览用的 chrome.* API 模拟层。
   仅在普通网页里生效（扩展环境下 chrome.bookmarks 已存在，本文件会直接跳过），
   用来在没有扩展权限的情况下预览 newtab / options 页面。 */
(() => {
  'use strict';

  if (window.chrome && window.chrome.bookmarks) return;

  const DAY = 86400000;
  const NOW = Date.now();
  const ago = (days) => NOW - Math.round(days * DAY);

  const link = (title, url, daysAgo) => ({ title, url, daysAgo });
  const dir = (title, children) => ({ title, children });

  /* 一棵贴近真实使用的中文书签树 */
  const SAMPLE = dir('', [
    dir('书签栏', [
      link('知乎', 'https://www.zhihu.com/', 96),
      link('掘金', 'https://juejin.cn/', 88),
      link('少数派', 'https://sspai.com/', 41),
      link('哔哩哔哩', 'https://www.bilibili.com/', 63),
      dir('开发工具', [
        dir('前端', [
          link('MDN Web 文档', 'https://developer.mozilla.org/zh-CN/', 12),
          link('Can I use', 'https://caniuse.com/', 55),
          link('Tailwind CSS', 'https://tailwindcss.com/', 34),
          link('Vite', 'https://vitejs.dev/', 47),
          link('React', 'https://react.dev/', 29),
          link('TypeScript', 'https://www.typescriptlang.org/', 71),
        ]),
        dir('后端', [
          link('Node.js 中文网', 'https://nodejs.cn/', 18),
          link('PostgreSQL 文档', 'https://www.postgresql.org/docs/', 77),
          link('Redis', 'https://redis.io/', 66),
          link('Docker Hub', 'https://hub.docker.com/', 25),
          link('Nginx', 'https://nginx.org/', 103),
        ]),
        link('GitHub', 'https://github.com/', 2),
        link('Stack Overflow', 'https://stackoverflow.com/', 44),
        link('npm', 'https://www.npmjs.com/', 58),
        link('Chrome DevTools 文档', 'https://developer.chrome.com/docs/devtools/', 15),
        link('CodePen', 'https://codepen.io/', 91),
      ]),
      dir('AI 工具', [
        link('ChatGPT', 'https://chat.openai.com/', 1),
        link('Claude', 'https://claude.ai/', 3),
        link('Gemini', 'https://gemini.google.com/', 8),
        link('Hugging Face', 'https://huggingface.co/', 21),
        link('Perplexity', 'https://www.perplexity.ai/', 6),
        link('Midjourney', 'https://www.midjourney.com/', 37),
        link('Cursor', 'https://cursor.com/', 4),
      ]),
      dir('设计灵感', [
        link('Dribbble', 'https://dribbble.com/', 52),
        link('Behance', 'https://www.behance.net/', 69),
        link('Figma 社区', 'https://www.figma.com/community', 27),
        link('Awwwards', 'https://www.awwwards.com/', 81),
        link('Unsplash', 'https://unsplash.com/', 46),
        link('Google Fonts', 'https://fonts.google.com/', 73),
      ]),
    ]),
    dir('其他书签', [
      dir('学习', [
        link('极客时间', 'https://time.geekbang.org/', 39),
        link('慕课网', 'https://www.imooc.com/', 85),
        link('freeCodeCamp 中文', 'https://www.freecodecamp.org/chinese/', 23),
        link('Coursera', 'https://www.coursera.org/', 94),
        link('菜鸟教程', 'https://www.runoob.com/', 61),
      ]),
      dir('新闻资讯', [
        link('36氪', 'https://36kr.com/', 30),
        link('虎嗅网', 'https://www.huxiu.com/', 57),
        link('Hacker News', 'https://news.ycombinator.com/', 9),
        link('The Verge', 'https://www.theverge.com/', 49),
        link('阮一峰的网络日志', 'https://www.ruanyifeng.com/blog/', 5),
      ]),
      dir('稍后阅读', [
        link('CSS 容器查询指南', 'https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_containment/Container_queries', 11),
        link('View Transitions API', 'https://developer.chrome.com/docs/web-platform/view-transitions', 14),
        link('约定式提交', 'https://www.conventionalcommits.org/zh-hans/v1.0.0/', 20),
      ]),
      link('豆瓣', 'https://www.douban.com/', 67),
      link('什么值得买', 'https://www.smzdm.com/', 42),
    ]),
    dir('移动端书签', [
      link('网易云音乐', 'https://music.163.com/', 33),
      link('小红书', 'https://www.xiaohongshu.com/', 7),
    ]),
  ]);

  /* 补齐 id / parentId / dateAdded，并生成扁平的可查询列表。
     Chrome 真实 id：根节点 0，书签栏 1、其他书签 2、移动端书签 3，其余从 10 起分配。 */
  let nextId = 10;
  let rootSeq = 0;
  const flat = [];
  const byId = new Map();

  function normalize(node, parent, depth) {
    let id;
    if (!parent) id = '0';
    else if (depth === 1) id = String(++rootSeq);
    else id = String(nextId++);
    const out = { id, title: node.title, dateAdded: ago(node.daysAgo == null ? 120 : node.daysAgo) };
    if (parent) out.parentId = parent.id;
    if (node.url) out.url = node.url;
    else {
      out.children = (node.children || []).map((child) => normalize(child, out, depth + 1));
      out.dateAdded = Math.min(...out.children.map((child) => child.dateAdded));
    }
    byId.set(id, out);
    if (out.url) flat.push(out);
    return out;
  }

  const tree = [normalize(SAMPLE, null, 0)];

  function makeEvent() {
    const listeners = new Set();
    return {
      addListener: (fn) => listeners.add(fn),
      removeListener: (fn) => listeners.delete(fn),
      hasListener: (fn) => listeners.has(fn),
      emit: (...args) => listeners.forEach((fn) => fn(...args)),
    };
  }

  const clone = (value) => JSON.parse(JSON.stringify(value));

  /* ---------------- chrome.bookmarks ---------------- */

  const bookmarkEvents = {
    onCreated: makeEvent(),
    onRemoved: makeEvent(),
    onChanged: makeEvent(),
    onMoved: makeEvent(),
    onChildrenReordered: makeEvent(),
    onImportEnded: makeEvent(),
    onImportBegan: makeEvent(),
  };

  const bookmarks = {
    ...bookmarkEvents,
    getTree: async () => clone(tree),
    get(idOrIds) {
      const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
      return Promise.resolve(ids.map((id) => clone(byId.get(String(id)))).filter(Boolean));
    },
    getRecent: async (limit = 20) =>
      clone(
        flat
          .slice()
          .sort((a, b) => b.dateAdded - a.dateAdded)
          .slice(0, limit)
      ),
    search: async (query) => {
      const q = String(query || '').toLowerCase();
      return clone(flat.filter((item) => item.title.toLowerCase().includes(q) || item.url.toLowerCase().includes(q)));
    },
    /* 以下写操作在预览里只广播事件，不修改数据 */
    create: async () => {
      bookmarkEvents.onCreated.emit('', {});
      return {};
    },
    remove: async () => {
      bookmarkEvents.onRemoved.emit('', {});
    },
    update: async () => {
      bookmarkEvents.onChanged.emit('', {});
    },
    move: async () => {
      bookmarkEvents.onMoved.emit('', {});
    },
  };

  /* ---------------- chrome.storage ---------------- */

  const LS_KEY = 'b2h-dev-storage';
  let store = {};
  try {
    store = JSON.parse(localStorage.getItem(LS_KEY) || '{}') || {};
  } catch (err) {
    store = {};
  }

  const persist = () => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(store));
    } catch (err) {
      /* 忽略写入失败，预览用 */
    }
  };

  const pick = (keys) => {
    if (keys == null) return { ...store };
    if (typeof keys === 'string') return keys in store ? { [keys]: store[keys] } : {};
    if (Array.isArray(keys)) {
      const out = {};
      for (const key of keys) if (key in store) out[key] = store[key];
      return out;
    }
    const out = {};
    for (const [key, fallback] of Object.entries(keys)) out[key] = key in store ? store[key] : fallback;
    return out;
  };

  function makeArea(areaName) {
    const onChanged = makeEvent();
    return {
      onChanged,
      async get(keys) {
        return clone(pick(keys));
      },
      async set(items) {
        const changes = {};
        for (const [key, value] of Object.entries(items || {})) {
          changes[key] = { oldValue: store[key], newValue: clone(value) };
          store[key] = clone(value);
        }
        persist();
        queueMicrotask(() => onChanged.emit(changes, areaName));
      },
      async remove(keys) {
        const list = Array.isArray(keys) ? keys : [keys];
        const changes = {};
        for (const key of list) {
          if (!(key in store)) continue;
          changes[key] = { oldValue: store[key] };
          delete store[key];
        }
        persist();
        queueMicrotask(() => onChanged.emit(changes, areaName));
      },
      async clear() {
        store = {};
        persist();
      },
    };
  }

  const syncArea = makeArea('sync');
  const storage = {
    sync: syncArea,
    local: makeArea('local'),
    /* 页面里监听的是 chrome.storage.onChanged（同步区的改动同样会触发） */
    onChanged: { ...syncArea.onChanged, addListener: (fn) => syncArea.onChanged.addListener(fn) },
  };

  /* ---------------- chrome.runtime / chrome.tabs ---------------- */

  const runtime = {
    id: 'dev-preview',
    lastError: null,
    getURL: (path) => new URL(String(path).replace(/^\//, ''), document.baseURI).toString(),
    getManifest: () => ({ name: 'bookmarks2html', version: '1.0.0' }),
    openOptionsPage: () => {
      window.open('dev-preview.html?page=options', '_blank', 'noopener');
    },
    onInstalled: makeEvent(),
    onMessage: makeEvent(),
    sendMessage: (message) => handleMessage(message),
  };

  const tabs = {
    async create(options) {
      const url = typeof options === 'string' ? options : options && options.url;
      if (url) window.open(url, '_blank', 'noopener');
      return { id: Math.floor(Math.random() * 1000), url };
    },
    async query() {
      return [];
    },
  };

  /* ---------------- 网页简介（模拟后台抓取） ---------------- */

  const DESC_KEY = 'b2h-descriptions';
  const HOST_PERMISSION_KEY = 'b2h-dev-host-permission';

  /* 真实扩展里由后台联网抓取 <meta name="description">；预览环境用固定文案模拟。
    未收录的网址模拟“页面没有简介”，卡片会继续显示网址。 */
  const FAKE_DESCRIPTIONS = {
    'https://www.zhihu.com/': '中文互联网高质量的问答社区和创作者聚集的原创内容平台，在这里可以分享知识、经验和见解。',
    'https://juejin.cn/': '面向开发者的技术内容分享社区，汇集前端、后端、人工智能等领域的优质文章。',
    'https://sspai.com/': '高效工作，品质生活。推荐高质量的 App、硬件与效率工具的使用指南。',
    'https://www.bilibili.com/': '国内知名的视频弹幕网站，提供动画、番剧、游戏、科技、生活等海量视频内容。',
    'https://developer.mozilla.org/zh-CN/': '面向 Web 开发者的权威技术文档，涵盖 HTML、CSS、JavaScript 与 Web API 的完整参考。',
    'https://caniuse.com/': '查询 HTML、CSS 与 Web API 在各浏览器中的兼容性支持情况。',
    'https://tailwindcss.com/': '实用优先的 CSS 框架，通过原子类快速构建现代响应式界面。',
    'https://vitejs.dev/': '新一代前端构建工具，提供极速的冷启动与热更新开发体验。',
    'https://react.dev/': '用于构建用户界面的 JavaScript 库，以组件化方式开发交互式 Web 应用。',
    'https://www.typescriptlang.org/': 'JavaScript 的超集，为语言添加静态类型检查，提升大型项目的可维护性。',
    'https://nodejs.cn/': 'Node.js 中文文档与社区资源，帮助开发者快速上手服务端 JavaScript。',
    'https://www.postgresql.org/docs/': 'PostgreSQL 官方文档，介绍这款开源关系型数据库的安装、SQL 语法与高级特性。',
    'https://redis.io/': '开源的内存数据结构存储，常用作数据库、缓存与消息中间件。',
    'https://hub.docker.com/': '全球最大的容器镜像仓库，用于发现、分发与拉取官方及社区镜像。',
    'https://nginx.org/': '高性能的 HTTP 与反向代理服务器，广泛用于静态资源托管与负载均衡。',
    'https://github.com/': '全球最大的代码托管与协作平台，支持 Git 仓库、代码评审与持续集成。',
    'https://stackoverflow.com/': '全球开发者问答社区，几乎所有的编程问题都能在这里找到答案。',
    'https://www.npmjs.com/': 'JavaScript 包管理器的官方仓库，提供数百万个开源软件包的检索与安装。',
    'https://developer.chrome.com/docs/devtools/': 'Chrome 开发者工具的官方文档，讲解元素、网络、性能等面板的使用方法。',
    'https://codepen.io/': '在线前端代码演练场，可以编写并分享 HTML、CSS 与 JavaScript 作品。',
    'https://chat.openai.com/': 'OpenAI 推出的对话式人工智能助手，可以回答问题、撰写内容与辅助编程。',
    'https://claude.ai/': 'Anthropic 推出的 AI 助手，擅长长文本理解、写作与代码分析。',
    'https://gemini.google.com/': 'Google 推出的多模态 AI 助手，与 Google 生态深度整合。',
    'https://huggingface.co/': '机器学习社区与模型托管平台，提供海量开源模型与数据集。',
    'https://www.perplexity.ai/': '结合实时联网检索的 AI 搜索引擎，回答会附带可验证的来源链接。',
    'https://www.midjourney.com/': '通过自然语言提示词生成高质量图像的 AI 绘画工具。',
    'https://cursor.com/': '内置 AI 的代码编辑器，支持用自然语言生成与重构代码。',
    'https://dribbble.com/': '设计师作品展示社区，汇集 UI、插画与品牌设计灵感。',
    'https://www.behance.net/': 'Adobe 旗下的创意作品平台，展示全球设计师与艺术家的专业作品集。',
    'https://www.figma.com/community': '免费的界面设计资源库，提供社区制作的组件、模板与插件。',
    'https://www.awwwards.com/': '评选并展示全球优秀网页设计的平台，是网页设计趋势的风向标。',
    'https://unsplash.com/': '免费可商用的高质量图片素材库，由全球摄影师共同贡献。',
    'https://fonts.google.com/': 'Google 提供的免费开源字体库，可直接在网页中嵌入使用。',
    'https://time.geekbang.org/': '面向 IT 从业者的知识服务平台，提供系统化的技术专栏与视频课程。',
    'https://www.freecodecamp.org/chinese/': '免费学习编程的开源社区，通过动手项目掌握 Web 开发技能。',
    'https://www.runoob.com/': '提供各类编程语言与技术的入门教程，适合初学者快速查阅。',
    'https://36kr.com/': '科技与商业新闻媒体，报道创业公司与互联网行业动态。',
    'https://www.huxiu.com/': '聚焦科技与商业的深度报道，关注创新公司与产业趋势。',
    'https://news.ycombinator.com/': 'Y Combinator 旗下的科技新闻聚合社区，聚焦程序员与创业话题。',
    'https://www.ruanyifeng.com/blog/': '知名技术博客，每周分享科技动态与技术随笔。',
    'https://www.douban.com/': '图书、电影与音乐的评分与评论社区，记录你的阅读与观影。',
    'https://www.smzdm.com/': '消费决策分享平台，提供商品优惠信息与购物攻略。',
    'https://music.163.com/': '音乐播放与分享平台，以个性化歌单和乐评社区著称。',
    'https://www.xiaohongshu.com/': '生活方式分享社区，覆盖穿搭、美食、旅行与好物推荐。',
  };

  let descriptions = store[DESC_KEY] && typeof store[DESC_KEY] === 'object' ? store[DESC_KEY] : {};

  function saveDescriptions() {
    store[DESC_KEY] = descriptions;
    persist();
  }

  function scheduleFetch(url) {
    setTimeout(() => {
      const text = FAKE_DESCRIPTIONS[url];
      if (!text) return;
      descriptions[url] = { text, ts: Date.now() };
      saveDescriptions();
      queueMicrotask(() => runtime.onMessage.emit({ type: 'b2h:described', entries: { [url]: text } }));
    }, 500 + Math.random() * 1400);
  }

  /* 对应真实扩展的 chrome.runtime.sendMessage({type:'b2h:describe', urls}) */
  function handleMessage(message) {
    if (!message || message.type !== 'b2h:describe') return Promise.resolve(undefined);
    const entries = {};
    let queued = 0;
    for (const url of message.urls || []) {
      const hit = descriptions[url];
      if (hit && hit.text) entries[url] = hit.text;
      else {
        queued += 1;
        scheduleFetch(url);
      }
    }
    return Promise.resolve({ entries, queued });
  }

  /* ---------------- chrome.permissions ---------------- */

  const permissionEvents = { onRemoved: makeEvent() };
  let hostGranted = store[HOST_PERMISSION_KEY] !== false;

  const permissions = {
    ...permissionEvents,
    async contains() {
      return hostGranted;
    },
    async request() {
      console.info('[bookmarks2html] 预览环境自动授予「读取网站数据」权限（真实扩展会弹出授权确认）');
      hostGranted = true;
      store[HOST_PERMISSION_KEY] = true;
      persist();
      return true;
    },
    async remove() {
      hostGranted = false;
      store[HOST_PERMISSION_KEY] = false;
      delete store[DESC_KEY];
      persist();
      descriptions = {};
      queueMicrotask(() => permissionEvents.onRemoved.emit({ origins: ['<all_urls>'] }));
      return true;
    },
  };

  const base = window.chrome && typeof window.chrome === 'object' ? window.chrome : {};
  window.chrome = Object.assign(base, { bookmarks, storage, runtime, tabs, permissions });

  console.info('[bookmarks2html] 已启用开发预览模拟数据：%d 个书签', flat.length);
})();
