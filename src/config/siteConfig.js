export const resumeDownloadPath = "./resume/20260318_Java开发工程师_范财胜_硕士.pdf";

export const bootLines = [
  "[boot] Loading candidate manifest...",
  "[boot] Loading resume attachment bundle...",
  "[boot] Splitting site into themed experience pages...",
  "[boot] Hydrating profile: 范财胜 / Java Full Stack Engineer",
  "[boot] Type 'start' to enter the resume portal.",
];

export const sectionMenus = [
  { id: "overview", label: "主页" },
  { id: "education", label: "教育背景" },
  { id: "skills", label: "个人技能" },
  { id: "projects", label: "项目经历" },
  { id: "portfolio", label: "作品集" },
  { id: "blog", label: "博客推文" },
  { id: "contact", label: "联系信息" },
];

export const topStats = [
  { label: "主栈", value: "Java / Spring / 微服务" },
  { label: "工程化", value: "Kubernetes / CI/CD / 稳定性治理" },
  { label: "方向", value: "AI Agent / 平台基础设施" },
];

export const digitalIdentity = {
  name: "范财胜",
  role: "Java 全栈工程师 / 平台与基础架构方向",
  fields: [
    { label: "学校", value: "华中科技大学" },
    { label: "学历", value: "硕士在读 · 2027 届" },
    { label: "专业", value: "信息与通信工程" },
    { label: "邮箱", value: "alleyf@qq.com" },
    { label: "博客", value: "alleyf.github.io" },
    { label: "状态", value: "开放展示 / 持续迭代中" },
  ],
};

export const educationList = [
  {
    period: "2024.09 - 2027.06",
    title: "华中科技大学 · 信息与通信工程硕士",
    body: "推荐免试研究生，持续在工程实践和 AI 方向之间寻找更高效的落地路径。",
    chips: ["创“芯”大赛全国三等奖", "研究生一等学业奖学金"],
  },
  {
    period: "2020.09 - 2024.06",
    title: "武汉理工大学 · 通信工程本科",
    body: "专业前 15%，获得保研资格。比赛、奖学金与项目并行推进。",
    chips: ["计算机设计大赛国赛二等奖", "服务外包大赛国赛三等奖", "华为社会奖学金"],
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
    url: "https://jp.liyunol.com",
    description: "面向教育培训的万人并发平台，负责核心后端架构与关键链路开发。",
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
    url: "https://cmis.csdcinfo.cn",
    description: "40 节点私有云平台与业务中枢，承担项目负责人与运维主管职责。",
    bullets: [
      "规划、部署并维护 40 节点私有云基础设施与容器平台。",
      "基于 Kubernetes、Rancher 与 Harbor 建立规范化交付链路。",
      "持续推进性能优化、安全加固与高可用设计。",
    ],
    stack: ["Kubernetes", "Docker", "Rancher", "Harbor", "Nginx", "VMware"],
    color: "green",
  },
  {
    title: "湖北省社会科学项目与奖励申报评审系统（HSAS）",
    status: "Maintain",
    url: "https://hsas.csdcinfo.cn",
    description: "面向全省社科工作者的申报评审平台，负责性能治理与安全加固。",
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
    image: "https://opengraph.githubassets.com/1/Alleyf/Md2Slide",
    summary: "把 Markdown 内容快速转成带演示感和数学表达力的可视化幻灯片。",
    highlights: [
      "实时编辑预览，支持数学公式、代码高亮和媒体嵌入。",
      "支持 click-to-reveal、过渡动画、主题切换与部署链路。",
      "更适合放进内容生产工具型作品集。",
    ],
    stack: ["React", "TypeScript", "Vite", "Remotion"],
  },
  {
    title: "CommandHub",
    subtitle: "桌面后台命令管理器",
    kind: "Desktop",
    repo: "https://github.com/Alleyf/CommandHub",
    image: "https://opengraph.githubassets.com/1/Alleyf/CommandHub",
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
    image: "https://opengraph.githubassets.com/1/Alleyf/pg-design",
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
    image: "https://opengraph.githubassets.com/1/Alleyf/VProOnline",
    summary: "基于 Node.js 的视频处理平台，覆盖上传、压缩、转码、裁剪和下载。",
    highlights: [
      "支持多格式转换、尺寸调整、音频提取和处理结果下载。",
      "后端以 Express + FFmpeg 为核心，体现多媒体处理工程能力。",
      "README 已给出本地启动、Vercel 部署和完整操作流程。",
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
    description: "环境配置如果写得好，本质上就是稳定性与交付效率的浓缩版工程推文。",
  },
];

export const contactConfig = {
  email: "alleyf@qq.com",
  inboxEmail: "alleyf@qq.com",
  github: "https://github.com/Alleyf",
  blog: "https://alleyf.github.io/",
  phone: "13669156253",
  location: "中国 · 武汉",
  status: "开放交流 / 作品集展示中",
  defaultSubject: "来自个人网站的联系",
};
