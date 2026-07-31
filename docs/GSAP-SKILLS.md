# GSAP Skills 使用文档

> 本文档介绍 [greensock/gsap-skills](https://github.com/greensock/gsap-skills) 的安装、使用方法，以及在本项目（MuscleMap）中的应用价值。

## 一、什么是 GSAP Skills

GSAP（GreenSock Animation Platform）是目前最强大的 JavaScript 动画库之一。官方推出的 AI Skills 包以 [Agent Skills](https://agentskills.io) 格式封装了 GSAP 的核心用法，让 AI 助手（Claude Code、Cursor、OpenCode、Copilot 等）能写出正确、规范的 GSAP 代码。

> **重要**：GSAP 在 Webflow 收购后已 **100% 免费**，包括所有插件（SplitText、MorphSVG、MotionPath 等）。所有功能均来自公开的 `gsap` npm 包，无需 Club 会员或授权 token。

## 二、安装

### 安装位置

本机为 OpenCode，已安装到用户级 skills 目录：

```
C:\Users\28491\.config\opencode\skills\
```

### 已安装的 8 个 Skill

| Skill | 用途 | 触发场景 |
|-------|------|---------|
| **gsap-core** | 核心 API：`gsap.to()/from()/fromTo()`、缓动、duration、stagger、matchMedia | 基础动画、缓动、响应式、减少动态效果 |
| **gsap-timeline** | 时间线：排序、位置参数、标签、嵌套、播放控制 | 多步骤动画、序列编排 |
| **gsap-scrolltrigger** | 滚动触发动画：pin、scrub、触发器 | 滚动动画、视差、固定区块 |
| **gsap-plugins** | 插件：Flip、Draggable、SplitText、ScrollSmoother 等 | 拖拽、文字拆分、DOM 翻转动画 |
| **gsap-utils** | 工具函数：clamp、mapRange、random、snap、wrap 等 | 数值映射、随机、取整 |
| **gsap-react** | React 集成：`useGSAP()` hook、scope、清理 | React/Next.js 动画 |
| **gsap-performance** | 性能优化：transform 优先、will-change、批处理 | 60fps、动画卡顿优化 |
| **gsap-frameworks** | Vue/Svelte 等其他框架集成 | 非 React 框架 |

### 其他方式安装

```bash
# 通用方式（npx skills CLI，自动检测 agent）
npx skills add https://github.com/greensock/gsap-skills

# Claude Code 插件市场
/plugin marketplace add greensock/gsap-skills

# 手动复制
# 将仓库 skills/ 目录复制到对应 agent 的 skills 目录
```

## 三、核心用法速查

### 1. 引入与插件注册（每个应用一次）

```javascript
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
```

### 2. 单个 Tween（推荐使用 transform 别名和 autoAlpha）

```javascript
gsap.to(".box", { x: 100, autoAlpha: 1, duration: 0.6, ease: "power2.inOut" });
```

### 3. 时间线编排（替代链式 delay）

```javascript
const tl = gsap.timeline({ defaults: { duration: 0.5, ease: "power2" } });
tl.to(".a", { x: 100 })
  .to(".b", { y: 50 }, "+=0.2")   // 上一个结束后 0.2s
  .to(".c", { opacity: 0 }, "-=0.1"); // 提前 0.1s
```

### 4. React 中的正确用法（useGSAP + scope + 自动清理）

```javascript
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

gsap.registerPlugin(useGSAP);

function Component() {
  const containerRef = useRef(null);

  useGSAP(() => {
    // 选择器限定在 containerRef 内，卸载时自动 revert
    gsap.to(boxRef.current, { x: 100, duration: 0.6, ease: "power2" });
    gsap.from(".item", { autoAlpha: 0, y: 20, stagger: 0.1 });
  }, { scope: containerRef });

  return <div ref={containerRef}>...</div>;
}
```

> ⚠️ 如果用 `useEffect` + `gsap.context()`，**必须**在清理函数中调用 `ctx.revert()`，否则会造成内存泄漏和已卸载节点的动画更新。

### 5. 滚动动画（ScrollTrigger）

```javascript
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".section",
    start: "top center",
    end: "bottom center",
    scrub: true,  // 滚动联动进度
  }
});
tl.to(".panel", { x: 100 });
```

### 6. 响应式与无障碍（matchMedia）

```javascript
const mm = gsap.matchMedia();
mm.add("(min-width: 800px)", () => {
  gsap.to(".box", { rotation: 360, duration: 2 });
});
mm.add("(prefers-reduced-motion: reduce)", () => {
  // 减少动态效果的用户：直接跳过动画
});
```

## 四、核心最佳实践（来自官方 skill）

✅ **要做**：
- 动画属性用 **camelCase**（`backgroundColor`、`rotationX`）
- 移动/缩放优先用 **transform 别名**（`x`、`y`、`scale`、`rotation`），避免动画 `width/height/top/left` 等布局属性
- 淡入淡出用 **`autoAlpha`** 而非 `opacity`（0 时自动 `visibility: hidden`，不阻挡点击）
- 多步骤动画用 **timeline** 而非链式 `delay`
- React 中用 **`useGSAP()`** + **scope**，保证卸载清理
- 用 **`gsap.matchMedia()`** 处理响应式断点和 `prefers-reduced-motion`

❌ **不要做**：
- ❌ 无 scope 的选择器字符串（可能误伤组件外元素）
- ❌ 忘记清理（不 revert context / 不 kill tween）
- ❌ 在 SSR 期间调用 gsap / ScrollTrigger
- ❌ 多个 `from()/fromTo()` 同属性叠加时不设 `immediateRender: false`
- ❌ 使用无效的缓动名称

## 五、对 MuscleMap 项目的适用性分析

### 项目现状

- **技术栈**：React 19 + TypeScript + React Three Fiber + Three.js + Zustand + Tailwind CSS
- **依赖**：`gsap ^3.15.0` **已在 package.json 中，但源码中完全未使用**
- **现有动画**：全部通过 R3F 的 `useFrame` + `THREE.MathUtils.lerp` 手写实现（颜色过渡、视角旋转）

### 高度适用的场景

| 场景 | 现状 | GSAP 方案 | 价值 |
|------|------|----------|------|
| **MuscleInfoPanel 滑入/滑出** | 无动画（瞬间出现/消失） | `gsap.to(panel, { xPercent: 100 → 0, autoAlpha })` | 高 - 立刻提升质感 |
| **训练日 Tab 切换** | Tailwind 过渡 | timeline + stagger | 中 |
| **动作卡片列表入场** | 无动画 | `gsap.from(cards, { y: 20, autoAlpha: 0, stagger: 0.05 })` | 高 |
| **视角切换（前/后）** | `useFrame` + lerp 旋转 180° | GSAP 可动画 Three.js 对象属性（`rotation.y`） | 中 - 需注意与 useFrame 冲突 |
| **肌肉脉冲动画** | `useFrame` 中 `sin(time*3)` | `gsap.to(material, { emissiveIntensity: {...}, yoyo: true, repeat: -1 })` | 中 - 更平滑可控 |
| **prefers-reduced-motion** | 无 | `gsap.matchMedia()` | 高 - 无障碍改进 |
| **选中动作的视觉反馈** | 无 | `gsap.to(card, { scale: 1.05, boxShadow })` | 中 |

### 不适用/不建议的场景

- **3D 模型内部的逐帧动画**（肌肉颜色 lerp、悬停高亮）：这些与 R3F 渲染循环深度耦合，GSAP 收益不大，保持 `useFrame` 更简单
- **ScrollTrigger 滚动动画**：本项目是单屏工具型应用（无长页面滚动），暂不需要
- **Flip / Draggable / SplitText 插件**：与当前功能无关

### 建议实施路径

1. **立即收益**（低风险，改动小）：
   - `MuscleInfoPanel` 滑入动画
   - 动作卡片列表 stagger 入场
   - 训练日 Tab 切换动画

2. **中期**：
   - 安装 `@gsap/react`（`npm install @gsap/react`），使用 `useGSAP` hook 管理所有 UI 动画
   - 用 `gsap.matchMedia()` 增加 `prefers-reduced-motion` 支持

3. **谨慎**：
   - 用 GSAP 替代 `useFrame` 中的视角旋转 —— 需要额外协调，收益有限

### 实施状态（2026-07-31）

✅ **已全部落地**：

| 项 | 状态 | 文件 |
|----|------|------|
| `@gsap/react` 安装 | ✅ | package.json |
| MuscleInfoPanel 滑入/滑出 | ✅ | src/components/MuscleInfoPanel.tsx |
| 动作卡片 stagger 入场 | ✅ | src/components/ExerciseList.tsx / ExerciseCard.tsx |
| 训练日 Tab 切换动画 | ✅ | src/components/TrainingTabs.tsx |
| `prefers-reduced-motion` 支持 | ✅ | 上述 3 个组件均通过 `gsap.matchMedia()` 实现 |

**实现要点**：
- 全部使用 `useGSAP()` hook + `scope` + `mm.revert()` 清理
- 面板关闭通过 `contextSafe` 包裹，先动画滑出再卸载
- 卡片/Tab 的 `transition-all` 改为 `transition-colors`，避免与 GSAP 的 transform/opacity 动画冲突
- 3D 模型内部动画（`useFrame` + lerp）按方案保留，未动

## 六、参考资料

- [GSAP 官方文档](https://gsap.com/docs/)
- [GSAP React 指南](https://gsap.com/resources/React)
- [gsap-skills 仓库](https://github.com/greensock/gsap-skills)
- [Agent Skills 规范](https://agentskills.io)

---

*文档生成日期：2026-07-31*
*基于 greensock/gsap-skills 仓库（MIT License）*
