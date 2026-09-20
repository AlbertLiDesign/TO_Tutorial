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
