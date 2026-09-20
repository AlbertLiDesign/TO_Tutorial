import {figure} from './theory-figures.js?v=14';
import {practical} from './teaching-practical.js?v=14';
// Original bilingual teaching text. Equations use fixed, design-independent loads.
const p=s=>`<p>${s}</p>`, h=s=>`<h2>${s}</h2>`, eq=s=>`<div class="theory-equation" role="math">${s}</div>`;
const exercise=(q,a,zh=false)=>`<section class="exercise"><h3>${zh?'分析例题':'Analytical example'}</h3><p>${q}</p><details><summary>${zh?'展开推导与讨论':'Derivation and discussion'}</summary><p>${a}</p></details></section>`;
const source=(url,label)=>`<p class="chapter-source"><a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a></p>`;
const book=source('https://link.springer.com/book/10.1007/978-3-662-05086-6','Bendsøe, M. P., & Sigmund, O. (2003). Topology Optimization: Theory, Methods, and Applications. Springer.');
const simp=source('https://www.topopt.mek.dtu.dk/apps-and-software/efficient-topology-optimization-in-matlab','Andreassen, E., Clausen, A., Schevenels, M., Lazarov, B. S., & Sigmund, O. (2011). Efficient topology optimization in MATLAB using 88 lines of code. Structural and Multidisciplinary Optimization, 43, 1–16.');
const beso=source('https://doi.org/10.1016/j.finel.2007.06.006','Huang, X., & Xie, Y. M. (2007). Convergent and mesh-independent solutions for the bi-directional evolutionary structural optimization method. Finite Elements in Analysis and Design, 43, 1039–1049.');
const ls=source('https://doi.org/10.1016/j.jcp.2003.09.032','Allaire, G., Jouve, F., & Toader, A.-M. (2004). Structural optimization using sensitivity analysis and a level-set method. Journal of Computational Physics, 194, 363–393.');
const chapters=[
{zh:['问题与设计变量','1 · 体积约束下的结构拓扑优化',
 h('尺寸、形状与拓扑')+p('尺寸优化调整截面或厚度；形状优化移动已有边界；拓扑优化还允许连接关系和孔洞数量改变。给定设计域 D、固定边界、载荷及材料模型后，设计变量描述材料的空间分布，位移则由平衡方程决定。')+
 eq('min<sub>ρ</sub> C(ρ) &nbsp; s.t. &nbsp; K(ρ)u = f, &nbsp; Σ<sub>e</sub>v<sub>e</sub>ρ<sub>e</sub> ≤ V*, &nbsp; 0 ≤ ρ<sub>e</sub> ≤ 1')+
 p('ρ 是相对材料密度，vₑ 是单元体积，V* 是允许的材料体积。理想实体–空洞问题要求 ρ∈{0,1}；密度法先允许连续值，再通过材料插值抑制中间密度。体积分数 fᵥ=V*/|D| 与载荷向量 f 是不同量。')+
 h('模型假设与比较条件')+p('本教材面向已具备材料力学、线性代数及有限元基础的读者，研究固定载荷、线弹性、小变形下的最小柔度问题。它不等同于最小应力、最大屈曲载荷或最大强度。比较算法必须固定物理尺寸、支撑、载荷位置及总量、材料参数和体积预算。改变其中一项，就改变了优化问题。')+
 exercise('减少一半材料，柔度一定也减半吗？','不会。在固定载荷下，去掉材料通常会降低刚度、增大柔度；优化是在有限材料中改善分布，并不能取消这个代价。',true)+book],
 en:['Problem & variables','1 · Volume-constrained structural topology optimization',
 h('Sizing, shape and topology')+p('Sizing changes sections or thicknesses. Shape optimization moves existing boundaries. Topology optimization also permits changes in connectivity and holes. The design domain D, supports, loads and material law define the problem; displacements are state variables determined by equilibrium.')+
 eq('min<sub>ρ</sub> C(ρ) &nbsp; s.t. &nbsp; K(ρ)u = f, &nbsp; Σ<sub>e</sub>v<sub>e</sub>ρ<sub>e</sub> ≤ V*, &nbsp; 0 ≤ ρ<sub>e</sub> ≤ 1')+
 p('Here ρ is relative material density, vₑ is element volume and V* is the material budget. A solid–void problem uses ρ∈{0,1}; density methods relax this restriction and penalize intermediate material. The volume fraction fᵥ=V*/|D| is distinct from the load vector f.')+
 h('Model assumptions and comparison conditions')+p('This text assumes prior mechanics of materials, linear algebra and finite-element fundamentals. We study minimum compliance with fixed loads, linear elasticity and small displacements. This is not a minimum-stress, buckling or strength problem. A fair comparison fixes physical dimensions, supports, load position and magnitude, material properties and volume budget. Changing any of them changes the optimization problem.')+
 exercise('Does halving material necessarily halve compliance?','No. Removing stiffness generally increases compliance under fixed loads. Optimization improves material placement within a budget; it does not remove that tradeoff.')+book]},
{zh:['线弹性与边界条件','2 · 线弹性状态方程及变分形式',
 eq('ε(u) = ½(∇u + ∇uᵀ), &nbsp; σ = 𝔻:ε(u), &nbsp; −div σ = b')+
 p('ε 为二阶小应变张量，σ 为二阶应力张量，𝔻 为四阶弹性张量，b 为体力。在位移边界 Γᴅ 上给定位移，在力边界 Γɴ 上给定表面力。固定约束必须消除刚体运动，否则平衡解不唯一。当前 App 使用零位移约束及节点力，不包含体力或随设计变化的载荷。')+
 h('二维本构假设')+p('平面应力假设 σzz=τxz=τyz=0，适合薄板的面内受力；平面应变假设 εzz=γxz=γyz=0，适合受约束的长结构截面。两者使用不同的本构矩阵。App 的 Q4 是单位厚度平面应力，H8 是三维弹性。')+
 eq('σ<sub>V</sub>=D<sub>ps</sub>ε<sub>V</sub>, &nbsp; ε<sub>V</sub>=[εxx, εyy, 2εxy]ᵀ, &nbsp; σ<sub>V</sub>=[σxx, σyy, σxy]ᵀ')+
 eq('D<sub>ps</sub> = E/(1−ν²) · [[1, ν, 0], [ν, 1, 0], [0, 0, (1−ν)/2]]')+
 h('弱形式')+p('对满足齐次位移边界的任意试函数 v，平衡条件为 ∫Ω ε(v):𝔻:ε(u) dΩ = ∫Ω v·b dΩ + ∫Γɴ v·t dΓ。有限元把这个连续问题限制在有限维位移空间内。')+
 exercise('二维图像相同，是否意味着 Q4 与一层 H8 的结果完全相同？','不意味着。单位厚度、厚度方向约束、载荷分布及三维泊松效应均可能不同。必须先匹配物理模型。',true)+book],
 en:['Elasticity & boundaries','2 · Linear elasticity and its variational formulation',
 eq('ε(u) = ½(∇u + ∇uᵀ), &nbsp; σ = 𝔻:ε(u), &nbsp; −div σ = b')+
 p('The second-order strain tensor ε, stress tensor σ, fourth-order elasticity tensor 𝔻 and body force b describe equilibrium. Prescribe displacement on Γᴅ and traction on Γɴ. Supports must eliminate rigid-body motion. App uses homogeneous displacement constraints and nodal forces; body forces and design-dependent loads are outside this model.')+
 h('Constitutive assumptions in two dimensions')+p('Plane stress sets σzz=τxz=τyz=0 for thin plates loaded in their plane. Plane strain sets εzz=γxz=γyz=0 for constrained long sections. Their constitutive matrices differ. App uses unit-thickness plane-stress Q4 elements and three-dimensional H8 elements.')+
 eq('σ<sub>V</sub>=D<sub>ps</sub>ε<sub>V</sub>, &nbsp; ε<sub>V</sub>=[εxx, εyy, 2εxy]ᵀ, &nbsp; σ<sub>V</sub>=[σxx, σyy, σxy]ᵀ')+
 eq('D<sub>ps</sub> = E/(1−ν²) · [[1, ν, 0], [ν, 1, 0], [0, 0, (1−ν)/2]]')+
 h('Weak equilibrium')+p('For every admissible test displacement v, ∫Ω ε(v):𝔻:ε(u) dΩ = ∫Ω v·b dΩ + ∫Γɴ v·t dΓ. Finite elements restrict this statement to a finite-dimensional displacement space.')+
 exercise('Must a Q4 plate and one layer of H8 elements give identical results?','No. Thickness, transverse constraints, load distribution and three-dimensional Poisson effects must first be matched.')+book]},
{zh:['有限元离散','3 · 等参有限元离散与刚度装配',
 eq('u ≈ N u<sub>e</sub>, &nbsp; ε<sub>V</sub> = B u<sub>e</sub>, &nbsp; k<sub>e</sub> = ∫Ωₑ BᵀDB dΩ')+
 p('Q4 使用双线性形函数，H8 使用三线性形函数。形函数在参考单元上定义，通过雅可比矩阵映射到物理单元。数值积分计算单元刚度，再按共享节点的自由度编号装配整体矩阵。单元朝向错误或雅可比退化会破坏分析。')+
 eq('K = Σ<sub>e</sub> A<sub>e</sub>ᵀ k<sub>e</sub> A<sub>e</sub>, &nbsp; K<sub>ff</sub>u<sub>f</sub> = f<sub>f</sub> − K<sub>fc</sub>u<sub>c</sub>')+
 p('Aₑ 是自由度装配映射，下标 f/c 分别表示自由与约束自由度。这里的固定端满足 u𝚌=0。Hard kill 还必须删除没有实体单元连接的空节点自由度；仅把这些节点留在矩阵中会产生零行。即使移除了零行，悬空实体或铰接机构仍可导致奇异矩阵。')+
 h('有限元分析的验证条件')+p('必要检查包括刚度对称性、刚体运动零能量、常应变补片试验、平衡残差，以及外功与应变能的一致性。优化图案合理不能替代这些检查。')+
 exercise('若所有单元都是实体，但结构没有任何支撑，增大 E 能否消除奇异性？','不能。刚体运动不产生应变，因而对应的零能量模态不会随 E 增大而消失。',true)+book],
 en:['Finite elements','3 · Isoparametric finite elements and stiffness assembly',
 eq('u ≈ N u<sub>e</sub>, &nbsp; ε<sub>V</sub> = B u<sub>e</sub>, &nbsp; k<sub>e</sub> = ∫Ωₑ BᵀDB dΩ')+
 p('Q4 uses bilinear shape functions; H8 uses trilinear ones. A Jacobian maps reference-element derivatives to physical coordinates. Numerical quadrature gives element stiffness, and shared-node degree-of-freedom maps assemble the global system. Inverted or degenerate elements invalidate the analysis.')+
 eq('K = Σ<sub>e</sub> A<sub>e</sub>ᵀ k<sub>e</sub> A<sub>e</sub>, &nbsp; K<sub>ff</sub>u<sub>f</sub> = f<sub>f</sub> − K<sub>fc</sub>u<sub>c</sub>')+
 p('Aₑ maps global to element displacements; f/c denote free/constrained DOFs. Fixed supports have u𝚌=0. Hard kill also removes DOFs attached only to void elements. Removing zero rows does not cure floating solid components or mechanisms: those can still make K singular.')+
 h('Verification conditions for finite-element analysis')+p('Check stiffness symmetry, zero energy for rigid motion, constant-strain patch tests, equilibrium residuals and work–energy consistency. A plausible optimized picture cannot replace these checks.')+
 exercise('Can increasing E make an unsupported solid structure nonsingular?','No. Rigid-body modes generate no strain, so their zero energy remains zero when E increases.')+book]},
{zh:['柔度与伴随敏度','4 · 柔度泛函与伴随灵敏度分析',
 eq('C = fᵀu = uᵀKu, &nbsp; U = ½C')+
 p('本教材和当前 App 统一用 C 表示柔度，U 表示应变能。对于固定载荷，柔度越小，载荷方向的加权位移越小。不要把柔度直接解释为强度或所有位置的最大位移。')+
 h('固定载荷下的导数')+p('逗号下标 x 表示对设计变量 x 求导。')+eq('K u = f ⇒ K u,<sub>x</sub> = −K,<sub>x</sub>u')+
 eq('C,<sub>x</sub> = fᵀu,<sub>x</sub> = uᵀK u,<sub>x</sub> = −uᵀK,<sub>x</sub>u')+
 p('对称刚度和固定 f 使伴随变量与位移相关，因此不必为每个设计变量重新求解位移导数。若 f 随设计变化，则应加上 2uᵀf,ₓ；忽略这个项会得到错误梯度。')+
 h('单自由度系统的解析解')+eq('k(ρ)=k₀ρᵖ, &nbsp; u=F/(k₀ρᵖ), &nbsp; C=F²/(k₀ρᵖ), &nbsp; dC/dρ=−pF²/(k₀ρᵖ⁺¹)')+
 exercise('保持几何和材料不变，将 F 加倍，u 和 C 如何变化？','u 加倍，C 变为四倍。把全部弹性模量加倍时，u 和 C 都减半。',true)+book],
 en:['Compliance & adjoints','4 · Compliance and adjoint sensitivity analysis',
 eq('C = fᵀu = uᵀKu, &nbsp; U = ½C')+
 p('C denotes compliance throughout this textbook and the current App; U denotes strain energy. At fixed loads, lower compliance reduces the load-weighted displacement. It is not a strength measure or a bound on every displacement component.')+
 h('Differentiate equilibrium with fixed loads')+p('A comma subscript x denotes differentiation with respect to design variable x.')+eq('K u = f ⇒ K u,<sub>x</sub> = −K,<sub>x</sub>u')+
 eq('C,<sub>x</sub> = fᵀu,<sub>x</sub> = uᵀK u,<sub>x</sub> = −uᵀK,<sub>x</sub>u')+
 p('Symmetry and fixed f make compliance self-adjoint: no separate displacement-derivative solve is needed for every variable. Design-dependent loads require the additional term 2uᵀf,ₓ. Dropping it gives an incorrect gradient.')+
 h('Analytical solution for a single spring')+eq('k(ρ)=k₀ρᵖ, &nbsp; u=F/(k₀ρᵖ), &nbsp; C=F²/(k₀ρᵖ), &nbsp; dC/dρ=−pF²/(k₀ρᵖ⁺¹)')+
 exercise('With unchanged geometry and material, what does doubling F do?','Displacement doubles and compliance quadruples. Doubling all elastic moduli instead halves both displacement and compliance.')+book]},
{zh:['SIMP 与 OC 更新','5 · SIMP 材料插值与最优性准则',
 eq('k<sub>e</sub>(ρ̃<sub>e</sub>) = [η + (1−η)ρ̃<sub>e</sub><sup>p</sup>] k<sub>e</sub><sup>0</sup>, &nbsp; η=E<sub>min</sub>/E₀')+
 p('ρ̃ 是用于分析的物理密度，kₑ⁰ 是实体单元刚度。p>1 降低中间密度的单位材料刚度效率；η>0 防止空区域导致奇异刚度。App 的 SIMP 采用 η=10⁻⁹、密度滤波和 OC 更新，设计变量允许降到零。p=3 是常见选择，并非普适最优参数。')+
 eq('∂C/∂ρ̃<sub>e</sub> = −p(1−η)ρ̃<sub>e</sub><sup>p−1</sup> u<sub>e</sub>ᵀk<sub>e</sub>⁰u<sub>e</sub>')+
 h('体积乘子与移动限')+p('令拉格朗日函数 L=C+λ(V−V*)。内部自由变量满足 C,ₓ+λV,ₓ=0，边界变量还需满足互补条件。OC 用这一平衡构造乘法更新，λ 由二分搜索满足体积约束。')+
 eq('x<sub>j</sub><sup>new</sup> = clip(x<sub>j</sub> √[−C,<sub>xⱼ</sub>/(λV,<sub>xⱼ</sub>)], max(0,x<sub>j</sub>−m), min(1,x<sub>j</sub>+m))')+
 exercise('为什么体积约束应使用滤波后的密度，而不是原始 x？','有限元刚度来自物理密度 ρ̃，因此材料用量也必须用 ρ̃ 定义。边界处滤波权重不均匀时，Σx 不一定等于 Σρ̃。',true)+simp],
 en:['SIMP & OC updates','5 · SIMP interpolation and optimality criteria',
 eq('k<sub>e</sub>(ρ̃<sub>e</sub>) = [η + (1−η)ρ̃<sub>e</sub><sup>p</sup>] k<sub>e</sub><sup>0</sup>, &nbsp; η=E<sub>min</sub>/E₀')+
 p('Physical density ρ̃ enters analysis; kₑ⁰ is solid stiffness. A penalty p>1 makes intermediate density less efficient. Positive η supplies residual stiffness. App uses η=10⁻⁹, density filtering and OC, with design variables allowed to reach zero. The common choice p=3 is not universally optimal.')+
 eq('∂C/∂ρ̃<sub>e</sub> = −p(1−η)ρ̃<sub>e</sub><sup>p−1</sup> u<sub>e</sub>ᵀk<sub>e</sub>⁰u<sub>e</sub>')+
 h('Volume multiplier and move limit')+p('For L=C+λ(V−V*), an interior variable satisfies C,ₓ+λV,ₓ=0; bounds require complementary conditions. The OC step uses this balance. Bisection chooses λ to satisfy physical volume, and m limits one iteration’s change.')+
 eq('x<sub>j</sub><sup>new</sup> = clip(x<sub>j</sub> √[−C,<sub>xⱼ</sub>/(λV,<sub>xⱼ</sub>)], max(0,x<sub>j</sub>−m), min(1,x<sub>j</sub>+m))')+
 exercise('Why constrain filtered density rather than the raw x?','Stiffness is evaluated using physical density, so material volume must use it too. Near boundaries, row normalization means Σx need not equal Σρ̃.')+simp]},
{zh:['滤波与网格尺度','6 · 密度滤波、链式求导与长度尺度',
 eq('H<sub>ei</sub>=max(0,R−‖X<sub>e</sub>−X<sub>i</sub>‖), &nbsp; W<sub>ei</sub>=H<sub>ei</sub>/Σ<sub>j</sub>H<sub>ej</sub>, &nbsp; ρ̃=Wx')+
 p('行归一化使常量密度保持常量。密度滤波改变从设计变量到物理材料的映射；敏度滤波则直接平滑更新信号。二者不是同一算法，也不能混用链式法则。')+
 eq('∇<sub>x</sub>C = Wᵀ∇<sub>ρ̃</sub>C, &nbsp; ∇<sub>x</sub>V = Wᵀv')+
 h('尺度与病态')+p('低阶离散中可能出现棋盘格；没有长度尺度约束时，细化网格还可能产生越来越细的结构。滤波改善数值行为，但不能自动保证最小构件尺寸、单一连通性或可制造性。')+
 p('App 的 r 以单元边长为单位，实际半径 R=rh。域尺寸为 Nx·h、Ny·h、Nz·h。做相同物理域的网格加密时，应同时减小 h、增大单元数量，并保持 rh 不变。二维厚度仍为 1。')+
 exercise('Nx、Ny 加倍且 h 减半，为保持物理滤波半径，r 应如何变化？','r 也加倍。三维还应将 Nz 加倍，才能保持厚度不变。',true)+source('https://doi.org/10.1007/BF01214002','Sigmund, O., & Petersson, J. (1998). Numerical instabilities in topology optimization: A survey on procedures dealing with checkerboards, mesh-dependencies and local minima. Structural Optimization, 16, 68–75.')],
 en:['Filtering & mesh scale','6 · Density filtering, chain rules and length scales',
 eq('H<sub>ei</sub>=max(0,R−‖X<sub>e</sub>−X<sub>i</sub>‖), &nbsp; W<sub>ei</sub>=H<sub>ei</sub>/Σ<sub>j</sub>H<sub>ej</sub>, &nbsp; ρ̃=Wx')+
 p('Row normalization preserves constant density. Density filtering changes the design-to-material map; sensitivity filtering smooths an update signal. They are different algorithms and cannot share a chain rule indiscriminately.')+
 eq('∇<sub>x</sub>C = Wᵀ∇<sub>ρ̃</sub>C, &nbsp; ∇<sub>x</sub>V = Wᵀv')+
 h('Numerical length scales')+p('Low-order discretizations can exhibit checkerboards. Without a length scale, refinement may favor ever finer structures. Filtering improves numerical behavior but does not automatically guarantee minimum member size, connectivity or manufacturability.')+
 p('In App, r is measured in element edges: physical radius is R=rh. Domain dimensions are Nx·h, Ny·h and Nz·h. To refine the same physical problem, decrease h, increase counts and hold rh fixed. Plane-stress thickness remains 1.')+
 exercise('If Nx and Ny double and h halves, how should r change?','Double r to keep rh fixed. In 3D, double Nz too so thickness remains unchanged.')+source('https://doi.org/10.1007/BF01214002','Sigmund, O., & Petersson, J. (1998). Numerical instabilities in topology optimization: A survey on procedures dealing with checkerboards, mesh-dependencies and local minima. Structural Optimization, 16, 68–75.')]},
{zh:['ESO：单向演化','7 · 单向演化法的删除准则与不可逆性',
 p('ESO 逐步删除低效材料，已删除材料不再恢复。原始应力型 ESO 以单元 von Mises 应力与当前最大应力之比作删除判断；达到稳定状态后提高拒绝比。它不是与体积受限柔度最小化完全相同的数学问题。')+
 eq('原始应力准则：σ<sub>VM,e</sub>/σ<sub>VM,max</sub> < RR')+
 h('本文采用的离散变体')+p('App 采用应变能准则的单向 ESO：先对包含弱材料的全域计算原始敏度，再做 α̂=Wα；仅在现有实体中按 α̂ 从低到高删除，直到达到本步体积。空单元的 ρᵖ⁻¹ 因子不能在滤波前省略。为保留带残余刚度的分析域，空单元保留弱刚度。这是柔度问题的能量型 ESO，不宣称复现原始应力拒绝比算法。')+
 eq('V<sub>k+1</sub> = max(V*, (1−ER)V<sub>k</sub>), &nbsp; α<sub>e</sub> ∝ ρ<sub>e</sub><sup>p−1</sup>u<sub>e</sub>ᵀk<sub>e</sub>⁰u<sub>e</sub>, &nbsp; α̂=Wα')+
 p('逐个单元删除使体积只能按离散增量改变；实现采用不低于目标的舍入。删除后的单元不参加恢复竞争，因此早期错误决策不能被后续加回修复。到达体积预算是一种停止条件，不是全局最优的证明。')+
 exercise('ESO 与 BESO 都得到 50% 体积，是否应有相同形态？','不应如此要求。BESO 可以加回材料，ESO 不可以；更新历史、筛选准则与局部最优可能不同。',true)+source('https://doi.org/10.1016/0045-7949(93)90035-C','Xie, Y. M., & Steven, G. P. (1993). A simple evolutionary procedure for structural optimization. Computers & Structures, 49, 885–896.')+source('https://doi.org/10.1016/S0045-7825(02)00464-4','Tanskanen, P. (2002). The evolutionary structural optimization method: theoretical aspects. Computer Methods in Applied Mechanics and Engineering, 191, 5485–5498.')],
 en:['ESO: one-way evolution','7 · Removal criteria and irreversibility in ESO',
 p('ESO progressively removes inefficient material without restoring it. Original stress-based ESO compares each element’s von Mises stress with the current maximum; the rejection ratio rises after a steady state. This is not the same mathematical formulation as volume-constrained compliance minimization.')+
 eq('Original stress criterion: σ<sub>VM,e</sub>/σ<sub>VM,max</sub> < RR')+
 h('Discrete variant used in this application')+p('App uses strain-energy-based, one-way ESO: compute raw scores over the entire domain, including weak material, apply α̂=Wα, then remove the lowest-ranked existing solids until the scheduled volume is reached. The weak-phase factor ρᵖ⁻¹ must not be omitted before filtering. A weak phase retains the analysis domain. This is energy-based ESO for the compliance problem, not a reproduction of the original stress-rejection algorithm.')+
 eq('V<sub>k+1</sub> = max(V*, (1−ER)V<sub>k</sub>), &nbsp; α<sub>e</sub> ∝ ρ<sub>e</sub><sup>p−1</sup>u<sub>e</sub>ᵀk<sub>e</sub>⁰u<sub>e</sub>, &nbsp; α̂=Wα')+
 p('Whole-element removal quantizes volume, which is rounded upward to the budget. Removed elements do not compete for reintroduction, so a premature removal cannot be repaired by adding material back. Reaching the budget is a stopping rule, not a global-optimality certificate.')+
 exercise('Should ESO and BESO produce identical shapes at 50% volume?','No. Their admissible updates differ: BESO can restore material. Removal criteria, history and local optima also matter.')+source('https://doi.org/10.1016/0045-7949(93)90035-C','Xie, Y. M., & Steven, G. P. (1993). A simple evolutionary procedure for structural optimization. Computers & Structures, 49, 885–896.')+source('https://doi.org/10.1016/S0045-7825(02)00464-4','Tanskanen, P. (2002). The evolutionary structural optimization method: theoretical aspects. Computer Methods in Applied Mechanics and Engineering, 191, 5485–5498.')]},
{zh:['BESO：双向演化','8 · 双向演化法的敏度估计与材料恢复',
 p('BESO 给实体及潜在空单元定义敏度数，在逐步缩减的体积预算内保留较高敏度区域。滤波控制空间变化，历史平均减弱迭代振荡。Soft kill 与 hard kill 是空区域的两种分析处理方式，不只是显示颜色不同。')+
 eq('ᾱ<sub>e</sub><sup>k</sup> = ½(α̂<sub>e</sub><sup>k</sup> + ᾱ<sub>e</sub><sup>k−1</sup>), &nbsp; 保留敏度高于阈值的单元')+
 h('Soft kill')+p('ρ∈{ρmin,1}，Kₑ=ρᵖKₑ⁰。忽略所有单元共有的正系数，排序敏度为 αₑ=ρᵖ⁻¹Uₑ⁰，Uₑ⁰=½uₑᵀKₑ⁰uₑ。弱材料密度取 ρmin=0.001。')+
 h('Hard kill')+p('ρ∈{0,1}，空单元完全不贡献刚度。先把实体单元能量平均到节点，再用节点到单元中心的距离权重外推全域敏度。当前版本采用全域敏度排序，并以最大加入率限制单步恢复体积（相对设计域体积，向下取整到整单元）；不施加额外连通路径约束。可选“固定加载区”将连接加载节点的单元设为实体非设计区，其体积计入预算；这一边界条件在 App 中明确显示。')+
 p('真正移除刚度可能产生机构或悬空材料。发生奇异分析时应报告失败并检查网格、滤波和演化率，不能将弱材料分析的结果报告为 hard kill。')+
 exercise('空单元没有刚度和应变能，hard kill 如何决定在哪里加回材料？','通过邻近实体的节点敏度外推与空间滤波估计空区域的材料价值；不能直接把所有空区域的恢复敏度永久设为零。',true)+beso],
 en:['BESO: two-way evolution','8 · Sensitivity estimation and material recovery in BESO',
 p('BESO assigns sensitivity numbers to solid and potential void elements, retaining higher values within a shrinking volume budget. Spatial filtering and history averaging moderate changes. Soft and hard kill specify different stiffness models for void; they are not display options.')+
 eq('ᾱ<sub>e</sub><sup>k</sup> = ½(α̂<sub>e</sub><sup>k</sup> + ᾱ<sub>e</sub><sup>k−1</sup>), &nbsp; retain high-sensitivity elements')+
 h('Soft kill')+p('Use ρ∈{ρmin,1} and Kₑ=ρᵖKₑ⁰. Up to a common positive factor, ranking uses αₑ=ρᵖ⁻¹Uₑ⁰ with Uₑ⁰=½uₑᵀKₑ⁰uₑ. The weak-phase density is ρmin=0.001.')+
 h('Hard kill')+p('Use ρ∈{0,1}; void contributes no stiffness. Average solid element energies onto nodes, then use node-to-element-center distance weights to extrapolate sensitivities. A global ranking step is subject to a maximum addition ratio. Added volume is capped relative to the domain volume, rounded down to whole elements. The explicit “Solid load pad” option marks load-adjacent elements as non-design solid, counted in the volume budget. No connecting path is imposed.')+
 p('Exact removal can create mechanisms or floating material. A singular analysis must be reported; inspect mesh, filtering and evolution rate rather than silently replacing hard kill with weak material.')+
 exercise('With no energy in void elements, how can hard kill add material?','Extrapolate neighboring solid nodal sensitivities and spatially filter them. Permanently assigning every void zero restoration sensitivity would prevent meaningful reintroduction.')+beso]},
{zh:['Level set：边界演化','9 · 隐式边界与 Hamilton–Jacobi 方程',
 eq('Ω = {X : φ(X)>0}, &nbsp; Γ = {X : φ(X)=0}, &nbsp; n<sub>out</sub> = −∇φ/|∇φ|')+
 p('本教材取实体内部 φ>0。符号距离在边界附近满足 |∇φ|≈1。令边界点以外法向速度 Vₙ 移动，对 φ(x(t),t)=0 求导，得到以下符号约定；若改为内部为负，方程符号也必须改变。')+
 eq('∂φ/∂t − V<sub>n</sub>|∇φ| = 0')+
 h('速度来自目标的形状导数')+p('对固定载荷、无体力的自由设计边界，柔度形状导数以局部弹性能密度决定保留材料的价值；体积乘子控制法向速度的平均偏移。曲率正则项用于平滑边界。载荷或支撑边界的特殊项不能随意套用自由边界公式。')+
 p('App 使用实体侧能量延拓、迎风 Godunov 离散、CFL 步长限制和周期性距离重初始化；在固定体积下用实际有限元结果回退使柔度增加的步。窄界面带用平滑 Heaviside 与弱材料计算刚度。二维绘制零等值线，三维为体素近似。')+
 h('形状法能改变什么拓扑？')+p('已有孔洞能合并或消失，但纯边界演化不能保证从无孔实体中产生新孔洞。因此当前方法以规则孔洞初始化。它是经典 Hamilton–Jacobi 形状优化路线的离散实现，不是所有 level set 方法，也尚未与论文完整优化轨迹逐步复现对照。')+
 exercise('若 φ=x−a 且 Vₙ=1，短时间 Δt 后零界面在哪里？','φ 新值为 x−a+Δt，因此零界面从 a 移到 a−Δt。这里实体是 x>a，外法向为 −x，移动方向正确。',true)+ls],
 en:['Level-set boundaries','9 · Implicit geometry and Hamilton–Jacobi transport',
 eq('Ω = {X : φ(X)>0}, &nbsp; Γ = {X : φ(X)=0}, &nbsp; n<sub>out</sub> = −∇φ/|∇φ|')+
 p('We use positive φ inside solid. Signed distance satisfies |∇φ|≈1 near the interface. Differentiate φ(x(t),t)=0 for a point moving with outward normal speed Vₙ to obtain the convention below. Reversing the inside sign requires reversing the corresponding transport sign.')+
 eq('∂φ/∂t − V<sub>n</sub>|∇φ| = 0')+
 h('Shape derivatives determine boundary speed')+p('On a free design boundary with fixed loads and no body forces, elastic energy density governs the compliance value of material. A volume multiplier shifts normal speed; curvature regularization smooths the boundary. Load and support boundary terms cannot be replaced indiscriminately by a free-boundary formula.')+
 p('App uses solid-side energy extension, Godunov upwinding, a CFL step limit and periodic distance reconstruction. At fixed volume, FEA backtracks compliance-increasing trials. A smoothed Heaviside band and weak material define stiffness. The 2D view draws the zero contour; 3D is a voxel approximation.')+
 h('Which topology changes are possible?')+p('Existing holes can merge or disappear, but pure boundary transport does not guarantee hole nucleation in a solid interior. This version therefore starts with seeded holes. It discretizes the classical Hamilton–Jacobi shape-optimization route; it is not every level-set formulation and has not reproduced a complete published optimization trajectory step by step.')+
 exercise('If φ=x−a and Vₙ=1, where is the interface after Δt?','The new field is x−a+Δt, so the zero moves to a−Δt. Solid occupies x>a and its outward normal points toward −x, consistent with the motion.')+ls]},
{zh:['收敛与可信度','10 · 数值收敛、可行性与验证层次',
 h('至少检查不同残差')+p('状态方程的残差衡量有限元平衡；体积误差衡量可行性；设计变化与目标历史衡量迭代稳定性。这些量回答不同问题。柔度不变可能意味着收敛，也可能是更新被拒绝、设计变量停留在变量边界或数值实现不一致。')+
 eq('r<sub>eq</sub>=‖K<sub>ff</sub>u<sub>f</sub>−f<sub>f</sub>‖/‖f<sub>f</sub>‖, &nbsp; r<sub>V</sub>=|V−V*|/V*, &nbsp; Δx=‖x<sup>k+1</sup>−x<sup>k</sup>‖∞')+
 h('梯度验证')+eq('d<sub>FD</sub>=[C(x+εe<sub>j</sub>)−C(x−εe<sub>j</sub>)]/(2ε)')+
 p('在不触及设计边界的点比较解析梯度和中心差分。ε 太大会引入截断误差，太小则放大求解及舍入误差；应在一段 ε 范围内观察误差趋势。单次差分通过并不能证明整个优化更新正确。')+
 h('验证证据的层级')+p('解析补片与尺度律检查力学；独立装配／求解器对照检查实现；逐步轨迹对照检查具体算法；网格研究检验离散依赖；实验验证物理模型。不能把其中一层替代其余层。当前应用的具体测试及尚未完成的文献轨迹对照列在项目验证文档中。')+
 exercise('运行显示“达到迭代上限”，可以在报告里写“已收敛的最优结构”吗？','不可以。应报告迭代数、体积误差、目标变化和停止原因，并将结果称为当前迭代设计。',true)+book],
 en:['Convergence & verification','10 · Numerical convergence, feasibility and verification',
 h('Check different kinds of residual')+p('Equilibrium residual measures the FE solve, volume error measures feasibility, and design/energy changes measure iteration stability. Constant compliance may indicate convergence, rejected updates, bound locking or an inconsistent numerical implementation. These explanations must be distinguished.')+
 eq('r<sub>eq</sub>=‖K<sub>ff</sub>u<sub>f</sub>−f<sub>f</sub>‖/‖f<sub>f</sub>‖, &nbsp; r<sub>V</sub>=|V−V*|/V*, &nbsp; Δx=‖x<sup>k+1</sup>−x<sup>k</sup>‖∞')+
 h('Check derivatives independently')+eq('d<sub>FD</sub>=[C(x+εe<sub>j</sub>)−C(x−εe<sub>j</sub>)]/(2ε)')+
 p('Compare analytic gradients with central differences away from bounds. Large ε has truncation error; tiny ε amplifies solve and roundoff errors. Examine a range of steps. Passing a derivative check alone does not validate the entire optimizer.')+
 h('A hierarchy of evidence')+p('Analytic patch and scaling tests check mechanics. Independent assembly and solvers check implementation. Stepwise trajectories check a particular algorithm. Mesh studies check discretization dependence. Experiments check the physical model. One level cannot replace the others; project validation notes identify implemented checks and remaining literature-reproduction gaps.')+
 exercise('Can a run that reached its iteration cap be reported as a converged optimum?','No. Report iterations, volume error, objective changes and stopping reason; call it the current iterate.')+book]},
{zh:['悬臂梁实验','11 · 悬臂梁算例与可重复性协议',
 h('实验 A：验证尺度律')+p('使用本章配套命令固定全实体设计，令载荷从 −1 改为 −2，验证 C 为原来的 4 倍；再将 E 从 1 改为 2，验证 C 减半。命令只求解固定密度场，不运行优化。App 的 Start 会重新初始化优化，因此不用于本实验。')+
 h('实验 B：公平比较方法')+p('记录方法及变体、网格、h、r、材料、总载荷、加载位置、体积目标、停止条件与迭代上限。SIMP 从均匀密度开始，BESO/ESO 从实体开始，level set 从孔洞设计开始，因此起始 C 不应直接排名。比较最终 C 前先确认实际体积相同。')+
 h('实验 C：离散网格敏感性（节点载荷）')+p('以 40×25、h=2、r=1.5 与 80×50、h=1、r=3 比较二维域 80×50。三维可用 40×25×2、h=2 与 80×50×4、h=1。总载荷保持不变，且加载位置相同；奇数网格在相邻节点间分配载荷。这只能检查当前离散模型的网格敏感性，不能据此宣称柔度收敛到非奇异连续体解。只有两个网格也不足以估计收敛阶。')+
 h('实验 D：区分显示和分析')+p('SIMP 的灰度不是实体/空洞制造图。对阈值化后的形态应重新分析，不能沿用连续密度的柔度。Level set 的过渡带和体素显示也有离散误差。记录导出的密度和求解设置，而不是只保留截图。')+
 exercise('把 80×50 改为 160×100，同时保持 h=1 和 r=3，算不算同一物理问题的网格收敛研究？','不算。物理尺寸加倍而物理滤波半径不变；三维厚度若未同步改变，还会改变长厚比。',true)],
 en:['Cantilever experiments','11 · Cantilever benchmarks and a reproducibility protocol',
 h('A: scaling laws')+p('Use the companion command below to hold a fully solid design fixed. Changing force from −1 to −2 must quadruple C; doubling E must halve C. The command solves a fixed density field without optimization. App Start reinitializes optimization and is not the workflow for this experiment.')+
 h('B: compare methods fairly')+p('Record the method variant, mesh, h, r, material, total load and position, volume target, stopping criteria and iteration budget. SIMP begins at uniform density, BESO/ESO begin solid and level set begins perforated. Initial C values are not a fair ranking. Match actual final volume before comparing final C.')+
 h('C: discrete mesh sensitivity with nodal loads')+p('Compare 40×25, h=2, r=1.5 with 80×50, h=1, r=3 for the same 80×50 plane domain. In 3D use 40×25×2, h=2 and 80×50×4, h=1. Keep the resultant and its position unchanged; odd grids split the force between adjacent nodes. This probes the discrete model’s mesh sensitivity, not convergence to a nonsingular continuum compliance. Two meshes alone also do not determine a convergence order.')+
 h('D: separate display from analysis')+p('SIMP gray density is not a manufactured solid–void part. Thresholding requires reanalysis; the continuous design’s compliance cannot be reused. Level-set transition bands and voxel views also have discretization errors. Export densities and settings, not only screenshots.')+
 exercise('Is changing 80×50 to 160×100 while keeping h=1 and r=3 a fixed-domain mesh study?','No. Physical dimensions double while physical filter radius stays fixed. Unchanged 3D thickness would additionally alter aspect ratios.')]},
{zh:['方法对照与文献','12 · 方法比较、适用范围与参考文献',
 p('本文以线弹性最小柔度问题为统一背景，讨论密度法、演化法与隐式边界法。以下文献分别给出其理论基础和代表性数值构造；软件与文献之间的对应关系须以具体假设、离散和验证证据界定。')+
 h('应用中的方法名称')+p('SIMP：残余刚度插值、密度滤波、OC。BESO soft kill：弱材料与双向敏度更新。BESO hard kill：零刚度移除、节点敏度外推及全域排序。ESO：应变能准则的单向弱材料版本。Level set：固定网格、带孔初始化的 Hamilton–Jacobi 边界演化。')+
 book+simp+beso+source('https://doi.org/10.1016/S0045-7825(02)00464-4','Tanskanen, P. (2002). The evolutionary structural optimization method: theoretical aspects. Computer Methods in Applied Mechanics and Engineering, 191, 5485–5498.')+ls+
 h('计算报告的必要信息')+p('问题定义、算法变体和公式、离散与求解参数、初始化、停止条件、验证证据、未满足的约束及适用范围。图像只能展示结果的一部分。结论应限定于所采用的物理模型、设计空间与数值精度，并区分局部驻点、迭代稳定性和全局最优性。')],
 en:['Method map & references','12 · Method comparison, scope and references',
 p('This text uses linear-elastic minimum compliance as a common setting for density, evolutionary and implicit-boundary methods. The references establish theoretical foundations and representative numerical constructions; correspondence between software and literature is defined by matched assumptions, discretizations and verification evidence.')+
 h('What each App name means')+p('SIMP: residual-stiffness interpolation, density filter and OC. Soft-kill BESO: weak material with bidirectional sensitivity updates. Hard-kill BESO: zero-stiffness removal, nodal extrapolation and global ranking. ESO: a one-way, strain-energy, weak-material variant. Level set: fixed-grid Hamilton–Jacobi boundary evolution initialized with holes.')+
 book+simp+beso+source('https://doi.org/10.1016/S0045-7825(02)00464-4','Tanskanen, P. (2002). The evolutionary structural optimization method: theoretical aspects. Computer Methods in Applied Mechanics and Engineering, 191, 5485–5498.')+ls+
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
 h('位移空间与能量原理')+eq('𝒱 = {v ∈ H¹(Ω)ᵈ : v = 0 on Γᴅ}, &nbsp; a(u,v) = ℓ(v) &nbsp; ∀v∈𝒱')+
 eq('a(u,v)=∫Ω ε(v):𝔻:ε(u) dΩ, &nbsp; ℓ(v)=∫Ω b·v dΩ+∫Γɴ t·v dΓ')+
 p('这里 𝔻 为四阶弹性张量，D 为其 Voigt 矩阵表示（与作为集合的设计域 D 由上下文区分）。将强形式乘以试函数并分部积分，边界项中的 σn 由给定表面力 t 替代，即得弱形式。对齐次位移约束，平衡位移是总势能 Π(v)=a(v,v)/2−ℓ(v) 的驻点；在材料正定、约束消除刚体模态且区域具有适当正则性时，该驻点为唯一极小值。')+
 note('点载荷的连续与离散含义','理想集中力可能产生局部奇异应力；有限元节点力是离散载荷定义。集中力还使加载点位移及包含该位移的柔度具有奇异极限问题。当前 App 使用节点力，适合固定网格的算法比较；若研究有限的连续体柔度极限，应改用固定物理范围的分布载荷，并保持加载区域和总力不变。')],
 en:['Elasticity supplies the state solution required by optimization. The weak form specifies the displacement space, natural boundary conditions and constitutive assumptions on which subsequent sensitivity expressions depend.',
 h('Admissible displacements and the energy principle')+eq('𝒱 = {v ∈ H¹(Ω)ᵈ : v = 0 on Γᴅ}, &nbsp; a(u,v) = ℓ(v) &nbsp; ∀v∈𝒱')+
 eq('a(u,v)=∫Ω ε(v):𝔻:ε(u) dΩ, &nbsp; ℓ(v)=∫Ω b·v dΩ+∫Γɴ t·v dΓ')+
 p('The fourth-order elasticity tensor is denoted by 𝔻 and its Voigt matrix by D. Integration by parts transfers the equilibrium divergence onto the test function; the boundary term σn becomes the prescribed traction t. With homogeneous displacement constraints, equilibrium is stationary for Π(v)=a(v,v)/2−ℓ(v). Positive material stiffness, suitable domain regularity and supports that remove rigid modes make this stationary point the unique minimum.')+
 note('Concentrated loads','An ideal point force can generate a local stress singularity. A nodal force defines a discrete load. Loaded-point displacement, and compliance that includes it, also have a singular-limit issue. App uses nodal loads and supports fixed-mesh algorithm comparisons. Studying a finite continuum compliance limit requires a load distributed over a fixed physical region, with unchanged region and resultant.')]},
{fig:'elements',
 zh:['使用 Q4 与 H8 等参单元离散位移场，以数值积分构造单元刚度，再施加位移约束求解整体平衡。材料更新改变刚度系数，但不改变固定分析网格。',
 h('参考单元上的插值与积分')+eq('Nₐ(ξ,η)=¼(1+ξₐξ)(1+ηₐη), &nbsp; (ξₐ,ηₐ)∈{−1,1}²')+
 eq('Nₐ(ξ,η,ζ)=⅛(1+ξₐξ)(1+ηₐη)(1+ζₐζ)')+
 p('几何映射 X(ξ)=ΣₐNₐ(ξ)Xₐ 与位移插值使用相同形函数。若 Jᵢⱼ=∂Xᵢ/∂ξⱼ，则空间梯度为 ∇XNₐ=J⁻ᵀ∇ξNₐ。Q4 使用 2×2 Gauss 积分，H8 使用 2×2×2 Gauss 积分；对规则单元和单元内常量材料参数，该积分与这里采用的低阶插值相容。')+
 eq('kₑ⁰ = Σ<sub>q</sub> B<sub>q</sub>ᵀD₀B<sub>q</sub> det(J<sub>q</sub>) w<sub>q</sub>')+
 p('二维积分还应乘以厚度 t，本应用取 t=1。Q4 使用工程剪应变 γxy=2εxy，与对应的 Voigt 本构矩阵配套。装配后的矩阵对称性是必要条件，但单独满足对称性不能证明形函数梯度、积分或自由度映射正确。')],
 en:['Q4 and H8 isoparametric elements approximate displacement. Quadrature constructs element stiffness, after which displacement constraints define the global equilibrium solve. Material updates alter stiffness coefficients on a fixed analysis mesh.',
 h('Reference interpolation and quadrature')+eq('Nₐ(ξ,η)=¼(1+ξₐξ)(1+ηₐη), &nbsp; (ξₐ,ηₐ)∈{−1,1}²')+
 eq('Nₐ(ξ,η,ζ)=⅛(1+ξₐξ)(1+ηₐη)(1+ζₐζ)')+
 p('Geometry X(ξ)=ΣₐNₐ(ξ)Xₐ and displacement use the same shape functions. Defining Jᵢⱼ=∂Xᵢ/∂ξⱼ gives ∇XNₐ=J⁻ᵀ∇ξNₐ. Q4 uses 2×2 Gauss quadrature and H8 uses 2×2×2. This quadrature is consistent with the regular elements and elementwise constant material parameters considered here.')+
 eq('kₑ⁰ = Σ<sub>q</sub> B<sub>q</sub>ᵀD₀B<sub>q</sub> det(J<sub>q</sub>) w<sub>q</sub>')+
 p('Plane integration additionally includes thickness t, set to one here. Q4 uses engineering shear strain γxy=2εxy with the corresponding Voigt matrix. Symmetry of the assembled matrix is necessary, but alone does not verify shape-function gradients, quadrature or DOF mapping.')]},
{fig:'adjoint',
 zh:['通过对约束平衡方程求导，可在一次状态求解后获得全部设计变量的柔度梯度。推导采用对称线弹性刚度、齐次固定约束和设计无关载荷；这些条件决定了柔度问题的自伴随结构。',
 h('拉格朗日推导')+eq('ℒ(u,x,ψ)=fᵀu+ψᵀ[K(x)u−f]')+
 eq('∂ℒ/∂u = f+Kᵀψ = 0 &nbsp; ⇒ &nbsp; ψ=−u')+
 p('取平衡位移与伴随解后，状态导数项消去，得到 dC/dxⱼ=−uᵀ(∂K/∂xⱼ)u。这里的负号具有明确的物理意义：若增加设计变量使 ∂K/∂xⱼ 半正定，则柔度不能增加。若载荷、约束位置或规定非零位移随设计变化，则本推导必须加入相应导数项。')+
 h('多载荷推广与量纲')+eq('C<sub>Σ</sub>=Σ<sub>ℓ</sub>ω<sub>ℓ</sub> f<sub>ℓ</sub>ᵀu<sub>ℓ</sub>, &nbsp; ∂C<sub>Σ</sub>/∂xⱼ=−Σ<sub>ℓ</sub>ω<sub>ℓ</sub>u<sub>ℓ</sub>ᵀK,<sub>xⱼ</sub>u<sub>ℓ</sub>')+
 p('上述推广要求各载荷工况具有固定非负权重 ωℓ，并分别求解平衡；当前应用仅计算单载荷工况。柔度具有力乘长度的量纲。采用 E₀=1、F=−1 时，数值应理解为选定一致单位制下的结果，不能直接当作实际材料的位移或承载能力。')],
 en:['Differentiating constrained equilibrium yields all compliance sensitivities after a state solve. Symmetric linear elasticity, homogeneous fixed supports and design-independent loading establish the self-adjoint structure used in the derivation.',
 h('Lagrangian derivation')+eq('ℒ(u,x,ψ)=fᵀu+ψᵀ[K(x)u−f]')+
 eq('∂ℒ/∂u = f+Kᵀψ = 0 &nbsp; ⇒ &nbsp; ψ=−u')+
 p('At equilibrium with this adjoint, state-derivative terms vanish and dC/dxⱼ=−uᵀ(∂K/∂xⱼ)u. The sign has a physical interpretation: a positive-semidefinite stiffness increment cannot increase compliance under fixed loads. Design-dependent loads, moving supports or prescribed nonzero displacements require additional terms.')+
 h('Multiple loads and dimensions')+eq('C<sub>Σ</sub>=Σ<sub>ℓ</sub>ω<sub>ℓ</sub> f<sub>ℓ</sub>ᵀu<sub>ℓ</sub>, &nbsp; ∂C<sub>Σ</sub>/∂xⱼ=−Σ<sub>ℓ</sub>ω<sub>ℓ</sub>u<sub>ℓ</sub>ᵀK,<sub>xⱼ</sub>u<sub>ℓ</sub>')+
 p('This extension uses fixed nonnegative weights ωℓ and a state solve for each load case; the application currently evaluates one case. Compliance has dimensions of force times length. Values with E₀=1 and F=−1 require a consistent unit system and are not direct predictions of a physical material’s displacement or strength.')]},
{fig:'simp',
 zh:['SIMP 用连续密度与惩罚型材料插值近似固–空设计。滤波后的物理密度参与有限元与体积计算，最优性准则更新则作用于独立变量；两者之间必须使用一致的链式求导。',
 h('约束最优性条件')+eq('g(x)=V(x)−V*≤0, &nbsp; λ≥0, &nbsp; λg(x)=0')+
 eq('C,<sub>xⱼ</sub>+λV,<sub>xⱼ</sub>−μⱼ+νⱼ=0, &nbsp; μⱼxⱼ=0, &nbsp; νⱼ(xⱼ−1)=0, &nbsp; μⱼ,νⱼ≥0')+
 p('μⱼ、νⱼ 分别对应下界和上界乘子。满足约束资格条件时，上述 KKT 条件是局部最优的必要条件，并非非凸问题的充分条件。对严格内部变量，Bⱼ=−C,ₓⱼ/(λV,ₓⱼ)=1；OC 用 xⱼ√Bⱼ 构造有阻尼的乘法更新，而不是直接求解完整 KKT 系统。')+
 p('移动限 m 限制单步设计变化，但不能单独保证目标单调下降。对滤波设计，λ 的搜索应计算 V(Wxⁿᵉʷ)。若边界或移动限使本步无法达到预算，应报告可行性而不能将某个乘子值直接解释为收敛。惩罚增加可以降低中间密度的刚度效率，仍不保证所有单元最终严格二值化。')],
 en:['SIMP approximates solid–void design using continuous variables and penalized material interpolation. Filtered physical density enters both analysis and volume, while the optimality-criteria update acts on independent variables through a consistent chain rule.',
 h('Constrained stationarity')+eq('g(x)=V(x)−V*≤0, &nbsp; λ≥0, &nbsp; λg(x)=0')+
 eq('C,<sub>xⱼ</sub>+λV,<sub>xⱼ</sub>−μⱼ+νⱼ=0, &nbsp; μⱼxⱼ=0, &nbsp; νⱼ(xⱼ−1)=0, &nbsp; μⱼ,νⱼ≥0')+
 p('The multipliers μⱼ and νⱼ correspond to lower and upper bounds. Under a constraint qualification, these KKT conditions are necessary for local optimality, not sufficient for this nonconvex problem. For interior variables, Bⱼ=−C,ₓⱼ/(λV,ₓⱼ)=1. OC constructs a damped multiplicative step xⱼ√Bⱼ rather than solving the full KKT system.')+
 p('A move limit m restricts design change but does not by itself ensure monotonic objective decrease. Multiplier search must evaluate V(Wxⁿᵉʷ). If bounds or move limits make a budget unreachable in one step, feasibility must be reported rather than inferred from the multiplier. Penalization reduces the efficiency of intermediate density without guaranteeing an exactly binary design.')]},
{fig:'filter',
 zh:['空间滤波规定了局部平均的物理尺度，同时改变设计变量到分析密度的映射。本节区分前向滤波与反向灵敏度传播，并说明边界归一化为何影响体积导数。',
 h('分量形式的链式法则')+eq('ρ̃ₑ=ΣⱼWₑⱼxⱼ &nbsp; ⇒ &nbsp; ∂C/∂xⱼ=ΣₑWₑⱼ ∂C/∂ρ̃ₑ')+
 p('虽然未归一化的距离权重 H 对称，W 通常不对称，因为边界附近每行的权重总和不同。W1=1 表示保持常量，但一般 1ᵀW≠1ᵀ，因此不保证保持总和。以 W 代替 Wᵀ 传播梯度会使边界单元的导数错误。空间坐标 Xₑ 与设计变量 xⱼ 在此具有不同含义。')+
 h('滤波与正则化的适用范围')+p('固定物理半径 R 的网格研究与固定单元半径 r 的网格研究并不等价。滤波引入可控尺度，但普通密度平均并不直接规定所有实体杆件和空隙的最小尺寸。若要求严格几何尺寸控制，需进一步定义投影、鲁棒侵蚀／膨胀设计或显式几何约束；这些扩展不属于当前应用。')],
 en:['Spatial filtering specifies a physical averaging scale and changes the design-to-analysis map. Forward filtering and reverse sensitivity propagation are distinct operations; boundary normalization also changes the volume derivative.',
 h('Componentwise chain rule')+eq('ρ̃ₑ=ΣⱼWₑⱼxⱼ &nbsp; ⇒ &nbsp; ∂C/∂xⱼ=ΣₑWₑⱼ ∂C/∂ρ̃ₑ')+
 p('Unnormalized distance weights H are symmetric, but W generally is not: row sums differ near the boundary. W1=1 preserves constants, whereas 1ᵀW generally differs from 1ᵀ, so totals need not be preserved. Propagating gradients with W instead of Wᵀ gives incorrect boundary derivatives. Spatial positions Xₑ and design variables xⱼ have distinct roles here.')+
 h('Scope of filtering and regularization')+p('Refining with a fixed physical R differs from refining with a fixed radius r in element units. Averaging introduces a controlled scale but does not directly prescribe every solid member width and void gap. Strict geometric control requires additional projection, robust erosion/dilation formulations or explicit geometric constraints, which are outside the current application.')]},
{fig:'evolution',
 zh:['ESO 通过不可逆的单元删除缩减材料体积。应力拒绝准则和柔度灵敏度准则具有不同目标解释；本文采用后者的弱材料离散版本，并明确其可行更新集合。',
 h('局部删除代价与离散误差')+eq('ΔC ≈ C,<sub>ρₑ</sub> Δρₑ, &nbsp; Δρₑ&lt;0, &nbsp; C,<sub>ρₑ</sub>≤0')+
 p('在小扰动范围内，删除绝对梯度较小的单元预计引起较小的柔度增长。然而从实体到弱材料是有限变化，并非无穷小扰动；多个单元同时删除还会重新分配载荷路径。因此，局部一阶排序不能替代更新后的有限元分析，也不能证明删除后的结构最优。')+
 eq('𝒮<sub>k+1</sub>⊆𝒮<sub>k</sub>, &nbsp; n<sub>keep</sub>=⌈n(f<sub>k+1</sub>−ρ<sub>min</sub>)/(1−ρ<sub>min</sub>)⌉')+
 p('𝒮ₖ 为当前实体单元集合。对等体积单元，fₖ₊₁=max(fᵥ,(1−ER)fₖ) 是计划密度均值，计数公式包含弱材料对报告体积的贡献。达到体积预算后，若不允许恢复或交换单元，则不存在继续改进拓扑的双向更新自由度。')],
 en:['ESO reduces material through irreversible element removal. Stress rejection and compliance sensitivity have different objective interpretations. The weak-material energy variant considered here is defined by its admissible update set.',
 h('Local removal cost and finite changes')+eq('ΔC ≈ C,<sub>ρₑ</sub> Δρₑ, &nbsp; Δρₑ&lt;0, &nbsp; C,<sub>ρₑ</sub>≤0')+
 p('For small perturbations, removing an element with a smaller gradient magnitude predicts a smaller compliance increase. A solid-to-weak transition is a finite change, however, and simultaneous deletions redistribute load paths. First-order ranking therefore cannot replace reanalysis or establish optimality of the resulting structure.')+
 eq('𝒮<sub>k+1</sub>⊆𝒮<sub>k</sub>, &nbsp; n<sub>keep</sub>=⌈n(f<sub>k+1</sub>−ρ<sub>min</sub>)/(1−ρ<sub>min</sub>)⌉')+
 p('Here 𝒮ₖ is the current solid set. For equal-volume elements, fₖ₊₁=max(fᵥ,(1−ER)fₖ) is the scheduled mean density; the count includes the weak phase’s contribution to reported volume. Once the budget is reached, removal-only updates cannot perform material exchanges to further improve topology.')]},
{zh:['BESO 扩展单向演化的设计更新，使空区域能够重新参与材料分配。关键在于定义可比较的实体与空域敏度、控制空间噪声和迭代振荡，并以体积预算及加入率约束选取单元。',
 h('Hard kill 的节点敏度外推')+eq('α<sub>i</sub><sup>node</sup> = Σ<sub>e∈𝒮(i)</sub>αₑ / |𝒮(i)|, &nbsp; α<sub>i</sub><sup>node</sup>=0 &nbsp; if |𝒮(i)|=0')+
 eq('α̂ₑ = [Σ<sub>i</sub>max(0,R−‖Xₑ−Xᵢ‖)α<sub>i</sub><sup>node</sup>] / [Σ<sub>i</sub>max(0,R−‖Xₑ−Xᵢ‖)]')+
 p('𝒮(i) 是与节点 i 相连的实体单元集合。上式适用于这里的等体积规则单元；非均匀单元需重新规定平均权重。分母包含支撑域内的空节点，即使其敏度为零也不能将其从归一化中删除。外推值是恢复材料的估计收益，不是零刚度奇异状态下可直接使用的普通密度导数。')+
 h('体积预算、被动区域与加入率')+eq('|𝒮<sub>k+1</sub>∖𝒮<sub>k</sub>| ≤ ⌊AR<sub>max</sub>n⌋, &nbsp; 𝒫⊆𝒮<sub>k+1</sub>')+
 p('𝒫 表示规定为实体的被动单元。当前离散以设计域单元数 n 为加入率分母：先保留被动实体，再在现有实体与允许恢复的高敏度空单元之间排序。载荷邻域的被动实体必须计入体积预算；它仅保持载荷施加位置有材料，不保证与支撑连通。')+
 source('https://www.aeromech.usyd.edu.au/WCSMO2015/papers/1154_paper.pdf','Ghabraie, K. (2015). An improvement technique for Bi-directional Evolutionary Structural optimisation (BESO) method. 11th World Congress on Structural and Multidisciplinary Optimisation, Sydney.')],
 en:['BESO extends one-way evolution by allowing void regions to compete for material. The essential ingredients are comparable solid/void scores, spatial and temporal stabilization, and selection subject to volume and admission constraints.',
 h('Nodal extrapolation for hard kill')+eq('α<sub>i</sub><sup>node</sup> = Σ<sub>e∈𝒮(i)</sub>αₑ / |𝒮(i)|, &nbsp; α<sub>i</sub><sup>node</sup>=0 &nbsp; if |𝒮(i)|=0')+
 eq('α̂ₑ = [Σ<sub>i</sub>max(0,R−‖Xₑ−Xᵢ‖)α<sub>i</sub><sup>node</sup>] / [Σ<sub>i</sub>max(0,R−‖Xₑ−Xᵢ‖)]')+
 p('𝒮(i) contains solid elements incident on node i. This average applies to equal-volume regular elements; nonuniform elements require a specified weighting. The denominator includes empty nodes within the support even when their score is zero. Extrapolation estimates restoration benefit; it is not an ordinary density derivative evaluated at a singular zero-stiffness state.')+
 h('Volume, passive material and admission')+eq('|𝒮<sub>k+1</sub>∖𝒮<sub>k</sub>| ≤ ⌊AR<sub>max</sub>n⌋, &nbsp; 𝒫⊆𝒮<sub>k+1</sub>')+
 p('𝒫 is the prescribed solid set. This discretization defines admission relative to all n domain elements: retain passive material, then rank existing solid and eligible high-score void cells. A passive load pad counts toward the budget and preserves material at the load application, but does not guarantee a connection to supports.')+
 source('https://www.aeromech.usyd.edu.au/WCSMO2015/papers/1154_paper.pdf','Ghabraie, K. (2015). An improvement technique for Bi-directional Evolutionary Structural optimisation (BESO) method. 11th World Congress on Structural and Multidisciplinary Optimisation, Sydney.')]},
{fig:'levelset',
 zh:['水平集方法将几何边界表示为标量场的零等值集，以形状导数确定边界运动方向。本节明确实体内取正的符号约定，区分连续边界梯度、速度延拓和固定网格上的弱材料近似。',
 h('自由边界上的下降方向')+eq('ℒ(Ω)=C(Ω)+λ[V(Ω)−V*]+γP(Ω)')+
 eq('ℒ′(Ω)[θ]=∫Γ<sub>free</sub>[−q+λ+γκ<sub>out</sub>] Vₙ dΓ, &nbsp; q=σ(u):ε(u)')+
 eq('Vₙ=q−λ−γκ<sub>out</sub> &nbsp; ⇒ &nbsp; ℒ′(Ω)[θ]=−∫Γ<sub>free</sub>Vₙ² dΓ ≤ 0')+
 p('上式限定于光滑、无载荷的可变自由边界，外载及支撑所在边界保持不动，且无体力。θ·n=Vₙ，P 为边界长度或面积，κout=divΓn（凸圆为正）。由 n=−∇φ/|∇φ| 可得 κout=−div(∇φ/|∇φ|)，所以正内符号约定下的曲率项必须相应换号。这里 λ 固定时给出拉格朗日泛函的瞬时下降方向；约束体积的实际迭代还需确定 λ 并满足步长条件。')+
 h('连续形状导数与离散近似')+p('应用中用实体侧单元能量估计并延拓边界驱动项，再滤波、归一化并加入曲率项。该构造不是对界面积分 q 的逐点精确计算。平滑 Heaviside 在单元中心提供材料插值；对该插值求导得到的离散密度梯度，与连续自由边界形状导数属于不同验证对象。')+
 eq('Hε(s)=0 (s≤−ε); &nbsp; ½[1+s/ε+sin(πs/ε)/π] (|s|&lt;ε); &nbsp; 1 (s≥ε)')+
 note('离散体积约定','当前应用取 ρ=η+(1−η)Hε(φ)，η=10⁻⁶，并用 Σvₑρₑ 计算体积；因此它是带残余相的离散体积，不严格等于几何体积 |{φ>0}|。界面半宽 ε=0.75 以单元边长计。理论下降方向经延拓、离散和重初始化后，不自动继承连续下降结论，仍需实际状态求解与验收。')],
 en:['Level sets represent geometry by the zero set of a scalar field and use shape derivatives to define boundary motion. The positive-inside convention is made explicit, separating the continuum gradient, velocity extension and fixed-grid weak-material approximation.',
 h('A descent direction on the free boundary')+eq('ℒ(Ω)=C(Ω)+λ[V(Ω)−V*]+γP(Ω)')+
 eq('ℒ′(Ω)[θ]=∫Γ<sub>free</sub>[−q+λ+γκ<sub>out</sub>] Vₙ dΓ, &nbsp; q=σ(u):ε(u)')+
 eq('Vₙ=q−λ−γκ<sub>out</sub> &nbsp; ⇒ &nbsp; ℒ′(Ω)[θ]=−∫Γ<sub>free</sub>Vₙ² dΓ ≤ 0')+
 p('These expressions concern a smooth, traction-free moving boundary, with loaded and supported boundaries fixed and no body forces. Here θ·n=Vₙ, P is perimeter or surface area, and κout=divΓn, positive for a convex circle. Since n=−∇φ/|∇φ|, κout=−div(∇φ/|∇φ|); the curvature sign must match the inside convention. With λ fixed this is an instantaneous Lagrangian descent direction. A volume-constrained discrete iteration must additionally determine λ and an admissible step.')+
 h('Continuum gradient and discrete approximation')+p('The application estimates and extends a boundary drive from solid-side element energies, then filters, normalizes and adds curvature smoothing. This is not an exact pointwise evaluation of the boundary integrand q. A smooth Heaviside defines cell-center material interpolation. Its discrete density derivative and the continuum free-boundary shape derivative are distinct verification targets.')+
 eq('Hε(s)=0 (s≤−ε); &nbsp; ½[1+s/ε+sin(πs/ε)/π] (|s|&lt;ε); &nbsp; 1 (s≥ε)')+
 note('Discrete volume convention','The application uses ρ=η+(1−η)Hε(φ), η=10⁻⁶, and volume Σvₑρₑ. This residual-phase volume differs from the geometric measure |{φ>0}|. Interface half-width ε=0.75 is in element units. Extension, discretization and reinitialization do not automatically preserve the continuum descent result; state solves and acceptance checks remain necessary.')]},
{zh:['验证需分别回答状态求解是否正确、灵敏度是否一致、优化迭代是否稳定，以及离散模型是否代表目标物理问题。本节给出可报告的误差指标，并区分数值停止与最优性证明。',
 h('可行性与约束驻点')+p('对上界型体积约束，严格的可行性残差可取 max(0,V−V*)/V*；|V−V*|/V* 则度量目标体积的满足程度，二者含义不同。只有在预算预期活跃的柔度问题中，才通常同时要求后者较小。')+
 eq('r<sub>KKT</sub>=‖x−Π<sub>[0,1]ⁿ</sub>(x−s[∇C+λ∇V])‖∞, &nbsp; s&gt;0')+
 p('该投影残差适用于连续密度变量，并应结合体积可行性、λ≥0 和互补性检查。步长尺度 s 应固定并明确报告。它不直接适用于二值演化法，也不是当前界面中 Δ 的定义；界面 Δ 来自目标历史变化。')+
 h('误差源与证据边界')+table(['检查','支持的结论','不支持的推论'],[['平衡残差、补片与尺度律','所测状态方程及离散行为一致','真实材料或非线性失效已验证'],['差分与独立装配对照','所测梯度或求解路径一致','全部初始化均收敛到同一设计'],['匹配条件下的迭代轨迹','指定算法与指定参考一致','所有方法已获通用认证'],['固定物理尺度网格研究','所测响应的离散依赖得到量化','点载荷应力峰值必然收敛']])],
 en:['Verification must distinguish state-solve accuracy, derivative consistency, iteration stability and physical-model adequacy. Reportable residuals provide evidence for these separate questions without turning numerical termination into an optimality proof.',
 h('Feasibility and constrained stationarity')+p('For an upper volume bound, max(0,V−V*)/V* measures violation; |V−V*|/V* measures agreement with the target. These are different quantities. The latter is usually also required when the compliance problem is expected to use an active material budget.')+
 eq('r<sub>KKT</sub>=‖x−Π<sub>[0,1]ⁿ</sub>(x−s[∇C+λ∇V])‖∞, &nbsp; s&gt;0')+
 p('This projected residual applies to continuous density variables and accompanies feasibility, λ≥0 and complementarity checks. Report a fixed step scale s. It does not apply directly to binary evolution and is not the interface’s Δ, which measures objective-history change.')+
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
 p('以下文献用来定位理论和代表性离散形式，不将引用本身视为软件验证。对应用的数值结论，应进一步核查其边界条件、材料插值、滤波、初始化和停止判据是否与参考完全一致。')],
 en:['These method families share state analysis but use different design spaces, sensitivity interpretations and updates. Comparison should address the posed problem, constraints and evidence rather than the appearance of a binary image.',
 h('Classification and comparison criteria')+table(['Method','Representation','Update','Interpretation boundary'],[['SIMP','Continuous variables x','Filtered derivatives and OC','Intermediate density and local stationarity'],['ESO','Retained-element set','Irreversible removal','Dependence on early removals'],['BESO','Solid/weak or solid/void','Ranking, removal and reintroduction','Void extrapolation and quantized volume'],['Level set','Implicit field φ and zero boundary','Normal velocity and Hamilton–Jacobi transport','Initialization, boundary gradients and nucleation']])+
 p('The references locate theoretical and representative discrete formulations; citation itself is not software verification. Numerical equivalence requires matching boundary conditions, interpolation, filtering, initialization and termination criteria.')]}];

export const lessons=chapters.map((chapter,index)=>Object.fromEntries(['zh','en'].map(lang=>{
 const [title,heading,body]=chapter[lang], [abstract,addition]=supplements[index][lang];
 const insert=body.indexOf('<section class="exercise">');
 const material=addition+(practical[index]?.[lang]??'');
 const expanded=insert<0?body+material:body.slice(0,insert)+material+body.slice(insert);
 return [lang,[title,heading,`<div class="chapter-abstract"><h2>${lang==='zh'?'摘要':'Abstract'}</h2>${p(abstract)}</div>${supplements[index].fig?figure(supplements[index].fig,lang):''}${expanded}`]];
})));
