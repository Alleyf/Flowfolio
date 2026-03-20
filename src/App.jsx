import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, AppBar, Avatar, Box, Button, Card, CardContent, Chip, Container, Divider, Grid, Stack, TextField, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { RadarChart } from "echarts/charts";
import { LegendComponent, RadarComponent, TooltipComponent } from "echarts/components";
import { init, use as useEcharts } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { ArrowUpRight, BookOpenText, BookMarked, BriefcaseBusiness, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Download, ExternalLink, Github, Globe, GraduationCap, Heart, Mail, MapPinned, Phone, Radar, School, Send, Sparkles, TerminalSquare, Wrench, X } from "lucide-react";
import { blogPosts, bootLines, contactConfig, digitalIdentity, educationList, personalSkills, portfolioWorks, projectExperiences, resumeDownloadPath, sectionMenus, siteMeta, terminalConfig, topStats } from "./config/siteConfig";

useEcharts([RadarChart, RadarComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const SLIDE_TRANSITION_MS = 820;

function HeroScene() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    let disposed = false;
    let cleanup = () => {};

    import("three").then((THREE) => {
      if (disposed) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(56, el.clientWidth / el.clientHeight, 0.1, 1000);
      camera.position.z = 30;
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(el.clientWidth, el.clientHeight);
      el.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      [
        { radius: 8, color: 0x6ef2ff, speed: 0.0026 },
        { radius: 11.5, color: 0x62b6ff, speed: -0.0021 },
        { radius: 15, color: 0x7ff0b0, speed: 0.0016 },
        { radius: 18.5, color: 0xffb865, speed: -0.0012 },
      ].forEach((ring) => {
        const mesh = new THREE.Mesh(
          new THREE.TorusGeometry(ring.radius, 0.05, 24, 160),
          new THREE.MeshBasicMaterial({ color: ring.color, opacity: 0.33, transparent: true }),
        );
        mesh.userData.speed = ring.speed;
        group.add(mesh);
      });

      const points = new Float32Array(1200 * 3);
      for (let i = 0; i < points.length; i += 1) points[i] = (Math.random() - 0.5) * 72;

      const particles = new THREE.BufferGeometry();
      particles.setAttribute("position", new THREE.BufferAttribute(points, 3));

      const dust = new THREE.Points(
        particles,
        new THREE.PointsMaterial({ color: 0xa1f7ff, size: 0.085, transparent: true, opacity: 0.72 }),
      );
      scene.add(dust);

      let mouseX = 0;
      let mouseY = 0;
      let frame;

      const onMove = (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = (event.clientY / window.innerHeight) * 2 - 1;
      };

      const onResize = () => {
        camera.aspect = el.clientWidth / el.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(el.clientWidth, el.clientHeight);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("resize", onResize);

      const animate = () => {
        frame = requestAnimationFrame(animate);
        group.children.forEach((child) => {
          child.rotation.z += child.userData.speed;
        });
        group.rotation.x += ((-mouseY * 0.15) - group.rotation.x) * 0.03;
        group.rotation.y += ((mouseX * 0.18) - group.rotation.y) * 0.03;
        dust.rotation.y += 0.0004;
        renderer.render(scene, camera);
      };

      animate();

      cleanup = () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <Box ref={ref} className="hero-scene" />;
}

function SkillsRadar() {
  const ref = useRef(null);

  useEffect(() => {
    const chart = init(ref.current);
    chart.setOption({
      backgroundColor: "transparent",
      radar: {
        indicator: [
          { name: "后端", max: 5 },
          { name: "数据库", max: 5 },
          { name: "中间件", max: 5 },
          { name: "云原生", max: 5 },
          { name: "前端", max: 5 },
          { name: "AI工程化", max: 5 },
        ],
        shape: "polygon",
        splitNumber: 5,
        radius: "68%",
        axisName: { color: "#dff7ff", fontSize: 12 },
        splitArea: { areaStyle: { color: ["rgba(110,242,255,0.04)", "rgba(110,242,255,0.015)"] } },
        splitLine: { lineStyle: { color: "rgba(110,242,255,0.14)" } },
        axisLine: { lineStyle: { color: "rgba(110,242,255,0.18)" } },
      },
      series: [
        {
          type: "radar",
          data: [
            {
              value: [5, 4, 4, 5, 3, 4],
              areaStyle: { color: "rgba(110,242,255,0.28)" },
              lineStyle: { color: "#6ef2ff", width: 2 },
              itemStyle: { color: "#6ef2ff" },
            },
          ],
        },
      ],
    });

    const resize = () => chart.resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      chart.dispose();
    };
  }, []);

  return <Box ref={ref} sx={{ width: "100%", height: 320 }} />;
}

function SectionShell({ id, eyebrow, title, icon, active, children }) {
  return (
    <motion.section
      id={id}
      className="section-shell"
      initial={false}
      animate={{ opacity: active ? 1 : 0.52, y: active ? 0 : 18 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <Stack spacing={1.1} sx={{ mb: 3 }}>
        <Chip icon={icon} label={eyebrow} variant="outlined" className="section-chip" />
        <Typography variant="h3">{title}</Typography>
      </Stack>
      {children}
    </motion.section>
  );
}

function ContactLine({ icon, label, value, href }) {
  const highlighted = value === "找实习ing";
  const node = (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box className="icon-badge small">{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        {highlighted ? <Box component="span" className="status-highlight">{value}</Box> : <Typography>{value}</Typography>}
      </Box>
    </Stack>
  );

  return href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="contact-link">{node}</a> : node;
}

function CommandHintList() {
  return (
    <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ mt: 2 }}>
      {terminalConfig.commands.map((item) => (
        <Chip key={item.name} label={item.name} size="small" variant="outlined" className="command-chip" />
      ))}
    </Stack>
  );
}

function CarouselNav({ onPrev, onNext }) {
  return (
    <Stack direction="row" spacing={1}>
      <Button variant="outlined" size="small" onClick={onPrev} startIcon={<ChevronLeft size={16} />}>上一项</Button>
      <Button variant="outlined" size="small" onClick={onNext} endIcon={<ChevronRight size={16} />}>下一项</Button>
    </Stack>
  );
}

const highlightTerms = [
  "Spring Cloud Alibaba",
  "微服务体系",
  "高并发",
  "缓存",
  "异步解耦",
  "服务治理",
  "容器化交付",
  "40 节点私有云",
  "Kubernetes",
  "Rancher",
  "Harbor",
  "性能优化",
  "安全加固",
  "Struts + Hibernate",
  "渐进式重构",
];

function HighlightText({ text }) {
  const pattern = new RegExp(`(${highlightTerms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  const termSet = new Set(highlightTerms);
  return text.split(pattern).filter(Boolean).map((part, index) => (
    termSet.has(part)
      ? <Box key={`${part}-${index}`} component="span" className="keyword-highlight">{part}</Box>
      : <Box key={`${part}-${index}`} component="span">{part}</Box>
  ));
}

export default function App() {
  const [terminalText, setTerminalText] = useState("");
  const [command, setCommand] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [terminalHint, setTerminalHint] = useState(terminalConfig.hint);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadedIndexes, setLoadedIndexes] = useState(() => new Set([0, 1]));
  const [flippedProjects, setFlippedProjects] = useState({});
  const [portfolioIndex, setPortfolioIndex] = useState(0);
  const [showPortfolioPoster, setShowPortfolioPoster] = useState(false);
  const [toolboxOpen, setToolboxOpen] = useState(false);
  const [liked, setLiked] = useState(() => (typeof window !== "undefined" ? window.localStorage.getItem("flowfolio-liked") === "true" : false));
  const [bookmarked, setBookmarked] = useState(() => (typeof window !== "undefined" ? window.localStorage.getItem("flowfolio-bookmarked") === "true" : false));
  const [completionState, setCompletionState] = useState({ prefix: "", matches: [], pointer: 0 });
  const [form, setForm] = useState({ name: "", email: "", subject: contactConfig.defaultSubject, message: "" });
  const touchStartY = useRef(null);
  const unlockTimerRef = useRef(null);
  const transitionTimerRef = useRef(null);

  useEffect(() => {
    document.title = siteMeta.pageTitle;
  }, []);

  useEffect(() => {
    window.localStorage.setItem("flowfolio-liked", String(liked));
  }, [liked]);

  useEffect(() => {
    window.localStorage.setItem("flowfolio-bookmarked", String(bookmarked));
  }, [bookmarked]);

  useEffect(() => {
    const image = new Image();
    image.src = siteMeta.portfolioPoster;
  }, []);

  useEffect(() => {
    if (!unlocked || typeof window === "undefined" || typeof window.gtag !== "function") return;

    const currentSection = sectionMenus[activeIndex];
    const pagePath = `/${currentSection.id}`;
    const pageLocation = `${window.location.origin}${window.location.pathname}#${currentSection.id}`;

    if (window.history?.replaceState) {
      window.history.replaceState(null, "", `#${currentSection.id}`);
    }

    window.gtag("event", "page_view", {
      page_title: `${siteMeta.projectName} - ${currentSection.label}`,
      page_path: pagePath,
      page_location: pageLocation,
    });
  }, [activeIndex, unlocked]);

  useEffect(() => {
    let line = 0;
    let char = 0;
    let timer;

    const type = () => {
      if (line >= bootLines.length) return;
      const current = bootLines[line];
      if (char < current.length) {
        setTerminalText((prev) => `${prev}${current.charAt(char)}`);
        char += 1;
        timer = window.setTimeout(type, 15);
        return;
      }
      setTerminalText((prev) => `${prev}\n`);
      line += 1;
      char = 0;
      if (line >= bootLines.length) {
        timer = window.setTimeout(() => {
          preloadAround(0);
          setUnlocked(true);
        }, 700);
        return;
      }
      timer = window.setTimeout(type, 110);
    };

    type();
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => () => {
    window.clearTimeout(unlockTimerRef.current);
    window.clearTimeout(transitionTimerRef.current);
  }, []);

  const portfolioSectionIndex = sectionMenus.findIndex((item) => item.id === "portfolio");

  useEffect(() => {
    setShowPortfolioPoster(activeIndex === portfolioSectionIndex);
  }, [activeIndex, portfolioSectionIndex]);

  const preloadAround = (index) => {
    setLoadedIndexes((current) => {
      const next = new Set(current);
      [index - 1, index, index + 1].forEach((item) => {
        if (item >= 0 && item < sectionMenus.length) next.add(item);
      });
      return next;
    });
  };

  const navigateTo = (nextIndex) => {
    if (!unlocked || isTransitioning) return;
    if (nextIndex < 0 || nextIndex >= sectionMenus.length || nextIndex === activeIndex) return;

    preloadAround(nextIndex);
    setToolboxOpen(false);
    setIsTransitioning(true);
    setActiveIndex(nextIndex);
    transitionTimerRef.current = window.setTimeout(() => setIsTransitioning(false), SLIDE_TRANSITION_MS);
  };

  const canSectionScroll = (section, direction) => {
    if (!section) return false;
    if (direction > 0) return section.scrollTop + section.clientHeight < section.scrollHeight - 2;
    return section.scrollTop > 2;
  };

  useEffect(() => {
    if (!unlocked) return undefined;

    const onWheel = (event) => {
      if (Math.abs(event.deltaY) < 28 || isTransitioning) return;
      const section = event.target instanceof Element ? event.target.closest(".section-shell") : null;
      const direction = event.deltaY > 0 ? 1 : -1;
      if (canSectionScroll(section, direction)) return;
      event.preventDefault();
      navigateTo(activeIndex + direction);
    };

    const onKeyDown = (event) => {
      if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        navigateTo(activeIndex + 1);
      } else if (["ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault();
        navigateTo(activeIndex - 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        navigateTo(0);
      } else if (event.key === "End") {
        event.preventDefault();
        navigateTo(sectionMenus.length - 1);
      }
    };

    const onTouchStart = (event) => {
      touchStartY.current = event.touches[0]?.clientY ?? null;
    };

    const onTouchEnd = (event) => {
      if (touchStartY.current == null) return;
      const deltaY = touchStartY.current - (event.changedTouches[0]?.clientY ?? touchStartY.current);
      if (Math.abs(deltaY) > 50) navigateTo(activeIndex + (deltaY > 0 ? 1 : -1));
      touchStartY.current = null;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [activeIndex, isTransitioning, unlocked]);

  const terminalCommandMap = useMemo(
    () => Object.fromEntries(terminalConfig.commands.map((item) => [item.name, item])),
    [],
  );

  const appendTerminalLines = (prefix, lines) => {
    const content = lines.length ? `${lines.join("\n")}\n` : "";
    setTerminalText((prev) => `${prev}${prefix}${content}`);
  };

  const runCommand = () => {
    const raw = command.trim().toLowerCase();
    const prefix = `${terminalConfig.prompt} ${command}\n`;

    if (!raw) {
      setTerminalText((prev) => `${prev}${prefix}`);
      return;
    }

    const matched = terminalCommandMap[raw];

    if (!matched) {
      setTerminalText((prev) => `${prev}${prefix}command not found: ${raw}\n`);
      setTerminalHint("命令不存在，按 Tab 自动补全或输入 help 查看。");
      setCommand("");
      setCompletionState({ prefix: "", matches: [], pointer: 0 });
      return;
    }

    if (matched.action === "clear") {
      setTerminalText("");
      setTerminalHint("终端已清空。");
    } else {
      appendTerminalLines(prefix, matched.output ?? []);
      if (matched.name === "help") setTerminalHint("已输出所有可用命令。");
      if (matched.name === "whoami") setTerminalHint("候选人摘要已输出。");
      if (matched.name === "contact") setTerminalHint("联系方式已输出。");
      if (matched.action === "unlock") {
        setTerminalHint("正在进入 Flowfolio。");
        unlockTimerRef.current = window.setTimeout(() => {
          preloadAround(0);
          setUnlocked(true);
        }, 500);
      }
    }

    setCommand("");
    setCompletionState({ prefix: "", matches: [], pointer: 0 });
  };

  const handleTerminalTab = () => {
    const prefix = command.trim().toLowerCase();
    const available = terminalConfig.commands.map((item) => item.name);

    if (completionState.prefix === prefix && completionState.matches.length > 0) {
      const nextPointer = (completionState.pointer + 1) % completionState.matches.length;
      const nextValue = completionState.matches[nextPointer];
      setCompletionState((current) => ({ ...current, pointer: nextPointer }));
      setCommand(nextValue);
      setTerminalHint(`Tab 补全：${completionState.matches.join(" / ")}`);
      return;
    }

    const matches = available.filter((item) => item.startsWith(prefix));
    if (!matches.length) {
      setTerminalHint("没有可补全的命令。");
      return;
    }

    setCommand(matches[0]);
    setCompletionState({ prefix, matches, pointer: 0 });
    setTerminalHint(`Tab 补全：${matches.join(" / ")}`);
  };

  const sendMessage = () => {
    const subject = encodeURIComponent(form.subject || contactConfig.defaultSubject);
    const body = encodeURIComponent(`姓名：${form.name || "未填写"}\n访客邮箱：${form.email || "未填写"}\n\n${form.message || ""}`);
    window.location.href = `mailto:${contactConfig.inboxEmail}?subject=${subject}&body=${body}`;
  };

  const handleBookmark = async () => {
    const currentSection = sectionMenus[activeIndex];
    const url = `${window.location.origin}${window.location.pathname}#${currentSection.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {}
    setBookmarked((current) => !current);
    setToolboxOpen(false);
  };

  const sectionNodes = [
    {
      id: "overview",
      eyebrow: siteMeta.overviewEyebrow,
      title: siteMeta.overviewTitle,
      icon: <TerminalSquare size={18} />,
      render: () => (
        <Grid container spacing={3} alignItems="stretch">
          <Grid size={{ xs: 12, md: 7 }}>
            <Chip icon={<TerminalSquare size={16} />} label="SYSTEM ONLINE / DIGITAL IDENTITY" className="hero-chip" />
            <Typography variant="h1" sx={{ mt: 2, mb: 2, fontSize: { xs: 42, md: 84 } }}>CsFan</Typography>
            <Typography className="hero-subtitle">Java 全栈工程师 / 微服务架构实践者 / 云原生与 AI 工程化探索者</Typography>
            <Typography className="hero-copy" sx={{ mt: 3 }}>
              聚焦高并发后端、微服务架构、云原生交付和工程效率提升，持续把平台能力建设与真实业务场景结合，输出可长期复用的系统能力。
            </Typography>
            <CommandHintList />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4 }}>
              <Button variant="contained" size="large" onClick={() => navigateTo(3)} startIcon={<BriefcaseBusiness size={18} />}>查看项目经历</Button>
              <Button variant="outlined" size="large" onClick={() => navigateTo(4)} startIcon={<Sparkles size={18} />}>浏览作品矩阵</Button>
            </Stack>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {topStats.map((item) => (
                <Grid key={item.label} size={{ xs: 12, sm: 4 }}>
                  <Card className="glass-card info-card">
                    <CardContent>
                      <Typography variant="overline">{item.label}</Typography>
                      <Typography variant="body1" className="strong-text" sx={{ mt: 0.5 }}>{item.value}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card className="glass-card identity-panel">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="overline">Digital Identity</Typography>
                    <Typography variant="h5">数字身份证</Typography>
                  </Box>
                  <Chip label="VERIFIED" color="primary" />
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={digitalIdentity.avatar || undefined} className="avatar-badge">{digitalIdentity.avatarFallback}</Avatar>
                  <Box>
                    <Typography variant="h6">{digitalIdentity.name}</Typography>
                    <Typography color="text.secondary">{digitalIdentity.role}</Typography>
                  </Box>
                </Stack>
                <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.08)" }} />
                <Stack spacing={1.5}>
                  {digitalIdentity.fields.map((field) => (
                    <Box key={field.label} className="metric-row">
                      <Typography color="text.secondary">{field.label}</Typography>
                      {field.value === "找实习ing" ? <Box component="span" className="status-highlight">{field.value}</Box> : <Typography>{field.value}</Typography>}
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ),
    },
    {
      id: "education",
      eyebrow: "Education",
      title: "教育背景",
      icon: <School size={18} />,
      render: () => (
        <Box className="education-timeline">
          {educationList.map((item) => (
            <Box key={item.title} className="education-node">
              <Box className="education-axis">
                <Typography className="period-label education-period">{item.period}</Typography>
                <Box className="education-dot" />
                <Box className="education-line" />
              </Box>
              <Card className="glass-card timeline-card education-card">
                <CardContent>
                  <Typography variant="h5">{item.title}</Typography>
                  <Typography color="text.secondary" sx={{ mt: 1.5 }}>{item.body}</Typography>
                  <Stack component="ul" spacing={1.1} className="bullet-list compact">
                    {item.details?.map((detail) => <Typography component="li" key={detail} color="text.secondary">{detail}</Typography>)}
                  </Stack>
                  <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ mt: 2.5 }}>
                    {item.chips.map((chip) => <Chip key={chip} label={chip} variant="outlined" />)}
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      ),
    },
    {
      id: "skills",
      eyebrow: "Skills",
      title: "个人技能",
      icon: <Radar size={18} />,
      render: () => (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card className="glass-card" sx={{ height: "100%" }}>
              <CardContent><SkillsRadar /></CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Grid container spacing={2}>
              {personalSkills.map((item) => (
                <Grid key={item.title} size={{ xs: 12, sm: 6 }}>
                  <Card className="glass-card skill-card">
                    <CardContent>
                      <Typography variant="h6">{item.title}</Typography>
                      <Typography color="text.secondary" sx={{ mt: 1 }}>{item.body}</Typography>
                      <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ mt: 2 }}>
                        {item.tags.map((tag) => <Chip key={tag} label={tag} size="small" />)}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      ),
    },
    {
      id: "projects",
      eyebrow: "Project Experience",
      title: "项目经历",
      icon: <BriefcaseBusiness size={18} />,
      render: () => (
        <Grid container spacing={2.5}>
          {projectExperiences.map((project) => {
            const flipped = !!flippedProjects[project.title];
            return (
              <Grid key={project.title} size={{ xs: 12, md: 4 }}>
                <Box className="flip-card" onClick={() => setFlippedProjects((current) => ({ ...current, [project.title]: !current[project.title] }))}>
                  <Box className={flipped ? "flip-card-inner is-flipped" : "flip-card-inner"}>
                    <Card className={`glass-card project-face project-front ${project.color}`}>
                      <CardContent>
                        <Typography variant="overline">项目介绍 / 我的角色</Typography>
                        <Typography variant="h5" sx={{ mt: 1.5 }}>{project.title}</Typography>
                        <Box className="flip-tip-badge">点击卡片翻转查看职责亮点</Box>
                        <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                          <HighlightText text={project.description} />
                        </Typography>
                        <Box className="project-role-panel">
                          <Typography className="project-detail-title">我的角色</Typography>
                          <Typography color="text.secondary" className="project-detail-copy">{project.role}</Typography>
                        </Box>
                        <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
                          <Chip label={project.status} size="small" />
                          <Chip label={project.role} size="small" variant="outlined" />
                        </Stack>
                      </CardContent>
                    </Card>
                    <Card className={`glass-card project-face project-back ${project.color}`}>
                      <CardContent>
                        <Typography variant="overline">职责亮点 / Tech Stack</Typography>
                        <Stack component="ul" spacing={1.2} className="bullet-list compact">
                          {project.bullets.map((bullet) => (
                            <Typography component="li" key={bullet} color="text.secondary">
                              <HighlightText text={bullet} />
                            </Typography>
                          ))}
                        </Stack>
                        <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ mt: 2 }}>
                          {project.stack.map((item) => <Chip key={item} label={item} size="small" variant="outlined" />)}
                        </Stack>
                        <Button href={project.url} target="_blank" rel="noreferrer" endIcon={<ArrowUpRight size={16} />} sx={{ mt: 2.5 }} onClick={(event) => event.stopPropagation()}>访问项目</Button>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      ),
    },
    {
      id: "portfolio",
      eyebrow: "Portfolio Feed",
      title: "作品矩阵",
      icon: <Sparkles size={18} />,
      render: () => {
        const work = portfolioWorks[portfolioIndex];
        return (
          <Stack spacing={2.5}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2}>
              <Typography color="text.secondary">代码赋予灵魂---灵感化为现实</Typography>
              <CarouselNav
                onPrev={() => setPortfolioIndex((current) => (current - 1 + portfolioWorks.length) % portfolioWorks.length)}
                onNext={() => setPortfolioIndex((current) => (current + 1) % portfolioWorks.length)}
              />
            </Stack>
            <motion.article key={work.title} initial={{ opacity: 0, x: 44 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, ease: "easeOut" }}>
              <Card className="glass-card portfolio-card">
                <Grid container>
                  <Grid size={{ xs: 12, md: 7 }}>
                    <img src={work.image} alt={work.title} loading="lazy" className="portfolio-image portfolio-image-large" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <CardContent className="portfolio-content">
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                        <Box>
                          <Typography variant="h4">{work.title}</Typography>
                          <Typography color="text.secondary">{work.subtitle}</Typography>
                        </Box>
                        <Chip label={work.kind} size="small" />
                      </Stack>
                      <Typography color="text.secondary" sx={{ mt: 1.6 }}>{work.summary}</Typography>
                      <Stack component="ul" spacing={1.1} className="bullet-list compact">
                        {work.highlights.map((item) => <Typography component="li" key={item} color="text.secondary">{item}</Typography>)}
                      </Stack>
                      <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ mt: 2 }}>
                        {work.stack.map((tag) => <Chip key={tag} label={tag} size="small" variant="outlined" />)}
                      </Stack>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2.5 }}>
                        <Button href={work.repo} target="_blank" rel="noreferrer" endIcon={<Github size={16} />}>GitHub</Button>
                        {work.demo && <Button href={work.demo} target="_blank" rel="noreferrer" endIcon={<ExternalLink size={16} />}>在线演示</Button>}
                      </Stack>
                    </CardContent>
                  </Grid>
                </Grid>
              </Card>
            </motion.article>
            <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1}>
              {portfolioWorks.map((item, index) => (
                <Chip key={item.title} label={item.title} onClick={() => setPortfolioIndex(index)} className={index === portfolioIndex ? "portfolio-chip active" : "portfolio-chip"} />
              ))}
            </Stack>
          </Stack>
        );
      },
    },
    {
      id: "blog",
      eyebrow: "Blog Tweets",
      title: "博客推文",
      icon: <BookOpenText size={18} />,
      render: () => (
        <Grid container spacing={2.5}>
          {blogPosts.map((post) => (
            <Grid key={post.title} size={{ xs: 12, md: 6 }}>
              <Card className="glass-card tweet-card">
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar src={digitalIdentity.avatar || undefined} className="tweet-avatar">{digitalIdentity.avatarFallback}</Avatar>
                      <Box>
                        <Typography variant="body1">CsFan</Typography>
                        <Typography variant="caption" color="text.secondary">@{post.handle}</Typography>
                      </Box>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">{post.date}</Typography>
                  </Stack>
                  <Typography sx={{ mt: 2, lineHeight: 1.9 }}>{post.description}</Typography>
                  <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ mt: 2 }}>
                    {post.tags.map((tag) => <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" />)}
                  </Stack>
                  <Button href={post.url} target="_blank" sx={{ mt: 2 }} rel="noreferrer" endIcon={<ExternalLink size={16} />}>阅读原文</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ),
    },
    {
      id: "contact",
      eyebrow: "Contact",
      title: "联系信息",
      icon: <Mail size={18} />,
      render: () => (
        <Stack spacing={3}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card className="glass-card about-card">
                <CardContent>
                  <Stack spacing={2.2}>
                    <ContactLine icon={<Mail size={18} />} label="邮箱" value={contactConfig.email} href={`mailto:${contactConfig.email}`} />
                    <ContactLine icon={<Github size={18} />} label="GitHub" value={contactConfig.github} href={contactConfig.github} />
                    <ContactLine icon={<Globe size={18} />} label="博客" value={contactConfig.blog} href={contactConfig.blog} />
                    <ContactLine icon={<Phone size={18} />} label="电话" value={contactConfig.phone || "未公开"} />
                    <ContactLine icon={<MapPinned size={18} />} label="所在地" value={contactConfig.location} />
                    <ContactLine icon={<GraduationCap size={18} />} label="当前状态" value={contactConfig.status} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card className="glass-card contact-card">
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>直接发送消息</Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>欢迎直接留下你的联系方式与沟通意向，我会通过邮件尽快回复。</Typography>
                  <Stack spacing={2}>
                    <TextField label="你的姓名" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} fullWidth />
                    <TextField label="你的邮箱" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} fullWidth />
                    <TextField label="邮件主题" value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} fullWidth />
                    <TextField label="消息内容" multiline minRows={5} value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} fullWidth />
                    <Button variant="contained" startIcon={<Send size={18} />} onClick={sendMessage}>发送消息到 {contactConfig.inboxEmail}</Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Box className="site-copyright">
            <Typography variant="caption" color="text.secondary">
              © {siteMeta.copyrightRange} {siteMeta.copyrightOwner}. All rights reserved.
              <Box component="span" id="busuanzi_container_site_pv" className="site-counter">
                {" · "}PV <Box component="span" id="busuanzi_value_site_pv" />
              </Box>
              <Box component="span" id="busuanzi_container_site_uv" className="site-counter">
                {" · "}UV <Box component="span" id="busuanzi_value_site_uv" />
              </Box>
            </Typography>
          </Box>
        </Stack>
      ),
    },
  ];

  return (
    <Box className="app-shell">
      {!unlocked && (
        <Box className="terminal-overlay">
          <motion.div className="terminal-window" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <Box className="terminal-head">
              <Box className="window-dots"><span className="dot red" /><span className="dot yellow" /><span className="dot green" /></Box>
              <Typography className="terminal-title">{terminalConfig.title}</Typography>
            </Box>
            <Box className="terminal-body">
              <Typography component="pre" className="terminal-output">{terminalText}</Typography>
              <Alert severity="info" variant="outlined" className="terminal-alert">系统启动完成后将自动进入首页。</Alert>
            </Box>
          </motion.div>
        </Box>
      )}
      <AppBar position="fixed" color="transparent" elevation={0} className="site-nav">
        <Box className="toolbar">
          <Box>
            <Typography variant="h6" className="brand">{siteMeta.brand}<span>{siteMeta.brandAccent}</span></Typography>
            <Typography variant="caption" color="text.secondary">Flow-driven portfolio resume</Typography>
          </Box>
          <Stack direction="row" spacing={1} className="nav-actions">
            {sectionMenus.map((menu, index) => (
              <Button key={menu.id} onClick={() => navigateTo(index)} color={activeIndex === index ? "primary" : "inherit"} className={activeIndex === index ? "nav-button-active" : ""}>
                {menu.label}
              </Button>
            ))}
            <Button href={resumeDownloadPath} download variant="contained" startIcon={<Download size={18} />}>下载简历</Button>
          </Stack>
        </Box>
      </AppBar>

      <Box className="page-glow" />
      <HeroScene />

      <AnimatePresence>
        {unlocked && activeIndex === portfolioSectionIndex && showPortfolioPoster && (
          <motion.div className="poster-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPortfolioPoster(false)}>
            <motion.div
              className="poster-modal-shell"
              initial={{ opacity: 0, scale: 0.88, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ duration: 0.42, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
            >
              <Button className="poster-close" variant="outlined" onClick={() => setShowPortfolioPoster(false)} startIcon={<X size={16} />}>
                关闭海报
              </Button>
              <Card className="glass-card portfolio-poster-card">
                <img src={siteMeta.portfolioPoster} alt="作品矩阵总览海报" className="portfolio-poster-image" />
                <CardContent>
                  <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={1.5}>
                    <Box>
                      <Typography variant="h5">作品矩阵总览海报</Typography>
                      <Typography color="text.secondary">点击空白处或关闭按钮后，进入作品矩阵详细浏览。</Typography>
                    </Box>
                    <Button href={siteMeta.portfolioPoster} target="_blank" rel="noreferrer" endIcon={<ExternalLink size={16} />}>查看大图</Button>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {unlocked && (
        <>
          <Box className="scroll-indicator-rail">
            {sectionMenus.map((menu, index) => (
              <button key={menu.id} type="button" onClick={() => navigateTo(index)} className={activeIndex === index ? "rail-dot active" : "rail-dot"} aria-label={menu.label} />
            ))}
          </Box>

          <Box className="slide-status">
            <Chip label={`第 ${activeIndex + 1} / ${sectionMenus.length} 页`} className="status-chip" />
            <Typography variant="caption" color="text.secondary">{isTransitioning ? "正在切换页面..." : "滚轮 / 方向键 / 触控切换"}</Typography>
          </Box>

          <Box className="slides-viewport">
            <Box className="slides-track" sx={{ transform: `translate3d(0, -${activeIndex * 100}vh, 0)` }}>
              {sectionNodes.map((section, index) => (
                <Box key={section.id} className="slide-shell">
                  <Container maxWidth="lg" className="slide-frame">
                    {loadedIndexes.has(index) ? (
                      <SectionShell id={section.id} eyebrow={section.eyebrow} title={section.title} icon={section.icon} active={activeIndex === index}>
                        {section.render()}
                      </SectionShell>
                    ) : (
                      <Card className="glass-card loading-card">
                        <CardContent>
                          <Typography variant="overline">Lazy Section</Typography>
                          <Typography variant="h4" sx={{ mt: 1.5 }}>内容加载中</Typography>
                          <Typography color="text.secondary" sx={{ mt: 1.5 }}>请继续浏览下一屏内容。</Typography>
                        </CardContent>
                      </Card>
                    )}
                  </Container>
                </Box>
              ))}
            </Box>
          </Box>

          <Box className={toolboxOpen ? "floating-toolbox open" : "floating-toolbox"}>
            <AnimatePresence>
              {toolboxOpen && (
                <motion.div className="floating-toolbox-panel" initial={{ opacity: 0, y: 14, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.94 }} transition={{ duration: 0.2 }}>
                  <Button className="toolbox-action" variant="outlined" onClick={() => navigateTo(0)} aria-label="回到顶部" title="回到顶部">
                    <ChevronUp size={18} />
                  </Button>
                  <Button className="toolbox-action" variant="outlined" onClick={() => navigateTo(Math.min(activeIndex + 1, sectionMenus.length - 1))} aria-label="下一页" title="下一页">
                    <ChevronDown size={18} />
                  </Button>
                  <Button className={liked ? "toolbox-action active-like" : "toolbox-action"} variant="outlined" onClick={() => setLiked((current) => !current)} aria-label={liked ? "取消点赞" : "点赞"} title={liked ? "取消点赞" : "点赞"}>
                    <Heart size={18} fill={liked ? "currentColor" : "none"} />
                  </Button>
                  <Button className={bookmarked ? "toolbox-action active-bookmark" : "toolbox-action"} variant="outlined" onClick={handleBookmark} aria-label={bookmarked ? "取消收藏" : "收藏为书签"} title={bookmarked ? "取消收藏" : "收藏为书签"}>
                    <BookMarked size={18} />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <Button className="toolbox-trigger" variant="contained" onClick={() => setToolboxOpen((current) => !current)} aria-label={toolboxOpen ? "收起工具箱" : "打开工具箱"} title={toolboxOpen ? "收起工具箱" : "打开工具箱"}>
              <Wrench size={18} />
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
