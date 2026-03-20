import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, AppBar, Avatar, Box, Button, Card, CardContent, Chip, Container, Divider, Grid, IconButton, Stack, TextField, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { RadarChart } from "echarts/charts";
import { LegendComponent, RadarComponent, TooltipComponent } from "echarts/components";
import { init, use as useEcharts } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { ArrowUpRight, BookOpenText, BriefcaseBusiness, Download, ExternalLink, Github, Globe, GraduationCap, Mail, MapPinned, Phone, Radar, School, Send, Sparkles, TerminalSquare } from "lucide-react";
import { blogPosts, bootLines, contactConfig, digitalIdentity, educationList, personalSkills, portfolioWorks, projectExperiences, resumeDownloadPath, sectionMenus, topStats } from "./config/siteConfig";

useEcharts([RadarChart, RadarComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

function useBusuanzi() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);
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
        const mesh = new THREE.Mesh(new THREE.TorusGeometry(ring.radius, 0.05, 24, 160), new THREE.MeshBasicMaterial({ color: ring.color, opacity: 0.33, transparent: true }));
        mesh.userData.speed = ring.speed;
        group.add(mesh);
      });
      const points = new Float32Array(1200 * 3);
      for (let i = 0; i < points.length; i += 1) points[i] = (Math.random() - 0.5) * 72;
      const particles = new THREE.BufferGeometry();
      particles.setAttribute("position", new THREE.BufferAttribute(points, 3));
      const dust = new THREE.Points(particles, new THREE.PointsMaterial({ color: 0xa1f7ff, size: 0.085, transparent: true, opacity: 0.72 }));
      scene.add(dust);
      let mouseX = 0;
      let mouseY = 0;
      let frame;
      const onMove = (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = (e.clientY / window.innerHeight) * 2 - 1;
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
        indicator: [{ name: "后端", max: 5 }, { name: "数据库", max: 5 }, { name: "中间件", max: 5 }, { name: "云原生", max: 5 }, { name: "前端", max: 5 }, { name: "AI工程化", max: 5 }],
        shape: "polygon",
        splitNumber: 5,
        radius: "68%",
        axisName: { color: "#dff7ff", fontSize: 12 },
        splitArea: { areaStyle: { color: ["rgba(110,242,255,0.04)", "rgba(110,242,255,0.015)"] } },
        splitLine: { lineStyle: { color: "rgba(110,242,255,0.14)" } },
        axisLine: { lineStyle: { color: "rgba(110,242,255,0.18)" } },
      },
      series: [{ type: "radar", data: [{ value: [5, 4, 4, 5, 3, 4], areaStyle: { color: "rgba(110,242,255,0.28)" }, lineStyle: { color: "#6ef2ff", width: 2 }, itemStyle: { color: "#6ef2ff" } }] }],
    });
    const resize = () => chart.resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      chart.dispose();
    };
  }, []);
  return <Box ref={ref} sx={{ width: "100%", height: 360 }} />;
}

function Section({ id, eyebrow, title, icon, children }) {
  return (
    <Box id={id} component={motion.section} className="page-section" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-12% 0px" }} transition={{ duration: 0.55, ease: "easeOut" }}>
      <Stack spacing={1.1} sx={{ mb: 3.5 }}>
        <Chip icon={icon} label={eyebrow} variant="outlined" className="section-chip" />
        <Typography variant="h3">{title}</Typography>
      </Stack>
      {children}
    </Box>
  );
}

function ContactLine({ icon, label, value, href }) {
  const node = (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box className="icon-badge small">{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography>{value}</Typography>
      </Box>
    </Stack>
  );
  return href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="contact-link">{node}</a> : node;
}

export default function App() {
  useBusuanzi();
  const [terminalText, setTerminalText] = useState("");
  const [command, setCommand] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [terminalHint, setTerminalHint] = useState("输入 start 解锁，输入 help 查看命令。");
  const [activeSection, setActiveSection] = useState("overview");
  const [flippedProjects, setFlippedProjects] = useState({});
  const [visibleCount, setVisibleCount] = useState(2);
  const [form, setForm] = useState({ name: "", email: "", subject: contactConfig.defaultSubject, message: "" });
  const sentinelRef = useRef(null);

  useEffect(() => {
    let line = 0;
    let char = 0;
    let timer;
    const type = () => {
      if (line >= bootLines.length) return;
      const current = bootLines[line];
      if (char < current.length) {
        setTerminalText((prev) => `${prev}${current[char]}`);
        char += 1;
        timer = window.setTimeout(type, 15);
        return;
      }
      setTerminalText((prev) => `${prev}\n`);
      line += 1;
      char = 0;
      timer = window.setTimeout(type, 110);
    };
    type();
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll(".page-section");
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.id) setActiveSection(visible.target.id);
    }, { threshold: [0.2, 0.5, 0.7], rootMargin: "-15% 0px -30% 0px" });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [unlocked]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) setVisibleCount((count) => Math.min(count + 2, portfolioWorks.length));
    }, { rootMargin: "0px 0px 260px 0px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const visiblePortfolio = useMemo(() => portfolioWorks.slice(0, visibleCount), [visibleCount]);

  const handleCommand = () => {
    const next = command.trim().toLowerCase();
    const prefix = `visitor@recruiter:~$ ${command}\n`;
    if (!next) return setTerminalText((prev) => `${prev}${prefix}`);
    if (next === "help") {
      setTerminalText((prev) => `${prev}${prefix}start -> 进入简历\nhelp -> 查看命令\nwhoami -> 查看候选人信息\nclear -> 清屏\n`);
      setTerminalHint("可用命令已输出。");
    } else if (next === "whoami") {
      setTerminalText((prev) => `${prev}${prefix}范财胜 / Java 全栈工程师 / 微服务与云原生实践者 / HUST 硕士在读\n`);
      setTerminalHint("候选人摘要已输出。");
    } else if (next === "clear") {
      setTerminalText("");
      setTerminalHint("终端已清空。");
    } else if (next === "start") {
      setTerminalText((prev) => `${prev}${prefix}[exec] Opening multi-page resume...\n[exec] Mounting experience layers...\n`);
      setTerminalHint("正在进入简历。");
      window.setTimeout(() => setUnlocked(true), 500);
    } else {
      setTerminalText((prev) => `${prev}${prefix}command not found: ${next}\n`);
      setTerminalHint("命令不存在，输入 help 查看。");
    }
    setCommand("");
  };

  const sendMessage = () => {
    const subject = encodeURIComponent(form.subject || contactConfig.defaultSubject);
    const body = encodeURIComponent(`姓名：${form.name || "未填写"}\n访客邮箱：${form.email || "未填写"}\n\n${form.message || ""}`);
    window.location.href = `mailto:${contactConfig.inboxEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <Box className="app-shell">
      {!unlocked && (
        <Box className="terminal-overlay">
          <motion.div className="terminal-window" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <Box className="terminal-head">
              <Box className="window-dots"><span className="dot red" /><span className="dot yellow" /><span className="dot green" /></Box>
              <Typography className="terminal-title">fan@archive:~/resume</Typography>
            </Box>
            <Box className="terminal-body">
              <Typography component="pre" className="terminal-output">{terminalText}</Typography>
              <Box className="terminal-input-line">
                <Typography className="terminal-prompt">visitor@recruiter:~$</Typography>
                <TextField variant="standard" value={command} onChange={(e) => setCommand(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCommand()} autoFocus placeholder="start" InputProps={{ disableUnderline: true }} fullWidth />
              </Box>
              <Alert severity="info" variant="outlined" className="terminal-alert">{terminalHint}</Alert>
            </Box>
          </motion.div>
        </Box>
      )}

      <AppBar position="sticky" color="transparent" elevation={0} className="site-nav">
        <Box className="toolbar">
          <Typography variant="h6" className="brand">FAN<span>/IDENTITY</span></Typography>
          <Stack direction="row" spacing={1} className="nav-actions">
            {sectionMenus.map((menu) => <Button key={menu.id} href={`#${menu.id}`} color={activeSection === menu.id ? "primary" : "inherit"} className={activeSection === menu.id ? "nav-button-active" : ""}>{menu.label}</Button>)}
            <Button href={resumeDownloadPath} download variant="contained" startIcon={<Download size={18} />}>下载简历</Button>
          </Stack>
        </Box>
      </AppBar>

      <Box className="page-glow" />
      <HeroScene />
      <Box className="scroll-indicator-rail">
        {sectionMenus.map((menu) => <a key={menu.id} href={`#${menu.id}`} className={activeSection === menu.id ? "rail-dot active" : "rail-dot"} />)}
      </Box>

      <Container maxWidth="lg" className="page-content">
        <Section id="overview" eyebrow="Resume Gateway" title="数字简历主页" icon={<TerminalSquare size={18} />}>
          <Grid container spacing={3} alignItems="stretch">
            <Grid size={{ xs: 12, md: 7 }}>
              <Chip icon={<TerminalSquare size={16} />} label="SYSTEM ONLINE / DIGITAL IDENTITY" className="hero-chip" />
              <Typography variant="h1" sx={{ mt: 2, mb: 2, fontSize: { xs: 48, md: 88 } }}>范财胜</Typography>
              <Typography className="hero-subtitle">Java 全栈工程师 / 微服务架构实践者 / 云原生与 AI 工程化探索者</Typography>
              <Typography className="hero-copy" sx={{ mt: 3 }}>聚焦高并发后端、基础平台与工程效率提升。页面按主题拆成多张“滚动页面”，随着滚动逐段加载内容和交互。</Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4 }}>
                <Button variant="contained" size="large" href="#projects" startIcon={<BriefcaseBusiness size={18} />}>查看项目经历</Button>
                <Button variant="outlined" size="large" href="#portfolio" startIcon={<Sparkles size={18} />}>浏览作品集</Button>
              </Stack>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {topStats.map((item) => <Grid key={item.label} size={{ xs: 12, sm: 4 }}><Card className="glass-card info-card"><CardContent><Typography variant="overline">{item.label}</Typography><Typography variant="body1" className="strong-text" sx={{ mt: 0.5 }}>{item.value}</Typography></CardContent></Card></Grid>)}
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Card className="glass-card identity-panel"><CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box><Typography variant="overline">Digital Identity</Typography><Typography variant="h5">数字身份证</Typography></Box>
                  <Chip label="VERIFIED" color="primary" />
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar className="avatar-badge">F</Avatar>
                  <Box><Typography variant="h6">{digitalIdentity.name}</Typography><Typography color="text.secondary">{digitalIdentity.role}</Typography></Box>
                </Stack>
                <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.08)" }} />
                <Stack spacing={1.5}>{digitalIdentity.fields.map((field) => <Box key={field.label} className="metric-row"><Typography color="text.secondary">{field.label}</Typography><Typography>{field.value}</Typography></Box>)}</Stack>
              </CardContent></Card>
            </Grid>
          </Grid>
        </Section>

        <Section id="education" eyebrow="Education" title="教育背景" icon={<School size={18} />}>
          <Grid container spacing={2.5}>{educationList.map((item) => <Grid key={item.title} size={{ xs: 12, md: 6 }}><Card className="glass-card timeline-card"><CardContent><Typography className="period-label">{item.period}</Typography><Typography variant="h5" sx={{ mt: 1.5 }}>{item.title}</Typography><Typography color="text.secondary" sx={{ mt: 1.5 }}>{item.body}</Typography><Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ mt: 2.5 }}>{item.chips.map((chip) => <Chip key={chip} label={chip} variant="outlined" />)}</Stack></CardContent></Card></Grid>)}</Grid>
        </Section>

        <Section id="skills" eyebrow="Skills" title="个人技能" icon={<Radar size={18} />}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 5 }}><Card className="glass-card" sx={{ height: "100%" }}><CardContent><SkillsRadar /></CardContent></Card></Grid>
            <Grid size={{ xs: 12, md: 7 }}><Grid container spacing={2}>{personalSkills.map((item) => <Grid key={item.title} size={{ xs: 12, sm: 6 }}><Card className="glass-card skill-card"><CardContent><Typography variant="h6">{item.title}</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>{item.body}</Typography><Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ mt: 2 }}>{item.tags.map((tag) => <Chip key={tag} label={tag} size="small" />)}</Stack></CardContent></Card></Grid>)}</Grid></Grid>
          </Grid>
        </Section>

        <Section id="projects" eyebrow="Project Experience" title="项目经历" icon={<BriefcaseBusiness size={18} />}>
          <Grid container spacing={2.5}>
            {projectExperiences.map((project) => {
              const flipped = !!flippedProjects[project.title];
              return <Grid key={project.title} size={{ xs: 12, md: 4 }}>
                <Box className="flip-card" onClick={() => setFlippedProjects((current) => ({ ...current, [project.title]: !current[project.title] }))}>
                  <Box className={flipped ? "flip-card-inner is-flipped" : "flip-card-inner"}>
                    <Card className={`glass-card project-face project-front ${project.color}`}><CardContent><Typography variant="overline">点击翻转查看亮点</Typography><Typography variant="h5" sx={{ mt: 1.5 }}>{project.title}</Typography><Typography color="text.secondary" sx={{ mt: 1.5 }}>{project.description}</Typography><Chip label={project.status} size="small" sx={{ mt: 2.5 }} /></CardContent></Card>
                    <Card className={`glass-card project-face project-back ${project.color}`}><CardContent><Typography variant="overline">项目亮点 / Tech Stack</Typography><Stack component="ul" spacing={1.2} className="bullet-list compact">{project.bullets.map((bullet) => <Typography component="li" key={bullet} color="text.secondary">{bullet}</Typography>)}</Stack><Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ mt: 2 }}>{project.stack.map((item) => <Chip key={item} label={item} size="small" variant="outlined" />)}</Stack><Button href={project.url} target="_blank" rel="noreferrer" endIcon={<ArrowUpRight size={16} />} sx={{ mt: 2.5 }} onClick={(event) => event.stopPropagation()}>访问项目</Button></CardContent></Card>
                  </Box>
                </Box>
              </Grid>;
            })}
          </Grid>
        </Section>

        <Section id="portfolio" eyebrow="Portfolio Feed" title="作品集" icon={<Sparkles size={18} />}>
          <Box className="portfolio-feed">
            {visiblePortfolio.map((work) => <motion.article key={work.title} className="portfolio-feed-item" initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10% 0px" }}><Card className="glass-card portfolio-card"><img src={work.image} alt={work.title} loading="lazy" className="portfolio-image" /><CardContent><Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}><Box><Typography variant="h5">{work.title}</Typography><Typography color="text.secondary">{work.subtitle}</Typography></Box><Chip label={work.kind} size="small" /></Stack><Typography color="text.secondary" sx={{ mt: 1.8 }}>{work.summary}</Typography><Stack component="ul" spacing={1.1} className="bullet-list compact">{work.highlights.map((item) => <Typography component="li" key={item} color="text.secondary">{item}</Typography>)}</Stack><Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ mt: 2 }}>{work.stack.map((tag) => <Chip key={tag} label={tag} size="small" variant="outlined" />)}</Stack><Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2.5 }}><Button href={work.repo} target="_blank" rel="noreferrer" endIcon={<Github size={16} />}>GitHub</Button>{work.demo && <Button href={work.demo} target="_blank" rel="noreferrer" endIcon={<ExternalLink size={16} />}>在线演示</Button>}</Stack></CardContent></Card></motion.article>)}
          </Box>
          <Box ref={sentinelRef} className="portfolio-sentinel">{visibleCount < portfolioWorks.length ? "继续下滑，自动加载更多作品..." : "作品集已加载完成"}</Box>
        </Section>

        <Section id="blog" eyebrow="Blog Tweets" title="博客推文" icon={<BookOpenText size={18} />}>
          <Grid container spacing={2.5}>{blogPosts.map((post) => <Grid key={post.title} size={{ xs: 12, md: 6 }}><Card className="glass-card tweet-card"><CardContent><Stack direction="row" justifyContent="space-between" alignItems="center"><Stack direction="row" spacing={1} alignItems="center"><Avatar className="tweet-avatar">F</Avatar><Box><Typography variant="body1">范财胜</Typography><Typography variant="caption" color="text.secondary">@{post.handle}</Typography></Box></Stack><Typography variant="caption" color="text.secondary">{post.date}</Typography></Stack><Typography sx={{ mt: 2, lineHeight: 1.9 }}>{post.description}</Typography><Stack direction="row" useFlexGap flexWrap="wrap" spacing={1} sx={{ mt: 2 }}>{post.tags.map((tag) => <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" />)}</Stack><Button href={post.url} target="_blank" rel="noreferrer" sx={{ mt: 2 }} endIcon={<ExternalLink size={16} />}>阅读原文</Button></CardContent></Card></Grid>)}</Grid>
        </Section>

        <Section id="contact" eyebrow="Contact" title="联系信息" icon={<Mail size={18} />}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card className="glass-card about-card"><CardContent><Stack spacing={2.2}><ContactLine icon={<Mail size={18} />} label="邮箱" value={contactConfig.email} href={`mailto:${contactConfig.email}`} /><ContactLine icon={<Github size={18} />} label="GitHub" value={contactConfig.github} href={contactConfig.github} /><ContactLine icon={<Globe size={18} />} label="博客" value={contactConfig.blog} href={contactConfig.blog} /><ContactLine icon={<Phone size={18} />} label="电话" value={contactConfig.phone || "请在配置文件中补充"} /><ContactLine icon={<MapPinned size={18} />} label="所在地" value={contactConfig.location} /><ContactLine icon={<GraduationCap size={18} />} label="当前状态" value={contactConfig.status} /></Stack></CardContent></Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card className="glass-card contact-card"><CardContent><Typography variant="h6" sx={{ mb: 2 }}>直接发送消息</Typography><Typography color="text.secondary" sx={{ mb: 2 }}>收件邮箱和默认主题来自配置文件，访客填写后会直接调用邮件客户端发送。</Typography><Stack spacing={2}><TextField label="你的姓名" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} fullWidth /><TextField label="你的邮箱" type="email" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} fullWidth /><TextField label="邮件主题" value={form.subject} onChange={(e) => setForm((current) => ({ ...current, subject: e.target.value }))} fullWidth /><TextField label="消息内容" multiline minRows={5} value={form.message} onChange={(e) => setForm((current) => ({ ...current, message: e.target.value }))} fullWidth /><Button variant="contained" startIcon={<Send size={18} />} onClick={sendMessage}>发送消息到 {contactConfig.inboxEmail}</Button></Stack></CardContent></Card>
            </Grid>
          </Grid>
        </Section>

        <Box component="footer" className="site-footer">
          <Card className="glass-card footer-card"><CardContent><Grid container spacing={3} alignItems="center"><Grid size={{ xs: 12, md: 7 }}><Typography variant="h5">范财胜 · 个人数字简历</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>底部保留联系信息与访问统计，下载文件已切到真实 PDF 附件。</Typography><Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2.5 }}><Button href={`mailto:${contactConfig.email}`} startIcon={<Mail size={16} />}>{contactConfig.email}</Button><Button href={contactConfig.github} target="_blank" rel="noreferrer" startIcon={<Github size={16} />}>GitHub</Button>{contactConfig.phone && <Button startIcon={<Phone size={16} />}>{contactConfig.phone}</Button>}</Stack></Grid><Grid size={{ xs: 12, md: 5 }}><Typography variant="overline">站点访问统计</Typography><Grid container spacing={2} sx={{ mt: 0.5 }}><Grid size={6}><Box className="stat-box footer-stat"><Typography color="text.secondary">PV</Typography><Typography variant="h4" id="busuanzi_value_site_pv">--</Typography></Box></Grid><Grid size={6}><Box className="stat-box footer-stat"><Typography color="text.secondary">UV</Typography><Typography variant="h4" id="busuanzi_value_site_uv">--</Typography></Box></Grid></Grid></Grid></Grid></CardContent></Card>
        </Box>
      </Container>
    </Box>
  );
}
