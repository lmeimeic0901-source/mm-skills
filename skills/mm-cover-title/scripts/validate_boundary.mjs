import fs from "node:fs";

const resultPath = process.argv[2];
if (!resultPath) {
  console.error("Usage: node validate_boundary.mjs <result.md>");
  process.exit(2);
}

const text = fs.readFileSync(resultPath, "utf8").trim();
const problems = [];
const expected = "这次收到多篇完整脚本，请告诉我先处理哪一篇。";

if (text !== expected) problems.push("多脚本边界必须只回复固定的单句询问");
if (text.includes("内容判断：") || /^###\s+方案/m.test(text)) problems.push("多脚本边界不得生成封面方案");
if (/^(?:我先|正在)|已读|加载|参考文件/.test(text)) problems.push("多脚本边界不得展示处理过程");

if (problems.length) {
  console.error(JSON.stringify({ ok: false, problems }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, mode: "multi-script-boundary" }, null, 2));
