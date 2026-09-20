import {learningGuide} from './learning-guide.js?v=18';
import {displayMath,inlineProse} from './math.js?v=18';
import {figure} from './theory-figures.js?v=18';
import {practical} from './teaching-practical.js?v=19';
// Original bilingual teaching text. Equations use fixed, design-independent loads.
const p=s=>`<p>${inlineProse(s)}</p>`, h=s=>`<h2>${s}</h2>`, eq=displayMath;
const exercise=(q,a,zh=false)=>`<section class="exercise"><h3>${zh?'分析例题':'Analytical example'}</h3><p>${q}</p><details><summary>${zh?'展开推导与讨论':'Derivation and discussion'}</summary><p>${a}</p></details></section>`;
const source=(url,label)=>`<p class="chapter-source"><a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a></p>`;
const book=source('https://link.springer.com/book/10.1007/978-3-662-05086-6','Bendsøe, M. P., & Sigmund, O. (2003). Topology Optimization: Theory, Methods, and Applications. Springer.');
const evolutionaryBook=source('https://doi.org/10.1002/9780470689486','Huang, X., & Xie, Y. M. (2010). Evolutionary Topology Optimization of Continuum Structures: Methods and Applications. Wiley.');
const simp=source('https://www.topopt.mek.dtu.dk/apps-and-software/efficient-topology-optimization-in-matlab','Andreassen, E., Clausen, A., Schevenels, M., Lazarov, B. S., & Sigmund, O. (2011). Efficient topology optimization in MATLAB using 88 lines of code. Structural and Multidisciplinary Optimization, 43, 1–16.');
const beso=source('https://doi.org/10.1016/j.finel.2007.06.006','Huang, X., & Xie, Y. M. (2007). Convergent and mesh-independent solutions for the bi-directional evolutionary structural optimization method. Finite Elements in Analysis and Design, 43, 1039–1049.');
const ls=source('https://doi.org/10.1016/j.jcp.2003.09.032','Allaire, G., Jouve, F., & Toader, A.-M. (2004). Structural optimization using sensitivity analysis and a level-set method. Journal of Computational Physics, 194, 363–393.');
const chapters=[
{zh:['问题与设计变量','1 · 体积约束下的结构拓扑优化',
 p('结构通过材料把外载传递到支撑。给定同样的材料用量，不同的分布会形成不同的传力路径，也会产生不同的变形。拓扑优化将这种分布作为设计对象：先规定结构必须完成的任务，再寻找满足约束的材料布局。本教材以悬臂梁贯穿问题定义、力学分析、材料更新和结果讨论。')+
 h('尺寸、形状与拓扑')+p('尺寸优化调整截面或厚度；形状优化移动已有边界；拓扑优化还允许连接关系和孔洞数量改变。给定设计域 D、固定边界、载荷及材料模型后，设计变量描述材料的空间分布，位移则由平衡方程决定。')+
 eq("\\begin{aligned}\\min_{\\rho}\\quad&C(\\rho)\\\\\\text{s.t.}\\quad&K(\\rho)u=f,\\\\&\\sum_e v_e\\rho_e\\le V^*\\\\0&\\le\\rho_e\\le1\\end{aligned}")+
 p('ρ 是相对材料密度，vₑ 是单元体积，V* 是允许的材料体积。理想实体–空洞问题要求 ρ∈{0,1}；密度法先允许连续值，再通过材料插值抑制中间密度。体积分数 fᵥ=V*/|D| 与载荷向量 f 是不同量。')+
 h('模型假设与比较条件')+p('建议具备基础微积分、向量和矩阵知识；不要求已有拓扑优化经验。第 2–3 章介绍后续所需的力学和有限元概念，伴随法、函数空间与形状导数可在初读时暂缓。本教材研究固定载荷、线弹性、小变形下的最小柔度问题。它不等同于最小应力、最大屈曲载荷或最大强度。比较算法必须固定物理尺寸、支撑、载荷位置及总量、材料参数和体积预算。改变其中一项，就改变了优化问题。')+
 exercise('减少一半材料，柔度一定也减半吗？','不会。在固定载荷下，去掉材料通常会降低刚度、增大柔度；优化是在有限材料中改善分布，并不能取消这个代价。',true)+book+evolutionaryBook],
 en:['Problem & variables','1 · Volume-constrained structural topology optimization',
 p('A structure transfers applied loads to its supports through material. The same amount of material can form different load paths and produce different displacements. Topology optimization treats this distribution as the design: specify what the structure must do, then seek a material layout within the constraints. A cantilever connects the problem definition, mechanical analysis, material updates and interpretation of results throughout this text.')+
 h('Sizing, shape and topology')+p('Sizing changes sections or thicknesses. Shape optimization moves existing boundaries. Topology optimization also permits changes in connectivity and holes. The design domain D, supports, loads and material law define the problem; displacements are state variables determined by equilibrium.')+
 eq("\\begin{aligned}\\min_{\\rho}\\quad&C(\\rho)\\\\\\text{s.t.}\\quad&K(\\rho)u=f,\\\\&\\sum_e v_e\\rho_e\\le V^*\\\\0&\\le\\rho_e\\le1\\end{aligned}")+
 p('Here ρ is relative material density, vₑ is element volume and V* is the material budget. A solid–void problem uses ρ∈{0,1}; density methods relax this restriction and penalize intermediate material. The volume fraction fᵥ=V*/|D| is distinct from the load vector f.')+
 h('Model assumptions and comparison conditions')+p('Basic calculus, vectors and matrices are recommended; no prior topology-optimization experience is required. Chapters 2–3 introduce the mechanics and finite-element concepts used later. Adjoint methods, function spaces and shape derivatives can be deferred on a first reading. We study minimum compliance with fixed loads, linear elasticity and small displacements. This is not a minimum-stress, buckling or strength problem. A fair comparison fixes physical dimensions, supports, load position and magnitude, material properties and volume budget. Changing any of them changes the optimization problem.')+
 exercise('Does halving material necessarily halve compliance?','No. Removing stiffness generally increases compliance under fixed loads. Optimization improves material placement within a budget; it does not remove that tradeoff.')+book+evolutionaryBook]},
{zh:['线弹性与边界条件','2 · 线弹性状态方程及变分形式',
 eq("\\begin{aligned}\\varepsilon(u)&=\\frac12(\\nabla u+\\nabla u^{\\mathsf T})\\\\\\sigma&=\\mathbb D:\\varepsilon(u)\\\\-\\operatorname{div}\\sigma&=b\\end{aligned}")+
 p('ε 为二阶小应变张量，σ 为二阶应力张量，𝔻 为四阶弹性张量，b 为体力。在位移边界 Γᴅ 上给定位移，在力边界 Γɴ 上给定表面力。固定约束必须消除刚体运动，否则平衡解不唯一。当前 App 使用零位移约束及节点力，不包含体力或随设计变化的载荷。')+
 h('二维本构假设')+p('平面应力假设 σzz=τxz=τyz=0，适合薄板的面内受力；平面应变假设 εzz=γxz=γyz=0，适合受约束的长结构截面。两者使用不同的本构矩阵。App 的 Q4 是单位厚度平面应力，H8 是三维弹性。')+
 eq("\\begin{aligned}\\sigma_V&=D_{\\mathrm{ps}}\\varepsilon_V,\\\\\\varepsilon_V&=[\\varepsilon_{xx},\\varepsilon_{yy},2\\varepsilon_{xy}]^{\\mathsf T},\\\\\\sigma_V&=[\\sigma_{xx},\\sigma_{yy},\\sigma_{xy}]^{\\mathsf T}\\end{aligned}")+
 eq("D_{\\mathrm{ps}}=\\frac{E}{1-\\nu^2}\\begin{bmatrix}1&\\nu&0\\\\\\nu&1&0\\\\0&0&\\frac{1-\\nu}{2}\\end{bmatrix}")+
 h('弱形式')+p('对满足齐次位移边界的任意试函数 v，内部虚功应与外部虚功相等，具体表达式见下方弱形式。有限元把这个连续问题限制在有限维位移空间内。')+
 exercise('二维图像相同，是否意味着 Q4 与一层 H8 的结果完全相同？','不意味着。单位厚度、厚度方向约束、载荷分布及三维泊松效应均可能不同。必须先匹配物理模型。',true)+book],
 en:['Elasticity & boundaries','2 · Linear elasticity and its variational formulation',
 eq("\\begin{aligned}\\varepsilon(u)&=\\frac12(\\nabla u+\\nabla u^{\\mathsf T})\\\\\\sigma&=\\mathbb D:\\varepsilon(u)\\\\-\\operatorname{div}\\sigma&=b\\end{aligned}")+
 p('The second-order strain tensor ε, stress tensor σ, fourth-order elasticity tensor 𝔻 and body force b describe equilibrium. Prescribe displacement on Γᴅ and traction on Γɴ. Supports must eliminate rigid-body motion. App uses homogeneous displacement constraints and nodal forces; body forces and design-dependent loads are outside this model.')+
 h('Constitutive assumptions in two dimensions')+p('Plane stress sets σzz=τxz=τyz=0 for thin plates loaded in their plane. Plane strain sets εzz=γxz=γyz=0 for constrained long sections. Their constitutive matrices differ. App uses unit-thickness plane-stress Q4 elements and three-dimensional H8 elements.')+
 eq("\\begin{aligned}\\sigma_V&=D_{\\mathrm{ps}}\\varepsilon_V,\\\\\\varepsilon_V&=[\\varepsilon_{xx},\\varepsilon_{yy},2\\varepsilon_{xy}]^{\\mathsf T},\\\\\\sigma_V&=[\\sigma_{xx},\\sigma_{yy},\\sigma_{xy}]^{\\mathsf T}\\end{aligned}")+
 eq("D_{\\mathrm{ps}}=\\frac{E}{1-\\nu^2}\\begin{bmatrix}1&\\nu&0\\\\\\nu&1&0\\\\0&0&\\frac{1-\\nu}{2}\\end{bmatrix}")+
 h('Weak equilibrium')+p('For every admissible test displacement v, internal virtual work equals external virtual work, as expressed below. Finite elements restrict this statement to a finite-dimensional displacement space.')+
 exercise('Must a Q4 plate and one layer of H8 elements give identical results?','No. Thickness, transverse constraints, load distribution and three-dimensional Poisson effects must first be matched.')+book]},
{zh:['有限元离散','3 · 等参有限元离散与刚度装配',
 eq("\\begin{aligned}u&\\approx Nu_e\\\\\\varepsilon_V&=Bu_e\\\\k_e&=\\int_{\\Omega_e}B^{\\mathsf T}DB\\,\\mathrm d\\Omega\\end{aligned}")+
 p('Q4 使用双线性形函数，H8 使用三线性形函数。形函数在参考单元上定义，通过雅可比矩阵映射到物理单元。数值积分计算单元刚度，再按共享节点的自由度编号装配整体矩阵。单元朝向错误或雅可比退化会破坏分析。')+
 eq("\\begin{aligned}K&=\\sum_e A_e^{\\mathsf T}k_eA_e\\\\K_{ff}u_f&=f_f-K_{fc}u_c\\end{aligned}")+
 p('Aₑ 是自由度装配映射，下标 f/c 分别表示自由与约束自由度。这里的固定端满足 u𝚌=0。Hard kill 还必须删除没有实体单元连接的空节点自由度；仅把这些节点留在矩阵中会产生零行。即使移除了零行，悬空实体或铰接机构仍可导致奇异矩阵。')+
 h('有限元分析的验证条件')+p('必要检查包括刚度对称性、刚体运动零能量、常应变补片试验、平衡残差，以及外功与应变能的一致性。优化图案合理不能替代这些检查。')+
 exercise('若所有单元都是实体，但结构没有任何支撑，增大 E 能否消除奇异性？','不能。刚体运动不产生应变，因而对应的零能量模态不会随 E 增大而消失。',true)+book],
 en:['Finite elements','3 · Isoparametric finite elements and stiffness assembly',
 eq("\\begin{aligned}u&\\approx Nu_e\\\\\\varepsilon_V&=Bu_e\\\\k_e&=\\int_{\\Omega_e}B^{\\mathsf T}DB\\,\\mathrm d\\Omega\\end{aligned}")+
 p('Q4 uses bilinear shape functions; H8 uses trilinear ones. A Jacobian maps reference-element derivatives to physical coordinates. Numerical quadrature gives element stiffness, and shared-node degree-of-freedom maps assemble the global system. Inverted or degenerate elements invalidate the analysis.')+
 eq("\\begin{aligned}K&=\\sum_e A_e^{\\mathsf T}k_eA_e\\\\K_{ff}u_f&=f_f-K_{fc}u_c\\end{aligned}")+
 p('Aₑ maps global to element displacements; f/c denote free/constrained DOFs. Fixed supports have u𝚌=0. Hard kill also removes DOFs attached only to void elements. Removing zero rows does not cure floating solid components or mechanisms: those can still make K singular.')+
 h('Verification conditions for finite-element analysis')+p('Check stiffness symmetry, zero energy for rigid motion, constant-strain patch tests, equilibrium residuals and work–energy consistency. A plausible optimized picture cannot replace these checks.')+
 exercise('Can increasing E make an unsupported solid structure nonsingular?','No. Rigid-body modes generate no strain, so their zero energy remains zero when E increases.')+book]},
{zh:['柔度与伴随敏度','4 · 柔度泛函与伴随灵敏度分析',
 eq("\\begin{aligned}C&=f^{\\mathsf T}u=u^{\\mathsf T}Ku\\\\U&=\\frac12 C\\end{aligned}")+
 p('本教材和当前 App 统一用 C 表示柔度，U 表示应变能。对于固定载荷，柔度越小，载荷方向的加权位移越小。不要把柔度直接解释为强度或所有位置的最大位移。')+
 p('与 Huang 和 Xie 专著对照时，注意其第 2–4 章将 ½fᵀu 记为 C 并称为 mean compliance，第 5.2 节则以小写 c 表示 fᵀu。本教材统一采用后者的数值定义。固定的正比例因子不改变最小化问题的解，但引用书中数值时必须先换算。')+
 h('固定载荷下的导数')+p('逗号下标 x 表示对设计变量 x 求导。')+eq("Ku=f\\quad\\Longrightarrow\\quad K u_{,x}=-K_{,x}u")+
 eq("C_{,x}=f^{\\mathsf T}u_{,x}=u^{\\mathsf T}Ku_{,x}=-u^{\\mathsf T}K_{,x}u")+
 p('对称刚度和固定 f 使伴随变量与位移相关，因此不必为每个设计变量重新求解位移导数。若 f 随设计变化，则应加上 2uᵀf,ₓ；忽略这个项会得到错误梯度。')+
 h('单自由度系统的解析解')+eq("\\begin{aligned}k(\\rho)&=k_0\\rho^p\\\\u&=\\frac{F}{k_0\\rho^p},\\\\C&=\\frac{F^2}{k_0\\rho^p}\\\\\\frac{\\mathrm dC}{\\mathrm d\\rho}&=-\\frac{pF^2}{k_0\\rho^{p+1}}\\end{aligned}")+
 exercise('保持几何和材料不变，将 F 加倍，u 和 C 如何变化？','u 加倍，C 变为四倍。把全部弹性模量加倍时，u 和 C 都减半。',true)+book+evolutionaryBook],
 en:['Compliance & adjoints','4 · Compliance and adjoint sensitivity analysis',
 eq("\\begin{aligned}C&=f^{\\mathsf T}u=u^{\\mathsf T}Ku\\\\U&=\\frac12 C\\end{aligned}")+
 p('C denotes compliance throughout this textbook and the current App; U denotes strain energy. At fixed loads, lower compliance reduces the load-weighted displacement. It is not a strength measure or a bound on every displacement component.')+
 p('When reading Huang and Xie, note that Chapters 2–4 denote ½fᵀu by C and call it mean compliance, whereas Section 5.2 uses lowercase c for fᵀu. This tutorial consistently uses the latter numerical definition. A fixed positive scale factor preserves the minimizers, but numerical values taken from the book must be converted before comparison.')+
 h('Differentiate equilibrium with fixed loads')+p('A comma subscript x denotes differentiation with respect to design variable x.')+eq("Ku=f\\quad\\Longrightarrow\\quad K u_{,x}=-K_{,x}u")+
 eq("C_{,x}=f^{\\mathsf T}u_{,x}=u^{\\mathsf T}Ku_{,x}=-u^{\\mathsf T}K_{,x}u")+
 p('Symmetry and fixed f make compliance self-adjoint: no separate displacement-derivative solve is needed for every variable. Design-dependent loads require the additional term 2uᵀf,ₓ. Dropping it gives an incorrect gradient.')+
 h('Analytical solution for a single spring')+eq("\\begin{aligned}k(\\rho)&=k_0\\rho^p\\\\u&=\\frac{F}{k_0\\rho^p},\\\\C&=\\frac{F^2}{k_0\\rho^p}\\\\\\frac{\\mathrm dC}{\\mathrm d\\rho}&=-\\frac{pF^2}{k_0\\rho^{p+1}}\\end{aligned}")+
 exercise('With unchanged geometry and material, what does doubling F do?','Displacement doubles and compliance quadruples. Doubling all elastic moduli instead halves both displacement and compliance.')+book+evolutionaryBook]},
{zh:['SIMP 与 OC 更新','5 · SIMP 材料插值与最优性准则',
 eq("\\begin{aligned}k_e(\\widetilde\\rho_e)&=[\\eta+(1-\\eta)\\widetilde\\rho_e^{\\,p}]k_e^0\\\\\\eta&=\\frac{E_{\\min}}{E_0}\\end{aligned}")+
 p('ρ̃ 是用于分析的物理密度，kₑ⁰ 是实体单元刚度。p>1 降低中间密度的单位材料刚度效率；η>0 防止空区域导致奇异刚度。App 的 SIMP 采用 η=10⁻⁹、密度滤波和 OC 更新，设计变量允许降到零。p=3 是常见选择，并非普适最优参数。')+
 eq("\\frac{\\partial C}{\\partial\\widetilde\\rho_e}=-p(1-\\eta)\\widetilde\\rho_e^{\\,p-1}u_e^{\\mathsf T}k_e^0u_e")+
 h('体积乘子与移动限')+p('令拉格朗日函数 L=C+λ(V−V*)。内部自由变量满足 C,ₓ+λV,ₓ=0，边界变量还需满足互补条件。OC 用这一平衡构造乘法更新，λ 由二分搜索满足体积约束。')+
 eq("\\begin{aligned}x_j^{\\mathrm{new}}&=\\operatorname{clip}\\!\\left(x_j\\sqrt{\\frac{-C_{,x_j}}{\\lambda V_{,x_j}}},x_j^-,x_j^+\\right),\\\\x_j^-&=\\max(0,x_j-m)\\\\x_j^+&=\\min(1,x_j+m)\\end{aligned}")+
 exercise('为什么体积约束应使用滤波后的密度，而不是原始 x？','有限元刚度来自物理密度 ρ̃，因此材料用量也必须用 ρ̃ 定义。边界处滤波权重不均匀时，Σx 不一定等于 Σρ̃。',true)+simp],
 en:['SIMP & OC updates','5 · SIMP interpolation and optimality criteria',
 eq("\\begin{aligned}k_e(\\widetilde\\rho_e)&=[\\eta+(1-\\eta)\\widetilde\\rho_e^{\\,p}]k_e^0\\\\\\eta&=\\frac{E_{\\min}}{E_0}\\end{aligned}")+
 p('Physical density ρ̃ enters analysis; kₑ⁰ is solid stiffness. A penalty p>1 makes intermediate density less efficient. Positive η supplies residual stiffness. App uses η=10⁻⁹, density filtering and OC, with design variables allowed to reach zero. The common choice p=3 is not universally optimal.')+
 eq("\\frac{\\partial C}{\\partial\\widetilde\\rho_e}=-p(1-\\eta)\\widetilde\\rho_e^{\\,p-1}u_e^{\\mathsf T}k_e^0u_e")+
 h('Volume multiplier and move limit')+p('For L=C+λ(V−V*), an interior variable satisfies C,ₓ+λV,ₓ=0; bounds require complementary conditions. The OC step uses this balance. Bisection chooses λ to satisfy physical volume, and m limits one iteration’s change.')+
 eq("\\begin{aligned}x_j^{\\mathrm{new}}&=\\operatorname{clip}\\!\\left(x_j\\sqrt{\\frac{-C_{,x_j}}{\\lambda V_{,x_j}}},x_j^-,x_j^+\\right),\\\\x_j^-&=\\max(0,x_j-m)\\\\x_j^+&=\\min(1,x_j+m)\\end{aligned}")+
 exercise('Why constrain filtered density rather than the raw x?','Stiffness is evaluated using physical density, so material volume must use it too. Near boundaries, row normalization means Σx need not equal Σρ̃.')+simp]},
{zh:['滤波与网格尺度','6 · 密度滤波、链式求导与长度尺度',
 eq("\\begin{aligned}H_{ei}&=\\max(0,R-\\lVert X_e-X_i\\rVert),\\\\W_{ei}&=\\frac{H_{ei}}{\\sum_j H_{ej}}\\\\\\widetilde\\rho&=Wx\\end{aligned}")+
 p('行归一化使常量密度保持常量。密度滤波改变从设计变量到物理材料的映射；敏度滤波则直接平滑更新信号。二者不是同一算法，也不能混用链式法则。')+
 eq("\\begin{aligned}\\nabla_x C&=W^{\\mathsf T}\\nabla_{\\widetilde\\rho}C\\\\\\nabla_x V&=W^{\\mathsf T}v\\end{aligned}")+
 h('尺度与病态')+p('低阶离散中可能出现棋盘格；没有长度尺度约束时，细化网格还可能产生越来越细的结构。滤波改善数值行为，但不能自动保证最小构件尺寸、单一连通性或可制造性。')+
 p('App 的 r 以单元边长为单位，实际半径 R=rh。域尺寸为 Nx·h、Ny·h、Nz·h。做相同物理域的网格加密时，应同时减小 h、增大单元数量，并保持 rh 不变。二维厚度仍为 1。')+
 exercise('Nx、Ny 加倍且 h 减半，为保持物理滤波半径，r 应如何变化？','r 也加倍。三维还应将 Nz 加倍，才能保持厚度不变。',true)+source('https://doi.org/10.1007/BF01214002','Sigmund, O., & Petersson, J. (1998). Numerical instabilities in topology optimization: A survey on procedures dealing with checkerboards, mesh-dependencies and local minima. Structural Optimization, 16, 68–75.')],
 en:['Filtering & mesh scale','6 · Density filtering, chain rules and length scales',
 eq("\\begin{aligned}H_{ei}&=\\max(0,R-\\lVert X_e-X_i\\rVert),\\\\W_{ei}&=\\frac{H_{ei}}{\\sum_j H_{ej}}\\\\\\widetilde\\rho&=Wx\\end{aligned}")+
 p('Row normalization preserves constant density. Density filtering changes the design-to-material map; sensitivity filtering smooths an update signal. They are different algorithms and cannot share a chain rule indiscriminately.')+
 eq("\\begin{aligned}\\nabla_x C&=W^{\\mathsf T}\\nabla_{\\widetilde\\rho}C\\\\\\nabla_x V&=W^{\\mathsf T}v\\end{aligned}")+
 h('Numerical length scales')+p('Low-order discretizations can exhibit checkerboards. Without a length scale, refinement may favor ever finer structures. Filtering improves numerical behavior but does not automatically guarantee minimum member size, connectivity or manufacturability.')+
 p('In App, r is measured in element edges: physical radius is R=rh. Domain dimensions are Nx·h, Ny·h and Nz·h. To refine the same physical problem, decrease h, increase counts and hold rh fixed. Plane-stress thickness remains 1.')+
 exercise('If Nx and Ny double and h halves, how should r change?','Double r to keep rh fixed. In 3D, double Nz too so thickness remains unchanged.')+source('https://doi.org/10.1007/BF01214002','Sigmund, O., & Petersson, J. (1998). Numerical instabilities in topology optimization: A survey on procedures dealing with checkerboards, mesh-dependencies and local minima. Structural Optimization, 16, 68–75.')]},
{zh:['ESO：单向演化','7 · 单向演化法的删除准则与不可逆性',
 h('从材料删除建立演化过程')+p('从一个含有较多材料的设计出发，先计算受力状态，再找出对当前性能贡献较小的区域，移除少量材料并重新分析。这构成 ESO 的基本循环。每次删除都会改变剩余结构的受力，因此不能只在初始设计上排序一次就完成优化。')+
 h('应力拒绝准则')+p('原始应力型 ESO 用单元 von Mises 应力与当前结构最大 von Mises 应力之比评价材料利用程度。低于拒绝比 RR 的单元被删除；在当前 RR 下没有更多单元满足删除条件时，再逐步提高 RR。')+
 eq("\\frac{\\sigma_{\\mathrm{VM},e}}{\\sigma_{\\mathrm{VM},\\max}}<RR")+
 p('RR 是相对应力的门槛。例如 RR=0.05 时，判据选中应力低于当前最大值 5% 的单元，并不表示删除 5% 的材料。应力准则提供了一种演化思想；若研究体积约束下的最小柔度，还需建立与柔度变化相联系的删除准则。')+
 p('专著第 2.2 节将拒绝比的递增量也记为 ER，第 2.3 节则用 ERR 表示单元删除比例。本教材和 App 的 ER 采用第 3.4 节的体积演化率含义，定义见下文。阅读不同版本时，应先确认参数所控制的量。')+
 h('从柔度敏度评价材料价值')+p('第 4 章表明，在固定载荷下增加单元刚度会降低柔度。对相同的微小密度减量，负柔度导数的绝对值越大，预计删除代价越高。因此可将其作为正的敏度数 α：高分材料优先保留，低分材料优先删除。该解释以当前平衡状态为基础。')+
 p('App 采用这一能量型 ESO 变体。以 ρmin=0.001 的弱材料代替被删除单元，按 Kₑ=ρᵖKₑ⁰ 分析全域。先计算原始敏度，再用第 6 章的邻域权重平滑；弱材料的 ρᵖ⁻¹ 因子也必须计入。最后只在现有实体中按滤波分数从低到高删除。')+
 eq("\\begin{aligned}V_{k+1}&=\\max(V^*,(1-ER)V_k),\\\\\\alpha_e&\\propto\\rho_e^{p-1}u_e^{\\mathsf T}k_e^0u_e\\\\\\widehat\\alpha&=W\\alpha\\end{aligned}")+
 h('演化率控制材料缩减速度')+p('这里 Vₖ 是第 k 步的计划体积，ER 是相对于它的缩减比例，V* 是最终预算。例如计划体积分数为 0.80、ER=0.02，且尚未接近目标时，下一步计划值为 0.784。ER 控制每步减少多少材料；前面的 RR 控制应力门槛，两者不能互换。实际体积还受整单元计数影响。')+
 p('逐步删除为重新分析留出机会，但较小 ER 并不保证得到全局最优解。已删除单元不能恢复，因此一次过早删除可能限制后续的传力路径。到达体积预算后，单向 ESO 的删除过程结束；第 8 章将引入允许材料交换的 BESO。')+
 exercise('ESO 与 BESO 都得到 50% 体积，是否应有相同形态？','不应如此要求。BESO 可以加回材料，ESO 不可以；更新历史、筛选准则与局部最优可能不同。',true)+evolutionaryBook+source('https://doi.org/10.1016/0045-7949(93)90035-C','Xie, Y. M., & Steven, G. P. (1993). A simple evolutionary procedure for structural optimization. Computers & Structures, 49, 885–896.')+source('https://doi.org/10.1016/S0045-7825(02)00464-4','Tanskanen, P. (2002). The evolutionary structural optimization method: theoretical aspects. Computer Methods in Applied Mechanics and Engineering, 191, 5485–5498.')],
 en:['ESO: one-way evolution','7 · Removal criteria and irreversibility in ESO',
 h('Build an evolution through material removal')+p('Start with a design containing ample material, compute its mechanical response, remove a small amount of material with a low contribution to the chosen performance measure, and analyze again. This is the basic ESO cycle. Each removal redistributes the load, so a single ranking of the initial design cannot determine the entire evolution.')+
 h('The stress-rejection criterion')+p('Original stress-based ESO compares each element’s von Mises stress with the current maximum. Elements below the rejection ratio RR are removed. When no further elements satisfy the criterion at the current RR, the threshold is raised gradually.')+
 eq("\\frac{\\sigma_{\\mathrm{VM},e}}{\\sigma_{\\mathrm{VM},\\max}}<RR")+
 p('RR is a relative-stress threshold. With RR=0.05, the criterion selects elements below 5% of the current maximum stress; it does not prescribe removal of 5% of the material. For volume-constrained minimum compliance, a removal criterion must instead be related to the change in compliance.')+
 p('Section 2.2 of the book also uses ER for the increment in rejection ratio, while Section 2.3 uses ERR for the element-removal ratio. In this tutorial and App, ER means the evolutionary volume ratio of Section 3.4, defined below. Check the controlled quantity before transferring a parameter between formulations.')+
 h('Use compliance sensitivity to value material')+p('Chapter 4 shows that adding element stiffness reduces compliance under fixed loads. For equal small density reductions, a larger magnitude of the negative compliance derivative predicts a greater removal cost. This motivates a positive sensitivity number α: retain high-scoring material and remove low-scoring material first. The estimate refers to the current equilibrium state.')+
 p('App uses this energy-based ESO variant. Removed elements retain a weak density ρmin=0.001, and analysis uses Kₑ=ρᵖKₑ⁰ throughout the domain. Compute raw sensitivities, including the weak-phase factor ρᵖ⁻¹, then smooth them with the neighborhood weights of Chapter 6. Only existing solids are eligible for removal, in ascending order of filtered score.')+
 eq("\\begin{aligned}V_{k+1}&=\\max(V^*,(1-ER)V_k),\\\\\\alpha_e&\\propto\\rho_e^{p-1}u_e^{\\mathsf T}k_e^0u_e\\\\\\widehat\\alpha&=W\\alpha\\end{aligned}")+
 h('The evolution rate controls volume reduction')+p('Here Vₖ is the scheduled volume at step k, ER is its fractional reduction, and V* is the final budget. For a scheduled fraction of 0.80 and ER=0.02, the next scheduled fraction is 0.784 while the target remains inactive. ER controls how much material is removed per step; RR controls a stress threshold. They are not interchangeable. Whole-cell counting also affects the actual volume.')+
 p('Gradual removal allows repeated analysis, but a smaller ER does not guarantee global optimality. Removed cells cannot return, so an early removal can restrict later load paths. At the target budget, the one-way removal process ends. Chapter 8 introduces BESO, which permits material exchanges.')+
 exercise('Should ESO and BESO produce identical shapes at 50% volume?','No. Their admissible updates differ: BESO can restore material. Removal criteria, history and local optima also matter.')+evolutionaryBook+source('https://doi.org/10.1016/0045-7949(93)90035-C','Xie, Y. M., & Steven, G. P. (1993). A simple evolutionary procedure for structural optimization. Computers & Structures, 49, 885–896.')+source('https://doi.org/10.1016/S0045-7825(02)00464-4','Tanskanen, P. (2002). The evolutionary structural optimization method: theoretical aspects. Computer Methods in Applied Mechanics and Engineering, 191, 5485–5498.')]},
{zh:['BESO：双向演化','8 · 双向演化法的敏度估计与材料恢复',
 h('从单向删除到双向材料分配')+p('材料删除改变传力路径后，原先不重要的区域可能重新变得有用。BESO 允许这些区域参与下一轮竞争：既删除低敏度实体，也恢复高敏度空单元。到达目标体积后，仍可用一处删除补偿另一处加入，在材料总量基本不变的条件下调整布局。')+
 p('问题仍是第 1 章的体积约束柔度最小化。新的困难在于：必须为实体与空区域构造可比较的敏度数。Soft kill 和 hard kill 对空区域采用不同的力学模型，因而需要不同的敏度估计。')+
 h('Soft kill：由材料插值得到敏度')+p('取 ρ∈{ρmin,1}，Kₑ=ρᵖKₑ⁰，弱材料密度 ρmin=0.001。第 4 章的导数给出正排序分数 αₑ=ρᵖ⁻¹Uₑ⁰，其中 Uₑ⁰=½uₑᵀKₑ⁰uₑ；所有单元共有的正系数不影响排序。Uₑ⁰ 用当前位移和实体参考刚度计算，不能与弱单元实际储存的能量混为一谈。')+
 p('本应用随后以单元中心距离对 α 做空间滤波，对应专著附录 4.1 的滤波形式；第 3.3.2 节正文采用的则是节点敏度投影。虽然刚度插值与 SIMP 相似，BESO 每次更新只选择实体或弱材料两个状态，SIMP 的设计密度则可连续变化。')+
 h('Hard kill：从邻近实体估计恢复价值')+p('取 ρ∈{0,1}，空单元完全不贡献刚度。空单元没有可直接用于恢复排序的实体应变能，因此先把邻近实体的能量平均到节点，再以距离权重估计各单元中心的敏度。下节给出这一外推过程。')+
 p('真正移除刚度可能产生机构或悬空材料。发生奇异分析时应报告失败并检查网格、滤波和演化率，不能将弱材料分析的结果报告为 hard kill。')+
 exercise('空单元没有刚度和应变能，hard kill 如何决定在哪里加回材料？','通过邻近实体的节点敏度外推与空间滤波估计空区域的材料价值；不能直接把所有空区域的恢复敏度永久设为零。',true)+evolutionaryBook+beso],
 en:['BESO: two-way evolution','8 · Sensitivity estimation and material recovery in BESO',
 h('From one-way removal to two-way allocation')+p('When removal changes a load path, a previously unimportant region can become useful again. BESO lets it compete in the next update: remove low-scoring solids and restore high-scoring void cells. After reaching the target volume, removal in one region can compensate for addition elsewhere, allowing redistribution at approximately constant material usage.')+
 p('The problem remains the volume-constrained minimum-compliance problem of Chapter 1. The new difficulty is to construct comparable sensitivity numbers for solid and void. Soft and hard kill model void differently and therefore need different sensitivity estimates.')+
 h('Soft kill: derive sensitivities from interpolation')+p('Use ρ∈{ρmin,1}, Kₑ=ρᵖKₑ⁰ and weak density ρmin=0.001. The derivative in Chapter 4 gives the positive ranking score αₑ=ρᵖ⁻¹Uₑ⁰, where Uₑ⁰=½uₑᵀKₑ⁰uₑ; a common positive multiplier does not change the ranking. Uₑ⁰ uses the current displacement and reference solid stiffness. It is not the energy actually stored in a weak element.')+
 p('App then filters α using element-center distances, as in the filtering routine of Appendix 4.1. Section 3.3.2 of the book instead projects nodal sensitivities. Although the stiffness interpolation resembles SIMP, each BESO update chooses between two material states, while SIMP permits continuous design densities.')+
 h('Hard kill: estimate recovery value from nearby solids')+p('Use ρ∈{0,1}; void contributes no stiffness. Void cells have no solid strain energy available for direct recovery ranking. First average neighboring solid energies onto nodes, then use distance weights to estimate sensitivities at cell centers. The next section develops this extrapolation.')+
 p('Exact removal can create mechanisms or floating material. A singular analysis must be reported; inspect mesh, filtering and evolution rate rather than silently replacing hard kill with weak material.')+
 exercise('With no energy in void elements, how can hard kill add material?','Extrapolate neighboring solid nodal sensitivities and spatially filter them. Permanently assigning every void zero restoration sensitivity would prevent meaningful reintroduction.')+evolutionaryBook+beso]},
{zh:['Level set：边界演化','9 · 隐式边界与 Hamilton–Jacobi 方程',
 eq("\\begin{aligned}\\Omega&=\\{X:\\phi(X)>0\\}\\\\\\Gamma&=\\{X:\\phi(X)=0\\},\\\\n_{\\mathrm{out}}&=-\\frac{\\nabla\\phi}{\\lVert\\nabla\\phi\\rVert}\\end{aligned}")+
 p('本教材取实体内部 φ>0。符号距离在边界附近满足 |∇φ|≈1。令边界点以外法向速度 Vₙ 移动，对 φ(x(t),t)=0 求导，得到以下符号约定；若改为内部为负，方程符号也必须改变。')+
 eq("\\frac{\\partial\\phi}{\\partial t}-V_n\\lVert\\nabla\\phi\\rVert=0")+
 h('速度来自目标的形状导数')+p('对固定载荷、无体力的自由设计边界，柔度形状导数以局部弹性能密度决定保留材料的价值；体积乘子控制法向速度的平均偏移。曲率正则项用于平滑边界。载荷或支撑边界的特殊项不能随意套用自由边界公式。')+
 p('App 使用实体侧能量延拓、迎风 Godunov 离散、CFL 步长限制和周期性距离重初始化；在固定体积下用实际有限元结果回退使柔度增加的步。窄界面带用平滑 Heaviside 与弱材料计算刚度。二维绘制零等值线，三维为体素近似。')+
 h('形状法能改变什么拓扑？')+p('已有孔洞能合并或消失，但纯边界演化不能保证从无孔实体中产生新孔洞。因此当前方法以规则孔洞初始化。它是经典 Hamilton–Jacobi 形状优化路线的离散实现，不是所有 level set 方法，也尚未与论文完整优化轨迹逐步复现对照。')+
 exercise('若 φ=x−a 且 Vₙ=1，短时间 Δt 后零界面在哪里？','φ 新值为 x−a+Δt，因此零界面从 a 移到 a−Δt。这里实体是 x>a，外法向为 −x，移动方向正确。',true)+ls],
 en:['Level-set boundaries','9 · Implicit geometry and Hamilton–Jacobi transport',
 eq("\\begin{aligned}\\Omega&=\\{X:\\phi(X)>0\\}\\\\\\Gamma&=\\{X:\\phi(X)=0\\},\\\\n_{\\mathrm{out}}&=-\\frac{\\nabla\\phi}{\\lVert\\nabla\\phi\\rVert}\\end{aligned}")+
 p('We use positive φ inside solid. Signed distance satisfies |∇φ|≈1 near the interface. Differentiate φ(x(t),t)=0 for a point moving with outward normal speed Vₙ to obtain the convention below. Reversing the inside sign requires reversing the corresponding transport sign.')+
 eq("\\frac{\\partial\\phi}{\\partial t}-V_n\\lVert\\nabla\\phi\\rVert=0")+
 h('Shape derivatives determine boundary speed')+p('On a free design boundary with fixed loads and no body forces, elastic energy density governs the compliance value of material. A volume multiplier shifts normal speed; curvature regularization smooths the boundary. Load and support boundary terms cannot be replaced indiscriminately by a free-boundary formula.')+
 p('App uses solid-side energy extension, Godunov upwinding, a CFL step limit and periodic distance reconstruction. At fixed volume, FEA backtracks compliance-increasing trials. A smoothed Heaviside band and weak material define stiffness. The 2D view draws the zero contour; 3D is a voxel approximation.')+
 h('Which topology changes are possible?')+p('Existing holes can merge or disappear, but pure boundary transport does not guarantee hole nucleation in a solid interior. This version therefore starts with seeded holes. It discretizes the classical Hamilton–Jacobi shape-optimization route; it is not every level-set formulation and has not reproduced a complete published optimization trajectory step by step.')+
 exercise('If φ=x−a and Vₙ=1, where is the interface after Δt?','The new field is x−a+Δt, so the zero moves to a−Δt. Solid occupies x>a and its outward normal points toward −x, consistent with the motion.')+ls]},
{zh:['收敛与可信度','10 · 数值收敛、可行性与验证层次',
 h('至少检查不同残差')+p('状态方程的残差衡量有限元平衡；体积误差衡量可行性；设计变化与目标历史衡量迭代稳定性。这些量回答不同问题。柔度不变可能意味着收敛，也可能是更新被拒绝、设计变量停留在变量边界或数值实现不一致。')+
 eq("\\begin{aligned}r_{\\mathrm{eq}}&=\\frac{\\lVert K_{ff}u_f-f_f\\rVert}{\\lVert f_f\\rVert}\\\\r_V&=\\frac{|V-V^*|}{V^*},\\\\\\Delta x&=\\lVert x^{k+1}-x^k\\rVert_\\infty\\end{aligned}")+
 h('梯度验证')+eq("d_{\\mathrm{FD}}=\\frac{C(x+\\epsilon e_j)-C(x-\\epsilon e_j)}{2\\epsilon}")+
 p('在不触及设计边界的点比较解析梯度和中心差分。ε 太大会引入截断误差，太小则放大求解及舍入误差；应在一段 ε 范围内观察误差趋势。单次差分通过并不能证明整个优化更新正确。')+
 h('验证证据的层级')+p('解析补片与尺度律检查力学；独立装配／求解器对照检查实现；逐步轨迹对照检查具体算法；网格研究检验离散依赖；实验验证物理模型。不能把其中一层替代其余层。当前应用的具体测试及尚未完成的文献轨迹对照列在项目验证文档中。')+
 exercise('运行显示“达到迭代上限”，可以在报告里写“已收敛的最优结构”吗？','不可以。应报告迭代数、体积误差、目标变化和停止原因，并将结果称为当前迭代设计。',true)+book],
 en:['Convergence & verification','10 · Numerical convergence, feasibility and verification',
 h('Check different kinds of residual')+p('Equilibrium residual measures the FE solve, volume error measures feasibility, and design/energy changes measure iteration stability. Constant compliance may indicate convergence, rejected updates, bound locking or an inconsistent numerical implementation. These explanations must be distinguished.')+
 eq("\\begin{aligned}r_{\\mathrm{eq}}&=\\frac{\\lVert K_{ff}u_f-f_f\\rVert}{\\lVert f_f\\rVert}\\\\r_V&=\\frac{|V-V^*|}{V^*},\\\\\\Delta x&=\\lVert x^{k+1}-x^k\\rVert_\\infty\\end{aligned}")+
 h('Check derivatives independently')+eq("d_{\\mathrm{FD}}=\\frac{C(x+\\epsilon e_j)-C(x-\\epsilon e_j)}{2\\epsilon}")+
 p('Compare analytic gradients with central differences away from bounds. Large ε has truncation error; tiny ε amplifies solve and roundoff errors. Examine a range of steps. Passing a derivative check alone does not validate the entire optimizer.')+
 h('A hierarchy of evidence')+p('Analytic patch and scaling tests check mechanics. Independent assembly and solvers check implementation. Stepwise trajectories check a particular algorithm. Mesh studies check discretization dependence. Experiments check the physical model. One level cannot replace the others; project validation notes identify implemented checks and remaining literature-reproduction gaps.')+
 exercise('Can a run that reached its iteration cap be reported as a converged optimum?','No. Report iterations, volume error, objective changes and stopping reason; call it the current iterate.')+book]},
{zh:['悬臂梁实验','11 · 悬臂梁算例与可重复性协议',
 h('实验 A：验证尺度律')+p('使用本章配套命令固定全实体设计，令载荷从 −1 改为 −2，验证 C 为原来的 4 倍；再将 E 从 1 改为 2，验证 C 减半。命令的 mechanics 部分只求解固定密度场，不运行优化。App 的 Start 会重新初始化优化，因此不用于本实验。')+
 h('实验 B：公平比较方法')+p('记录方法及变体、网格、h、r、材料、总载荷、加载位置、体积目标、停止条件与迭代上限。SIMP 从均匀密度开始，BESO/ESO 从实体开始，level set 从孔洞设计开始，因此起始 C 不应直接排名。比较最终 C 前先确认实际体积相同。')+
 p('参照专著第 5.3 节，将每种方法的参数、实际体积、最终柔度、停止原因与计算耗时放在同一张结果表中，再讨论形态。迭代次数不是统一的成本单位：不同方法每步的求解规模和停止条件可能不同。App 当前固定各方法的初始化，未提供自定义初始设计入口，因此本实验不能检验对任意初始形态的独立性。')+
 h('实验 C：离散网格敏感性（节点载荷）')+p('以 40×25、h=2、r=1.5 与 80×50、h=1、r=3 比较二维域 80×50。三维可用 40×25×2、h=2 与 80×50×4、h=1。总载荷保持不变，且加载位置相同；奇数网格在相邻节点间分配载荷。这只能检查当前离散模型的网格敏感性，不能据此宣称柔度收敛到非奇异连续体解。只有两个网格也不足以估计收敛阶。')+
 h('实验 D：区分显示和分析')+p('SIMP 的灰度不是实体/空洞制造图。对阈值化后的形态应重新分析，不能沿用连续密度的柔度。Level set 的过渡带和体素显示也有离散误差。记录导出的密度和求解设置，而不是只保留截图。')+
 h('实验 E：观察演化路径')+p('使用默认 80×50 悬臂梁，固定 BESO 的 kill 模式、体积目标、滤波半径、材料及停止条件，只改变 ER，例如分别取 0.01、0.02 和 0.04。先比较相同实际体积附近的设计，再比较目标体积阶段的柔度、材料交换和停止原因。必要时提高共同的迭代上限，使较小 ER 的运行有机会完成体积缩减。')+
 p('缩减材料时柔度可能上升，这并不单独表示算法错误；应同时看材料节省了多少。到达目标体积后，重点观察材料交换能否改善布局，以及目标与设计是否稳定。较小 ER 通常需要更多步才能达到预算，但最终形态和柔度须由实验确定。本实验不预设哪一个 ER 最好。')+
 exercise('把 80×50 改为 160×100，同时保持 h=1 和 r=3，算不算同一物理问题的网格收敛研究？','不算。物理尺寸加倍而物理滤波半径不变；三维厚度若未同步改变，还会改变长厚比。',true)],
 en:['Cantilever experiments','11 · Cantilever benchmarks and a reproducibility protocol',
 h('A: scaling laws')+p('Use the companion command below to hold a fully solid design fixed. Changing force from −1 to −2 must quadruple C; doubling E must halve C. The command’s mechanics section solves a fixed density field without optimization. App Start reinitializes optimization and is not the workflow for this experiment.')+
 h('B: compare methods fairly')+p('Record the method variant, mesh, h, r, material, total load and position, volume target, stopping criteria and iteration budget. SIMP begins at uniform density, BESO/ESO begin solid and level set begins perforated. Initial C values are not a fair ranking. Match actual final volume before comparing final C.')+
 p('Following the comparison format of Section 5.3 of the book, tabulate parameters, actual volume, final compliance, stopping reason and elapsed time before discussing shape. Iteration count is not a common cost unit: solve sizes and stopping criteria can differ between methods. App currently fixes each method’s initialization and has no custom initial-design input, so this experiment cannot establish independence from arbitrary starting layouts.')+
 h('C: discrete mesh sensitivity with nodal loads')+p('Compare 40×25, h=2, r=1.5 with 80×50, h=1, r=3 for the same 80×50 plane domain. In 3D use 40×25×2, h=2 and 80×50×4, h=1. Keep the resultant and its position unchanged; odd grids split the force between adjacent nodes. This probes the discrete model’s mesh sensitivity, not convergence to a nonsingular continuum compliance. Two meshes alone also do not determine a convergence order.')+
 h('D: separate display from analysis')+p('SIMP gray density is not a manufactured solid–void part. Thresholding requires reanalysis; the continuous design’s compliance cannot be reused. Level-set transition bands and voxel views also have discretization errors. Export densities and settings, not only screenshots.')+
 h('E: observe the evolutionary path')+p('Use the default 80×50 cantilever and hold the BESO kill mode, target volume, filter radius, material and stopping criteria fixed. Change only ER, for example to 0.01, 0.02 and 0.04. First compare designs near the same actual volume, then compare compliance, material exchanges and termination during the target-volume stage. Increase the common iteration limit if necessary so the smaller ER can complete volume reduction.')+
 p('Compliance can rise while material is removed; this alone does not indicate an error. Read it alongside the reduction in material usage. At the target volume, examine whether exchanges improve the layout and whether both the objective and design stabilize. A smaller ER generally takes more steps to reach the budget, but its final shape and compliance must be determined experimentally. No best ER is assumed here.')+
 exercise('Is changing 80×50 to 160×100 while keeping h=1 and r=3 a fixed-domain mesh study?','No. Physical dimensions double while physical filter radius stays fixed. Unchanged 3D thickness would additionally alter aspect ratios.')]},
{zh:['方法对照与文献','12 · 方法比较、适用范围与参考文献',
 p('本文以线弹性最小柔度问题为统一背景，讨论密度法、演化法与隐式边界法。以下文献分别给出其理论基础和代表性数值构造；软件与文献之间的对应关系须以具体假设、离散和验证证据界定。')+
 h('应用中的方法名称')+p('SIMP：残余刚度插值、密度滤波、OC。BESO soft kill：弱材料与双向敏度更新。BESO hard kill：零刚度移除、节点敏度外推及全域排序。ESO：应变能准则的单向弱材料版本。Level set：固定网格、带孔初始化的 Hamilton–Jacobi 边界演化。')+
 evolutionaryBook+book+simp+beso+source('https://doi.org/10.1016/S0045-7825(02)00464-4','Tanskanen, P. (2002). The evolutionary structural optimization method: theoretical aspects. Computer Methods in Applied Mechanics and Engineering, 191, 5485–5498.')+ls+
 h('计算报告的必要信息')+p('问题定义、算法变体和公式、离散与求解参数、初始化、停止条件、验证证据、未满足的约束及适用范围。图像只能展示结果的一部分。结论应限定于所采用的物理模型、设计空间与数值精度，并区分局部驻点、迭代稳定性和全局最优性。')],
 en:['Method map & references','12 · Method comparison, scope and references',
 p('This text uses linear-elastic minimum compliance as a common setting for density, evolutionary and implicit-boundary methods. The references establish theoretical foundations and representative numerical constructions; correspondence between software and literature is defined by matched assumptions, discretizations and verification evidence.')+
 h('What each App name means')+p('SIMP: residual-stiffness interpolation, density filter and OC. Soft-kill BESO: weak material with bidirectional sensitivity updates. Hard-kill BESO: zero-stiffness removal, nodal extrapolation and global ranking. ESO: a one-way, strain-energy, weak-material variant. Level set: fixed-grid Hamilton–Jacobi boundary evolution initialized with holes.')+
 evolutionaryBook+book+simp+beso+source('https://doi.org/10.1016/S0045-7825(02)00464-4','Tanskanen, P. (2002). The evolutionary structural optimization method: theoretical aspects. Computer Methods in Applied Mechanics and Engineering, 191, 5485–5498.')+ls+
 h('Required information in a computational report')+p('State the problem, algorithm variant and equations, discretization and solver parameters, initialization, stopping rules, validation evidence, unmet constraints and model scope. Pictures show only part of the result. Conclusions must be restricted to the physical model, admissible design space and numerical accuracy, distinguishing local stationarity, iteration stability and global optimality.')]}];

const table=(head,rows)=>`<div class="theory-table"><table><thead><tr>${head.map(s=>`<th scope="col">${s}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(s=>`<td>${s}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const note=(title,body)=>`<aside class="theory-note"><h3>${title}</h3>${p(body)}</aside>`;
// Each supplement makes the assumptions and derivations explicit; implementation
// qualifications are separated from the continuum equations they approximate.
const supplements=[
{fig:'domain',
 zh:['研究对象为给定设计域内、固定外载作用下的线弹性材料分布。以状态方程为约束，将结构刚度最大化表述为柔度最小化，并区分几何描述、设计变量和有限元分析中的物理密度。',
 h('连续描述与离散设计空间')+p('令 D⊂ℝᵈ 为固定设计域，d∈{2,3}，Ω⊆D 为材料占据区域。其特征函数 χΩ(X) 在实体内为 1、空洞内为 0。连续固–空设计的体积为 V(Ω)=∫DχΩdX。实际计算中将 D 划分为 n 个单元，使用逐单元密度近似材料分布；形状法则以隐式函数描述 Ω 的边界。')+
 p('为避免混淆，X 表示空间坐标，x 表示密度法的独立设计变量，ρ̃ 表示进入刚度和体积计算的物理密度。一般关系为 ρ̃=𝒫(x)；无滤波时 𝒫 为恒等映射。二值设计空间非凸，SIMP 的惩罚插值通常也产生非凸优化问题，因此局部迭代所得设计不具有全局最优保证。')+
 table(['符号','定义'],[['D, Ω, Γ','固定设计域、实体区域与设计边界'],['x, ρ̃, φ','独立密度变量、物理密度、水平集函数'],['u, f, K','节点位移、固定载荷、装配刚度矩阵'],['E₀, ν, η','实体杨氏模量、泊松比、残余刚度比'],['vₑ, V*, fᵥ','单元体积、体积预算、目标体积分数'],['h, r, R','单元边长、以单元计量的滤波半径、物理滤波半径 R=rh']])],
 en:['The problem is the distribution of linear-elastic material within a fixed domain under prescribed external loading. Structural stiffness is measured by compliance, with equilibrium imposed as a state constraint. Geometry, independent design variables and analysis densities are distinguished throughout.',
 h('Continuum description and discrete design space')+p('Let D⊂ℝᵈ be a fixed domain, d∈{2,3}, and Ω⊆D its solid region. The characteristic function χΩ(X) equals one in solid and zero in void, giving V(Ω)=∫DχΩdX. Computation partitions D into n elements and approximates material by elementwise densities; shape methods instead describe the boundary of Ω implicitly.')+
 p('Spatial coordinates are denoted by X, independent density variables by x, and analysis densities by ρ̃. In general ρ̃=𝒫(x); without filtering, 𝒫 is the identity. The binary design space is nonconvex, and penalized SIMP generally also yields a nonconvex problem. Local iteration therefore does not establish global optimality.')+
 table(['Symbol','Definition'],[['D, Ω, Γ','Fixed domain, solid region and design boundary'],['x, ρ̃, φ','Independent density, physical density and level-set function'],['u, f, K','Nodal displacement, prescribed force and assembled stiffness'],['E₀, ν, η','Solid Young’s modulus, Poisson ratio and residual stiffness ratio'],['vₑ, V*, fᵥ','Element volume, volume budget and target fraction'],['h, r, R','Element edge, radius in element units and physical radius R=rh']])]},
{zh:['线弹性分析为优化提供状态解。本节从局部平衡导出弱形式，明确位移空间、自然边界条件和本构假设；后续灵敏度公式均以这些条件成立为前提。',
 h('位移空间与能量原理')+eq("\\begin{aligned}\\mathcal V&=\\{v\\in H^1(\\Omega)^d:v=0\\text{ on }\\Gamma_D\\},\\\\a(u,v)&=\\ell(v)\\qquad\\forall v\\in\\mathcal V\\end{aligned}")+
 eq("\\begin{aligned}a(u,v)&=\\int_\\Omega\\varepsilon(v):\\mathbb D:\\varepsilon(u)\\,\\mathrm d\\Omega,\\\\\\ell(v)&=\\int_\\Omega b\\cdot v\\,\\mathrm d\\Omega+\\int_{\\Gamma_N}t\\cdot v\\,\\mathrm d\\Gamma\\end{aligned}")+
 p('这里 𝔻 为四阶弹性张量，D 为其 Voigt 矩阵表示（与作为集合的设计域 D 由上下文区分）。将强形式乘以试函数并分部积分，边界项中的 σn 由给定表面力 t 替代，即得弱形式。对齐次位移约束，平衡位移是总势能 Π(v)=a(v,v)/2−ℓ(v) 的驻点；在材料正定、约束消除刚体模态且区域具有适当正则性时，该驻点为唯一极小值。')+
 note('点载荷的连续与离散含义','理想集中力可能产生局部奇异应力；有限元节点力是离散载荷定义。集中力还使加载点位移及包含该位移的柔度具有奇异极限问题。当前 App 使用节点力，适合固定网格的算法比较；若研究有限的连续体柔度极限，应改用固定物理范围的分布载荷，并保持加载区域和总力不变。')],
 en:['Elasticity supplies the state solution required by optimization. The weak form specifies the displacement space, natural boundary conditions and constitutive assumptions on which subsequent sensitivity expressions depend.',
 h('Admissible displacements and the energy principle')+eq("\\begin{aligned}\\mathcal V&=\\{v\\in H^1(\\Omega)^d:v=0\\text{ on }\\Gamma_D\\},\\\\a(u,v)&=\\ell(v)\\qquad\\forall v\\in\\mathcal V\\end{aligned}")+
 eq("\\begin{aligned}a(u,v)&=\\int_\\Omega\\varepsilon(v):\\mathbb D:\\varepsilon(u)\\,\\mathrm d\\Omega,\\\\\\ell(v)&=\\int_\\Omega b\\cdot v\\,\\mathrm d\\Omega+\\int_{\\Gamma_N}t\\cdot v\\,\\mathrm d\\Gamma\\end{aligned}")+
 p('The fourth-order elasticity tensor is denoted by 𝔻 and its Voigt matrix by D. Integration by parts transfers the equilibrium divergence onto the test function; the boundary term σn becomes the prescribed traction t. With homogeneous displacement constraints, equilibrium is stationary for Π(v)=a(v,v)/2−ℓ(v). Positive material stiffness, suitable domain regularity and supports that remove rigid modes make this stationary point the unique minimum.')+
 note('Concentrated loads','An ideal point force can generate a local stress singularity. A nodal force defines a discrete load. Loaded-point displacement, and compliance that includes it, also have a singular-limit issue. App uses nodal loads and supports fixed-mesh algorithm comparisons. Studying a finite continuum compliance limit requires a load distributed over a fixed physical region, with unchanged region and resultant.')]},
{fig:'elements',
 zh:['使用 Q4 与 H8 等参单元离散位移场，以数值积分构造单元刚度，再施加位移约束求解整体平衡。材料更新改变刚度系数，但不改变固定分析网格。',
 h('参考单元上的插值与积分')+eq("\\begin{aligned}N_a(\\xi,\\eta)&=\\frac14(1+\\xi_a\\xi)(1+\\eta_a\\eta)\\\\(\\xi_a,\\eta_a)&\\in\\{-1,1\\}^2\\end{aligned}")+
 eq("N_a(\\xi,\\eta,\\zeta)=\\frac18(1+\\xi_a\\xi)(1+\\eta_a\\eta)(1+\\zeta_a\\zeta)")+
 p('几何映射 X(ξ)=ΣₐNₐ(ξ)Xₐ 与位移插值使用相同形函数。若 Jᵢⱼ=∂Xᵢ/∂ξⱼ，则空间梯度为 ∇XNₐ=J⁻ᵀ∇ξNₐ。Q4 使用 2×2 Gauss 积分，H8 使用 2×2×2 Gauss 积分；对规则单元和单元内常量材料参数，该积分与这里采用的低阶插值相容。')+
 eq("k_e^0=\\sum_q B_q^{\\mathsf T}D_0B_q\\det(J_q)w_q")+
 p('二维积分还应乘以厚度 t，本应用取 t=1。Q4 使用工程剪应变 γxy=2εxy，与对应的 Voigt 本构矩阵配套。装配后的矩阵对称性是必要条件，但单独满足对称性不能证明形函数梯度、积分或自由度映射正确。')],
 en:['Q4 and H8 isoparametric elements approximate displacement. Quadrature constructs element stiffness, after which displacement constraints define the global equilibrium solve. Material updates alter stiffness coefficients on a fixed analysis mesh.',
 h('Reference interpolation and quadrature')+eq("\\begin{aligned}N_a(\\xi,\\eta)&=\\frac14(1+\\xi_a\\xi)(1+\\eta_a\\eta)\\\\(\\xi_a,\\eta_a)&\\in\\{-1,1\\}^2\\end{aligned}")+
 eq("N_a(\\xi,\\eta,\\zeta)=\\frac18(1+\\xi_a\\xi)(1+\\eta_a\\eta)(1+\\zeta_a\\zeta)")+
 p('Geometry X(ξ)=ΣₐNₐ(ξ)Xₐ and displacement use the same shape functions. Defining Jᵢⱼ=∂Xᵢ/∂ξⱼ gives ∇XNₐ=J⁻ᵀ∇ξNₐ. Q4 uses 2×2 Gauss quadrature and H8 uses 2×2×2. This quadrature is consistent with the regular elements and elementwise constant material parameters considered here.')+
 eq("k_e^0=\\sum_q B_q^{\\mathsf T}D_0B_q\\det(J_q)w_q")+
 p('Plane integration additionally includes thickness t, set to one here. Q4 uses engineering shear strain γxy=2εxy with the corresponding Voigt matrix. Symmetry of the assembled matrix is necessary, but alone does not verify shape-function gradients, quadrature or DOF mapping.')]},
{fig:'adjoint',
 zh:['通过对约束平衡方程求导，可在一次状态求解后获得全部设计变量的柔度梯度。推导采用对称线弹性刚度、齐次固定约束和设计无关载荷；这些条件决定了柔度问题的自伴随结构。',
 h('拉格朗日推导')+eq("\\mathcal L(u,x,\\psi)=f^{\\mathsf T}u+\\psi^{\\mathsf T}[K(x)u-f]")+
 eq("\\frac{\\partial\\mathcal L}{\\partial u}=f+K^{\\mathsf T}\\psi=0\\quad\\Longrightarrow\\quad\\psi=-u")+
 p('取平衡位移与伴随解后，状态导数项消去，得到 dC/dxⱼ=−uᵀ(∂K/∂xⱼ)u。这里的负号具有明确的物理意义：若增加设计变量使 ∂K/∂xⱼ 半正定，则柔度不能增加。若载荷、约束位置或规定非零位移随设计变化，则本推导必须加入相应导数项。')+
 h('多载荷推广与量纲')+eq("\\begin{aligned}C_\\Sigma&=\\sum_\\ell\\omega_\\ell f_\\ell^{\\mathsf T}u_\\ell,\\\\\\frac{\\partial C_\\Sigma}{\\partial x_j}&=-\\sum_\\ell\\omega_\\ell u_\\ell^{\\mathsf T}K_{,x_j}u_\\ell\\end{aligned}")+
 p('上述推广要求各载荷工况具有固定非负权重 ωℓ，并分别求解平衡；当前应用仅计算单载荷工况。柔度具有力乘长度的量纲。采用 E₀=1、F=−1 时，数值应理解为选定一致单位制下的结果，不能直接当作实际材料的位移或承载能力。')],
 en:['Differentiating constrained equilibrium yields all compliance sensitivities after a state solve. Symmetric linear elasticity, homogeneous fixed supports and design-independent loading establish the self-adjoint structure used in the derivation.',
 h('Lagrangian derivation')+eq("\\mathcal L(u,x,\\psi)=f^{\\mathsf T}u+\\psi^{\\mathsf T}[K(x)u-f]")+
 eq("\\frac{\\partial\\mathcal L}{\\partial u}=f+K^{\\mathsf T}\\psi=0\\quad\\Longrightarrow\\quad\\psi=-u")+
 p('At equilibrium with this adjoint, state-derivative terms vanish and dC/dxⱼ=−uᵀ(∂K/∂xⱼ)u. The sign has a physical interpretation: a positive-semidefinite stiffness increment cannot increase compliance under fixed loads. Design-dependent loads, moving supports or prescribed nonzero displacements require additional terms.')+
 h('Multiple loads and dimensions')+eq("\\begin{aligned}C_\\Sigma&=\\sum_\\ell\\omega_\\ell f_\\ell^{\\mathsf T}u_\\ell,\\\\\\frac{\\partial C_\\Sigma}{\\partial x_j}&=-\\sum_\\ell\\omega_\\ell u_\\ell^{\\mathsf T}K_{,x_j}u_\\ell\\end{aligned}")+
 p('This extension uses fixed nonnegative weights ωℓ and a state solve for each load case; the application currently evaluates one case. Compliance has dimensions of force times length. Values with E₀=1 and F=−1 require a consistent unit system and are not direct predictions of a physical material’s displacement or strength.')]},
{fig:'simp',
 zh:['SIMP 用连续密度与惩罚型材料插值近似固–空设计。滤波后的物理密度参与有限元与体积计算，最优性准则更新则作用于独立变量；两者之间必须使用一致的链式求导。',
 h('约束最优性条件')+eq("\\begin{aligned}g(x)&=V(x)-V^*\\le0\\\\\\lambda\\ge0\\\\\\lambda g(x)&=0\\end{aligned}")+
 eq("\\begin{aligned}C_{,x_j}+\\lambda V_{,x_j}-\\mu_j+\\nu_j&=0,\\\\\\mu_jx_j&=0\\\\\\nu_j(x_j-1)&=0\\\\\\mu_j,\\nu_j\\ge0\\end{aligned}")+
 p('μⱼ、νⱼ 分别对应下界和上界乘子。满足约束资格条件时，上述 KKT 条件是局部最优的必要条件，并非非凸问题的充分条件。对严格内部变量，Bⱼ=−C,ₓⱼ/(λV,ₓⱼ)=1；OC 用 xⱼ√Bⱼ 构造有阻尼的乘法更新，而不是直接求解完整 KKT 系统。')+
 p('移动限 m 限制单步设计变化，但不能单独保证目标单调下降。对滤波设计，λ 的搜索应计算 V(Wxⁿᵉʷ)。若边界或移动限使本步无法达到预算，应报告可行性而不能将某个乘子值直接解释为收敛。惩罚增加可以降低中间密度的刚度效率，仍不保证所有单元最终严格二值化。')],
 en:['SIMP approximates solid–void design using continuous variables and penalized material interpolation. Filtered physical density enters both analysis and volume, while the optimality-criteria update acts on independent variables through a consistent chain rule.',
 h('Constrained stationarity')+eq("\\begin{aligned}g(x)&=V(x)-V^*\\le0\\\\\\lambda\\ge0\\\\\\lambda g(x)&=0\\end{aligned}")+
 eq("\\begin{aligned}C_{,x_j}+\\lambda V_{,x_j}-\\mu_j+\\nu_j&=0,\\\\\\mu_jx_j&=0\\\\\\nu_j(x_j-1)&=0\\\\\\mu_j,\\nu_j\\ge0\\end{aligned}")+
 p('The multipliers μⱼ and νⱼ correspond to lower and upper bounds. Under a constraint qualification, these KKT conditions are necessary for local optimality, not sufficient for this nonconvex problem. For interior variables, Bⱼ=−C,ₓⱼ/(λV,ₓⱼ)=1. OC constructs a damped multiplicative step xⱼ√Bⱼ rather than solving the full KKT system.')+
 p('A move limit m restricts design change but does not by itself ensure monotonic objective decrease. Multiplier search must evaluate V(Wxⁿᵉʷ). If bounds or move limits make a budget unreachable in one step, feasibility must be reported rather than inferred from the multiplier. Penalization reduces the efficiency of intermediate density without guaranteeing an exactly binary design.')]},
{fig:'filter',
 zh:['空间滤波规定了局部平均的物理尺度，同时改变设计变量到分析密度的映射。本节区分前向滤波与反向灵敏度传播，并说明边界归一化为何影响体积导数。',
 h('分量形式的链式法则')+eq("\\widetilde\\rho_e=\\sum_j W_{ej}x_j\\quad\\Longrightarrow\\quad\\frac{\\partial C}{\\partial x_j}=\\sum_e W_{ej}\\frac{\\partial C}{\\partial\\widetilde\\rho_e}")+
 p('虽然未归一化的距离权重 H 对称，W 通常不对称，因为边界附近每行的权重总和不同。W1=1 表示保持常量，但一般 1ᵀW≠1ᵀ，因此不保证保持总和。以 W 代替 Wᵀ 传播梯度会使边界单元的导数错误。空间坐标 Xₑ 与设计变量 xⱼ 在此具有不同含义。')+
 h('滤波与正则化的适用范围')+p('固定物理半径 R 的网格研究与固定单元半径 r 的网格研究并不等价。滤波引入可控尺度，但普通密度平均并不直接规定所有实体杆件和空隙的最小尺寸。若要求严格几何尺寸控制，需进一步定义投影、鲁棒侵蚀／膨胀设计或显式几何约束；这些扩展不属于当前应用。')],
 en:['Spatial filtering specifies a physical averaging scale and changes the design-to-analysis map. Forward filtering and reverse sensitivity propagation are distinct operations; boundary normalization also changes the volume derivative.',
 h('Componentwise chain rule')+eq("\\widetilde\\rho_e=\\sum_j W_{ej}x_j\\quad\\Longrightarrow\\quad\\frac{\\partial C}{\\partial x_j}=\\sum_e W_{ej}\\frac{\\partial C}{\\partial\\widetilde\\rho_e}")+
 p('Unnormalized distance weights H are symmetric, but W generally is not: row sums differ near the boundary. W1=1 preserves constants, whereas 1ᵀW generally differs from 1ᵀ, so totals need not be preserved. Propagating gradients with W instead of Wᵀ gives incorrect boundary derivatives. Spatial positions Xₑ and design variables xⱼ have distinct roles here.')+
 h('Scope of filtering and regularization')+p('Refining with a fixed physical R differs from refining with a fixed radius r in element units. Averaging introduces a controlled scale but does not directly prescribe every solid member width and void gap. Strict geometric control requires additional projection, robust erosion/dilation formulations or explicit geometric constraints, which are outside the current application.')]},
{fig:'evolution',
 zh:['ESO 通过不可逆的单元删除缩减材料体积。应力拒绝准则和柔度灵敏度准则具有不同目标解释；本文采用后者的弱材料离散版本，并明确其可行更新集合。',
 h('局部删除代价与离散误差')+eq("\\begin{aligned}\\Delta C&\\approx C_{,\\rho_e}\\Delta\\rho_e\\\\\\Delta\\rho_e&<0\\\\C_{,\\rho_e}\\le0\\end{aligned}")+
 p('在小扰动范围内，删除绝对梯度较小的单元预计引起较小的柔度增长。然而从实体到弱材料是有限变化，并非无穷小扰动；多个单元同时删除还会重新分配载荷路径。因此，局部一阶排序不能替代更新后的有限元分析，也不能证明删除后的结构最优。')+
 eq("\\begin{aligned}\\mathcal S_{k+1}&\\subseteq\\mathcal S_k\\\\n_{\\mathrm{keep}}&=\\left\\lfloor\\frac{n(f_{k+1}-\\rho_{\\min})}{1-\\rho_{\\min}}\\right\\rfloor\\end{aligned}")+
 p('𝒮ₖ 为当前实体单元集合。对等体积单元，fₖ₊₁=max(fᵥ,(1−ER)fₖ) 是计划密度均值，计数公式包含弱材料对报告体积的贡献。达到体积预算后，若不允许恢复或交换单元，则不存在继续改进拓扑的双向更新自由度。')],
 en:['ESO reduces material through irreversible element removal. Stress rejection and compliance sensitivity have different objective interpretations. The weak-material energy variant considered here is defined by its admissible update set.',
 h('Local removal cost and finite changes')+eq("\\begin{aligned}\\Delta C&\\approx C_{,\\rho_e}\\Delta\\rho_e\\\\\\Delta\\rho_e&<0\\\\C_{,\\rho_e}\\le0\\end{aligned}")+
 p('For small perturbations, removing an element with a smaller gradient magnitude predicts a smaller compliance increase. A solid-to-weak transition is a finite change, however, and simultaneous deletions redistribute load paths. First-order ranking therefore cannot replace reanalysis or establish optimality of the resulting structure.')+
 eq("\\begin{aligned}\\mathcal S_{k+1}&\\subseteq\\mathcal S_k\\\\n_{\\mathrm{keep}}&=\\left\\lfloor\\frac{n(f_{k+1}-\\rho_{\\min})}{1-\\rho_{\\min}}\\right\\rfloor\\end{aligned}")+
 p('Here 𝒮ₖ is the current solid set. For equal-volume elements, fₖ₊₁=max(fᵥ,(1−ER)fₖ) is the scheduled mean density; the count includes the weak phase’s contribution to reported volume. Once the budget is reached, removal-only updates cannot perform material exchanges to further improve topology.')]},
{zh:['BESO 扩展单向演化的设计更新，使空区域能够重新参与材料分配。关键在于定义可比较的实体与空域敏度、控制空间噪声和迭代振荡，并以体积预算及加入率约束选取单元。',
 h('Hard kill 的节点敏度外推')+eq("\\alpha_i^{\\mathrm{node}}=\\begin{cases}\\dfrac{\\sum_{e\\in\\mathcal S(i)}\\alpha_e}{|\\mathcal S(i)|},&|\\mathcal S(i)|>0,\\\\0,&|\\mathcal S(i)|=0\\end{cases}")+
 eq("\\widehat\\alpha_e=\\frac{\\sum_i\\max(0,R-\\lVert X_e-X_i\\rVert)\\alpha_i^{\\mathrm{node}}}{\\sum_i\\max(0,R-\\lVert X_e-X_i\\rVert)}")+
 p('𝒮(i) 是与节点 i 相连的实体单元集合。上式适用于这里的等体积规则单元；非均匀单元需重新规定平均权重。分母包含支撑域内的空节点，即使其敏度为零也不能将其从归一化中删除。外推值是恢复材料的估计收益，不是零刚度奇异状态下可直接使用的普通密度导数。')+
 p('这里采用 Ghabraie（2015）的实体邻接平均。专著第 3.3.2 节的节点平均则包含相邻空单元的零原始敏度，并使用距离权重。两者在实体–空洞交界处可给出不同的节点值；复现实验时必须说明所用版本。后续距离投影和历史平均的作用仍可按相同顺序理解。')+
 h('空间滤波与历史平均')+p('空间滤波把同一次分析中相邻位置的信息结合起来；历史平均把同一位置在连续迭代中的信息结合起来。前者提供空间尺度，后者缓和材料状态反复切换造成的分数波动。本应用第一步直接使用滤波分数，随后采用以下递推。')+
 eq("\\overline\\alpha_e^{\\,k}=\\frac12\\left(\\widehat\\alpha_e^{\\,k}+\\overline\\alpha_e^{\\,k-1}\\right)")+
 p('右侧的上一项是已经平均过的历史分数，因此它保留了更早迭代的影响。平滑后的分数用于排序；它不是当前柔度的精确导数，平滑本身也不能证明目标必然下降。')+
 h('体积预算、被动区域与加入率')+eq("\\begin{aligned}|\\mathcal S_{k+1}\\setminus\\mathcal S_k|&\\le\\lfloor AR_{\\max}n\\rfloor\\\\\\mathcal P&\\subseteq\\mathcal S_{k+1}\\end{aligned}")+
 p('本应用的 hard kill 以设计域全部 n 个单元为加入率分母；𝒮ₖ 为当前实体集合，𝒫 为固定为实体的非设计单元集合。先保留 𝒫，再从现有实体与加入率允许的高分空单元中选取本步材料。可选“固定加载区”将连接加载节点的单元放入 𝒫，其体积计入预算。')+
 p('ER 决定计划体积的净缩减，ARmax 限制从空到实的恢复量。例如当前有 60 个实体，本步保留 58 个，若恢复 3 个空单元，就必须删除 5 个原实体。体积减少 2 个不等于只改变 2 个单元。加载区保护和加入率均不保证设计连通；更新后仍需重新分析。')+
 source('https://www.aeromech.usyd.edu.au/WCSMO2015/papers/1154_paper.pdf','Ghabraie, K. (2015). An improvement technique for Bi-directional Evolutionary Structural optimisation (BESO) method. 11th World Congress on Structural and Multidisciplinary Optimisation, Sydney.')],
 en:['BESO extends one-way evolution by allowing void regions to compete for material. The essential ingredients are comparable solid/void scores, spatial and temporal stabilization, and selection subject to volume and admission constraints.',
 h('Nodal extrapolation for hard kill')+eq("\\alpha_i^{\\mathrm{node}}=\\begin{cases}\\dfrac{\\sum_{e\\in\\mathcal S(i)}\\alpha_e}{|\\mathcal S(i)|},&|\\mathcal S(i)|>0,\\\\0,&|\\mathcal S(i)|=0\\end{cases}")+
 eq("\\widehat\\alpha_e=\\frac{\\sum_i\\max(0,R-\\lVert X_e-X_i\\rVert)\\alpha_i^{\\mathrm{node}}}{\\sum_i\\max(0,R-\\lVert X_e-X_i\\rVert)}")+
 p('𝒮(i) contains solid elements incident on node i. This average applies to equal-volume regular elements; nonuniform elements require a specified weighting. The denominator includes empty nodes within the support even when their score is zero. Extrapolation estimates restoration benefit; it is not an ordinary density derivative evaluated at a singular zero-stiffness state.')+
 p('This is the solid-neighbor average of Ghabraie (2015). The nodal average in Section 3.3.2 of the book includes adjacent void cells with zero raw sensitivity and uses distance weights. These choices can give different nodal values at solid–void interfaces and must be identified in a reproduction study. Distance projection and history averaging can still be understood in the same sequence.')+
 h('Spatial filtering and history averaging')+p('Spatial filtering combines neighboring locations within one analysis. History averaging combines information at the same location across iterations. The former introduces a spatial scale; the latter moderates score fluctuations caused by repeated changes of material state. App uses the filtered score on the first step and the following recurrence thereafter.')+
 eq("\\overline\\alpha_e^{\\,k}=\\frac12\\left(\\widehat\\alpha_e^{\\,k}+\\overline\\alpha_e^{\\,k-1}\\right)")+
 p('The previous score has already been averaged, so earlier iterations continue to contribute. The smoothed score is used for ranking; it is not an exact derivative of the current compliance, and smoothing alone does not establish descent.')+
 h('Volume, passive material and admission')+eq("\\begin{aligned}|\\mathcal S_{k+1}\\setminus\\mathcal S_k|&\\le\\lfloor AR_{\\max}n\\rfloor\\\\\\mathcal P&\\subseteq\\mathcal S_{k+1}\\end{aligned}")+
 p('App hard kill measures admission relative to all n domain elements. Here 𝒮ₖ is the current solid set and 𝒫 contains prescribed non-design solids. Retain 𝒫, then select from existing solids and high-scoring void cells permitted by the admission limit. The optional “Solid load pad” assigns load-adjacent cells to 𝒫 and counts their volume in the budget.')+
 p('ER determines the net reduction in scheduled volume; ARmax bounds void-to-solid recovery. For example, retaining 58 cells from a current design of 60 solids while restoring three voids requires removal of five existing solids. A net reduction of two cells does not mean that only two cells change. Neither the load pad nor admission limit guarantees connectivity; reanalysis is still required.')+
 source('https://www.aeromech.usyd.edu.au/WCSMO2015/papers/1154_paper.pdf','Ghabraie, K. (2015). An improvement technique for Bi-directional Evolutionary Structural optimisation (BESO) method. 11th World Congress on Structural and Multidisciplinary Optimisation, Sydney.')]},
{fig:'levelset',
 zh:['水平集方法将几何边界表示为标量场的零等值集，以形状导数确定边界运动方向。本节明确实体内取正的符号约定，区分连续边界梯度、速度延拓和固定网格上的弱材料近似。',
 h('自由边界上的下降方向')+eq("\\mathcal L(\\Omega)=C(\\Omega)+\\lambda[V(\\Omega)-V^*]+\\gamma P(\\Omega)")+
 eq("\\begin{aligned}\\mathcal L'(\\Omega)[\\theta]&=\\int_{\\Gamma_{\\mathrm{free}}}[-q+\\lambda+\\gamma\\kappa_{\\mathrm{out}}]V_n\\,\\mathrm d\\Gamma,\\\\q&=\\sigma(u):\\varepsilon(u)\\end{aligned}")+
 eq("\\begin{aligned}V_n&=q-\\lambda-\\gamma\\kappa_{\\mathrm{out}},\\\\\\mathcal L'(\\Omega)[\\theta]&=-\\int_{\\Gamma_{\\mathrm{free}}}V_n^2\\,\\mathrm d\\Gamma\\le0\\end{aligned}")+
 p('上式限定于光滑、无载荷的可变自由边界，外载及支撑所在边界保持不动，且无体力。θ·n=Vₙ，P 为边界长度或面积，κout=divΓn（凸圆为正）。由 n=−∇φ/|∇φ| 可得 κout=−div(∇φ/|∇φ|)，所以正内符号约定下的曲率项必须相应换号。这里 λ 固定时给出拉格朗日泛函的瞬时下降方向；约束体积的实际迭代还需确定 λ 并满足步长条件。')+
 h('连续形状导数与离散近似')+p('应用中用实体侧单元能量估计并延拓边界驱动项，再滤波、归一化并加入曲率项。该构造不是对界面积分 q 的逐点精确计算。平滑 Heaviside 在单元中心提供材料插值；对该插值求导得到的离散密度梯度，与连续自由边界形状导数属于不同验证对象。')+
 eq("H_\\epsilon(s)=\\begin{cases}0,&s\\le-\\epsilon,\\\\\\dfrac12\\left[1+\\dfrac{s}{\\epsilon}+\\dfrac1\\pi\\sin\\left(\\frac{\\pi s}{\\epsilon}\\right)\\right],&|s|<\\epsilon,\\\\1,&s\\ge\\epsilon\\end{cases}")+
 note('离散体积约定','当前应用取 ρ=η+(1−η)Hε(φ)，η=10⁻⁶，并用 Σvₑρₑ 计算体积；因此它是带残余相的离散体积，不严格等于几何体积 |{φ>0}|。界面半宽 ε=0.75 以单元边长计。理论下降方向经延拓、离散和重初始化后，不自动继承连续下降结论，仍需实际状态求解与验收。')],
 en:['Level sets represent geometry by the zero set of a scalar field and use shape derivatives to define boundary motion. The positive-inside convention is made explicit, separating the continuum gradient, velocity extension and fixed-grid weak-material approximation.',
 h('A descent direction on the free boundary')+eq("\\mathcal L(\\Omega)=C(\\Omega)+\\lambda[V(\\Omega)-V^*]+\\gamma P(\\Omega)")+
 eq("\\begin{aligned}\\mathcal L'(\\Omega)[\\theta]&=\\int_{\\Gamma_{\\mathrm{free}}}[-q+\\lambda+\\gamma\\kappa_{\\mathrm{out}}]V_n\\,\\mathrm d\\Gamma,\\\\q&=\\sigma(u):\\varepsilon(u)\\end{aligned}")+
 eq("\\begin{aligned}V_n&=q-\\lambda-\\gamma\\kappa_{\\mathrm{out}},\\\\\\mathcal L'(\\Omega)[\\theta]&=-\\int_{\\Gamma_{\\mathrm{free}}}V_n^2\\,\\mathrm d\\Gamma\\le0\\end{aligned}")+
 p('These expressions concern a smooth, traction-free moving boundary, with loaded and supported boundaries fixed and no body forces. Here θ·n=Vₙ, P is perimeter or surface area, and κout=divΓn, positive for a convex circle. Since n=−∇φ/|∇φ|, κout=−div(∇φ/|∇φ|); the curvature sign must match the inside convention. With λ fixed this is an instantaneous Lagrangian descent direction. A volume-constrained discrete iteration must additionally determine λ and an admissible step.')+
 h('Continuum gradient and discrete approximation')+p('The application estimates and extends a boundary drive from solid-side element energies, then filters, normalizes and adds curvature smoothing. This is not an exact pointwise evaluation of the boundary integrand q. A smooth Heaviside defines cell-center material interpolation. Its discrete density derivative and the continuum free-boundary shape derivative are distinct verification targets.')+
 eq("H_\\epsilon(s)=\\begin{cases}0,&s\\le-\\epsilon,\\\\\\dfrac12\\left[1+\\dfrac{s}{\\epsilon}+\\dfrac1\\pi\\sin\\left(\\frac{\\pi s}{\\epsilon}\\right)\\right],&|s|<\\epsilon,\\\\1,&s\\ge\\epsilon\\end{cases}")+
 note('Discrete volume convention','The application uses ρ=η+(1−η)Hε(φ), η=10⁻⁶, and volume Σvₑρₑ. This residual-phase volume differs from the geometric measure |{φ>0}|. Interface half-width ε=0.75 is in element units. Extension, discretization and reinitialization do not automatically preserve the continuum descent result; state solves and acceptance checks remain necessary.')]},
{zh:['验证需分别回答状态求解是否正确、灵敏度是否一致、优化迭代是否稳定，以及离散模型是否代表目标物理问题。本节给出可报告的误差指标，并区分数值停止与最优性证明。',
 h('可行性与约束驻点')+p('对上界型体积约束，严格的可行性残差可取 max(0,V−V*)/V*；|V−V*|/V* 则度量目标体积的满足程度，二者含义不同。只有在预算预期活跃的柔度问题中，才通常同时要求后者较小。')+
 eq("\\begin{aligned}r_{\\mathrm{KKT}}&=\\left\\lVert x-\\Pi_{[0,1]^n}\\left(x-s[\\nabla C+\\lambda\\nabla V]\\right)\\right\\rVert_\\infty\\\\s&>0\\end{aligned}")+
 p('该投影残差适用于连续密度变量，并应结合体积可行性、λ≥0 和互补性检查。步长尺度 s 应固定并明确报告。它不直接适用于二值演化法，也不是当前界面中 Δ 的定义；界面 Δ 来自已显示柔度的历史变化，定义见本章补充说明。')+
 h('误差源与证据边界')+table(['检查','支持的结论','不支持的推论'],[['平衡残差、补片与尺度律','所测状态方程及离散行为一致','真实材料或非线性失效已验证'],['差分与独立装配对照','所测梯度或求解路径一致','全部初始化均收敛到同一设计'],['匹配条件下的迭代轨迹','指定算法与指定参考一致','所有方法已获通用认证'],['固定物理尺度网格研究','所测响应的离散依赖得到量化','点载荷应力峰值必然收敛']])],
 en:['Verification must distinguish state-solve accuracy, derivative consistency, iteration stability and physical-model adequacy. Reportable residuals provide evidence for these separate questions without turning numerical termination into an optimality proof.',
 h('Feasibility and constrained stationarity')+p('For an upper volume bound, max(0,V−V*)/V* measures violation; |V−V*|/V* measures agreement with the target. These are different quantities. The latter is usually also required when the compliance problem is expected to use an active material budget.')+
 eq("\\begin{aligned}r_{\\mathrm{KKT}}&=\\left\\lVert x-\\Pi_{[0,1]^n}\\left(x-s[\\nabla C+\\lambda\\nabla V]\\right)\\right\\rVert_\\infty\\\\s&>0\\end{aligned}")+
 p('This projected residual applies to continuous density variables and accompanies feasibility, λ≥0 and complementarity checks. Report a fixed step scale s. It does not apply directly to binary evolution and is not the interface’s Δ, which measures displayed compliance-history change as defined below.')+
 h('Evidence and its limits')+table(['Check','Supports','Does not establish'],[['Equilibrium, patch and scaling tests','Consistency of tested state equations and discretization','Physical material or nonlinear failure validity'],['Finite differences and independent assembly','Consistency of tested derivatives or solve paths','A unique design from all initializations'],['Matched iteration trajectories','Agreement with a specified reference variant','Universal certification of all methods'],['Fixed-scale mesh study','Quantified discretization dependence','Convergence of point-load stress peaks']])]},
{fig:'mesh',
 zh:['以悬臂梁为统一算例，分别考察力学尺度律、优化方法差异和网格依赖。所有比较均需固定物理问题，并记录初始化、实际体积及停止原因；本节给出实验协议，不预设某种方法优于其他方法。',
 h('算例定义与报告字段')+table(['量','默认二维算例','三维扩展'],[['设计域','L=80，H=50，t=1','L=80，H=50，B=4'],['单元','80×50 Q4，h=1','80×50×4 H8，h=1'],['支撑','X=0 边界 u=0','X=0 端面 u=0'],['载荷','右边界中点，总 Fᵧ=−1','右端面 y/H=0.5、z/B=0.5，总 Fᵧ=−1'],['材料与约束','E₀=1，ν≈0.3，fᵥ=0.5','相同；三维本构'],['滤波尺度','r=3，R=3','r=3，R=3']])+
 p('方法比较还需记录 BESO 的 kill 模式、被动区域和加入率，SIMP 的惩罚与移动限，以及 level set 的初始化、界面带宽和速度正则参数。若不同方法的残余材料、被动区域或几何解释不同，则即使名义体积分数一致，也不宜直接宣称解的质量有严格排序。')+
 note('本文图示与数值证据','教材内的流程、网格及边界图为解析示意，不作为优化结果。定量结论应附导出的密度场、参数、求解版本和可重复计算记录。本文不将未执行的网格实验绘制成收敛曲线。')],
 en:['Cantilevers provide a common setting for scaling checks, method comparisons and mesh studies. Each comparison fixes the physical problem and records initialization, actual volume and termination. The protocol does not presume that one method outperforms another.',
 h('Benchmark definition and reporting fields')+table(['Quantity','Default 2D case','3D extension'],[['Domain','L=80, H=50, t=1','L=80, H=50, B=4'],['Elements','80×50 Q4, h=1','80×50×4 H8, h=1'],['Support','u=0 on X=0 edge','u=0 on X=0 face'],['Load','Right-edge midpoint, total Fᵧ=−1','Right face at y/H=0.5, z/B=0.5, total Fᵧ=−1'],['Material and budget','E₀=1, ν≈0.3, fᵥ=0.5','Same parameters; 3D constitutive law'],['Filter scale','r=3, R=3','r=3, R=3']])+
 p('Also record BESO kill mode, passive regions and admission ratio; SIMP penalty and move limit; and level-set initialization, interface width and velocity regularization. Different residual phases, passive regions or geometric interpretations can preclude a strict ranking even when nominal volume fractions coincide.')+
 note('Illustrations and numerical evidence','The diagrams in this text are analytical schematics, not optimized results. Quantitative claims require exported densities, settings, solver version and reproducible calculation records. No convergence curve is inferred from an unperformed refinement experiment.')]},
{zh:['三类方法共享状态分析，却具有不同的设计空间、灵敏度解释和更新机制。比较应围绕所求问题、约束与证据展开，而不是仅以二值图像的外观评价算法。',
 h('方法分类与比较口径')+table(['方法','独立表示','更新机制','主要解释边界'],[['SIMP','连续设计密度 x','滤波链式导数与 OC','中间密度及局部驻点'],['ESO','单元保留集合','不可逆删除','对早期删除路径敏感'],['BESO','实体／弱材料或实体／空洞','敏度排序、删除与恢复','空域外推及离散体积'],['Level set','隐式场 φ 与零边界','法向速度及 Hamilton–Jacobi 传输','初始化、边界梯度与孔洞成核']])+
 h('Huang 与 Xie 专著阅读指引')+p('将 Huang 与 Xie（2010）的 Evolutionary Topology Optimization of Continuum Structures: Methods and Applications 作为 ESO／BESO 的主要延伸读物。可结合本教材按下表阅读；先掌握删除与恢复的物理含义，再追踪敏度、滤波和单元选择之间的关系。')+
 table(['本教材','专著章节与页码','阅读重点'],[['第 7 章：ESO','§2.2–2.3，pp. 5–14','应力准则与刚度／位移优化'],['第 8 章：BESO','§3.2–3.5，pp. 18–25；§4.2–4.3，pp. 40–43','敏度、滤波、增删规则与惩罚插值'],['第 8 章：soft kill 算法','附录 4.1，pp. 47–50','单元中心滤波、历史平均及阈值更新'],['第 11 章：悬臂梁实验','§3.6–3.9，pp. 25–37','初始设计、三维扩展和网格影响'],['第 5、12 章：方法比较','§5.2–5.4，pp. 52–61','BESO 与 SIMP 的比较及局部最优问题']])+
 p('第 9 章的 level set 另以 Allaire 等人的工作为依据。引用用于帮助继续阅读；判断程序与文献是否一致，还需逐项匹配物理问题、材料插值、滤波和更新规则。')],
 en:['These method families share state analysis but use different design spaces, sensitivity interpretations and updates. Comparison should address the posed problem, constraints and evidence rather than the appearance of a binary image.',
 h('Classification and comparison criteria')+table(['Method','Representation','Update','Interpretation boundary'],[['SIMP','Continuous variables x','Filtered derivatives and OC','Intermediate density and local stationarity'],['ESO','Retained-element set','Irreversible removal','Dependence on early removals'],['BESO','Solid/weak or solid/void','Ranking, removal and reintroduction','Void extrapolation and quantized volume'],['Level set','Implicit field φ and zero boundary','Normal velocity and Hamilton–Jacobi transport','Initialization, boundary gradients and nucleation']])+
 h('Reading Huang and Xie alongside this tutorial')+p('Use Huang and Xie’s Evolutionary Topology Optimization of Continuum Structures: Methods and Applications (2010) as the principal further reading for ESO and BESO. Follow the map below, first establishing the physical meaning of removal and recovery, then tracing sensitivities through filtering and element selection.')+
 table(['This tutorial','Book sections and printed pages','Reading focus'],[['Chapter 7: ESO','§2.2–2.3, pp. 5–14','Stress criteria and stiffness/displacement optimization'],['Chapter 8: BESO','§3.2–3.5, pp. 18–25; §4.2–4.3, pp. 40–43','Sensitivities, filtering, removal/addition and penalized interpolation'],['Chapter 8: soft-kill algorithm','Appendix 4.1, pp. 47–50','Element-center filtering, history averaging and threshold updates'],['Chapter 11: cantilever experiments','§3.6–3.9, pp. 25–37','Initial designs, three dimensions and mesh effects'],['Chapters 5 and 12: method comparison','§5.2–5.4, pp. 52–61','BESO/SIMP comparison and local optima']])+
 p('The level-set chapter instead draws on Allaire and colleagues. References support further study; correspondence between a program and a publication still requires matching the physical problem, interpolation, filters and update rules.')]}];

export const lessons=chapters.map((chapter,index)=>Object.fromEntries(['zh','en'].map(lang=>{
 const [title,heading,body]=chapter[lang], [abstract,addition]=supplements[index][lang];
 const insert=body.indexOf('<section class="exercise">');
 // Define the cantilever and its parameters before assigning experiments.
 const leading=index===10?addition:'';
 const material=(index===10?'':addition)+(practical[index]?.[lang]??'');
 const expanded=leading+(insert<0?body+material:body.slice(0,insert)+material+body.slice(insert));
 return [lang,[title,heading,`<div class="chapter-abstract"><h2>${lang==='zh'?'摘要':'Abstract'}</h2>${p(abstract)}</div>${learningGuide(index,lang)}${supplements[index].fig?figure(supplements[index].fig,lang):''}${expanded}`]];
})));
