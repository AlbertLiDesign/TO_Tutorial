// Original bilingual teaching text. Equations use fixed, design-independent loads.
const p=s=>`<p>${s}</p>`, h=s=>`<h2>${s}</h2>`, eq=s=>`<div class="theory-equation" role="math">${s}</div>`;
const exercise=(q,a,zh=false)=>`<section class="exercise"><h3>${zh?'思考与练习':'Check your understanding'}</h3><p>${q}</p><details><summary>${zh?'查看解答':'Show solution'}</summary><p>${a}</p></details></section>`;
const source=(url,label)=>`<p class="chapter-source"><a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a></p>`;
const book=source('https://link.springer.com/book/10.1007/978-3-662-05086-6','Bendsøe & Sigmund · Topology Optimization: Theory, Methods, and Applications');
const simp=source('https://www.topopt.mek.dtu.dk/apps-and-software/efficient-topology-optimization-in-matlab','Andreassen et al. (2011) · Density filtering and the 88-line method');
const beso=source('https://doi.org/10.1016/j.finel.2007.06.006','Huang & Xie (2007) · Convergent and mesh-independent BESO');
const ls=source('https://doi.org/10.1016/j.jcp.2003.09.032','Allaire, Jouve & Toader (2004) · Shape sensitivity and level sets');
export const lessons=[
{zh:['问题与设计变量','1 · 从结构设计到材料分布',
 h('尺寸、形状与拓扑')+p('尺寸优化调整截面或厚度；形状优化移动已有边界；拓扑优化还允许连接关系和孔洞数量改变。给定设计域 D、固定边界、载荷及材料模型后，设计变量回答“材料放在哪里”，位移则由平衡方程决定。')+
 eq('min<sub>ρ</sub> C(ρ) &nbsp; s.t. &nbsp; K(ρ)u = f, &nbsp; Σ<sub>e</sub>v<sub>e</sub>ρ<sub>e</sub> ≤ V*, &nbsp; 0 ≤ ρ<sub>e</sub> ≤ 1')+
 p('ρ 是相对材料密度，vₑ 是单元体积，V* 是允许的材料体积。理想实体–空洞问题要求 ρ∈{0,1}；密度法先允许连续值，再通过材料插值抑制中间密度。体积分数 fᵥ=V*/|D| 与载荷向量 f 是不同量。')+
 h('先定义问题，再选择算法')+p('本教材研究固定载荷、线弹性、小变形下的最小柔度问题。它不等同于最小应力、最大屈曲载荷或最大强度。比较算法必须固定物理尺寸、支撑、载荷位置及总量、材料参数和体积预算。改变其中一项，就改变了优化问题。')+
 exercise('减少一半材料，柔度一定也减半吗？','不会。在固定载荷下，去掉材料通常会降低刚度、增大柔度；优化是在有限材料中改善分布，并不能取消这个代价。',true)+book],
 en:['Problem & variables','1 · From structural design to material distribution',
 h('Sizing, shape and topology')+p('Sizing changes sections or thicknesses. Shape optimization moves existing boundaries. Topology optimization also permits changes in connectivity and holes. The design domain D, supports, loads and material law define the problem; displacements are state variables determined by equilibrium.')+
 eq('min<sub>ρ</sub> C(ρ) &nbsp; s.t. &nbsp; K(ρ)u = f, &nbsp; Σ<sub>e</sub>v<sub>e</sub>ρ<sub>e</sub> ≤ V*, &nbsp; 0 ≤ ρ<sub>e</sub> ≤ 1')+
 p('Here ρ is relative material density, vₑ is element volume and V* is the material budget. A solid–void problem uses ρ∈{0,1}; density methods relax this restriction and penalize intermediate material. The volume fraction fᵥ=V*/|D| is distinct from the load vector f.')+
 h('Define the problem before the algorithm')+p('We study minimum compliance with fixed loads, linear elasticity and small displacements. This is not a minimum-stress, buckling or strength problem. A fair comparison fixes physical dimensions, supports, load position and magnitude, material properties and volume budget. Changing any of them changes the optimization problem.')+
 exercise('Does halving material necessarily halve compliance?','No. Removing stiffness generally increases compliance under fixed loads. Optimization improves material placement within a budget; it does not remove that tradeoff.')+book]},
{zh:['线弹性与边界条件','2 · 优化必须服从力学',
 eq('ε(u) = ½(∇u + ∇uᵀ), &nbsp; σ = Dε, &nbsp; −div σ = b')+
 p('ε 为小应变，σ 为应力，D 为弹性矩阵，b 为体力。在位移边界 Γᴅ 上给定位移，在力边界 Γɴ 上给定表面力。固定约束必须消除刚体运动，否则平衡解不唯一。当前 App 使用零位移约束及节点力，不包含体力或随设计变化的载荷。')+
 h('二维不是三维的简单删除')+p('平面应力假设 σzz=τxz=τyz=0，适合薄板的面内受力；平面应变假设 εzz=γxz=γyz=0，适合受约束的长结构截面。两者使用不同的本构矩阵。App 的 Q4 是单位厚度平面应力，H8 是三维弹性。')+
 eq('D<sub>plane stress</sub> = E/(1−ν²) · [[1, ν, 0], [ν, 1, 0], [0, 0, (1−ν)/2]]')+
 h('弱形式')+p('对满足齐次位移边界的任意试函数 v，平衡条件为 ∫Ω ε(v):D:ε(u) dΩ = ∫Ω v·b dΩ + ∫Γɴ v·t dΓ。有限元把这个连续问题限制在有限维位移空间内。')+
 exercise('二维图像相同，是否意味着 Q4 与一层 H8 的结果完全相同？','不意味着。单位厚度、厚度方向约束、载荷分布及三维泊松效应均可能不同。必须先匹配物理模型。',true)+book],
 en:['Elasticity & boundaries','2 · Optimization must satisfy mechanics',
 eq('ε(u) = ½(∇u + ∇uᵀ), &nbsp; σ = Dε, &nbsp; −div σ = b')+
 p('Small strain ε, stress σ, elasticity tensor D and body force b describe equilibrium. Prescribe displacement on Γᴅ and traction on Γɴ. Supports must eliminate rigid-body motion. App uses homogeneous displacement constraints and nodal forces; body forces and design-dependent loads are outside this model.')+
 h('Two dimensions require a constitutive assumption')+p('Plane stress sets σzz=τxz=τyz=0 for thin plates loaded in their plane. Plane strain sets εzz=γxz=γyz=0 for constrained long sections. Their constitutive matrices differ. App uses unit-thickness plane-stress Q4 elements and three-dimensional H8 elements.')+
 eq('D<sub>plane stress</sub> = E/(1−ν²) · [[1, ν, 0], [ν, 1, 0], [0, 0, (1−ν)/2]]')+
 h('Weak equilibrium')+p('For every admissible test displacement v, ∫Ω ε(v):D:ε(u) dΩ = ∫Ω v·b dΩ + ∫Γɴ v·t dΓ. Finite elements restrict this statement to a finite-dimensional displacement space.')+
 exercise('Must a Q4 plate and one layer of H8 elements give identical results?','No. Thickness, transverse constraints, load distribution and three-dimensional Poisson effects must first be matched.')+book]},
{zh:['有限元离散','3 · 从单元到整体平衡',
 eq('u ≈ N u<sub>e</sub>, &nbsp; ε = B u<sub>e</sub>, &nbsp; k<sub>e</sub> = ∫Ωₑ BᵀDB dΩ')+
 p('Q4 使用双线性形函数，H8 使用三线性形函数。形函数在参考单元上定义，通过雅可比矩阵映射到物理单元。数值积分计算单元刚度，再按共享节点的自由度编号装配整体矩阵。单元朝向错误或雅可比退化会破坏分析。')+
 eq('K = Σ<sub>e</sub> A<sub>e</sub>ᵀ k<sub>e</sub> A<sub>e</sub>, &nbsp; K<sub>ff</sub>u<sub>f</sub> = f<sub>f</sub> − K<sub>fc</sub>u<sub>c</sub>')+
 p('Aₑ 是自由度装配映射，下标 f/c 分别表示自由与约束自由度。这里的固定端满足 u𝚌=0。Hard kill 还必须删除没有实体单元连接的空节点自由度；仅把这些节点留在矩阵中会产生零行。即使移除了零行，悬空实体或铰接机构仍可导致奇异矩阵。')+
 h('先验证分析器')+p('必要检查包括刚度对称性、刚体运动零能量、常应变补片试验、平衡残差，以及外功与应变能的一致性。优化图案合理不能替代这些检查。')+
 exercise('若所有单元都是实体，但结构没有任何支撑，增大 E 能否消除奇异性？','不能。刚体运动不产生应变，因而对应的零能量模态不会随 E 增大而消失。',true)+book],
 en:['Finite elements','3 · From elements to global equilibrium',
 eq('u ≈ N u<sub>e</sub>, &nbsp; ε = B u<sub>e</sub>, &nbsp; k<sub>e</sub> = ∫Ωₑ BᵀDB dΩ')+
 p('Q4 uses bilinear shape functions; H8 uses trilinear ones. A Jacobian maps reference-element derivatives to physical coordinates. Numerical quadrature gives element stiffness, and shared-node degree-of-freedom maps assemble the global system. Inverted or degenerate elements invalidate the analysis.')+
 eq('K = Σ<sub>e</sub> A<sub>e</sub>ᵀ k<sub>e</sub> A<sub>e</sub>, &nbsp; K<sub>ff</sub>u<sub>f</sub> = f<sub>f</sub> − K<sub>fc</sub>u<sub>c</sub>')+
 p('Aₑ maps global to element displacements; f/c denote free/constrained DOFs. Fixed supports have u𝚌=0. Hard kill also removes DOFs attached only to void elements. Removing zero rows does not cure floating solid components or mechanisms: those can still make K singular.')+
 h('Verify the analyzer first')+p('Check stiffness symmetry, zero energy for rigid motion, constant-strain patch tests, equilibrium residuals and work–energy consistency. A plausible optimized picture cannot replace these checks.')+
 exercise('Can increasing E make an unsupported solid structure nonsingular?','No. Rigid-body modes generate no strain, so their zero energy remains zero when E increases.')+book]},
{zh:['柔度与伴随敏度','4 · 推导目标函数的梯度',
 eq('C = fᵀu = uᵀKu, &nbsp; U = ½C')+
 p('本教材和当前 App 统一用 C 表示柔度，U 表示应变能。对于固定载荷，柔度越小，载荷方向的加权位移越小。不要把柔度直接解释为强度或所有位置的最大位移。')+
 h('固定载荷下的导数')+p('逗号下标 x 表示对设计变量 x 求导。')+eq('K u = f ⇒ K u,<sub>x</sub> = −K,<sub>x</sub>u')+
 eq('C,<sub>x</sub> = fᵀu,<sub>x</sub> = uᵀK u,<sub>x</sub> = −uᵀK,<sub>x</sub>u')+
 p('对称刚度和固定 f 使伴随变量与位移相关，因此不必为每个设计变量重新求解位移导数。若 f 随设计变化，则应加上 2uᵀf,ₓ；忽略这个项会得到错误梯度。')+
 h('一个可手算的例子')+eq('k(ρ)=k₀ρᵖ, &nbsp; u=F/(k₀ρᵖ), &nbsp; C=F²/(k₀ρᵖ), &nbsp; dC/dρ=−pF²/(k₀ρᵖ⁺¹)')+
 exercise('保持几何和材料不变，将 F 加倍，u 和 C 如何变化？','u 加倍，C 变为四倍。把全部弹性模量加倍时，u 和 C 都减半。',true)+book],
 en:['Compliance & adjoints','4 · Derive the objective gradient',
 eq('C = fᵀu = uᵀKu, &nbsp; U = ½C')+
 p('C denotes compliance throughout this textbook and the current App; U denotes strain energy. At fixed loads, lower compliance reduces the load-weighted displacement. It is not a strength measure or a bound on every displacement component.')+
 h('Differentiate equilibrium with fixed loads')+p('A comma subscript x denotes differentiation with respect to design variable x.')+eq('K u = f ⇒ K u,<sub>x</sub> = −K,<sub>x</sub>u')+
 eq('C,<sub>x</sub> = fᵀu,<sub>x</sub> = uᵀK u,<sub>x</sub> = −uᵀK,<sub>x</sub>u')+
 p('Symmetry and fixed f make compliance self-adjoint: no separate displacement-derivative solve is needed for every variable. Design-dependent loads require the additional term 2uᵀf,ₓ. Dropping it gives an incorrect gradient.')+
 h('A one-spring calculation')+eq('k(ρ)=k₀ρᵖ, &nbsp; u=F/(k₀ρᵖ), &nbsp; C=F²/(k₀ρᵖ), &nbsp; dC/dρ=−pF²/(k₀ρᵖ⁺¹)')+
 exercise('With unchanged geometry and material, what does doubling F do?','Displacement doubles and compliance quadruples. Doubling all elastic moduli instead halves both displacement and compliance.')+book]},
{zh:['SIMP 与 OC 更新','5 · 连续密度的最优性条件',
 eq('k<sub>e</sub>(ρ̃<sub>e</sub>) = [η + (1−η)ρ̃<sub>e</sub><sup>p</sup>] k<sub>e</sub><sup>0</sup>, &nbsp; η=E<sub>min</sub>/E₀')+
 p('ρ̃ 是用于分析的物理密度，kₑ⁰ 是实体单元刚度。p>1 降低中间密度的单位材料刚度效率；η>0 防止空区域导致奇异刚度。App 的 SIMP 采用 η=10⁻⁹、密度滤波和 OC 更新，设计变量允许降到零。p=3 是常见选择，并非普适最优参数。')+
 eq('∂C/∂ρ̃<sub>e</sub> = −p(1−η)ρ̃<sub>e</sub><sup>p−1</sup> u<sub>e</sub>ᵀk<sub>e</sub>⁰u<sub>e</sub>')+
 h('体积乘子与移动限')+p('令拉格朗日函数 L=C+λ(V−V*)。内部自由变量满足 C,ₓ+λV,ₓ=0，边界变量还需满足互补条件。OC 用这一平衡构造乘法更新，λ 由二分搜索满足体积约束。')+
 eq('x<sub>j</sub><sup>new</sup> = clip(x<sub>j</sub> √[−C,<sub>xⱼ</sub>/(λV,<sub>xⱼ</sub>)], max(0,x<sub>j</sub>−m), min(1,x<sub>j</sub>+m))')+
 exercise('为什么体积约束应使用滤波后的密度，而不是原始 x？','有限元刚度来自物理密度 ρ̃，因此材料用量也必须用 ρ̃ 定义。边界处滤波权重不均匀时，Σx 不一定等于 Σρ̃。',true)+simp],
 en:['SIMP & OC updates','5 · Optimality conditions for continuous density',
 eq('k<sub>e</sub>(ρ̃<sub>e</sub>) = [η + (1−η)ρ̃<sub>e</sub><sup>p</sup>] k<sub>e</sub><sup>0</sup>, &nbsp; η=E<sub>min</sub>/E₀')+
 p('Physical density ρ̃ enters analysis; kₑ⁰ is solid stiffness. A penalty p>1 makes intermediate density less efficient. Positive η supplies residual stiffness. App uses η=10⁻⁹, density filtering and OC, with design variables allowed to reach zero. The common choice p=3 is not universally optimal.')+
 eq('∂C/∂ρ̃<sub>e</sub> = −p(1−η)ρ̃<sub>e</sub><sup>p−1</sup> u<sub>e</sub>ᵀk<sub>e</sub>⁰u<sub>e</sub>')+
 h('Volume multiplier and move limit')+p('For L=C+λ(V−V*), an interior variable satisfies C,ₓ+λV,ₓ=0; bounds require complementary conditions. The OC step uses this balance. Bisection chooses λ to satisfy physical volume, and m limits one iteration’s change.')+
 eq('x<sub>j</sub><sup>new</sup> = clip(x<sub>j</sub> √[−C,<sub>xⱼ</sub>/(λV,<sub>xⱼ</sub>)], max(0,x<sub>j</sub>−m), min(1,x<sub>j</sub>+m))')+
 exercise('Why constrain filtered density rather than the raw x?','Stiffness is evaluated using physical density, so material volume must use it too. Near boundaries, row normalization means Σx need not equal Σρ̃.')+simp]},
{zh:['滤波与网格尺度','6 · 为什么不能忽略空间尺度',
 eq('H<sub>ei</sub>=max(0,R−‖x<sub>e</sub>−x<sub>i</sub>‖), &nbsp; W<sub>ei</sub>=H<sub>ei</sub>/Σ<sub>j</sub>H<sub>ej</sub>, &nbsp; ρ̃=Wx')+
 p('行归一化使常量密度保持常量。密度滤波改变从设计变量到物理材料的映射；敏度滤波则直接平滑更新信号。二者不是同一算法，也不能混用链式法则。')+
 eq('∇<sub>x</sub>C = Wᵀ∇<sub>ρ̃</sub>C, &nbsp; ∇<sub>x</sub>V = Wᵀv')+
 h('尺度与病态')+p('低阶离散中可能出现棋盘格；没有长度尺度约束时，细化网格还可能产生越来越细的结构。滤波改善数值行为，但不能自动保证最小构件尺寸、单一连通性或可制造性。')+
 p('App 的 r 以单元边长为单位，实际半径 R=rh。域尺寸为 Nx·h、Ny·h、Nz·h。做相同物理域的网格加密时，应同时减小 h、增大单元数量，并保持 rh 不变。二维厚度仍为 1。')+
 exercise('Nx、Ny 加倍且 h 减半，为保持物理滤波半径，r 应如何变化？','r 也加倍。三维还应将 Nz 加倍，才能保持厚度不变。',true)+source('https://doi.org/10.1007/BF01214002','Sigmund & Petersson (1998) · Checkerboards, mesh dependence and local minima')],
 en:['Filtering & mesh scale','6 · A length scale is part of the problem',
 eq('H<sub>ei</sub>=max(0,R−‖x<sub>e</sub>−x<sub>i</sub>‖), &nbsp; W<sub>ei</sub>=H<sub>ei</sub>/Σ<sub>j</sub>H<sub>ej</sub>, &nbsp; ρ̃=Wx')+
 p('Row normalization preserves constant density. Density filtering changes the design-to-material map; sensitivity filtering smooths an update signal. They are different algorithms and cannot share a chain rule indiscriminately.')+
 eq('∇<sub>x</sub>C = Wᵀ∇<sub>ρ̃</sub>C, &nbsp; ∇<sub>x</sub>V = Wᵀv')+
 h('Numerical length scales')+p('Low-order discretizations can exhibit checkerboards. Without a length scale, refinement may favor ever finer structures. Filtering improves numerical behavior but does not automatically guarantee minimum member size, connectivity or manufacturability.')+
 p('In App, r is measured in element edges: physical radius is R=rh. Domain dimensions are Nx·h, Ny·h and Nz·h. To refine the same physical problem, decrease h, increase counts and hold rh fixed. Plane-stress thickness remains 1.')+
 exercise('If Nx and Ny double and h halves, how should r change?','Double r to keep rh fixed. In 3D, double Nz too so thickness remains unchanged.')+source('https://doi.org/10.1007/BF01214002','Sigmund & Petersson (1998) · Checkerboards, mesh dependence and local minima')]},
{zh:['ESO：单向演化','7 · 删除准则必须说清楚',
 p('ESO 逐步删除低效材料，已删除材料不再恢复。原始应力型 ESO 以单元 von Mises 应力与当前最大应力之比作删除判断；达到稳定状态后提高拒绝比。它不是与体积受限柔度最小化完全相同的数学问题。')+
 eq('原始应力准则：σ<sub>VM,e</sub>/σ<sub>VM,max</sub> < RR')+
 h('本 App 的具体版本')+p('App 采用应变能准则的单向 ESO：在现有实体中，按滤波后的能量敏度从低到高删除，直到达到本步体积。为保留稳定的分析域，空单元保留弱刚度。这是柔度问题的能量型 ESO，不宣称复现原始应力拒绝比算法。')+
 eq('V<sub>k+1</sub> = max(V*, (1−ER)V<sub>k</sub>), &nbsp; α<sub>e</sub> ∝ u<sub>e</sub>ᵀk<sub>e</sub>⁰u<sub>e</sub>')+
 p('逐个单元删除使体积只能按离散增量改变；实现采用不低于目标的舍入。删除后的单元不参加恢复竞争，因此早期错误决策不能被后续加回修复。到达体积预算是一种停止条件，不是全局最优的证明。')+
 exercise('ESO 与 BESO 都得到 50% 体积，是否应有相同形态？','不应如此要求。BESO 可以加回材料，ESO 不可以；更新历史、筛选准则与局部最优可能不同。',true)+source('https://doi.org/10.1016/0045-7949(93)90035-C','Xie & Steven (1993) · Original stress-based ESO')+source('https://doi.org/10.1016/S0045-7825(02)00464-4','Tanskanen (2002) · Strain-energy removal and theoretical aspects')],
 en:['ESO: one-way evolution','7 · State the removal criterion',
 p('ESO progressively removes inefficient material without restoring it. Original stress-based ESO compares each element’s von Mises stress with the current maximum; the rejection ratio rises after a steady state. This is not the same mathematical formulation as volume-constrained compliance minimization.')+
 eq('Original stress criterion: σ<sub>VM,e</sub>/σ<sub>VM,max</sub> < RR')+
 h('The variant in this App')+p('App uses strain-energy-based, one-way ESO: rank existing solid elements by filtered energy sensitivity and remove the lowest until the scheduled volume is reached. A weak phase retains the analysis domain. This is energy-based ESO for the compliance problem, not a reproduction of the original stress-rejection algorithm.')+
 eq('V<sub>k+1</sub> = max(V*, (1−ER)V<sub>k</sub>), &nbsp; α<sub>e</sub> ∝ u<sub>e</sub>ᵀk<sub>e</sub>⁰u<sub>e</sub>')+
 p('Whole-element removal quantizes volume, which is rounded upward to the budget. Removed elements do not compete for reintroduction, so a premature removal cannot be repaired by adding material back. Reaching the budget is a stopping rule, not a global-optimality certificate.')+
 exercise('Should ESO and BESO produce identical shapes at 50% volume?','No. Their admissible updates differ: BESO can restore material. Removal criteria, history and local optima also matter.')+source('https://doi.org/10.1016/0045-7949(93)90035-C','Xie & Steven (1993) · Original stress-based ESO')+source('https://doi.org/10.1016/S0045-7825(02)00464-4','Tanskanen (2002) · Strain-energy removal and theoretical aspects')]},
{zh:['BESO：双向演化','8 · 让材料可以删除，也可以加回',
 p('BESO 给实体及潜在空单元定义敏度数，在逐步缩减的体积预算内保留较高敏度区域。滤波控制空间变化，历史平均减弱迭代振荡。Soft kill 与 hard kill 是空区域的两种分析处理方式，不只是显示颜色不同。')+
 eq('ᾱ<sub>e</sub><sup>k</sup> = ½(α̂<sub>e</sub><sup>k</sup> + ᾱ<sub>e</sub><sup>k−1</sup>), &nbsp; 保留敏度高于阈值的单元')+
 h('Soft kill')+p('ρ∈{ρmin,1}，Kₑ=ρᵖKₑ⁰。忽略所有单元共有的正系数，排序敏度为 αₑ=ρᵖ⁻¹Uₑ⁰，Uₑ⁰=½uₑᵀKₑ⁰uₑ。App 保留这一既有计算路径与基准；ρmin=0.001。')+
 h('Hard kill')+p('ρ∈{0,1}，空单元完全不贡献刚度。先把实体单元能量平均到节点，再用节点到单元中心的距离权重外推全域敏度。当前版本采用全域敏度排序，并以最大加入率限制单步恢复体积（相对设计域体积，向下取整到整单元）；没有路径生长或补桥。可选“固定加载区”将连接加载节点的单元设为实体非设计区，其体积计入预算；这一边界条件在 App 中明确显示。')+
 p('真正移除刚度可能产生机构或悬空材料。发生奇异分析时应报告失败并检查网格、滤波和演化率，不能悄悄把 hard kill 换回弱材料。')+
 exercise('空单元没有刚度和应变能，hard kill 如何决定在哪里加回材料？','通过邻近实体的节点敏度外推与空间滤波估计空区域的材料价值；不能直接把所有空区域的恢复敏度永久设为零。',true)+beso],
 en:['BESO: two-way evolution','8 · Remove and reintroduce material',
 p('BESO assigns sensitivity numbers to solid and potential void elements, retaining higher values within a shrinking volume budget. Spatial filtering and history averaging moderate changes. Soft and hard kill specify different stiffness models for void; they are not display options.')+
 eq('ᾱ<sub>e</sub><sup>k</sup> = ½(α̂<sub>e</sub><sup>k</sup> + ᾱ<sub>e</sub><sup>k−1</sup>), &nbsp; retain high-sensitivity elements')+
 h('Soft kill')+p('Use ρ∈{ρmin,1} and Kₑ=ρᵖKₑ⁰. Up to a common positive factor, ranking uses αₑ=ρᵖ⁻¹Uₑ⁰ with Uₑ⁰=½uₑᵀKₑ⁰uₑ. App preserves its existing regression-checked path with ρmin=0.001.')+
 h('Hard kill')+p('Use ρ∈{0,1}; void contributes no stiffness. Average solid element energies onto nodes, then use node-to-element-center distance weights to extrapolate sensitivities. Global ranking with a maximum addition ratio replaces the earlier path-growing safeguard. Added volume is capped relative to the domain volume, rounded down to whole elements. The explicit “Solid load pad” option marks load-adjacent elements as non-design solid, counted in the volume budget. No connecting path is imposed.')+
 p('Exact removal can create mechanisms or floating material. A singular analysis must be reported; inspect mesh, filtering and evolution rate rather than silently replacing hard kill with weak material.')+
 exercise('With no energy in void elements, how can hard kill add material?','Extrapolate neighboring solid nodal sensitivities and spatially filter them. Permanently assigning every void zero restoration sensitivity would prevent meaningful reintroduction.')+beso]},
{zh:['Level set：边界演化','9 · 隐式边界与 Hamilton–Jacobi 方程',
 eq('Ω = {x : φ(x)>0}, &nbsp; Γ = {x : φ(x)=0}, &nbsp; n<sub>out</sub> = −∇φ/|∇φ|')+
 p('本教材取实体内部 φ>0。符号距离在边界附近满足 |∇φ|≈1。令边界点以外法向速度 Vₙ 移动，对 φ(x(t),t)=0 求导，得到以下符号约定；若改为内部为负，方程符号也必须改变。')+
 eq('∂φ/∂t − V<sub>n</sub>|∇φ| = 0')+
 h('速度来自目标的形状导数')+p('对固定载荷、无体力的自由设计边界，柔度形状导数以局部弹性能密度决定保留材料的价值；体积乘子控制法向速度的平均偏移。曲率正则项用于平滑边界。载荷或支撑边界的特殊项不能随意套用自由边界公式。')+
 p('App 使用实体侧能量延拓、迎风 Godunov 离散、CFL 步长限制和周期性距离重初始化；在固定体积下用实际有限元结果回退使柔度增加的步。窄界面带用平滑 Heaviside 与弱材料计算刚度。二维绘制零等值线，三维为体素近似。')+
 h('形状法能改变什么拓扑？')+p('已有孔洞能合并或消失，但纯边界演化不能保证从无孔实体中产生新孔洞。因此当前方法以规则孔洞初始化。它是经典 Hamilton–Jacobi 形状优化路线的离散实现，不是所有 level set 方法，也尚未与论文完整优化轨迹逐步复现对照。')+
 exercise('若 φ=x−a 且 Vₙ=1，短时间 Δt 后零界面在哪里？','φ 新值为 x−a+Δt，因此零界面从 a 移到 a−Δt。这里实体是 x>a，外法向为 −x，移动方向正确。',true)+ls],
 en:['Level-set boundaries','9 · Implicit geometry and Hamilton–Jacobi transport',
 eq('Ω = {x : φ(x)>0}, &nbsp; Γ = {x : φ(x)=0}, &nbsp; n<sub>out</sub> = −∇φ/|∇φ|')+
 p('We use positive φ inside solid. Signed distance satisfies |∇φ|≈1 near the interface. Differentiate φ(x(t),t)=0 for a point moving with outward normal speed Vₙ to obtain the convention below. Reversing the inside sign requires reversing the corresponding transport sign.')+
 eq('∂φ/∂t − V<sub>n</sub>|∇φ| = 0')+
 h('Shape derivatives determine boundary speed')+p('On a free design boundary with fixed loads and no body forces, elastic energy density governs the compliance value of material. A volume multiplier shifts normal speed; curvature regularization smooths the boundary. Load and support boundary terms cannot be replaced indiscriminately by a free-boundary formula.')+
 p('App uses solid-side energy extension, Godunov upwinding, a CFL step limit and periodic distance reconstruction. At fixed volume, FEA backtracks compliance-increasing trials. A smoothed Heaviside band and weak material define stiffness. The 2D view draws the zero contour; 3D is a voxel approximation.')+
 h('Which topology changes are possible?')+p('Existing holes can merge or disappear, but pure boundary transport does not guarantee hole nucleation in a solid interior. This version therefore starts with seeded holes. It discretizes the classical Hamilton–Jacobi shape-optimization route; it is not every level-set formulation and has not reproduced a complete published optimization trajectory step by step.')+
 exercise('If φ=x−a and Vₙ=1, where is the interface after Δt?','The new field is x−a+Δt, so the zero moves to a−Δt. Solid occupies x>a and its outward normal points toward −x, consistent with the motion.')+ls]},
{zh:['收敛与可信度','10 · 停止不等于证明正确',
 h('至少检查三种量')+p('状态方程的残差衡量有限元平衡；体积误差衡量可行性；设计变化与目标历史衡量迭代稳定性。这些量回答不同问题。柔度不变可能意味着收敛，也可能是更新被拒绝、设计变量卡在边界或实现出错。')+
 eq('r<sub>eq</sub>=‖K<sub>ff</sub>u<sub>f</sub>−f<sub>f</sub>‖/‖f<sub>f</sub>‖, &nbsp; r<sub>V</sub>=|V−V*|/V*, &nbsp; Δx=‖x<sup>k+1</sup>−x<sup>k</sup>‖∞')+
 h('梯度验证')+eq('d<sub>FD</sub>=[C(x+εe<sub>j</sub>)−C(x−εe<sub>j</sub>)]/(2ε)')+
 p('在不触及设计边界的点比较解析梯度和中心差分。ε 太大会引入截断误差，太小则放大求解及舍入误差；应在一段 ε 范围内观察误差趋势。单次差分通过并不能证明整个优化更新正确。')+
 h('验证证据的层级')+p('解析补片与尺度律检查力学；独立装配／求解器对照检查实现；逐步轨迹对照检查具体算法；网格研究检验离散依赖；实验验证物理模型。不能把其中一层替代其余层。当前应用的具体测试及尚未完成的文献轨迹对照列在项目验证文档中。')+
 exercise('运行显示“达到迭代上限”，可以在报告里写“已收敛的最优结构”吗？','不可以。应报告迭代数、体积误差、目标变化和停止原因，并将结果称为当前迭代设计。',true)+book],
 en:['Convergence & verification','10 · Stopping is not a correctness proof',
 h('Check different kinds of residual')+p('Equilibrium residual measures the FE solve, volume error measures feasibility, and design/energy changes measure iteration stability. Constant compliance may indicate convergence, rejected updates, bound locking or a bug. These explanations must be distinguished.')+
 eq('r<sub>eq</sub>=‖K<sub>ff</sub>u<sub>f</sub>−f<sub>f</sub>‖/‖f<sub>f</sub>‖, &nbsp; r<sub>V</sub>=|V−V*|/V*, &nbsp; Δx=‖x<sup>k+1</sup>−x<sup>k</sup>‖∞')+
 h('Check derivatives independently')+eq('d<sub>FD</sub>=[C(x+εe<sub>j</sub>)−C(x−εe<sub>j</sub>)]/(2ε)')+
 p('Compare analytic gradients with central differences away from bounds. Large ε has truncation error; tiny ε amplifies solve and roundoff errors. Examine a range of steps. Passing a derivative check alone does not validate the entire optimizer.')+
 h('A hierarchy of evidence')+p('Analytic patch and scaling tests check mechanics. Independent assembly and solvers check implementation. Stepwise trajectories check a particular algorithm. Mesh studies check discretization dependence. Experiments check the physical model. One level cannot replace the others; project validation notes identify implemented checks and remaining literature-reproduction gaps.')+
 exercise('Can a run that reached its iteration cap be reported as a converged optimum?','No. Report iterations, volume error, objective changes and stopping reason; call it the current iterate.')+book]},
{zh:['悬臂梁实验','11 · 一组可重复的课堂实验',
 h('实验 A：验证尺度律')+p('先固定一个设计，令载荷从 −1 改为 −2，验证 C 约为原来的 4 倍；再将 E 从 1 改为 2，验证 C 减半。应保持相同设计进行力学对照，而不是任意比较两次尚未收敛的优化。')+
 h('实验 B：公平比较方法')+p('记录方法及变体、网格、h、r、材料、总载荷、加载位置、体积目标、停止条件与迭代上限。SIMP 从均匀密度开始，BESO/ESO 从实体开始，level set 从孔洞设计开始，因此起始 C 不应直接排名。比较最终 C 前先确认实际体积相同。')+
 h('实验 C：保持物理域的加密')+p('以 40×25、h=2、r=1.5 与 80×50、h=1、r=3 比较二维域 80×50。三维可用 40×25×2、h=2 与 80×50×4、h=1。总载荷保持不变，且加载位置相同；奇数网格的节点力应分配到相邻节点。')+
 h('实验 D：区分显示和分析')+p('SIMP 的灰度不是实体/空洞制造图。对阈值化后的形态应重新分析，不能沿用连续密度的柔度。Level set 的过渡带和体素显示也有离散误差。记录导出的密度和求解设置，而不是只保留截图。')+
 exercise('把 80×50 改为 160×100，同时保持 h=1 和 r=3，算不算同一物理问题的网格收敛研究？','不算。物理尺寸加倍而物理滤波半径不变；三维厚度若未同步改变，还会改变长厚比。',true)],
 en:['Cantilever experiments','11 · Reproducible classroom experiments',
 h('A: scaling laws')+p('For a fixed design, change force from −1 to −2: C should quadruple. Doubling E should halve C. Use the same design for this mechanics check, rather than comparing unrelated, unconverged optimization runs.')+
 h('B: compare methods fairly')+p('Record the method variant, mesh, h, r, material, total load and position, volume target, stopping criteria and iteration budget. SIMP begins at uniform density, BESO/ESO begin solid and level set begins perforated. Initial C values are not a fair ranking. Match actual final volume before comparing final C.')+
 h('C: refine a fixed physical domain')+p('Compare 40×25, h=2, r=1.5 with 80×50, h=1, r=3 for the same 80×50 plane domain. In 3D use 40×25×2, h=2 and 80×50×4, h=1. Keep total load and its physical position unchanged; odd grids distribute force to adjacent nodes.')+
 h('D: separate display from analysis')+p('SIMP gray density is not a manufactured solid–void part. Thresholding requires reanalysis; the continuous design’s compliance cannot be reused. Level-set transition bands and voxel views also have discretization errors. Export densities and settings, not only screenshots.')+
 exercise('Is changing 80×50 to 160×100 while keeping h=1 and r=3 a fixed-domain mesh study?','No. Physical dimensions double while physical filter radius stays fixed. Unchanged 3D thickness would additionally alter aspect ratios.')]},
{zh:['方法对照与文献','12 · 从教材走向可核查的计算',
 p('本教材为原创教学文字，按经典概念组织，不是任何书籍的翻译或复刻。以下资料分别支持连续材料分布、SIMP、演化法和形状导数路线。引用某篇论文不意味着软件已经逐行复现该论文。')+
 h('应用中的方法名称')+p('SIMP：残余刚度插值、密度滤波、OC。BESO soft kill：弱材料与双向敏度更新。BESO hard kill：零刚度移除、节点敏度外推及全域排序。ESO：应变能准则的单向弱材料版本。Level set：固定网格、带孔初始化的 Hamilton–Jacobi 边界演化。')+
 h('主线阅读')+book+simp+beso+source('https://doi.org/10.1016/S0045-7825(02)00464-4','Tanskanen (2002) · The evolutionary structural optimization method: theoretical aspects')+ls+
 h('报告应包含什么')+p('问题定义、算法变体和公式、离散与求解参数、初始化、停止条件、验证证据、未满足的约束及适用范围。图像只能展示结果的一部分。所有方法都有局部最优、参数敏感性及模型假设，不存在“选一个方法就没有误差”的保证。')],
 en:['Method map & references','12 · From a textbook to auditable computation',
 p('This is original instructional text organized around classical concepts, not a translation or reproduction of a book. These sources support material-distribution, SIMP, evolutionary and shape-derivative formulations. Citing a paper does not certify a line-by-line software reproduction.')+
 h('What each App name means')+p('SIMP: residual-stiffness interpolation, density filter and OC. Soft-kill BESO: weak material with bidirectional sensitivity updates. Hard-kill BESO: zero-stiffness removal, nodal extrapolation and global ranking. ESO: a one-way, strain-energy, weak-material variant. Level set: fixed-grid Hamilton–Jacobi boundary evolution initialized with holes.')+
 h('Primary reading')+book+simp+beso+source('https://doi.org/10.1016/S0045-7825(02)00464-4','Tanskanen (2002) · The evolutionary structural optimization method: theoretical aspects')+ls+
 h('What a report should include')+p('State the problem, algorithm variant and equations, discretization and solver parameters, initialization, stopping rules, validation evidence, unmet constraints and model scope. Pictures show only part of the result. Local optima, parameter sensitivity and modeling assumptions remain; choosing a method cannot guarantee zero error.')]}];
