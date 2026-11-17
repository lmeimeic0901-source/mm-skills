# MM Skills

美美的母婴账号与内容工具箱。当前包含七个可独立安装、独立调用的 Skill。

## 当前包含

- `mm-positioning` `1.0.5`：MM 定位判断
- `mm-pricing` `1.0.0`：MM 商单报价
- `mm-cover-title` `1.0.1`：从完整广告脚本生成3—4组封面压字、辅助小字、20字内发布标题和真实爆款小标题参照
- `mm-ad-coach` `3.4.3`：mm 广告教练
- `mm-test-coach` `2.7.1`：mm 测评教练
- `mm-decode` `1.0.0-RC11`：mm 爆款拆解（学员内测版）
- `mm-review` `2.0.0`：mm 学员改稿

豆包用户请看 [安装包下载与安装说明](doubao-install.md)。

## 一句话安装或更新全部

```bash
npx -y skills add lmeimeic0901-source/mm-skills -g --all
```

## 只安装一个 Skill

```bash
npx -y skills add lmeimeic0901-source/mm-skills -g -y --skill mm-positioning
npx -y skills add lmeimeic0901-source/mm-skills -g -y --skill mm-pricing
npx -y skills add lmeimeic0901-source/mm-skills -g -y --skill mm-cover-title
```

以后仓库更新后，重新运行原安装命令即可覆盖更新。

## `mm-cover-title` 最短用法

上传一篇完整广告脚本，然后输入：

```text
使用 $mm-cover-title 生成封面压字和发布标题。
```

它适用于已经写好的母婴或日用品广告脚本。每次只处理一篇完整脚本；不重写整篇脚本，不生成封面图片，也不把无证据的身体结果或强情绪写进标题。

## 旧名称迁移

安装过旧内测名称的用户，先运行：

```bash
npx -y skills remove meimei-positioning-v2-beta meimei-commercial-pricing-beta meimei-cover-title meimei-cover-title-beta -g
```

再运行上面的新安装命令。详细说明见 [MIGRATION.md](MIGRATION.md)。
