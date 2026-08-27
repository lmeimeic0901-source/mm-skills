# MM Skills

美美的母婴账号判断工具箱。当前公开两个可独立安装、独立调用的 Skill。

## 当前包含

- `mm-positioning` `1.0.5`：MM 定位判断
- `mm-pricing` `1.0.0`：MM 商单报价

广告教练和封面标题仍在完善，验收通过后再加入本仓库。

## 一句话安装或更新全部

```bash
npx -y skills add lmeimeic0901-source/mm-skills -g --all
```

## 只安装一个 Skill

```bash
npx -y skills add lmeimeic0901-source/mm-skills -g -y --skill mm-positioning
npx -y skills add lmeimeic0901-source/mm-skills -g -y --skill mm-pricing
```

以后仓库更新后，重新运行原安装命令即可覆盖更新。

## 旧名称迁移

安装过旧内测名称的用户，先运行：

```bash
npx -y skills remove meimei-positioning-v2-beta meimei-commercial-pricing-beta -g
```

再运行上面的新安装命令。详细说明见 [MIGRATION.md](MIGRATION.md)。
