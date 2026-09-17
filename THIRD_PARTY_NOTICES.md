# Third-party notices

## Application and numerical backend

This repository retains the MIT license originally published by Albert Li in
TO_Tutorial. The standalone numerical backend implements the Q4/H8 finite-element
formulations and soft-kill BESO, with an original spatial index and a minimal
native CHOLMOD bridge. The private reference solver is not a build dependency;
its source tree and managed/native binaries are not included. Regression fixtures
contain numeric model inputs and results only.

## Math.NET Numerics 5.0.0

Source: https://github.com/mathnet/mathnet-numerics
Package: https://www.nuget.org/packages/MathNet.Numerics/5.0.0
License: MIT. Restored through NuGet with a committed lockfile. Full notice:
`licenses/MathNet.Numerics.txt`.

## Eigen / SuiteSparse / BLAS / LAPACK

The native bridge uses Eigen headers and dynamically links to CHOLMOD and system
BLAS/LAPACK. They are installed as Debian packages by the Dockerfile. Eigen is
MPL-2.0; SuiteSparse contains modules with their own licenses (including GPL
components). These third-party components are not relicensed by the application
MIT license. Preserve their notices and applicable source-distribution terms when
distributing container binaries. The Docker image retains installed package
copyright files under `/usr/share/doc/`; inspect the exact installed versions with
`dpkg-query -W`. Obtain matching package sources from the Debian archive when
required by the component licenses.

## Microsoft .NET

The image uses official Microsoft .NET SDK and ASP.NET runtime base images.
Their licenses and third-party notices remain applicable.
