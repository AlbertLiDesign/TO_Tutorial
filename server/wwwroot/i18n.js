// UI language is independent of model settings and exported numerical data.
const english = {
  "拓扑优化教学实验室": "Topology optimization teaching lab",
  "恢复默认": "Reset defaults",
  "从实体到结构。": "From solid to structure.",
  "调整约束，观察材料如何沿受力路径演化。": "Adjust the parameters and watch material evolve along load paths.",
  "计算维度": "Model dimension",
  "2D 平面": "2D Plane",
  "3D 实体": "3D Solid",
  "算例": "Example",
  "Cantilever · 悬臂梁": "Cantilever",
  "横向单元 Nx": "Horizontal cells Nx",
  "纵向单元 Ny": "Vertical cells Ny",
  "厚度单元 Nz": "Depth cells Nz",
  "目标体积分数": "Target volume fraction",
  "演化率 ER (%)": "Evolution rate ER (%)",
  "滤波半径 r": "Filter radius r",
  "惩罚指数 p": "Penalty exponent p",
  "最大迭代数": "Max. iterations",
  "滤波半径以单元边长为单位。": "Filter radius is measured in element edge lengths.",
  "材料与载荷": "Material & load",
  "弹性模量 E": "Young’s modulus E",
  "泊松比 ν": "Poisson’s ratio ν",
  "竖向力 Fy": "Vertical force Fy",
  "加载高度 y/H": "Load height y/H",
  "左侧全固定。3D 载荷位于自由端厚度中点；非网格节点位置采用相邻节点分配。": "The left face is fixed. The 3D load acts at mid-depth of the free end; loads between nodes are distributed to adjacent nodes.",
  "▶ 开始优化": "▶ Start optimization",
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
  "计算任务进行中": "Optimization in progress",
  "材料分布": "Material",
  "敏度场": "Sensitivity",
  "网格": "Grid",
  "重置视角": "Reset view",
  "悬臂梁有限元拓扑结果": "Cantilever finite-element topology result",
  "左侧固定 · 自由端中点向下加载": "Left face fixed · Downward load at free-end midpoint",
  "Q4 · 平面应力": "Q4 · Plane stress",
  "H8 · 拖拽旋转 / 滚轮缩放": "H8 · Drag to rotate / Scroll to zoom",
  "低": "Low",
  "高": "High",
  "迭代步": "Iteration",
  "目标函数 C": "Objective C",
  "½uᵀKu · 更新前": "½uᵀKu · Before update",
  "当前体积分数": "Current volume fraction",
  "收敛变化率 Δ": "Convergence change Δ",
  "阈值 0.001": "Tolerance 0.001",
  "演化曲线": "Evolution history",
  "目标函数和体积分数迭代曲线": "Objective and volume fraction iteration history",
  "迭代回放": "Playback",
  "最新": "Latest",
  "让材料出现在更有效的位置": "Place material where it works best",
  "BESO 根据有限元敏度移除低效材料，并允许材料重新加入。每一步都重新求解结构响应。": "BESO uses finite-element sensitivities to remove inefficient material and allows material to return. The structural response is solved at every step.",
  "有限元分析": "Finite-element analysis",
  "空间滤波与历史平均": "Spatial filtering and history averaging",
  "二分阈值更新材料": "Update material by threshold bisection",
  "Q4 / H8 · CHOLMOD · 双精度 · 串行装配": "Q4 / H8 · CHOLMOD · Double precision · Serial assembly",
  "导出计算记录 ↓": "Export results ↓",
  "拓扑显示本步更新后的材料；C 与敏度来自更新前的有限元分析。软杀死密度为 0.001，体积分数包含该密度。线弹性、小变形模型。": "Topology shows material after this step’s update; C and sensitivity come from the analysis before the update. Soft-kill density is 0.001 and is included in the volume fraction. Linear elasticity, small deformations.",
  "正在连接计算核心": "Connecting to solver",
  "原生计算核心已连接": "Native solver connected",
  "计算服务未连接": "Solver disconnected",
  "无法连接 BESO 计算服务，请启动服务器。": "Cannot connect to the BESO solver. Please start the server.",
  "开始优化后显示真实迭代记录": "Start optimization to see the iteration history",
  "目标": "Target",
  "迭代": "Iteration",
  "左侧固定": "Left face fixed",
  "请求失败": "Request failed",
  "连接中断，正在重试：": "Connection lost, retrying: ",
  "计算队列已满，请先停止已有任务。": "The queue is full. Stop an existing run first.",
  "网格范围：Nx 4–200、Ny 4–150、Nz 1–32。": "Mesh range: Nx 4–200, Ny 4–150, Nz 1–32.",
  "网格上限：2D 30,000 / 3D 32,000 单元。": "Mesh limit: 30,000 elements in 2D / 32,000 in 3D.",
  "参数超出范围，请检查输入。": "Parameters are out of range. Please check your inputs.",
  "01 / DESIGN SPACE": "01 / DESIGN SPACE",
  "02 / EVOLUTION": "02 / EVOLUTION",
  "LIVE TOPOLOGY": "LIVE TOPOLOGY",
  "UNDER THE HOOD": "UNDER THE HOOD"
};
let language = 'zh';
try { language = localStorage.getItem('beso-language') === 'en' ? 'en' : 'zh'; } catch {}
const chinese = {'01 / DESIGN SPACE':'01 / 设计域','02 / EVOLUTION':'02 / 演化参数','LIVE TOPOLOGY':'实时拓扑','UNDER THE HOOD':'计算原理','Cantilever':'悬臂梁'};
export const t = text => language === 'en' ? (english[text] ?? text) : (chinese[text] ?? text);
export const locale = () => language === 'en' ? 'en-US' : 'zh-CN';
export function meshText(count, dim) {
  return language === 'en'
    ? `${count.toLocaleString(locale())} ${dim === 2 ? 'Q4' : 'H8'} elements · Unit edge length`
    : `${count.toLocaleString(locale())} 个${dim === 2 ? '四节点' : '八节点'}单元 · 单元边长 1`;
}
export function applyLanguage() {
  document.documentElement.lang = locale();
  document.title = 'BESO Lab · ' + t('拓扑优化教学实验室');
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
