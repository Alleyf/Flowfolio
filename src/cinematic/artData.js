/* Art Matrix data — glob of /public/art/**, plus the random copy pools.
   Ported 1:1 from the main branch so the cinematic Art Matrix keeps the
   exact same content source and copy pool. */

export const artPhotoModules = import.meta.glob("/public/art/**/*.webp");

const PUBLIC_BASE_URL = import.meta.env.BASE_URL || "/";

const artPhotoCategoryMap = Object.keys(artPhotoModules).reduce((accumulator, path) => {
  const matched = path.match(/\/art\/([^/]+)\/[^/]+$/);
  if (!matched) return accumulator;
  const category = decodeURIComponent(matched[1]);
  if (!accumulator[category]) accumulator[category] = [];
  accumulator[category].push(`${PUBLIC_BASE_URL}${path.replace("/public/", "")}`);
  return accumulator;
}, {});

export const artPhotoCategories = Object.entries(artPhotoCategoryMap)
  .map(([name, photos]) => ({
    name,
    photos: photos.sort((left, right) => left.localeCompare(right, "zh-CN")),
  }))
  .sort((left, right) => left.name.localeCompare(right.name, "zh-CN"));

export function normalizeArtCategoryName(name) {
  return name.replace(/[-_]+/g, " ").trim();
}

export const artCopyPool = [
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
];

export const artCuratorMetaPool = [
  "Curator Note",
  "Light Study",
  "Street Archive",
  "Color Field",
  "Silent Frame",
  "Moment Record",
];

export const ART_INITIAL_VISIBLE_COUNT = 6;
