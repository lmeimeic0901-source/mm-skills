# MM Skills 更名迁移说明

## 名称对应

| 旧内部名称 | 新内部名称 | 版本 |
| --- | --- | --- |
| `meimei-positioning-v2-beta` | `mm-positioning` | `1.0.5` |
| `meimei-commercial-pricing-beta` | `mm-pricing` | `1.0.0` |

## 为什么需要先移除旧名称

Skill 的内部 `name` 是安装身份。改名后，安装工具会把新名称识别成新的 Skill，不会自动删除旧名称。如果新旧同时保留，Agent 可能重复识别或调用错误版本。

## 老用户迁移

```bash
npx -y skills remove meimei-positioning-v2-beta meimei-commercial-pricing-beta -g
npx -y skills add lmeimeic0901-source/mm-skills -g --all
```

新用户不需要执行移除命令，直接安装即可。
