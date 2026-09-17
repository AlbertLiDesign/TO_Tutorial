// UI language is independent of model settings and exported numerical data.
const english = {
  "恢复默认": "Reset defaults",
  "计算维度": "Model dimension",
  "2D 平面": "2D Plane",
  "3D 实体": "3D Solid",
  "目标体积分数": "Target volume",
  "演化率 ER (%)": "Evolution rate (%)",
  "滤波半径 r": "Filter radius r",
  "惩罚指数 p": "Penalty p",
  "最大迭代数": "Max. iterations",
  "滤波半径以单元边长为单位。": "Radius is measured in element edge lengths.",
  "材料与载荷": "Material & load",
  "弹性模量 E": "Young’s modulus E",
  "泊松比 ν": "Poisson’s ratio ν",
  "竖向力 Fy": "Vertical force Fy",
  "加载高度 y/H": "Load height y/H",
  "暂停": "Pause",
  "单步": "Step",
  "停止": "Stop",
  "继续": "Resume",
  "就绪": "Ready",
  "排队中": "Queued",
  "初始化有限元": "Initializing FEA",
  "正在优化": "Optimizing",
  "已暂停": "Paused",
  "已停止": "Stopped",
  "已收敛": "Converged",
  "达到迭代上限": "Iteration limit reached",
  "计算出错": "Computation error",
  "计算任务进行中": "Optimizing…",
  "材料分布": "Material",
  "敏度场": "Sensitivity",
  "网格": "Grid",
  "重置视角": "Reset view",
  "悬臂梁有限元拓扑结果": "Cantilever finite-element topology result",
  "Q4 · 平面应力": "Plane stress",
  "H8 · 拖拽旋转 / 滚轮缩放": "Drag to rotate · Scroll to zoom",
  "低": "Low",
  "高": "High",
  "迭代步": "Iteration",
  "阈值 0.001": "Tolerance 0.001",
  "演化曲线": "History",
  "目标函数和体积分数迭代曲线": "Objective and volume fraction iteration history",
  "迭代回放": "Playback",
  "最新": "Latest",
  "正在连接计算核心": "Connecting…",
  "原生计算核心已连接": "Connected",
  "计算服务未连接": "Disconnected",
  "无法连接 BESO 计算服务，请启动服务器。": "Cannot connect to the BESO solver. Please start the server.",
  "开始优化后显示真实迭代记录": "Run optimization to view the history",
  "目标": "Target",
  "迭代": "Iteration",
  "左侧固定": "Left face fixed",
  "请求失败": "Request failed",
  "连接中断，正在重试：": "Connection lost, retrying: ",
  "计算队列已满，请先停止已有任务。": "The queue is full. Stop an existing run first.",
  "网格范围：Nx 4–200、Ny 4–150、Nz 1–32。": "Mesh range: Nx 4–200, Ny 4–150, Nz 1–32.",
  "网格上限：2D 30,000 / 3D 32,000 单元。": "Mesh limit: 30,000 elements in 2D / 32,000 in 3D.",
  "参数超出范围，请检查输入。": "Parameters are out of range. Please check your inputs.",
  "拓扑优化": "Topology optimization",
  "参数设置": "Parameters",
  "宽度 Nx": "Width Nx",
  "高度 Ny": "Height Ny",
  "厚度 Nz": "Depth Nz",
  "优化": "Optimization",
  "开始优化": "Start optimization",
  "应变能 C": "Strain energy C",
  "体积分数": "Volume fraction",
  "变化率 Δ": "Change Δ",
  "如何读图": "Reading the results",
  "导出结果": "Export results",
  "左端固定，载荷作用于右端。": "Left end fixed; load applied at the right end.",
  "材料分布为本步更新后的结果；应变能与敏度来自更新前的分析。": "Material shows the updated design. Energy and sensitivity are calculated before the update.",
  "C/C₀ 为相对初始应变能，V/V₀ 为体积分数。": "C/C₀ is energy relative to the first iteration; V/V₀ is the volume fraction.",
  "采用线弹性、小变形模型。": "Linear elasticity with small deformations.",
  "计算结果": "Results",
  "模型": "Model",
  "关闭": "Close"
};
let language = 'zh';
try { language = localStorage.getItem('beso-language') === 'en' ? 'en' : 'zh'; } catch {}
const chinese = {'开始优化后显示真实迭代记录':'运行优化后显示曲线','Cantilever':'悬臂梁','正在连接计算核心':'连接中…','原生计算核心已连接':'已连接','计算服务未连接':'未连接','计算任务进行中':'优化中…','Q4 · 平面应力':'平面应力','H8 · 拖拽旋转 / 滚轮缩放':'拖拽旋转 · 滚轮缩放'};
export const t = text => language === 'en' ? (english[text] ?? text) : (chinese[text] ?? text);
export const locale = () => language === 'en' ? 'en-US' : 'zh-CN';
export function meshText(count, dim) {
  return language === 'en'
    ? `${count.toLocaleString(locale())} elements`
    : `${count.toLocaleString(locale())} 个单元`;
}
export function applyLanguage() {
  document.documentElement.lang = locale();
  document.title = 'BESO Lab · ' + t('拓扑优化');
  document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
  document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  const button = document.querySelector('#language');
  button.textContent = language === 'en' ? '中文' : 'English';
  button.lang = language === 'en' ? 'zh-CN' : 'en';
  button.setAttribute('aria-label', language === 'en' ? '切换到中文' : 'Switch to English');
}
export function toggleLanguage() {
  language = language === 'en' ? 'zh' : 'en';
  try { localStorage.setItem('beso-language', language); } catch {}
  applyLanguage();
}
