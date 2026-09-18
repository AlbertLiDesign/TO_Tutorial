// SPDX-License-Identifier: MIT
using Tutorial.Fem;
namespace Tutorial.Optimization;

public interface IOptimizer
{
    FEModel Model { get; }
    int iter { get; }
    bool converged { get; }
    double Delta { get; }
    double LastC { get; }
    List<double> Sensitivities { get; }
    List<double> isovalues { get; }
    double[] LevelSet => null;
    void Initialize();
    void Optimize(bool writeFiles=false);
}
