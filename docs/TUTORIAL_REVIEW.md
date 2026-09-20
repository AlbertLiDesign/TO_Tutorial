# Tutorial review — 2026-09-20

Scope: bilingual 12-chapter text, numerical conventions, worked examples and correspondence to the current implementation. This is an implementation self-review, not independent certification.

## Resolved

- ESO and hard-kill BESO use floor-based retained counts for scheduled upper volume bounds. Passive material is checked against the feasible final count. The text distinguishes scheduled and final volume and explains quantization.
- Level-set retries rebuild geometry-dependent velocity extension, normalization and curvature when restoring the original field.
- Displayed delta uses two five-frame sums of post-update compliance. Its definition and the distinct internal stopping history are explicit.
- A complete 4×4 Q4 SIMP update exports connectivity, reduced stiffness, forces, displacements, compliance gradients and updated densities. The displayed numerical values agree with the executable example.

## Verification

Release build and the 19-report numerical method suite passed, including independent SIMP trajectories and 2D/3D method checks. The HTTP suite passed all method dispatch checks and recomputed delta from paginated compliance frames. A separate calculation from the exported worked example checked equilibrium, external work, OC clipping and material volume. All 24 localized chapter bodies rendered through the content module; the new example and convergence sections were inspected in the browser.

## Remaining scope limits

The material is suitable as a focused teaching companion for linear-elastic minimum compliance with prerequisite mechanics and finite elements. It is not a comprehensive topology-optimization textbook. Published full-trajectory reproduction for hard-kill BESO, ESO and level set, independent boundary shape-gradient verification, and distributed-load mesh studies remain open as recorded in VALIDATION.md. Soft-kill BESO retains its threshold-based volume behavior, so actual volume must be checked separately from termination. One successful SIMP update does not establish convergence or global optimality.

## Local typesetting and beginner-reading revision

Display formulas now use explicit LaTeX with a locally bundled KaTeX renderer and fonts. Both languages share equivalent mathematical sources; `node tests/tutorial_math.mjs` validates 106 display equations across 24 chapter bodies, with strict parsing. Matrix, fraction, integral, piecewise and indexed-sum layouts were checked in the browser. At 390px, 640px and desktop widths, equation overflow stays within the formula area; long formulas provide an explicit horizontal-scroll hint and keyboard focus rather than clipping. Mathematical content is also exposed as MathML.

Each chapter includes a conceptual reading guide. Chapter 1 explains core notation and a suggested reading sequence; Chapter 2 explains operators, virtual work and test functions. Advanced topics are identified for a second reading. The prerequisite statement now asks for basic calculus, vectors and matrices, rather than prior topology optimization or a completed finite-element course. This is still a focused introduction, not an independent technical certification.

## Evolutionary-method teaching revision

Huang and Xie (2010), *Evolutionary Topology Optimization of Continuum Structures: Methods and Applications*, is now a principal further-reading reference for ESO/BESO. The initial structural reference was the publisher table of contents and public introduction. The user subsequently supplied the complete 237-page PDF. The revision now checks the primary technical passages in Chapters 2–5 and Appendix 4.1 directly, including printed pp. 6, 11, 18–25, 40–44, 48–49 and 52–61. Printed pp. 22, 26 and 42 were also rendered to check equation and flowchart layout. This is a targeted reading, not a claim that every chapter or example has been reproduced. The supplied PDF remains outside the repository.

Original bilingual prose now develops the physical motivation before the update rules: removal cost, irreversible ESO decisions, recovery in BESO, interpolation, spatial filtering, history averaging and material selection. RR, ER and the hard-kill admission ratio are distinguished with simple arithmetic examples. The existing six-cell exercise now explains what permitting recovery changes, without asserting an uncomputed compliance improvement. The cantilever chapter adds a controlled ER experiment and separates volume reduction from subsequent material redistribution. Chapter 12 maps further reading to the book’s chapters 2–5.

The 106-equation bilingual rendering check and JavaScript syntax checks passed after the revision. Both languages of the edited ESO, BESO, cantilever and reference chapters were inspected in the browser with no KaTeX errors or article-width overflow. No solver behavior was changed in this editorial revision.

Source-specific checks after reading the supplied book:

- The rejection-ratio increment called ER in Section 2.2 differs from the evolutionary volume ratio in Section 3.4; the tutorial distinguishes these and the ERR of Section 2.3.
- The book uses mean compliance in Chapters 2–4 and twice that quantity for lowercase compliance in Section 5.2. Chapter 4 of the tutorial states this conversion once; App keeps its existing compliance convention.
- The solid/weak sensitivity factors agree with the ranking form of Eq. (4.13). Element-center filtering matches Appendix 4.1 rather than the nodal projection in Section 3.3.2. The hard-kill solid-neighbor average remains the separately cited Ghabraie variant.
- The recursive history average agrees with Eq. (3.8), including storing the averaged score for the next iteration. The displayed change metric uses the older window in its denominator; Eq. (3.13) uses the newer window. This difference is explicit.
- The cantilever definition and parameter table now precede its experiments. The method-comparison discussion follows Section 5.3 in separating parameter choices, results and interpretation; iteration counts alone are not treated as comparable computational cost.
- Finite element removal remains a first-order estimate in the tutorial. Book example outcomes are not elevated to general guarantees of global optimality, mesh independence or agreement between kill modes.
