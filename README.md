# MuscleMap - 肌肉图谱

一款面向健身爱好者的轻量级 Web 应用，通过 3D 人体模型直观展示训练动作所激活的肌肉群，辅助用户理解动作发力原理、优化训练计划。

## 功能特性

### 核心功能

- **3D 人体肌肉模型**：使用真实的 3D 解剖模型（基于 [3DMuscleSelector](https://github.com/cadenmarinozzi/3DMuscleSelector)），包含 12 个独立可交互的肌肉群
- **动作-肌肉高亮系统**：三级高亮显示（主要发力肌/次要发力肌/辅助稳定肌）
- **三分化训练日切换**：支持「背+二头」「胸+三头」「腿+核心」三种训练日
- **动作库与选择**：7 个常用训练动作，支持多选合并显示
- **反向肌肉查询**：点击 3D 模型上的肌肉，查看相关训练动作

### 交互特性

- 鼠标拖拽旋转模型（左右 180°）
- 滚轮缩放
- 正面/背面视角平滑切换
- 肌肉悬停高亮反馈
- 主要发力肌脉冲动画
- 颜色平滑过渡动画

## 技术栈

| 技术 | 说明 |
|------|------|
| React 18+ | 组件化开发 |
| TypeScript | 类型安全 |
| React Three Fiber | Three.js 的 React 封装 |
| @react-three/drei | R3F 辅助组件库（useGLTF） |
| Three.js | 3D 渲染引擎 |
| Zustand | 轻量级状态管理 |
| Tailwind CSS | 原子化 CSS 框架 |
| Vite | 快速构建工具 |

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装

```bash
git clone https://github.com/ChenYi1031/musclemap.git
cd musclemap/musclemap-app
npm install
```

### 开发

```bash
npm run dev
```

访问 http://localhost:5173

### 构建

```bash
npm run build
```

### 预览

```bash
npm run preview
```

## 项目结构

```
musclemap-app/
├── public/
│   └── models/
│       └── human-muscles.glb    # 3D 肌肉模型（2.3 MB）
├── src/
│   ├── components/              # React 组件
│   │   ├── Scene3D.tsx          # 3D 场景容器
│   │   ├── HumanModel.tsx       # 3D 人体模型（GLB 加载 + 高亮）
│   │   ├── TrainingTabs.tsx     # 训练日标签
│   │   ├── ExerciseList.tsx     # 动作列表
│   │   ├── ExerciseCard.tsx     # 动作卡片
│   │   ├── MuscleInfoPanel.tsx  # 肌肉信息面板
│   │   └── ViewToggle.tsx       # 视角切换
│   ├── data/                    # 数据文件
│   │   ├── muscles.ts           # 肌肉数据（12 个）
│   │   ├── exercises.ts         # 动作数据（7 个）
│   │   └── trainingDays.ts      # 训练日配置
│   ├── store/                   # 状态管理
│   │   └── useStore.ts          # Zustand store
│   ├── types/                   # TypeScript 类型
│   │   └── index.ts
│   ├── App.tsx                  # 主应用组件
│   ├── main.tsx                 # 入口文件
│   └── index.css                # 全局样式
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 3D 模型说明

本项目使用 [3DMuscleSelector](https://github.com/cadenmarinozzi/3DMuscleSelector) 的 GLB 模型，包含以下肌肉网格：

| 网格名称 | 对应肌肉 | 高亮颜色 |
|---------|---------|---------|
| MUSCLE_PECS | 胸大肌 | 红色/橙色/黄色 |
| MUSCLE_LAT_1/2 | 背阔肌 | 红色/橙色/黄色 |
| MUSCLE_TRAP_1/2 | 斜方肌 | 红色/橙色/黄色 |
| MUSCLE_DELTS | 三角肌 | 红色/橙色/黄色 |
| MUSCLE_BICEPS | 肱二头肌 | 红色/橙色/黄色 |
| MUSCLE_TRICEPS | 肱三头肌 | 红色/橙色/黄色 |
| MUSCLE_FOREARMS | 前臂肌群 | 红色/橙色/黄色 |
| MUSCLE_ABS | 腹直肌 | 红色/橙色/黄色 |
| MUSCLE_QUAD_1/2 | 股四头肌 | 红色/橙色/黄色 |
| MUSCLE_HAM_1/2 | 腘绳肌 | 红色/橙色/黄色 |
| MUSCLE_GLUTE_1/2 | 臀大肌 | 红色/橙色/黄色 |
| MUSCLE_CALF_1/2 | 小腿肌群 | 红色/橙色/黄色 |

**许可证**：CC Attribution（可商用）

## 数据说明

### 肌肉数据（12 个）

| 区域 | 肌肉 |
|------|------|
| 胸部 | 胸大肌 |
| 背部 | 背阔肌、斜方肌 |
| 肩部 | 三角肌 |
| 手臂 | 肱二头肌、肱三头肌、前臂肌群 |
| 核心 | 腹直肌 |
| 腿部 | 股四头肌、腘绳肌、臀大肌、小腿肌群 |

### 动作数据（7 个）

**背+二头日**
- 引体向上（主要：背阔肌、肱二头肌；次要：斜方肌、三角肌；辅助：腹直肌、前臂肌群）
- 钢线弯举（主要：肱二头肌；次要：前臂肌群；辅助：腹直肌）

**胸+三头日**
- 卧推（主要：胸大肌；次要：三角肌、肱三头肌；辅助：腹直肌、前臂肌群）
- Y字侧平举（主要：三角肌；次要：斜方肌；辅助：腹直肌）

**腿+核心日**
- 深蹲（主要：股四头肌、臀大肌；次要：腘绳肌；辅助：腹直肌、小腿肌群）
- 悬垂举腿（主要：腹直肌；次要：股四头肌；辅助：前臂肌群）
- 卷腹（主要：腹直肌）

## 颜色规范

| 用途 | 色值 | 说明 |
|------|------|------|
| 主要发力肌 | #E53E3E | 红色，带脉冲动画 |
| 次要发力肌 | #ED8936 | 橙色 |
| 辅助稳定肌 | #F6AD55 | 浅橙色 |
| 肌肉默认色 | #C4956A | 棕色 |
| 背景色 | #0F172A | 深蓝灰 |
| 面板背景 | #1E293B | 灰色 |

## 浏览器支持

- Chrome (最新 2 个版本)
- Firefox (最新 2 个版本)
- Safari (最新 2 个版本)
- Edge (最新 2 个版本)

## 致谢

- [3DMuscleSelector](https://github.com/cadenmarinozzi/3DMuscleSelector) - 提供 3D 肌肉模型
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/) - React 3D 渲染框架
- [Zustand](https://zustand-demo.pmnd.rs/) - 状态管理库

## 免责声明

本工具为健身参考，非医学诊断。肌肉激活数据基于常见健身动作的一般规律，实际激活程度可能因个体差异、动作执行方式等因素而有所不同。

## 许可证

MIT
