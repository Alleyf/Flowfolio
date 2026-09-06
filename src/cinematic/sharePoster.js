import { portfolioWorks, contactConfig } from "../config/siteConfig";

/* Share-poster generator — canvas-drawn 1080x1620 card, ported from the
   main branch and re-skinned to the cinematic palette (#050505 + #d8ff3e).
   Returns an object URL for preview / copy / download. */

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Image load failed: ${src}`));
    img.src = src;
  });

const rr = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

export async function generateSharePoster() {
  const shareUrl = "https://alleyf.github.io/Flowfolio";
  const generatedAt = new Date().toLocaleString("zh-CN", { hour12: false });
  let ipInfo = { query: "", country: "", city: "" };
  try {
    const ipResponse = await fetch("http://ip-api.com/json/?lang=zh-CN");
    if (ipResponse.ok) ipInfo = await ipResponse.json();
  } catch (e) {
    console.warn("IP fetch failed, skipping.", e);
  }

  const W = 1080;
  const H = 1620;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  /* near-black base with a whisper of green */
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#050505");
  bg.addColorStop(0.55, "#0a0c08");
  bg.addColorStop(1, "#050505");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(216, 255, 62, 0.05)";
  ctx.beginPath();
  ctx.arc(880, 240, 260, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(216, 255, 62, 0.035)";
  ctx.beginPath();
  ctx.arc(160, 1360, 300, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#d8ff3e";
  ctx.font = "700 30px 'JetBrains Mono', monospace";
  ctx.fillText("FLOWFOLIO // PERSONAL SHARE CARD", 84, 116);

  ctx.fillStyle = "#f2f2ee";
  ctx.font = "900 100px 'HarmonyOS Sans SC', 'Noto Sans SC', sans-serif";
  ctx.fillText("CsFan", 84, 240);

  ctx.fillStyle = "rgba(242, 242, 238, 0.6)";
  ctx.font = "600 34px 'HarmonyOS Sans SC', 'Noto Sans SC', sans-serif";
  ctx.fillText("Agent 应用研发 · 多智能体 · 云原生 · 全栈工程化", 84, 298);

  /* works grid card */
  ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
  ctx.strokeStyle = "rgba(216, 255, 62, 0.28)";
  ctx.lineWidth = 2;
  rr(ctx, 84, 352, 912, 680, 28);
  ctx.fill();
  ctx.stroke();

  const gridWorks = portfolioWorks.slice(0, 4);
  const tileW = 408;
  const tileH = 296;
  for (let i = 0; i < gridWorks.length; i += 1) {
    const item = gridWorks[i];
    const col = i % 2;
    const row = Math.floor(i / 2);
    const tileX = 114 + col * (tileW + 24);
    const tileY = 396 + row * (tileH + 24);
    try {
      const workImage = await loadImage(item.image);
      ctx.save();
      rr(ctx, tileX, tileY, tileW, tileH, 16);
      ctx.clip();
      ctx.drawImage(workImage, tileX, tileY, tileW, tileH);
      ctx.restore();
    } catch (error) {
      ctx.fillStyle = "rgba(216, 255, 62, 0.06)";
      rr(ctx, tileX, tileY, tileW, tileH, 16);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(5, 5, 5, 0.8)";
    ctx.fillRect(tileX, tileY + tileH - 56, tileW, 56);
    ctx.fillStyle = "#f2f2ee";
    ctx.font = "600 26px 'HarmonyOS Sans SC', 'Noto Sans SC', sans-serif";
    ctx.fillText(item.title, tileX + 20, tileY + tileH - 20);
  }

  /* QR panel */
  ctx.fillStyle = "rgba(255, 255, 255, 0.028)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  rr(ctx, 84, 1076, 912, 470, 24);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#f2f2ee";
  ctx.font = "700 44px 'HarmonyOS Sans SC', 'Noto Sans SC', sans-serif";
  ctx.fillText("扫码查看完整站点", 124, 1160);

  ctx.fillStyle = "rgba(242, 242, 238, 0.5)";
  ctx.font = "500 26px 'HarmonyOS Sans SC', 'Noto Sans SC', sans-serif";
  ctx.fillText("作品矩阵 · 项目经历 · 博客推文 · 联系方式", 124, 1202);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(shareUrl)}`;
  const qrImage = await loadImage(qrUrl);

  ctx.fillStyle = "rgba(216, 255, 62, 0.1)";
  rr(ctx, 678, 1112, 300, 344, 24);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  rr(ctx, 700, 1134, 256, 256, 18);
  ctx.fill();
  ctx.drawImage(qrImage, 718, 1152, 220, 220);

  ctx.fillStyle = "rgba(242, 242, 238, 0.72)";
  ctx.font = "600 20px 'HarmonyOS Sans SC', 'Noto Sans SC', sans-serif";
  ctx.fillText("微信扫码访问", 756, 1416);

  ctx.fillStyle = "rgba(242, 242, 238, 0.62)";
  ctx.font = "500 25px 'JetBrains Mono', monospace";
  ctx.fillText(shareUrl, 124, 1312);

  ctx.fillStyle = "rgba(242, 242, 238, 0.38)";
  ctx.font = "500 24px 'JetBrains Mono', monospace";
  ctx.fillText(`Generated at: ${generatedAt}`, 124, 1360);
  if (ipInfo.query) {
    ctx.fillText(`Visitor IP: ${ipInfo.query} (${ipInfo.country} ${ipInfo.city})`, 124, 1392);
  }

  ctx.fillStyle = "#d8ff3e";
  ctx.font = "700 24px 'JetBrains Mono', monospace";
  ctx.fillText("FLOWFOLIO", 124, 1462);
  ctx.fillStyle = "rgba(242, 242, 238, 0.55)";
  ctx.font = "500 24px 'HarmonyOS Sans SC', 'Noto Sans SC', sans-serif";
  ctx.fillText(`让简历成为可交互的作品 · ${contactConfig.email}`, 280, 1462);

  return await new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return resolve(null);
        resolve(URL.createObjectURL(blob));
      },
      "image/png",
      0.96
    );
  });
}
