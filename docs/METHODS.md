# Formulations and numerical conventions

The bilingual Tutorial is an original, twelve-chapter introduction to classical topology optimization. It distinguishes a method family from the particular discretization implemented here. It is not a translation of a textbook or a claim of exact reproduction of every cited paper.

## Shared problem and objective

Q4 is plane stress with unit out-of-plane thickness; H8 is three-dimensional isotropic elasticity. Loads are fixed nodal forces and supports prescribe zero displacement. The element edge length is `elementSize`, so the domain measures `nx*h`, `ny*h`, and (in 3D) `nz*h`. Filter radius is specified in element edges; its physical value is `radius*h`.

API/export schema 2 reports **compliance C = fᵀu**, recomputed for the density displayed in each frame. Earlier releases reported strain energy before the update, so old curve values are not directly comparable: both the factor of two and the evaluated design state changed. The sensitivity field is the score that generated the update, not a newly computed gradient of the displayed design. Legacy numerical regression files retain their original internal strain-energy convention.

## Implemented variants

- **SIMP:** the modified SIMP interpolation `E/E0 = 1e-9 + (1-1e-9)*rho^p`, physical density filtering, the transpose chain rule for both objective and volume, and an OC update with a move limit. Design densities range from 0 to 1. This follows the density-filter equations of [Andreassen et al. (2011)](https://www.topopt.mek.dtu.dk/apps-and-software/efficient-topology-optimization-in-matlab), using a cantilever rather than their half-MBB benchmark. H8 extends the same optimization equations to 3D. The volume bisection is tighter than the short reference code; stopping additionally checks objective-history stability.
- **Soft-kill BESO:** densities are 0.001 or 1, with `K_e=rho^p K_e^0`, spatial filtering and historical sensitivity averaging. The existing trajectory regression remains applicable. Radius queries now include the complete neighborhood instead of a fixed neighbor-count cap.
- **Hard-kill BESO:** densities are exactly 0 or 1. Solid energies are averaged at connected nodes, followed by node-to-element-center radius filtering (including zero-sensitivity empty nodes in the normalization), history averaging and global ranking with a maximum admission ratio (default 1% of the domain per iteration, rounded down to whole elements). No shortest paths, frontier growth, bridges or implicit connectivity repairs are applied. The visible **Solid load pad** option makes cells incident on loaded nodes passive solid; they count toward the volume budget. With it disabled, all cells are designable. This is the nodal-extrapolation BESO route described in the [evolutionary optimization literature](https://www.aeromech.usyd.edu.au/WCSMO2015/papers/1154_paper.pdf).
- **ESO:** energy-ranked, unidirectional weak-material elimination for the compliance problem. It is the strain-energy criterion family discussed by [Tanskanen (2002)](https://doi.org/10.1016/S0045-7825(02)00464-4), not the original von-Mises rejection-ratio algorithm of Xie and Steven (1993). The Tutorial explicitly distinguishes these. Volume is scheduled by evolution rate; deleted cells cannot return.
- **Level set:** a fixed-grid Hamilton–Jacobi shape-optimization discretization, with positive solid signed distance, initial holes, solid-side energy extension, spatially smoothed velocity, curvature smoothing, Godunov upwind transport and a CFL step limit. Periodic distance reconstruction and volume correction preserve the representation; fixed-volume uphill compliance trials are backtracked. The physical interpolation uses a 1e-6 weak phase and a smooth Heaviside band of half-width 0.75 element edges. This follows the classical shape-derivative/transport route of [Allaire, Jouve & Toader (2004)](https://doi.org/10.1016/j.jcp.2003.09.032). It does not implement a separate topological-derivative nucleation step or claim a published full-trajectory reproduction.

## Singular structures and termination

Hard kill removes unused DOFs. Disconnected unloaded free-body blocks have zero strain and arbitrary rigid displacement; the solver fixes those blocks to zero without changing their material. A disconnected loaded component or a remaining mechanism is invalid and is reported rather than repaired by hidden stiffness or added material.

Global sensitivity ranking can still create mechanisms. A solid load pad guarantees the existence of material at the load, not a load path. Small filter radii, coarse meshes or aggressive evolution can therefore fail. No algorithm is silently substituted.

A completed volume schedule, a small objective change, an iteration cap and a numerical failure mean different things. None proves global optimality. The level-set method depends on seeded holes; holes can merge or close, but it cannot guarantee creation of a new interior hole. Display thresholds and voxel surfaces are not manufacturing-ready geometry.

See [VALIDATION.md](VALIDATION.md) for the scope of numerical evidence and remaining gaps.
