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
  description: "CsFan的作品化简历网站，聚焦 Java 全栈、微服务、云原生与 AI 工程化。",
  overviewEyebrow: "Flowfolio / Resume OS",
  overviewTitle: "基础简介",
  copyrightRange: "2025-2026",
  copyrightOwner: "CsFan",
  footerTitle: "CsFan · Flowfolio",
  footerNote: "感谢浏览，欢迎通过邮箱、GitHub 或博客进一步了解我的项目与技术沉淀。",
  portfolioPoster: "./doc/poster.webp",
  contribution: "./doc/contribution.png",
};

export const resumeDownloadPath = "./doc/resume.pdf";

export const terminalConfig = {
  prompt: "visitor@recruiter:~$",
  title: "fan@flowfolio:~/resume",
  placeholder: "系统自动进入简历首页",
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
      output: ["start -> 进入简历", "help -> 查看命令", "whoami -> 查看候选人信息", "contact -> 输出联系方式", "clear -> 清屏"],
    },
    {
      name: "whoami",
      description: "查看候选人信息",
      output: ["CsFan / Java 全栈工程师 / 微服务与云原生实践者 / HUST 硕士在读"],
    },
    {
      name: "contact",
      description: "输出联系方式",
      output: ["mail: alleyf@qq.com", "github: https://github.com/Alleyf", "blog: https://alleyf.github.io/"],
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
  "[启动] 正在载入候选人档案：CsFan / Java 全栈工程师",
  "[启动] 简历入口已就绪，即将自动进入首页...",
];

export const sectionMenus = [
  { id: "overview", label: "主页" },
  { id: "education", label: "教育背景" },
  { id: "skills", label: "个人技能" },
  { id: "projects", label: "项目经历" },
  { id: "portfolio", label: "作品矩阵" },
  { id: "blog", label: "博客推文" },
  { id: "contact", label: "联系信息" },
];

export const topStats = [
  { label: "主栈", value: "Java / Spring" },
  { label: "工程化", value: "DevOps / Kubernetes" },
  { label: "方向", value: "AI Agent / AI Infra" },
];

export const digitalIdentity = {
  name: "CsFan",
  role: "Java 全栈工程师 / AI 应用开发工程师",
  avatar: "./doc/avatar.webp",
  avatarFallback: "F",
  fields: [
    { label: "学校", value: "华中科技大学" },
    { label: "学历", value: "硕士" },
    { label: "专业", value: "信息与通信工程" },
    { label: "邮箱", value: "alleyf@qq.com" },
    { label: "博客", value: "alleyf.github.io" },
    { label: "状态", value: "找实习ing" },
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
    body: "推荐免试研究生，持续把通信工程背景和软件工程实践结合，重点关注工程系统设计、平台能力建设与 AI 工具落地。",
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
    chips: ["计算机设计大赛全国二等奖", "服务外包大赛全国三等奖", "华为社会奖学金", "三好学生标兵", "优秀毕业生"],
    details: ["获得科研、竞赛和奖学金等多项荣誉。", "兼顾专业课程、比赛和项目开发，形成了较强的自驱学习与工程实践能力。"],
  },
];

export const personalSkills = [
  {
    title: "后端开发",
    body: "围绕业务系统、平台能力和服务治理搭建稳健的 Java 后端基础。",
    tags: ["Java", "Spring Boot", "Spring Cloud", "MyBatis", "Dubbo"],
  },
  {
    title: "数据与中间件",
    body: "覆盖缓存、消息、搜索和事务协调，兼顾性能与可维护性。",
    tags: ["MySQL", "Redis", "ElasticSearch", "MongoDB", "RocketMQ"],
  },
  {
    title: "云原生与运维",
    body: "从发布、容器平台到可观测性链路，都能完成工程级交付。",
    tags: ["Docker", "Kubernetes", "GitLab CI/CD", "Arthas", "SkyWalking"],
  },
  {
    title: "AI 工程化",
    body: "持续把 Codex、Cursor 等工具纳入真实研发流程，提高交付效率。",
    tags: ["Codex", "Cursor", "OpenClaw", "Vibe Coding"],
  },
];

export const projectExperiences = [
  {
    title: "北师大教育培训管理服务平台（ETMS）",
    status: "Live",
    role: "项目负责人 / 后端研发",
    url: "https://jp.liyunol.com",
    description: "北师大教育培训ToB项目，提供在线学习、项目管理、学情分析等服务，日活1W+，并发5K+。",
    bullets: [
      "基于 Spring Cloud Alibaba 搭建微服务体系，覆盖学习、培训与管理流程。",
      "围绕高并发场景设计缓存、异步解耦和服务治理能力。",
      "推动容器化交付和线上稳定性优化，缩短发布与恢复路径。",
    ],
    stack: ["Spring Cloud Alibaba", "Dubbo", "Redis", "RocketMQ", "Seata", "K8s"],
    color: "cyan",
  },
  {
    title: "中国高校社会科学数据中心（CMIS）",
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
    title: "CommandHub",
    subtitle: "桌面后台命令管理器",
    kind: "Desktop",
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
    title: "PG Design",
    subtitle: "摄影设计项目管理平台",
    kind: "Vertical SaaS",
    repo: "https://github.com/Alleyf/pg-design",
    image: "./doc/PG Design.webp",
    summary: "面向摄影师、设计师和创意团队的项目管理系统，强调垂直业务流程。",
    highlights: [
      "覆盖项目状态、预算分类、客户管理、团队协作和任务推进。",
      "提供灵感与拍摄规划模块，不是泛化 CRUD 页面拼接。",
      "适合展示产品建模和场景化前端设计能力。",
    ],
    stack: ["React", "TypeScript", "Vite", "Tailwind CSS"],
  },
  {
    title: "VProOnline",
    subtitle: "在线视频上传、处理与分享平台",
    kind: "Media Tool",
    repo: "https://github.com/Alleyf/VProOnline",
    image: "./doc/VProOnline.webp",
    summary: "基于 Node.js 的视频处理平台，覆盖上传、压缩、转码、裁剪和下载。",
    highlights: [
      "支持多格式转换、尺寸调整、音频提取和处理结果下载。",
      "后端以 Express + FFmpeg 为核心，体现多媒体处理工程能力。",
      "响应式设计，适配各种设备、支持 Vercel 部署和完整操作流程。",
    ],
    stack: ["Node.js", "Express", "FFmpeg", "HTML/CSS/JS"],
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
  status: "找实习ing",
  defaultSubject: "纳入人才库，发送offer",
};
