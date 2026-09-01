import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const resultPath = process.argv[2];
const sourcePath = process.argv[3];
if (!resultPath) {
  console.error("Usage: node validate_output.mjs <result.md> [source.md]");
  process.exit(2);
}

const text = fs.readFileSync(resultPath, "utf8");
const problems = [];
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const skillDir = path.resolve(scriptDir, "..");

const titleSources = [
  path.join(skillDir, "references", "title-shells-ad-review.md"),
  path.join(skillDir, "references", "title-shells-good-list.md"),
  path.join(skillDir, "references", "emotion-supplement.md"),
  path.join(skillDir, "references", "good-list-theme-emotion.md"),
];
const originals = new Set();
const supplementOriginals = new Set();
const goodListEmotionOriginals = new Set();
const stoppedOriginals = new Set();
for (const source of titleSources) {
  const sourceText = fs.readFileSync(source, "utf8");
  for (const section of sourceText.split(/^###\s+/m).slice(1)) {
    const match = section.match(/^- 原始标题：`([^`]+)`$/m);
    if (!match) continue;
    const original = match[1];
    if (/^- 状态：`?停用/m.test(section)) {
      stoppedOriginals.add(original);
      continue;
    }
    originals.add(original);
    if (source.endsWith("emotion-supplement.md")) supplementOriginals.add(original);
    if (source.endsWith("good-list-theme-emotion.md")) goodListEmotionOriginals.add(original);
  }
}
const fallback = "无精确对标，原生结构";

if (!text.startsWith("内容判断：")) problems.push("最终输出必须从“内容判断：”开始");
const judgmentCount = [...text.matchAll(/内容判断：/g)].length;
if (judgmentCount !== 1) problems.push(`“内容判断：”必须且只能出现1次，当前为${judgmentCount}次`);

const schemeMatches = [...text.matchAll(/^###\s+方案(\d+)(（最推荐）)?$/gm)];
const schemes = schemeMatches.map((match) => Number(match[1]));
if (schemes.length < 3 || schemes.length > 4) problems.push(`方案数量应为3—4组，当前为${schemes.length}组`);
if (schemes.join(",") !== schemes.map((_, index) => index + 1).join(",")) problems.push("方案编号必须从1连续排列");
if (schemeMatches.filter((match) => match[2]).length !== 1 || !schemeMatches[0]?.[2]) problems.push("只能把方案1标为最推荐");

for (const [label, limit] of [["上排", 10], ["下排", 10], ["发布标题", 20]]) {
  const matches = [...text.matchAll(new RegExp(`^- ${label}：(.+)$`, "gm"))];
  if (matches.length !== schemes.length) problems.push(`${label}应每组出现一次，当前${matches.length}/${schemes.length}`);
  for (const match of matches) {
    const value = match[1].trim();
    if ([...value].length > limit) problems.push(`${label}超字数：${value}（${[...value].length}字）`);
  }
}

const helperMatches = [...text.matchAll(/^- 辅助小字：(.+)$/gm)];
if (helperMatches.length !== schemes.length) problems.push(`辅助小字应每组出现一次，当前${helperMatches.length}/${schemes.length}`);
for (const match of helperMatches) {
  const value = match[1].trim();
  if (value === "不加") continue;
  const items = value.split(/[｜/；]/).map((item) => item.trim()).filter(Boolean);
  if (items.length < 2 || items.length > 3) problems.push(`辅助小字应为2—3项或“不加”：${value}`);
  for (const item of items) if ([...item].length > 7) problems.push(`辅助小字单项超7字：${item}`);
}

const benchmarkMatches = [...text.matchAll(/^- 对标小标题（原始爆款）：(.+)$/gm)];
if (benchmarkMatches.length !== schemes.length) problems.push(`对标小标题应每组出现一次，当前${benchmarkMatches.length}/${schemes.length}`);
const usedOriginals = new Map();
let supplementCount = 0;
let goodListEmotionCount = 0;
for (const [index, match] of benchmarkMatches.entries()) {
  const value = match[1].trim();
  if (stoppedOriginals.has(value)) problems.push(`方案${index + 1}使用了已停用的对标小标题：${value}`);
  if (value !== fallback && !originals.has(value)) problems.push(`方案${index + 1}的对标小标题不是参考库真实原句：${value}`);
  if (supplementOriginals.has(value)) supplementCount += 1;
  if (goodListEmotionOriginals.has(value)) goodListEmotionCount += 1;
  if (value !== fallback) {
    if (usedOriginals.has(value)) problems.push(`方案${usedOriginals.get(value)}与方案${index + 1}重复使用同一对标原句`);
    usedOriginals.set(value, index + 1);
  }
}
if (supplementCount > 1) problems.push(`每篇最多1组使用强情绪补充库，当前为${supplementCount}组`);
if (goodListEmotionCount > 2) problems.push(`每篇最多2组使用好物合集主题情绪层，当前为${goodListEmotionCount}组`);

const lastBenchmark = benchmarkMatches.at(-1);
if (lastBenchmark) {
  const tail = text.slice(lastBenchmark.index + lastBenchmark[0].length).trim();
  if (tail) problems.push("最后一组对标小标题后不得追加任何内容");
}

const forbiddenVisible = [
  "点击机制", "点击理由", "机制去重", "脚本证据：", "对标来源：", "迁移关系：", "案例库缺口：",
  "样本ID", "内部打分", "字数计算", "配套分段小标题", "视频花字", "按口播节奏卡点"
];
for (const phrase of forbiddenVisible) if (text.includes(phrase)) problems.push(`出现不允许向学员展示的字段或过程：${phrase}`);

const processLeaks = [
  "我先看一下压缩包", "我先读取", "现在读取", "正在分析", "安装完成", "规则已读完", "成稿写入文件",
  "跑一遍校验", "调用技能", "调用 Skill", "参考文件", "读取skill", "读取 Skill",
  "脚本已读取完", "脚本已读完", "两篇脚本都已读完", "按 Skill 工作流程", "按封面标题流程",
  "同时加载", "参考文件也已加载", "先出", "再出"
];
for (const phrase of processLeaks) if (text.includes(phrase)) problems.push(`出现过程话术：${phrase}`);

const blocked = [
  "气泡呼呼往外冒", "透气不是嘴上说", "纸尿裤还能吹泡泡", "我家踩过这坑", "我家月子玩到现在",
  "真正防红PP看成分", "真正防红pp看成分", "换个好PP多值啊", "换个好pp多值啊",
  "肚皮光溜溜没纹", "湿疹期也敢涂", "再也没磨红大腿根", "踩中一个就红PP", "踩中一个就红pp",
  "一天一包更干净", "大包装占地方、敞口落灰受潮"
];
for (const phrase of blocked) if (text.includes(phrase)) problems.push(`命中已确认失败表达：${phrase}`);

if (/https?:\/\//.test(text)) problems.push("最终成品不应包含链接");
if (/\b(?:MMG|MMN|D6[A-Z]|T-[AG]|G)\d{2,3}\b/.test(text)) problems.push("最终成品不应包含样本或公式编号");
if (/(?:没|不|无|从没|再也没)红过?(?:PP|pp|屁屁)/.test(text)) problems.push("个人红PP结果进入成品字段");
if (/(?:肚皮|孕肚).{0,8}(?:没纹|无纹|不长纹)/.test(text)) problems.push("个人妊娠纹结果进入成品字段");
if (/(?:湿疹期|湿疹期间).{0,8}(?:敢涂|能用|可用|放心用)/.test(text)) problems.push("把个人湿疹期体验扩大成使用承诺");
if (/(?:独立装|一天一包|日抛).{0,12}(?:更干净|防落灰|防受潮)/.test(text)) problems.push("把包装便利扩大成卫生事实");
if (/(?:吸收完全没用|吸收一点用都没有)/.test(text)) problems.push("把基础吸收能力绝对化为完全无用");

if (sourcePath) {
  const source = fs.readFileSync(sourcePath, "utf8").replace(/\s+/g, "");
  const generatedOnly = text
    .split("\n")
    .filter((line) => !line.startsWith("- 对标小标题（原始爆款）："))
    .join("\n")
    .replace(/\s+/g, "");
  const strengthCues = [
    "导致", "造成", "引发", "反而易", "反而更容易", "才靠谱", "必须", "才能",
    "到天亮", "一整晚", "整夜", "一定", "都会", "百分百", "从不", "从没", "再也不", "完全不会",
    "终于不用", "再也不用", "永远不用"
  ];
  const sourceSupportsCue = (cue) => {
    let from = 0;
    while (from < source.length) {
      const index = source.indexOf(cue, from);
      if (index === -1) return false;
      const before = source.slice(Math.max(0, index - 36), index);
      const after = source.slice(index + cue.length, index + cue.length + 12);
      const context = `${before}${cue}${after}`;
      const negated = /(?:不允许|不得|不能|禁止|不使用|不承诺|不支持|没有证据|没有证明|没证明|未证明|明确隔离)/.test(context);
      if (!negated) return true;
      from = index + cue.length;
    }
    return false;
  };
  for (const cue of strengthCues) {
    if (generatedOnly.includes(cue) && !sourceSupportsCue(cue)) problems.push(`成品新增了原脚本未正向支持的强关系词：${cue}`);
  }
  if (/只有.{0,12}(?:才|才能)/.test(generatedOnly) && !/只有.{0,12}(?:才|才能)/.test(source)) {
    problems.push("成品新增了原脚本未正向支持的‘只有…才…’必要关系");
  }
  if (/(?:\d+(?:\.\d+)?%|百分之[一二三四五六七八九十百零\d]+)/.test(generatedOnly) &&
      !/(?:\d+(?:\.\d+)?%|百分之[一二三四五六七八九十百零\d]+)/.test(source)) {
    problems.push("成品新增了原脚本未提供的百分比");
  }
  if (/(?:自费无广|100%无广|百分百无广|无广)/.test(generatedOnly)) {
    problems.push("广告封面不得伪装自费或无广");
  }
  const sourceBoundPhrases = ["被问爆", "相见恨晚", "永久锁死", "焊在行李箱", "真离不开", "穷鬼养娃"];
  for (const phrase of sourceBoundPhrases) {
    if (generatedOnly.includes(phrase) && !source.includes(phrase)) problems.push(`成品使用了必须由脚本原话支持的强情绪词：${phrase}`);
  }
}

const allowedFields = new Set(["上排", "下排", "辅助小字", "发布标题", "对标小标题（原始爆款）"]);
for (const match of text.matchAll(/^- ([^：\n]+)：/gm)) {
  if (!allowedFields.has(match[1].trim())) problems.push(`出现未允许字段：${match[1].trim()}`);
}

if (problems.length) {
  console.error(JSON.stringify({ ok: false, problems }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, schemes: schemes.length, benchmarks: benchmarkMatches.length, sourceChecked: Boolean(sourcePath) }, null, 2));
