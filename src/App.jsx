import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, AppBar, Avatar, Box, Button, Card, CardContent, Chip, Container, Divider, Grid, Stack, TextField, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { RadarChart } from "echarts/charts";
import { LegendComponent, RadarComponent, TooltipComponent } from "echarts/components";
import { init, use as useEcharts } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { ArrowUpRight, BookOpenText, BriefcaseBusiness, Camera, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Download, ExternalLink, Github, Globe, GraduationCap, Heart, Mail, MapPinned, MonitorCog, MoonStar, Phone, Radar, School, Send, Share2, Sparkles, Sun, TerminalSquare, Wrench, X } from "lucide-react";
import { blogPosts, bootLines, contactConfig, digitalIdentity, educationList, personalSkills, portfolioWorks, projectExperiences, resumeDownloadPath, sectionMenus, siteMeta, terminalConfig, topStats } from "./config/siteConfig";

useEcharts([RadarChart, RadarComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const SLIDE_TRANSITION_MS = 820;
const PUBLIC_BASE_URL = (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/");

const artPhotoModules = import.meta.glob("../public/art/**/*.webp");

const artPhotoCategoryMap = Object.keys(artPhotoModules).reduce((accumulator, path) => {
  const matched = path.match(/\/art\/([^/]+)\/[^/]+$/);
  if (!matched) return accumulator;
  const category = decodeURIComponent(matched[1]);
  if (!accumulator[category]) accumulator[category] = [];
  accumulator[category].push(`${PUBLIC_BASE_URL}${path.replace("../public/", "")}`);
  return accumulator;
}, {});

const artPhotoCategories = Object.entries(artPhotoCategoryMap)
  .map(([name, photos]) => ({
    name,
    photos: photos.sort((left, right) => left.localeCompare(right, "zh-CN")),
  }))
  .sort((left, right) => left.name.localeCompare(right.name, "zh-CN"));

function normalizeArtCategoryName(name) {
  return name.replace(/[-_]+/g, " ").trim();
}

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

  const resolveRadarPalette = () => {
    if (typeof document === "undefined") {
      return {
        axisNameColor: "#dff7ff",
        splitAreaColors: ["rgba(110,242,255,0.04)", "rgba(110,242,255,0.015)"],
        splitLineColor: "rgba(110,242,255,0.14)",
        axisLineColor: "rgba(110,242,255,0.18)",
      };
    }

    const theme = document.documentElement.getAttribute("data-theme") || "dark";
    if (theme === "light") {
      return {
        axisNameColor: "#1f476a",
        splitAreaColors: ["rgba(63,132,184,0.13)", "rgba(63,132,184,0.05)"],
        splitLineColor: "rgba(37,95,140,0.35)",
        axisLineColor: "rgba(37,95,140,0.4)",
      };
    }

    return {
      axisNameColor: "#dff7ff",
      splitAreaColors: ["rgba(110,242,255,0.04)", "rgba(110,242,255,0.015)"],
      splitLineColor: "rgba(110,242,255,0.14)",
      axisLineColor: "rgba(110,242,255,0.18)",
    };
  };

  useEffect(() => {
    const chart = init(ref.current);
    const palette = resolveRadarPalette();
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
        axisName: { color: palette.axisNameColor, fontSize: 12 },
        splitArea: { areaStyle: { color: palette.splitAreaColors } },
        splitLine: { lineStyle: { color: palette.splitLineColor } },
        axisLine: { lineStyle: { color: palette.axisLineColor } },
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
    const onThemeChange = () => {
      const nextPalette = resolveRadarPalette();
      chart.setOption({
        radar: {
          axisName: { color: nextPalette.axisNameColor, fontSize: 12 },
          splitArea: { areaStyle: { color: nextPalette.splitAreaColors } },
          splitLine: { lineStyle: { color: nextPalette.splitLineColor } },
          axisLine: { lineStyle: { color: nextPalette.axisLineColor } },
        },
      });
    };

    window.addEventListener("resize", resize);
    window.addEventListener("flowfolio-theme-change", onThemeChange);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("flowfolio-theme-change", onThemeChange);
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

const artCopyPool = [
  "光线不是背景，它是情绪的旁白。",
  "每一次快门，都是和时间短暂握手。",
  "城市在夜里更诚实，影子会替人说话。",
  "风景不止在远方，也在你停下来的那一秒。",
  "有些颜色会发声，只是需要慢一点看。",
  "镜头收集的不是画面，是当天的呼吸。",
  "当构图安静下来，故事就开始流动。",
  "照片会老去，但被看见的瞬间不会。",
  "光从边缘进入，记忆从细节开始。",
  "按下快门前，我先听见了画面的节奏。",
  "把噪点留下来，像给夜色留一段证词。",
  "当人群走散，街角才开始发光。",
  "焦外是沉默，焦内是回答。",
  "远处的灯，不是目的地，是方向感。",
  "有些瞬间不属于构图，只属于直觉。",
  "风吹过来时，画面会自己站稳。",
  "光影交叠的地方，最容易长出故事。",
  "我把日常拍成了证据，把证据拍成了诗。",
  "快门闭合的一刻，世界短暂地同意了我。",
  "颜色先抵达情绪，然后才抵达眼睛。",
  "比清晰更重要的，是这张照片想说什么。",
  "每一帧都在提醒我：生活值得被认真看见。",
  "镜头不是窗口，是与世界谈判的方式。",
  "画面边缘的留白，刚好容纳想象。",
  "我追逐的不是风景，是风景里的呼吸。",
  "当光落在脸上，时间就有了形状。",
  "拍摄让瞬间慢下来，也让记忆更准确。",
  "你看到的是照片，我看到的是当时的温度。",
  "每次对焦，都是一次选择与舍弃。",
  "镜头向外，心却在向内生长。",
];

const artCuratorMetaPool = [
  "Curator Note",
  "Light Study",
  "Street Archive",
  "Color Field",
  "Silent Frame",
  "Moment Record",
];

const ART_INITIAL_VISIBLE_COUNT = 6;

function HighlightText({ text }) {
  const pattern = new RegExp(`(${highlightTerms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  const termSet = new Set(highlightTerms);
  return text.split(pattern).filter(Boolean).map((part, index) => (
    termSet.has(part)
      ? <Box key={`${part}-${index}`} component="span" className="keyword-highlight">{part}</Box>
      : <Box key={`${part}-${index}`} component="span">{part}</Box>
  ));
}

function getProjectStatusClass(status) {
  const normalized = status.toLowerCase();
  if (normalized === "live") return "project-status-chip live";
  if (normalized === "stable") return "project-status-chip stable";
  if (normalized === "maintain") return "project-status-chip maintain";
  return "project-status-chip";
}

export default function App() {
  const [terminalText, setTerminalText] = useState("");
  const [command, setCommand] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [terminalHint, setTerminalHint] = useState(terminalConfig.hint);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadedIndexes, setLoadedIndexes] = useState(() => new Set([0]));
  const [flippedProjects, setFlippedProjects] = useState({});
  const [portfolioIndex, setPortfolioIndex] = useState(0);
  const [portfolioMode, setPortfolioMode] = useState("works");
  const [artCategoryIndex, setArtCategoryIndex] = useState(0);
  const [artPhotoIndex, setArtPhotoIndex] = useState(0);
  const [artVisibleCount, setArtVisibleCount] = useState(ART_INITIAL_VISIBLE_COUNT);
  const [artCopy, setArtCopy] = useState(artCopyPool[0]);
  const [showPortfolioPoster, setShowPortfolioPoster] = useState(false);
  const [toolboxOpen, setToolboxOpen] = useState(false);
  const [liked, setLiked] = useState(() => (typeof window !== "undefined" ? window.localStorage.getItem("flowfolio-liked") === "true" : false));
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [sharePosterPreview, setSharePosterPreview] = useState(null);
  const [sharePosterGeneratedAt, setSharePosterGeneratedAt] = useState("");
  const [showPosterGeneratingModal, setShowPosterGeneratingModal] = useState(false);
  const [busuanziStats, setBusuanziStats] = useState({ pv: "--", uv: "--" });
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window === "undefined") return "dark";
    const saved = window.localStorage.getItem("flowfolio-theme-mode");
    return saved === "light" || saved === "dark" || saved === "system" ? saved : "dark";
  });
  const [systemTheme, setSystemTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [completionState, setCompletionState] = useState({ prefix: "", matches: [], pointer: 0 });
  const [form, setForm] = useState({ name: "", email: "", subject: contactConfig.defaultSubject, message: "" });
  const touchStartY = useRef(null);
  const touchStartSection = useRef(null);
  const artHoverRafRef = useRef(null);
  const toolboxRef = useRef(null);
  const unlockTimerRef = useRef(null);
  const transitionTimerRef = useRef(null);
  const portfolioSectionIndex = sectionMenus.findIndex((item) => item.id === "portfolio");
  const skillsSectionIndex = sectionMenus.findIndex((item) => item.id === "skills");
  const projectsSectionIndex = sectionMenus.findIndex((item) => item.id === "projects");
  const blogSectionIndex = sectionMenus.findIndex((item) => item.id === "blog");

  useEffect(() => {
    document.title = siteMeta.pageTitle;
  }, []);

  useEffect(() => {
    window.localStorage.setItem("flowfolio-liked", String(liked));
  }, [liked]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("flowfolio-theme-mode", themeMode);
  }, [themeMode]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemTheme = () => {
      setSystemTheme(media.matches ? "dark" : "light");
    };

    handleSystemTheme();
    media.addEventListener("change", handleSystemTheme);
    return () => media.removeEventListener("change", handleSystemTheme);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const resolvedTheme = themeMode === "system" ? systemTheme : themeMode;
    document.documentElement.setAttribute("data-theme", resolvedTheme);
    document.documentElement.setAttribute("data-theme-mode", themeMode);
    window.dispatchEvent(new Event("flowfolio-theme-change"));
  }, [systemTheme, themeMode]);

  useEffect(() => {
    if (!unlocked || activeIndex < Math.max(1, portfolioSectionIndex - 1)) return;
    const image = new Image();
    image.src = siteMeta.portfolioPoster;
  }, [activeIndex, portfolioSectionIndex, unlocked]);

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
    if (!unlocked || typeof window === "undefined") return undefined;

    const onEscapeCloseModal = (event) => {
      if (event.key !== "Escape") return;
      if (showPosterGeneratingModal) {
        setShowPosterGeneratingModal(false);
      }
      if (sharePosterPreview) {
        closeSharePosterPreview();
      }
      if (showPortfolioPoster) {
        setShowPortfolioPoster(false);
      }
    };

    window.addEventListener("keydown", onEscapeCloseModal);
    return () => window.removeEventListener("keydown", onEscapeCloseModal);
  }, [sharePosterPreview, showPortfolioPoster, showPosterGeneratingModal, unlocked]);

  useEffect(() => {
    if (!unlocked || typeof window === "undefined") return undefined;

    let disposed = false;
    const refreshBusuanzi = async () => {
      try {
        const url = `${window.location.origin}${window.location.pathname}`;
        const response = await fetch("https://cdn.busuanzi.cc/api.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, referrer: document.referrer || "" }),
        });
        if (!response.ok) throw new Error(`busuanzi http ${response.status}`);
        const data = await response.json();

        if (disposed) return;
        const pvValue = data.busuanzi_site_pv ?? data.busuanzi_value_site_pv;
        const uvValue = data.busuanzi_site_uv ?? data.busuanzi_value_site_uv;
        const next = {
          pv: pvValue != null ? String(pvValue) : "--",
          uv: uvValue != null ? String(uvValue) : "--",
        };
        setBusuanziStats(next);
      } catch (error) {
        console.error("busuanzi refresh failed", error);
      }
    };

    refreshBusuanzi();
    const timer = window.setInterval(refreshBusuanzi, 60000);
    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, [unlocked]);

  useEffect(() => {
    if (!toolboxOpen || typeof window === "undefined") return undefined;

    const onPointerDownOutsideToolbox = (event) => {
      if (!(event.target instanceof Element)) return;
      if (toolboxRef.current?.contains(event.target)) return;
      setToolboxOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDownOutsideToolbox);
    return () => window.removeEventListener("pointerdown", onPointerDownOutsideToolbox);
  }, [toolboxOpen]);

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
    if (artHoverRafRef.current) window.cancelAnimationFrame(artHoverRafRef.current);
  }, []);

  useEffect(() => {
    setShowPortfolioPoster(activeIndex === portfolioSectionIndex);
  }, [activeIndex, portfolioSectionIndex]);

  useEffect(() => {
    setArtPhotoIndex(0);
    setArtVisibleCount(ART_INITIAL_VISIBLE_COUNT);
  }, [artCategoryIndex, portfolioMode]);

  useEffect(() => {
    if (portfolioMode !== "art" || !artPhotoCategories.length || activeIndex !== portfolioSectionIndex) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    if ((navigator.hardwareConcurrency ?? 8) <= 4) return undefined;

    const safeCategoryIndex = ((artCategoryIndex % artPhotoCategories.length) + artPhotoCategories.length) % artPhotoCategories.length;
    const currentPhotos = artPhotoCategories[safeCategoryIndex]?.photos ?? [];
    if (currentPhotos.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setArtPhotoIndex((current) => (current + 1) % currentPhotos.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [activeIndex, artCategoryIndex, portfolioMode, portfolioSectionIndex]);

  useEffect(() => {
    if (portfolioMode !== "art") return;
    const randomIndex = Math.floor(Math.random() * artCopyPool.length);
    setArtCopy(artCopyPool[randomIndex]);
  }, [portfolioMode, artCategoryIndex]);

  const handleArtTileHover = (index) => {
    if (index === artPhotoIndex || artHoverRafRef.current) return;
    artHoverRafRef.current = window.requestAnimationFrame(() => {
      setArtPhotoIndex(index);
      artHoverRafRef.current = null;
    });
  };

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
      if (activeIndex === portfolioSectionIndex && ["ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        if (portfolioMode === "works") {
          setPortfolioIndex((current) => {
            if (event.key === "ArrowLeft") return (current - 1 + portfolioWorks.length) % portfolioWorks.length;
            return (current + 1) % portfolioWorks.length;
          });
          return;
        }

        if (!artPhotoCategories.length) return;

        const safeCategoryIndex = ((artCategoryIndex % artPhotoCategories.length) + artPhotoCategories.length) % artPhotoCategories.length;
        const currentPhotos = artPhotoCategories[safeCategoryIndex]?.photos ?? [];
        if (!currentPhotos.length) return;

        setArtPhotoIndex((current) => {
          if (event.key === "ArrowLeft") return (current - 1 + currentPhotos.length) % currentPhotos.length;
          return (current + 1) % currentPhotos.length;
        });
      } else if (["ArrowDown", "PageDown", " "].includes(event.key)) {
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
      touchStartSection.current = event.target instanceof Element ? event.target.closest(".section-shell") : null;
    };

    const onTouchEnd = (event) => {
      if (touchStartY.current == null) return;
      const deltaY = touchStartY.current - (event.changedTouches[0]?.clientY ?? touchStartY.current);
      const direction = deltaY > 0 ? 1 : -1;
      if (Math.abs(deltaY) > 70 && !canSectionScroll(touchStartSection.current, direction)) {
        navigateTo(activeIndex + direction);
      }
      touchStartY.current = null;
      touchStartSection.current = null;
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
  }, [activeIndex, artCategoryIndex, isTransitioning, portfolioMode, portfolioSectionIndex, unlocked]);

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
    const body = encodeURIComponent(`姓名：${form.name || "未填写"}\n访客公司：${form.email || "未填写"}\n\n${form.message || ""}`);
    window.location.href = `mailto:${contactConfig.inboxEmail}?subject=${subject}&body=${body}`;
  };

  const loadImage = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Image load failed: ${src}`));
    img.src = src;
  });

  const generateSharePoster = async () => {
    if (isGeneratingPoster) return;
    setIsGeneratingPoster(true);
    setShowPosterGeneratingModal(true);

    const shareUrl = "https://alleyf.github.io/Flowfolio";
    const generatedAt = new Date().toLocaleString("zh-CN", { hour12: false });
    const posterWidth = 1080;
    const posterHeight = 1620;
    const canvas = document.createElement("canvas");
    canvas.width = posterWidth;
    canvas.height = posterHeight;
    const context = canvas.getContext("2d");

    if (!context) {
      setIsGeneratingPoster(false);
      return;
    }

    try {
      const backgroundGradient = context.createLinearGradient(0, 0, posterWidth, posterHeight);
      backgroundGradient.addColorStop(0, "#061018");
      backgroundGradient.addColorStop(0.55, "#10283a");
      backgroundGradient.addColorStop(1, "#071019");
      context.fillStyle = backgroundGradient;
      context.fillRect(0, 0, posterWidth, posterHeight);

      context.fillStyle = "rgba(110, 242, 255, 0.16)";
      context.beginPath();
      context.arc(860, 230, 250, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = "rgba(255, 184, 101, 0.14)";
      context.beginPath();
      context.arc(180, 1340, 280, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = "#8cecff";
      context.font = "700 34px 'Azeret Mono', 'Noto Sans SC', sans-serif";
      context.fillText("FLOWFOLIO // PERSONAL SHARE CARD", 84, 116);

      context.fillStyle = "#ffffff";
      context.font = "900 96px 'Noto Sans SC', sans-serif";
      context.fillText("CsFan", 84, 236);

      context.fillStyle = "#d9eefc";
      context.font = "600 36px 'Noto Sans SC', sans-serif";
      context.fillText("Java 全栈工程师 · 微服务 · 云原生 · AI 工程化", 84, 296);

      context.fillStyle = "rgba(7, 20, 32, 0.86)";
      context.strokeStyle = "rgba(110, 242, 255, 0.32)";
      context.lineWidth = 3;
      context.beginPath();
      context.roundRect(84, 352, 912, 680, 34);
      context.fill();
      context.stroke();

      const posterImage = await loadImage(siteMeta.portfolioPoster);
      context.drawImage(posterImage, 114, 382, 852, 620);

      context.fillStyle = "rgba(7, 20, 32, 0.9)";
      context.strokeStyle = "rgba(255, 255, 255, 0.08)";
      context.beginPath();
      context.roundRect(84, 1076, 912, 470, 28);
      context.fill();
      context.stroke();

      context.fillStyle = "#ebf8ff";
      context.font = "700 44px 'Noto Sans SC', sans-serif";
      context.fillText("扫码查看完整站点", 124, 1160);

      context.fillStyle = "#9fc4dc";
      context.font = "500 26px 'Noto Sans SC', sans-serif";
      context.fillText("作品矩阵 · 项目经历 · 博客推文 · 联系方式", 124, 1202);

      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(shareUrl)}`;
      const qrImage = await loadImage(qrUrl);

      context.fillStyle = "rgba(255, 255, 255, 0.12)";
      context.beginPath();
      context.roundRect(678, 1112, 300, 344, 28);
      context.fill();

      context.fillStyle = "#ffffff";
      context.beginPath();
      context.roundRect(700, 1134, 256, 256, 22);
      context.fill();

      context.lineWidth = 1;
      context.strokeStyle = "rgba(12, 30, 45, 0.14)";
      context.beginPath();
      context.roundRect(706, 1140, 244, 244, 18);
      context.stroke();

      context.drawImage(qrImage, 718, 1152, 220, 220);

      context.fillStyle = "#d6ecff";
      context.font = "600 20px 'Noto Sans SC', sans-serif";
      context.fillText("微信扫码访问", 756, 1416);

      context.fillStyle = "#9ec3dc";
      context.font = "500 25px 'Azeret Mono', 'Noto Sans SC', sans-serif";
      context.fillText(shareUrl, 124, 1312);

      context.fillStyle = "#7fa3bb";
      context.font = "500 24px 'Azeret Mono', 'Noto Sans SC', sans-serif";
      context.fillText(`Generated at: ${generatedAt}`, 124, 1360);

      context.fillStyle = "#6ef2ff";
      context.font = "700 24px 'Azeret Mono', 'Noto Sans SC', sans-serif";
      context.fillText("FLOWFOLIO", 124, 1460);
      context.fillStyle = "#a9c8dd";
      context.font = "500 24px 'Noto Sans SC', sans-serif";
      context.fillText("让简历成为可交互的作品", 276, 1460);

      canvas.toBlob((blob) => {
        if (!blob) {
          setTerminalHint("海报生成失败，请稍后再试。");
          setIsGeneratingPoster(false);
          return;
        }

        const objectUrl = URL.createObjectURL(blob);
        setSharePosterPreview((previous) => {
          if (previous) URL.revokeObjectURL(previous);
          return objectUrl;
        });
        setSharePosterGeneratedAt(generatedAt);
        setTerminalHint("分享海报已生成，可在预览窗中复制图片。");
        setToolboxOpen(false);
        setShowPosterGeneratingModal(false);
        setIsGeneratingPoster(false);
      }, "image/png", 0.96);
    } catch (error) {
      console.error(error);
      setTerminalHint("海报生成失败，请检查网络后重试。");
      setShowPosterGeneratingModal(false);
      setIsGeneratingPoster(false);
    }
  };

  const handleCopyPosterImage = async () => {
    if (!sharePosterPreview || !window.ClipboardItem || !navigator.clipboard?.write) {
      setTerminalHint("当前浏览器不支持图片复制，请使用下载按钮。");
      return;
    }

    try {
      const response = await fetch(sharePosterPreview);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setTerminalHint("分享海报已复制到剪贴板，可直接粘贴发送。");
    } catch (error) {
      console.error(error);
      setTerminalHint("复制失败，请使用下载按钮。");
    }
  };

  const handleDownloadPosterImage = () => {
    if (!sharePosterPreview) return;
    const anchor = document.createElement("a");
    anchor.href = sharePosterPreview;
    anchor.download = `flowfolio-share-${Date.now()}.png`;
    anchor.click();
  };

  const closeSharePosterPreview = () => {
    setSharePosterPreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return null;
    });
    setSharePosterGeneratedAt("");
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
              <Card
                className="glass-card timeline-card education-card"
                component="a"
                href={item.schoolUrl}
                target="_blank"
                rel="noreferrer"
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box className="education-logo-shell">
                      <img src={item.logo} alt={`${item.school} logo`} className="education-logo" loading="lazy" />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="h5">{item.title}</Typography>
                      <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ mt: 1 }}>
                        {item.tiers?.map((tier) => <Box key={tier} component="span" className="education-tier-badge">{tier}</Box>)}
                      </Stack>
                    </Box>
                  </Stack>
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
              {personalSkills.map((item, index) => (
                <Grid key={item.title} size={{ xs: 12, sm: 6 }}>
                  <motion.div
                    className="skill-card-wrap"
                    initial={false}
                    animate={activeIndex === skillsSectionIndex ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0.74, y: 26, scale: 0.97 }}
                    transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
                    whileHover={{ y: -10, rotateX: -4, rotateY: index % 2 === 0 ? 3 : -3 }}
                  >
                    <Card className="glass-card skill-card">
                      <CardContent>
                        <Typography variant="h6">{item.title}</Typography>
                        <Typography color="text.secondary" sx={{ mt: 1 }}>{item.body}</Typography>
                        <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ mt: 2 }}>
                          {item.tags.map((tag) => <Chip key={tag} label={tag} size="small" />)}
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
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
          {projectExperiences.map((project, index) => {
            const flipped = !!flippedProjects[project.title];
            return (
              <Grid key={project.title} size={{ xs: 12, md: 4 }}>
                <motion.div
                  className="project-card-wrap"
                  initial={false}
                  animate={activeIndex === projectsSectionIndex ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0.76, y: 28, scale: 0.97 }}
                  transition={{ duration: 0.52, delay: index * 0.08, ease: "easeOut" }}
                  whileHover={{ y: -10 }}
                >
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
                          <Chip label={project.status} size="small" className={getProjectStatusClass(project.status)} />
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
                        {project.external !== false && project.url ? (
                          <Button href={project.url} target="_blank" rel="noreferrer" endIcon={<ArrowUpRight size={16} />} sx={{ mt: 2.5 }} onClick={(event) => event.stopPropagation()}>访问项目</Button>
                        ) : null}
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
                </motion.div>
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
        const hasArtPhotos = artPhotoCategories.length > 0;
        const safeArtCategoryIndex = hasArtPhotos ? ((artCategoryIndex % artPhotoCategories.length) + artPhotoCategories.length) % artPhotoCategories.length : 0;
        const activeArtCategory = hasArtPhotos ? artPhotoCategories[safeArtCategoryIndex] : null;
        const activeArtPhotos = activeArtCategory?.photos ?? [];
        const visibleArtPhotos = activeArtPhotos.slice(0, artVisibleCount);
        const canLoadMoreArtPhotos = activeArtPhotos.length > artVisibleCount;
        const safeArtPhotoIndex = activeArtPhotos.length > 0 ? ((artPhotoIndex % activeArtPhotos.length) + activeArtPhotos.length) % activeArtPhotos.length : 0;
        const artLeadPhoto = activeArtPhotos[safeArtPhotoIndex] ?? null;
        const curatorMeta = artCuratorMetaPool[(safeArtCategoryIndex + safeArtPhotoIndex) % artCuratorMetaPool.length];
        const frameCode = `ART-${String(safeArtCategoryIndex + 1).padStart(2, "0")}-${String(safeArtPhotoIndex + 1).padStart(2, "0")}`;
        const work = portfolioWorks[portfolioIndex];
        return (
          <Stack spacing={2.5}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2}>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip
                  icon={<Sparkles size={14} />}
                  label="作品矩阵"
                  onClick={() => setPortfolioMode("works")}
                  className={portfolioMode === "works" ? "portfolio-mode-chip active" : "portfolio-mode-chip"}
                />
                <Chip
                  icon={<Camera size={14} />}
                  label="艺术矩阵"
                  onClick={() => setPortfolioMode("art")}
                  className={portfolioMode === "art" ? "portfolio-mode-chip active" : "portfolio-mode-chip"}
                />
              </Stack>
              {portfolioMode === "works" ? (
                <CarouselNav
                  onPrev={() => setPortfolioIndex((current) => (current - 1 + portfolioWorks.length) % portfolioWorks.length)}
                  onNext={() => setPortfolioIndex((current) => (current + 1) % portfolioWorks.length)}
                />
              ) : (
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Typography color="text.secondary">艺术源于生活而高于生活</Typography>
                  {activeArtPhotos.length > 1 ? (
                    <CarouselNav
                      onPrev={() => setArtPhotoIndex((current) => (current - 1 + activeArtPhotos.length) % activeArtPhotos.length)}
                      onNext={() => setArtPhotoIndex((current) => (current + 1) % activeArtPhotos.length)}
                    />
                  ) : null}
                </Stack>
              )}
            </Stack>
            {portfolioMode === "works" ? (
              <>
                <motion.article key={work.title} initial={{ opacity: 0, x: 44 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, ease: "easeOut" }}>
                  <Card className="glass-card portfolio-card">
                    <Grid container>
                      <Grid size={{ xs: 12, md: 7 }}>
                        <img src={work.image} alt={work.title} loading="lazy" decoding="async" className="portfolio-image portfolio-image-large" />
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
              </>
            ) : (
              <motion.article key={activeArtCategory?.name || "art-empty"} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.42, ease: "easeOut" }}>
                {hasArtPhotos ? (
                  <Stack spacing={2}>
                    <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1}>
                      {artPhotoCategories.map((category, index) => (
                        <Chip
                          key={category.name}
                          label={`${normalizeArtCategoryName(category.name)} · ${category.photos.length}`}
                          onClick={() => setArtCategoryIndex(index)}
                          className={index === safeArtCategoryIndex ? "portfolio-chip active" : "portfolio-chip"}
                        />
                      ))}
                    </Stack>
                    <Card className="glass-card portfolio-card art-matrix-shell">
                      <Grid container>
                        <Grid size={{ xs: 12, md: 7 }}>
                          {artLeadPhoto ? <img src={artLeadPhoto} alt={normalizeArtCategoryName(activeArtCategory.name)} loading="lazy" decoding="async" className="portfolio-image portfolio-image-large art-lead-image" /> : null}
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }}>
                          <CardContent className="portfolio-content">
                            <Typography variant="overline" className="art-matrix-kicker">Art Matrix / 艺术摄影</Typography>
                            <Typography variant="h4">{normalizeArtCategoryName(activeArtCategory.name)}</Typography>
                            <Box className="art-copy-block">
                              <Stack direction="row" justifyContent="space-between" alignItems="center" className="art-copy-header">
                                <Typography variant="caption" className="art-copy-label">随机艺术文案</Typography>
                                <Typography variant="caption" className="art-copy-code">{frameCode}</Typography>
                              </Stack>
                              <Typography className="art-copy-text">{artCopy}</Typography>
                              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" className="art-copy-meta">
                                <Chip label={curatorMeta} size="small" variant="outlined" />
                                <Chip label={`分类 ${safeArtCategoryIndex + 1}/${artPhotoCategories.length}`} size="small" variant="outlined" />
                              </Stack>
                            </Box>
                            <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
                              <Chip label={`总计 ${activeArtCategory.photos.length} 张`} size="small" variant="outlined" />
                              {activeArtPhotos.length > 0 ? <Chip label={`第 ${safeArtPhotoIndex + 1} 张`} size="small" variant="outlined" /> : null}
                            </Stack>
                          </CardContent>
                        </Grid>
                      </Grid>
                    </Card>
                    <Box className="art-matrix-grid">
                      {visibleArtPhotos.map((photo, index) => {
                        return (
                          <motion.figure
                            key={`${activeArtCategory.name}-${photo}`}
                            className={index === safeArtPhotoIndex ? "art-photo-tile active" : "art-photo-tile"}
                            style={{ "--tile-tilt": `${((index % 3) - 1) * 0.35}deg` }}
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.28), ease: "easeOut" }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            onMouseEnter={() => handleArtTileHover(index)}
                            onFocus={() => handleArtTileHover(index)}
                            onClick={() => setArtPhotoIndex(index)}
                          >
                            <img src={photo} alt={`${normalizeArtCategoryName(activeArtCategory.name)}-${index + 1}`} loading="lazy" decoding="async" className="art-photo-image" />
                            <Box component="figcaption" className="art-photo-caption">FRAME {String(index + 1).padStart(2, "0")}</Box>
                          </motion.figure>
                        );
                      })}
                    </Box>
                    {canLoadMoreArtPhotos ? (
                      <Stack direction="row" justifyContent="center" sx={{ mt: 1.25 }}>
                        <Button variant="outlined" onClick={() => setArtVisibleCount((current) => current + ART_INITIAL_VISIBLE_COUNT)}>
                          加载更多（剩余 {activeArtPhotos.length - artVisibleCount} 张）
                        </Button>
                      </Stack>
                    ) : null}
                  </Stack>
                ) : (
                  <Card className="glass-card portfolio-card">
                    <CardContent>
                      <Typography variant="h5">艺术矩阵尚未检测到作品</Typography>
                      <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                        请将摄影作品放入 <code>/public/art/分类名/</code> 目录，例如：
                        <code> /public/art/street/001.webp </code>。
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </motion.article>
            )}
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
          {blogPosts.map((post, index) => (
            <Grid key={post.title} size={{ xs: 12, md: 6 }}>
              <motion.div
                className="tweet-card-wrap"
                initial={false}
                animate={activeIndex === blogSectionIndex ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0.76, y: 28, scale: 0.975 }}
                transition={{ duration: 0.48, delay: index * 0.08, ease: "easeOut" }}
                whileHover={{ y: -8 }}
              >
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
              </motion.div>
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
                    <TextField label="你的公司" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} fullWidth />
                    <TextField label="邮件主题" value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} fullWidth />
                    <TextField label="消息内容" multiline minRows={5} value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} fullWidth />
                    <Button variant="contained" startIcon={<Send size={18} />} onClick={sendMessage}>发送消息</Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Box className="site-copyright">
            <Typography variant="caption" color="text.secondary">
              © {siteMeta.copyrightRange} {siteMeta.copyrightOwner}. All rights reserved.
              <Box component="span" className="site-counter">
                {" · "}PV {busuanziStats.pv}
              </Box>
              <Box component="span" className="site-counter">
                {" · "}UV {busuanziStats.uv}
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
            <Typography variant="h6" className="brand">{siteMeta.brand}</Typography>
            <Typography variant="caption" color="text.secondary" className="brand-subtitle">Flow-driven portfolio resume</Typography>
          </Box>
          <Stack direction="row" spacing={0.8} className="theme-switch" aria-label="主题切换">
            <Button variant={themeMode === "system" ? "contained" : "outlined"} size="small" className="theme-switch-btn" onClick={() => setThemeMode("system")} aria-label="跟随系统主题" title="跟随系统主题">
              <MonitorCog size={14} />
            </Button>
            <Button variant={themeMode === "light" ? "contained" : "outlined"} size="small" className="theme-switch-btn" onClick={() => setThemeMode("light")} aria-label="浅色主题" title="浅色主题">
              <Sun size={14} />
            </Button>
            <Button variant={themeMode === "dark" ? "contained" : "outlined"} size="small" className="theme-switch-btn" onClick={() => setThemeMode("dark")} aria-label="深色主题" title="深色主题">
              <MoonStar size={14} />
            </Button>
          </Stack>
          <Stack direction="row" spacing={1} className="nav-actions">
            {sectionMenus.map((menu, index) => (
              <Button key={menu.id} onClick={() => navigateTo(index)} color={activeIndex === index ? "primary" : "inherit"} className={activeIndex === index ? "nav-button-active" : ""}>
                {menu.label}
              </Button>
            ))}
          </Stack>
          <Button href={resumeDownloadPath} download variant="contained" startIcon={<Download size={18} />} className="desktop-resume-download">下载简历</Button>
          <Button href={resumeDownloadPath} download variant="contained" startIcon={<Download size={16} />} size="small" className="mobile-resume-download">简历</Button>
        </Box>
      </AppBar>

      <Box className="page-glow" />
      {unlocked ? <HeroScene /> : null}

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

      <AnimatePresence>
        {unlocked && showPosterGeneratingModal ? (
          <motion.div className="share-poster-generating-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="share-poster-generating-panel" initial={{ opacity: 0, y: 22, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 14, scale: 0.97 }} transition={{ duration: 0.24, ease: "easeOut" }}>
              <Box className="poster-loader-ring" />
              <Typography variant="h6" sx={{ mt: 2 }}>正在生成分享海报</Typography>
              <Typography color="text.secondary" sx={{ mt: 1.2 }}>请稍等片刻，海报会自动弹出预览。生成过程中你也可以按 ESC 关闭提示窗。</Typography>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {unlocked && (
        <>
          <AnimatePresence>
            {sharePosterPreview ? (
              <motion.div className="share-poster-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div className="share-poster-modal-shell" initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 14, scale: 0.97 }} transition={{ duration: 0.26, ease: "easeOut" }}>
                  <Card className="glass-card share-poster-modal-card">
                    <CardContent>
                      <Stack direction={{ xs: "column", md: "row" }} spacing={2.2} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
                        <Box>
                          <Typography variant="h5">分享海报预览</Typography>
                          <Typography color="text.secondary">网站：https://alleyf.github.io/Flowfolio</Typography>
                          <Typography variant="caption" color="text.secondary">生成时间：{sharePosterGeneratedAt}</Typography>
                        </Box>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                          <Button variant="contained" onClick={handleCopyPosterImage}>复制海报图片</Button>
                          <Button variant="outlined" onClick={handleDownloadPosterImage}>下载海报</Button>
                          <Button variant="text" onClick={closeSharePosterPreview}>关闭</Button>
                        </Stack>
                      </Stack>
                      <Box className="share-poster-preview-wrap">
                        <img src={sharePosterPreview} alt="分享海报预览" className="share-poster-preview-image" />
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>

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

          <Box ref={toolboxRef} className={toolboxOpen ? "floating-toolbox open" : "floating-toolbox"}>
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
                  <Button className={isGeneratingPoster ? "toolbox-action active-share" : "toolbox-action"} variant="outlined" onClick={generateSharePoster} aria-label="生成分享海报" title="生成分享海报" disabled={isGeneratingPoster}>
                    <Share2 size={18} />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <Button className="toolbox-trigger" variant="contained" onClick={() => setToolboxOpen((current) => !current)} aria-label={toolboxOpen ? "收起工具箱" : "打开工具箱"} title={toolboxOpen ? "收起工具箱" : "打开工具箱"}>
              <Wrench size={18} />
            </Button>
          </Box>

          <Box className="site-counter-fixed" aria-label="站点访问统计">
            <Typography variant="caption">PV {busuanziStats.pv} · UV {busuanziStats.uv}</Typography>
          </Box>
        </>
      )}
    </Box>
  );
}
