# Top Lab

Learn and explore 2D and 3D topology optimization in English or Chinese.

**Tutorial** introduces the theory. **App** lets you compare SIMP, BESO, ESO, and level set on the same cantilever.

The default example is an **80 × 50 cantilever** in 2D, or **80 × 50 × 4** in 3D, fixed at the left end with a downward load at the midpoint of the right end.

## Features

- Choose an optimization method and adjust its parameters.
- Adjust mesh resolution, volume fraction, evolution rate, filter radius, material properties, and loads.
- Pause, step, resume, and replay the optimization history.
- Explore material layouts, sensitivity fields, and convergence curves. Rotate and zoom 3D results.
- Export settings and results.

## Quick start

Install and start Docker, then run from the project directory:

```sh
docker compose up --build -d
```

Open <http://localhost:5080>. If the port is already in use:

```sh
BESO_PORT=5081 docker compose up --build -d
```

Then open <http://localhost:5081>.

To stop:

```sh
docker compose down
```

Results are temporary. Export anything you want to keep before stopping or restarting the service.

## Notes

BESO has been checked against reference cases; the additional methods have passed 2D/3D numerical-consistency and algorithm checks. The tool is intended for teaching topology optimization under linear elasticity and small deformations.

See the [deployment guide](docs/DISTRIBUTION.md) for more options. Licensed under [MIT](LICENSE); see [third-party notices](THIRD_PARTY_NOTICES.md).
