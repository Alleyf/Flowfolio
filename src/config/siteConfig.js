const createCoverPlaceholder = (title, subtitle) => `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
    <defs>
      <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
        <stop offset="0%" stop-color="#0b1522" />
        <stop offset="55%" stop-color="#10283a" />
        <stop offset="100%" stop-color="#071019" />
      </linearGradient>
      <linearGradient id="glow" x1="0%" x2="100%" y1="0%" y2="0%">
        <stop offset="0%" stop-color="#6ef2ff" stop-opacity="0.95" />
        <stop offset="100%" stop-color="#ffb865" stop-opacity="0.95" />
      </linearGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#bg)" />
    <circle cx="1290" cy="180" r="240" fill="#6ef2ff" fill-opacity="0.10" />
    <circle cx="280" cy="760" r="280" fill="#ffb865" fill-opacity="0.10" />
    <rect x="110" y="110" width="1380" height="680" rx="42" fill="#0d1b2a" fill-opacity="0.9" stroke="url(#glow)" stroke-opacity="0.45" />
    <rect x="170" y="180" width="420" height="540" rx="28" fill="#101f31" stroke="#6ef2ff" stroke-opacity="0.22" />
    <rect x="640" y="210" width="760" height="110" rx="22" fill="#0e1a29" stroke="#6ef2ff" stroke-opacity="0.2" />
    <rect x="640" y="360" width="760" height="180" rx="28" fill="#0e1a29" stroke="#ffffff" stroke-opacity="0.1" />
    <rect x="640" y="580" width="210" height="92" rx="22" fill="#6ef2ff" fill-opacity="0.85" />
    <rect x="890" y="580" width="210" height="92" rx="22" fill="#101f31" stroke="#ffffff" stroke-opacity="0.16" />
    <rect x="1140" y="580" width="210" height="92" rx="22" fill="#101f31" stroke="#ffffff" stroke-opacity="0.16" />
    <text x="210" y="310" fill="#ffcf70" font-family="Arial, sans-serif" font-size="38" font-weight="700">Terminal Runtime</text>
    <text x="210" y="390" fill="#ffffff" font-family="Arial, sans-serif" font-size="72" font-weight="800">${title}</text>
    <text x="210" y="458" fill="#a9c3d8" font-family="Arial, sans-serif" font-size="30">${subtitle}</text>
    <text x="678" y="280" fill="#8fa8be" font-family="Arial, sans-serif" font-size="28">搜索命令、参数、工作目录或分组</text>
    <text x="678" y="440" fill="#ffffff" font-family="Courier New, monospace" font-size="44">docker run -d -p 6379:6379 redis:alpine</text>
    <text x="678" y="504" fill="#ffb865" font-family="Arial, sans-serif" font-size="28">桌面端命令编排与进程控制台</text>
  </svg>
`)}`;

export const siteMeta = {
  projectName: "Flowfolio",
  brand: "FLOWFOLIO | Resume OS",
  brandAccent: "Resume OS",
  pageTitle: "CsFan | Flowfolio",
  description: "CsFan的作品化简历网站，聚焦 Agent 应用研发、多智能体系统、云原生与全栈工程化。",
  overviewEyebrow: "Flowfolio / Resume OS",
  overviewTitle: "基础简介",
  copyrightRange: "2025-2026",
  copyrightOwner: "CsFan",
  footerTitle: "CsFan · Flowfolio",
  footerNote: "感谢浏览，欢迎通过邮箱、GitHub 或博客进一步了解我的项目与技术沉淀。",
  portfolioPoster: "./doc/poster.webp",
  contribution: "./doc/contribution.png",
};

export const terminalConfig = {
  prompt: "visitor@recruiter:~$",
  title: "fan@flowfolio:~/resume",
  placeholder: "输入命令，Tab 自动补全，Enter 执行",
  hint: "系统启动完成后将自动进入简历首页。",
  commands: [
    {
      name: "start",
      description: "进入简历分页视图",
      output: ["[执行] 正在打开 Flowfolio...", "[执行] 正在挂载分页内容流..."],
      action: "unlock",
    },
    {
      name: "help",
      description: "查看可用命令",
      output: ["start -> 进入简历", "help -> 查看命令", "whoami -> 查看候选人信息", "agent -> Agent 技能栈", "intern -> 实习经历摘要", "matrix -> 打开作品矩阵", "contact -> 输出联系方式", "clear -> 清屏"],
    },
    {
      name: "whoami",
      description: "查看候选人信息",
      output: ["CsFan / Agent 应用研发工程师 / 多智能体系统与云原生实践者 / HUST 硕士在读"],
    },
    {
      name: "agent",
      description: "查看 Agent 技能栈",
      output: [
        "[基座] Harness 核心机制 / SDD 开发 / 方案设计与概念验证",
        "[工具] Skill · MCP · Plugin / Codex / Claude Code / Qoder",
        "[范式] ReAct - Plan - Execute - Replan - Reflection",
        "[机制] 上下文治理 / 记忆管理 / Multi-Agent 协作 / Hook / Sandbox",
      ],
      action: "goto-skills",
    },
    {
      name: "intern",
      description: "查看实习经历摘要",
      output: [
        "淘天集团 · 阿里妈妈 · 广告技术部 / AI 应用研发工程师 / 2026.06-2026.09",
        "广告配置中心智能运维 Agent · 生成式 UI Agent · 热点话题聚合治理（7天->3天）",
        "AI 意图定向搜索广告结案（ODPS + ClickHouse + 因果归因）",
      ],
      action: "goto-internship",
    },
    {
      name: "matrix",
      description: "打开作品矩阵",
      output: ["[执行] 正在打开作品矩阵..."],
      action: "goto-portfolio",
    },
    {
      name: "contact",
      description: "输出联系方式",
      output: ["mail: alleyf@qq.com", "phone: 19223276194", "github: https://github.com/Alleyf", "blog: https://alleyf.github.io/"],
    },
    {
      name: "clear",
      description: "清空终端",
      action: "clear",
    },
  ],
};

export const bootLines = [
  "[启动] 正在加载 Flowfolio 配置清单...",
  "[启动] 正在连接作品封面与数字身份资源...",
  "[启动] 正在启用分页交互与动态切换管线...",
  "[启动] 正在载入候选人档案：CsFan / Agent 应用研发工程师",
  "[启动] 简历入口已就绪，即将自动进入首页...",
];

export const sectionMenus = [
  { id: "overview", label: "主页" },
  { id: "education", label: "教育背景" },
  { id: "internship", label: "实习经历" },
  { id: "skills", label: "个人技能" },
  { id: "projects", label: "项目经历" },
  { id: "portfolio", label: "作品矩阵" },
  { id: "blog", label: "博客推文" },
  { id: "contact", label: "联系信息" },
];

export const topStats = [
  { label: "方向", value: "Agent 应用研发" },
  { label: "主栈", value: "Java / Spring / SpringAI" },
  { label: "工程化", value: "云原生 / DevOps / K8s" },
];

export const digitalIdentity = {
  name: "CsFan",
  role: "Agent 应用研发工程师 / Java 全栈",
  avatar: "./doc/avatar.webp",
  avatarFallback: "F",
  fields: [
    { label: "学校", value: "华中科技大学" },
    { label: "学历", value: "硕士" },
    { label: "专业", value: "信息与通信工程" },
    { label: "邮箱", value: "alleyf@qq.com" },
    { label: "博客", value: "alleyf.github.io" },
    { label: "状态", value: "秋招进行中 · Agent 研发" },
  ],
};

export const educationList = [
  {
    period: "2024.09 - 2027.06",
    title: "华中科技大学 · 信息与通信工程-硕士",
    school: "华中科技大学",
    schoolUrl: "https://www.hust.edu.cn/",
    logo: "./doc/hust_logo.svg",
    tiers: ["985", "211", "双一流"],
    body: "推荐免试研究生，持续把通信工程背景和软件工程实践结合，重点关注 Agent 工程、系统设计与平台能力建设。",
    chips: ["中国研究生创“芯”大赛 · EDA 精英挑战赛全国三等奖", "研究生一等学业奖学金"],
    details: ["推荐免试录取，研究方向聚焦工程化能力与系统实现。", "在校期间持续参与竞赛与项目实践，保持技术研究与工程落地并进。"],
  },
  {
    period: "2020.09 - 2024.06",
    title: "武汉理工大学 · 通信工程-本科",
    school: "武汉理工大学",
    schoolUrl: "https://www.whut.edu.cn/",
    logo: "./doc/whut_logo.svg",
    tiers: ["211", "双一流"],
    body: "专业前 15%，获得保研资格。本科阶段在课程学习、竞赛获奖、项目实践和综合素质评定上持续保持稳定输出。",
    chips: ["计算机设计大赛全国二等奖", "服务外包大赛全国三等奖", "华为社会奖学金", "校一等奖学金", "三好学生标兵", "优秀毕业生", "CET-6"],
    details: ["获得科研、竞赛和奖学金等多项荣誉。", "兼顾专业课程、比赛和项目开发，形成了较强的自驱学习与工程实践能力。"],
  },
];

export const internshipExperience = {
  company: "浙江天猫技术有限公司",
  org: "淘天集团 · 阿里妈妈 · 广告技术部",
  role: "AI 应用研发工程师",
  period: "2026.06 - 2026.09",
  intro: "参与阿里妈妈无界效果 BP 广告平台搜索广告相关业务研发：运行域对客使用的广告投放平台业务研发，以及管理域对内使用的广告配置中心智能 Agent 建设。",
  stack: ["Orchestrator-Worker", "Multi-Agent", "Workflow", "ReAct", "Skill", "云端沙箱", "Agent Harness", "上下文工程", "ODPS", "ClickHouse", "Vibe Coding"],
  summaryTitle: "核心工作与产出",
  summary: "主导建设广告配置中心智能运维 Agent：基于 Orchestrator-Worker 多智能体架构与云端沙箱，设计视觉验证、浏览器自动化等业务 Skill 并编排三阶段 Workflow 流水线，把配置变更后的人工验证升级为自动化闭环；再整合离线会话日志与 Human in the loop 审批设计自进化工作流，实现异常自主感知、工具自主治理、经验自主沉淀。基于 Agent Harness 基座搭建生成式 UI Agent，以软硬双门限上下文压缩与分层记忆管理控制长流程上下文成本，结合组件设计规范与存量模板 few-shot 编排两阶段生成 Workflow，生成结果经人工筛选后入库反哺，持续提升界面生成质量与一致性。业务侧统一站内热点、站外赛道、营销话题三条异构链路的话题聚合、生图、评测与汰换治理，0→1 搭建 AI 生图工作流与话题评测平台并接入钉钉监控告警，上线时间从 7 天缩短到 3 天；同时完成 AI 意图定向搜索广告结案，设计统一 ODPS 底表并同步至 ClickHouse 做数据加速，构建增量价值指标与因果归因案例对客披露，有效拉升产品渗透率。",
  metrics: ["验证自动化闭环", "Workflow + ReAct 自进化", "上线 7 天 → 3 天", "增量价值披露"],
};

export const personalSkills = [
  {
    title: "AI 工程应用",
    body: "熟悉 Java Agent 研发基座的 Harness 核心机制，能把 Skill、架构范式与上下文工程真正落进工程实践。",
    tags: ["Harness", "SDD", "Skill·MCP·Plugin", "ReAct·Plan·Reflection", "上下文治理", "记忆管理", "Multi-Agent", "Hook", "Sandbox", "Codex", "Claude Code", "Qoder"],
  },
  {
    title: "全栈开发设计",
    body: "掌握 Spring Cloud Alibaba 微服务治理，熟悉 MySQL 调优、Redis 缓存穿透/雪崩治理与高并发场景处理，借助 AI Coding 完成全栈交付。",
    tags: ["Spring Cloud Alibaba", "MySQL", "Redis", "ElasticSearch", "RocketMQ", "Vue", "Element Plus"],
  },
  {
    title: "云原生运维",
    body: "具备 CPU/GPU 物理服务器、虚拟机与 K8s 集群管理经验，熟悉 DevOps 链路与生产环境排障。",
    tags: ["Linux", "Docker", "Kubernetes", "CI/CD", "Arthas", "SkyWalking", "阿里云 ACK"],
  },
  {
    title: "团队协作与沉淀",
    body: "担任实验室主管，管理 10 人团队；坚持周月报与技术博客，持续沉淀工程经验与知识体系。",
    tags: ["实验室主管", "10 人团队管理", "技术博客", "周月报机制", "Agent Engineering"],
  },
];

export const skillTicker = [
  "SpringAI-Alibaba", "MCP", "RAG", "Multi-Agent", "ReAct", "Plan-Execute",
  "Spring Cloud", "Redis", "RocketMQ", "Kubernetes", "Docker", "MySQL",
  "ElasticSearch", "Claude Code", "Codex", "AI Coding", "Prompt Engineering", "Context Engineering",
];

export const projectExperiences = [
  {
    title: "LabOps 智能运维系统",
    period: "2025.12 - 2026.05",
    status: "Stable",
    role: "项目负责人",
    external: false,
    description: "面向实验室内部运维的智能监控治理平台，集成设备状态监控、日志分析和故障治理等能力，有效提高故障响应效率。",
    bullets: [
      "多Agent架构设计：设计 Knowledge/Chat/Plan-Execute-Replan 三类 Agent 协同架构，通过图编排实现模块化工作流；引入 MCP 协议标准化集成告警查询、日志检索和联网查询等工具。",
      "RAG检索精度优化：构建运维手册向量化知识库，通过多轮实验对比 Chunk Size + TopK 参数组合，将知识检索准确率提升至 82%+。",
      "智能运维闭环落地：基于 Plan-Execute-Replan 模式构建“服务告警→知识库检索→诊断步骤规划→工具调用→结果分析”标准 SOP，实现异常自主感知预警与初步诊断解决。",
    ],
    stack: ["SpringAI-Alibaba", "Spring Boot", "MCP", "RAG", "ReAct", "Plan-Executor", "Multi-Agent"],
    color: "violet",
  },
  {
    title: "北师大教育培训管理服务平台（ETMS）",
    period: "2024.03 - 2026.05",
    status: "Live",
    role: "项目负责人 / 后端研发",
    url: "https://jp.liyunol.com",
    description: "北师大教育培训ToB项目，提供在线学习、项目管理、学情分析等服务，日活 2W+，并发 500+。",
    bullets: [
      "基础架构设计：拆分解耦 10 大核心业务模块，搭建项目开发脚手架，设计异步任务监控框架、条件查询构建器框架、定制化统计分析框架，引入 DynamicTp 动态配置和监控线程池。",
      "核心功能开发：对接保利威支持 1w+ 在线用户直播学习；对接阿里云 OSS 和 kkFileView 实现资源分片上传、断点续传、秒传和在线预览；对接第三方支付实现支付全流程。",
      "性能诊断优化：基于 Redis+RocketMQ+线程池构建“网关限流+缓存预热+异步解耦+批量处理”的考试业务削峰方案，吞吐量提升 10 倍，支撑 500+ QPS 稳定运行，高峰期零故障。",
      "容器化云部署：搭建 GitLab 流水线，管理阿里云 ACK 容器服务集群和相关中间件，设计 HPA 策略根据流量自动伸缩。",
    ],
    stack: ["Spring Cloud Alibaba", "Dubbo", "MySQL", "Redis", "ElasticSearch", "RocketMQ", "Seata", "Kubernetes"],
    color: "cyan",
  },
  {
    title: "中国高校社会科学数据中心（CMIS）",
    period: "2024.09 - 至今",
    status: "Stable",
    role: "项目主管 / 运维负责人",
    url: "https://cmis.csdcinfo.cn",
    external: false,
    description: "对实验室的私有云平台与业务中枢事务工作进行统筹安排、分工协作、技术指导和维护管理等工作。",
    bullets: [
      "规划、部署并维护 40 个节点的私有云基础设施与容器平台。",
      "基于 Kubernetes、Rancher 与 Harbor 建立规范化交付链路。",
      "持续推进性能优化、安全加固与高可用设计。",
    ],
    stack: ["Kubernetes", "Docker", "Rancher", "Harbor", "Nginx", "VMware"],
    color: "green",
  },
  {
    title: "湖北省社会科学项目与奖励申报评审系统（HSAS）",
    period: "长期维护",
    status: "Maintain",
    role: "项目负责人 / 后端研发",
    url: "https://hsas.csdcinfo.cn",
    description: "为湖北省社科联提供社科课题、项目和成果申报、评审、统计分析等服务，支撑湖北全省社科工作者的申报评审工作。",
    bullets: [
      "修复多项线上问题并优化高峰场景下的系统承载能力。",
      "对 Struts + Hibernate 历史架构进行治理与渐进式重构。",
      "围绕权限、接口与基础设施完成一轮安全升级。",
    ],
    stack: ["Spring", "Struts", "Hibernate", "JSP", "Security", "Performance"],
    color: "gold",
  },
];

export const portfolioWorks = [
  {
    title: "Md2Slide",
    subtitle: "Markdown 转幻灯片生成器",
    kind: "Web App",
    repo: "https://github.com/Alleyf/Md2Slide",
    demo: "https://md2-slide.vercel.app",
    image: "./doc/Md2Slide.webp",
    summary: "把 Markdown 内容快速转成带演示感和数学表达力的可视化幻灯片。",
    highlights: [
      "实时编辑预览，支持数学公式、代码高亮和媒体嵌入。",
      "支持 click-to-reveal、过渡动画、主题切换与部署链路。",
      "创意汇报演示生产力工具。",
    ],
    stack: ["React", "TypeScript", "Vite", "Remotion"],
  },
  {
    title: "MindScape",
    subtitle: "AI-Native 知识星图工作室",
    kind: "Web App",
    repo: "https://github.com/Alleyf/MindScape",
    image: "./doc/MindScape.webp",
    summary: "把 Markdown 笔记转化为可探索的思维星图：AI 隐喻、标签图谱、学习路线、参考文档预览——不是归档文章，而是在每次阅读时重新生成线索。",
    highlights: [
      "d3-force 标签图谱 + React Flow 流程图双引擎可视化。",
      "AI 隐喻与学习路线生成，让笔记在阅读时重新生长。",
      "资源库六大分类 + Favicon 集成 + 外部链接预览。",
    ],
    stack: ["React 19", "TypeScript", "Vite 8", "d3-force", "React Flow"],
  },
  {
    title: "AgnesOnline",
    subtitle: "Agnes AI 多模态在线演示平台",
    kind: "Web App",
    repo: "https://github.com/Alleyf/AgnesOnline",
    image: "./doc/AgnesOnline.webp",
    summary: "一站式体验 Agnes AI 的文本对话、图像生成与视频创作能力，支持多服务商一键切换。",
    highlights: [
      "流式对话、文生图、文生视频三大能力统一接入，OpenAI 兼容协议。",
      "内置 Agnes AI / SenseNova 双服务商预设，能力按服务商动态适配。",
      "资产集中管理 + 本地存储 + 跨标签页同步，Token 不落盘。",
    ],
    stack: ["React 19", "TypeScript", "Tailwind CSS 4", "shadcn/ui", "Vite 8"],
  },
  {
    title: "pianke 片刻",
    subtitle: "本地照片擂台式选片工具",
    kind: "桌面应用",
    repo: "https://github.com/Alleyf/pianke",
    image: "./doc/pianke.webp",
    summary: "为摄影师设计的本地选片工具：相似照片自动归入“同一个瞬间”，再用左右 A/B 擂台 PK 快速挑出最满意的一张。",
    highlights: [
      "相似照片智能分组 + A/B 擂台 PK 选片交互。",
      "Flask + Web 前端，Tauri 2.x 正式桌面版双路径分发。",
      "Python 后端经 PyInstaller 打成 sidecar 随桌面应用分发。",
    ],
    stack: ["Flask", "Tauri 2.x", "Rust", "PyInstaller"],
  },
  {
    title: "CommandHub",
    subtitle: "桌面后台命令管理器",
    kind: "桌面应用",
    repo: "https://github.com/Alleyf/CommandHub",
    downloadUrl: "https://github.com/Alleyf/CommandHub/releases/tag/v0.5.0",
    image: "./doc/CommandHub.webp",
    summary: "用一个桌面界面统一管理本地常驻命令、进程状态和日志输出。",
    highlights: [
      "提供命令清单、进程巡视、日志尾部查看和运行状态追踪。",
      "支持自动重启、静默启动、匹配高亮和进程分类聚合。",
      "定位已经接近可长期使用的效率工具。",
    ],
    stack: ["Electron", "React 19", "Vite 7", "Node.js"],
  },
  {
    title: "SwitchCookie",
    subtitle: "浏览器账号切换器（每标签隔离版）",
    kind: "浏览器扩展",
    repo: "https://github.com/Alleyf/SwitchCookie",
    image: "./doc/SwitchCookie.webp",
    summary: "Chrome / Edge MV3 扩展：同一个域名可以在多个标签页里各自登录不同账号，Cookie 与 localStorage 均按标签隔离。",
    highlights: [
      "DNR session rules 按标签改写 Cookie 请求头，Set-Cookie 自动吸收进私有 jar。",
      "完整快照：Cookie（含 HttpOnly）/ localStorage / sessionStorage 一次打包。",
      "主密码保护：PBKDF2-SHA256(250000) 派生密钥 + AES-GCM-256 加密。",
    ],
    stack: ["Chrome MV3", "DNR", "Web Crypto", "Service Worker"],
  },
  {
    title: "MaterialBox",
    subtitle: "本地优先的浏览器素材管理扩展",
    kind: "浏览器扩展",
    repo: "https://github.com/Alleyf/MaterialBox",
    image: "./doc/MaterialBox.webp",
    summary: "从网页中采集图片与视频保存在本地 IndexedDB，结合本地模型做基础智能分类，支持 Chrome 和 Firefox。",
    highlights: [
      "右键保存 + 整页扫描批量收集，低质/广告资源自动过滤。",
      "TensorFlow.js 本地模型智能分类，支持手动纠正持续优化。",
      "图片/视频工作室：裁剪、格式转换、截取；S3 / WebDAV 云端双向同步。",
    ],
    stack: ["Chrome / Firefox 扩展", "IndexedDB", "TensorFlow.js", "S3 / WebDAV"],
  },
  {
    title: "TabMark",
    subtitle: "把收藏夹变成新标签页",
    kind: "浏览器扩展",
    repo: "https://github.com/Alleyf/TabMark-Bookmark-New-Tab",
    demo: "http://www.ainewtab.app",
    image: "./doc/TabMark.webp",
    summary: "让收藏的书签一目了然、整洁高效，快速直达你最需要的网站；搭配智能 AI 搜索，更快找到答案。",
    highlights: [
      "书签拖拽排序 + 树状文件夹视图 + 侧边栏 / 悬浮球快速访问。",
      "AI 智能搜索聚合豆包、Kimi、秘塔等，支持对比搜索一键全开。",
      "暗黑模式 + 壁纸随心换，支持 Chrome / Edge / Firefox。",
    ],
    stack: ["Chrome / Edge / Firefox 扩展", "侧边栏 API", "AI 搜索聚合"],
  },
  {
    title: "Zotero Duplicate Cleaner",
    subtitle: "Zotero 10 文献资源整理插件",
    kind: "Zotero 插件",
    repo: "https://github.com/Alleyf/zotero-duplicate-cleaner",
    image: "./doc/zotero-duplicate-cleaner.webp",
    summary: "帮助 Zotero 用户在确认后处理重复条目、重复 PDF、重复笔记、孤儿 PDF 和失效附件。",
    highlights: [
      "按条目类型、DOI 或完整标题发现候选，优先保留 PDF 可用且元信息完整的条目。",
      "PDF 内容按 SHA-256 本地哈希去重，删除只进回收站可恢复。",
      "资源流图展示来源、判定过程、保留结果和处理去向。",
    ],
    stack: ["Zotero Plugin", "SHA-256", "CrossRef", "GitHub Actions"],
  },
];

export const blogPosts = [
  {
    title: "Kubernetes 入门",
    url: "https://alleyf.github.io/2026/03/21e41440c16d.html",
    date: "2026.03.08",
    tags: ["Kubernetes", "云原生"],
    handle: "alleyf",
    description: "K8s 入门不只是概念清单，这篇更像是把平台视角、核心资源对象和上手流程压缩成了一条技术推文。",
  },
  {
    title: "Spring Cloud Alibaba 微服务原理与实战 - 阅读心得",
    url: "https://alleyf.github.io/2023/11/d1d8bbbe9e18.html",
    date: "2023.11.28",
    tags: ["微服务", "Java"],
    handle: "alleyf",
    description: "围绕服务治理、中间件与微服务协作方式提炼重点，适合呈现系统化技术认知。",
  },
  {
    title: "SpringBoot + Vue 项目实战",
    url: "https://alleyf.github.io/2026/03/0fe45fd783f7.html",
    date: "2026.03.08",
    tags: ["全栈", "项目实战"],
    handle: "alleyf",
    description: "用更短平快的内容形式，展示从接口到前端交互的全链路项目经验。",
  },
  {
    title: "各种环境配置",
    url: "https://alleyf.github.io/2026/03/dcdb2301e296.html",
    date: "2026.03.08",
    tags: ["部署", "运维"],
    handle: "alleyf",
    description: "环境配置如果写得好，本质上就是稳定性与交付效率的保证。",
  },
];

export const contactConfig = {
  email: "alleyf@qq.com",
  inboxEmail: "alleyf@qq.com",
  github: "https://github.com/Alleyf",
  blog: "https://alleyf.github.io/",
  phone: "19223276194",
  location: "中国 · 武汉",
  status: "秋招进行中 · Agent 研发",
  defaultSubject: "纳入人才库，发送offer",
};
