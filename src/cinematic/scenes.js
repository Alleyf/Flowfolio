/* Cinematic scene map — single source of truth for the continuous scroll engine.
   Each scene has a span `w` (scroll weight). Global progress runs 0..TOTAL
   and every consumer (DOM engine, WebGL camera, particle morphs) reads it. */

const RAW = [
  { id: "profile", en: "PROFILE", cn: "主页", w: 1, jump: 0.5 },
  { id: "education", en: "EDUCATION", cn: "教育背景", w: 1.3 },
  { id: "experience", en: "EXPERIENCE", cn: "实习经历", w: 2.2 },
  { id: "skills", en: "SKILLS", cn: "个人技能", w: 1.7 },
  // projects lands exactly on slide 3: t = jump = 2/(n-1)
  { id: "projects", en: "PROJECTS", cn: "项目经历", w: 3, jump: 2 / 3 },
  { id: "works", en: "WORK MATRIX", cn: "作品矩阵", w: 2.8 },
  { id: "writing", en: "WRITING", cn: "博客推文", w: 1.2 },
  { id: "contact", en: "CONTACT", cn: "联系信息", w: 1 },
];

let acc = 0;
export const SCENES = RAW.map((s) => {
  const o = { ...s, start: acc, end: acc + s.w, center: acc + s.w / 2 };
  acc += s.w;
  return o;
});

export const TOTAL = acc;

export function sceneAt(p) {
  let idx = 0;
  for (let i = 0; i < SCENES.length; i++) {
    if (p >= SCENES[i].start - 0.45) idx = i;
  }
  return idx;
}
