# Optimization methods

All methods share the same structured Q4/H8 finite-element model, supports, loads, and linear-elastic material. The application reports strain energy as C (half the usual compliance). Each history frame contains the updated design and the energy and sensitivity from the analysis preceding that update.

- **BESO:** binary soft-kill densities, spatial filtering and sensitivity history averaging, with material removal and reintroduction. Existing reference regressions are preserved.
- **SIMP:** continuous design densities, a row-normalized physical density filter, its transpose for the sensitivity chain rule, and an optimality-criteria update with a move limit. The volume constraint applies to physical densities after filtering.
- **ESO:** unidirectional removal ranked by filtered element energy sensitivity. Removed elements cannot return. Integer element counts round the volume up, with at most one element of discrepancy. A final unchanged analysis evaluates the completed design.
- **Level set:** an educational reaction–diffusion variant on the element grid. A bounded implicit field defines the boundary at zero, and a compact smooth Heaviside maps it to weak/solid material. Stiffness interpolation is linear. The driving field is normalized, filtered unit energy; backward-Euler diffusion uses a zero-flux boundary and a length scale set by the filter radius. A scalar volume multiplier is found by bisection. Once volume is fixed, trial updates that increase energy are backtracked. This is not a reproduction of a specific published level-set implementation.

All methods retain a density floor of 0.001. Level set uses an interface half-width of 0.15 in field units. Its smoothing coefficient multiplies the squared filter radius. The 2D/3D level-set material view thresholds density at 0.5; its reported volume and energy use the smoothed density, so the displayed solid fraction can differ. SIMP shows continuous density in 2D and a 0.5 threshold surface in 3D.

SIMP and level set check both energy-history stability and design change. An iteration limit or rejected update is not proof of convergence. The level-set energy safeguard can stall; changing the step, smoothing, or mesh can change the result. These local methods do not guarantee a global optimum.

## Checks

Run `scripts/verify.sh` for numerical checks, including the SIMP filtered-gradient finite-difference test, 2D/3D volume and density bounds, ESO removal monotonicity, and the level-set field/density relation. With a server running, `python3 tests/api_methods.py` checks method dispatch and serialized histories; `python3 tests/api_smoke.py` checks pause, step, resume, stop, and input validation. Container checks run both suites against the published image.
