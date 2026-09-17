# BESO Lab · TO Tutorial

面向教学的二维／三维 BESO 拓扑优化网页工具。后端在本仓库独立实现，
只支持 **Q4 四节点四边形（平面应力）** 和 **H8 八节点六面体**，
不引用 TOPX 项目、TOPX.dll、SolverX.dll 或 KDTree.dll。

默认算例：2D **80×50** 悬臂梁；3D **80×50×4**。左端固定，自由端中点向下受力。

- 网格、体积分数、演化率、滤波半径、惩罚指数、材料和载荷可调。
- 暂停、单步、继续、停止、历史回放、敏度场、3D 旋转缩放。
- 导出包含参数、逐步结果及构建哈希的 JSON。
- 原创 C# KD-tree，Math.NET 密集单元矩阵，Eigen／CHOLMOD 稀疏求解。

## Docker 启动

```sh
docker compose up --build -d
```

打开 <http://127.0.0.1:5080>。如端口已占用：

```sh
BESO_PORT=5081 docker compose up --build -d
```

Docker 内从源码编译 Linux 原生库，不需要宿主机安装 .NET 或数值库。
构建配置支持 `linux/amd64` 和 `linux/arm64`。当前开发机未安装 Docker，
容器实测状态以 GitHub Actions 的构建和测试结果为准。

停止：`docker compose down`。计算记录保存在内存，重启后消失。

## 本机开发

安装 .NET 9 SDK、Python 3、CMake、Eigen 和 SuiteSparse。macOS 依赖：

```sh
brew install cmake eigen suite-sparse
./scripts/build-native.sh
./scripts/start.sh
```

Linux、镜像测试、离线分发及 GitHub Container Registry 发布步骤见
[分发说明](docs/DISTRIBUTION.md)。

## 数值方法和一致性

后端采用线弹性、小变形模型，软杀死 BESO：

1. 求解 `Ku=F`，目标函数 `C=½uᵀKu`。
2. 计算 `x^(p−1) · ½uₑᵀKₑuₑ` 并进行距离加权滤波。
3. 与上一步敏度平均，根据递减体积目标二分查找阈值。
4. 材料密度为 `1` 或 `0.001`。比较最近两组各五步目标函数变化率。

为与已有教学基线对齐，保留参考算例的节点编号、默认泊松比小数值、
H8 数值积分常数及顺序、刚度装配 `1e-10` 零值阈值与停止规则。
规则正方形 Q4 使用解析刚度；一般 Q4 使用 3×3 积分，H8 使用 4×4×4 积分。

`tests/baselines/` 是重写前独立采集的参考**数值数据**，不包含参考项目代码。
当前 macOS ARM64 验证结果：

| 算例 | 步数 | 每步拓扑差异 | 每步 C 差异 |
|---|---:|---:|---:|
| 80×50 | 44 | 0 | 0 |
| 12×8×4 | 45（迭代上限） | 0 | 0 |
| 80×50×4 | 44 | 0 | 0 |

新 KD-tree 的等距邻居按插入顺序返回，阈值最大舍入差约 `3.47e-18`，
因此不承诺所有内部浮点数位级相同。保留 1024 邻居上限；超过此上限时，
边界等距点选择可能与旧实现不同。不同参数、平台、数值库需分别回归，
不能将这些算例的结果扩大为全部配置已证明一致。

图中材料为本步更新后状态，C 和敏度为更新前分析；体积分数包含软材料密度。
单元边长为 1，调整网格不会自动调整滤波半径。当前网页生成规则网格；
一般 Q4/H8 几何仅在后端支持，没有任意网格导入界面。

## 验证

```sh
./scripts/verify.sh
# Docker 可用时
docker build -t beso-lab:local .
./scripts/test-container.sh beso-lab:local
```

包含 2,400 次 KD-tree 对照、有限元单元检查、两个独立建模路径比较、
三个旧基线的完整迭代比较及 HTTP 生命周期检查。报告写入 `artifacts/`。
Linux CI 将跨平台旧基线差异单独报告；同环境建模路径和单元／空间查询测试必须通过。

## 项目结构

- `server/Numerics/`：独立 Q4/H8 有限元、稀疏装配与 BESO。
- `server/Spatial/`：原创 KD-tree 及测试。
- `native/BesoNative/`：仅 CHOLMOD 的精简 C 接口。
- `server/Engine.cs`：参数、悬臂梁网格及任务生命周期。
- `server/wwwroot/`：中文教学界面。
- `.github/workflows/docker.yml`：双架构构建、验证及可选 GHCR 发布。

沿用本仓库 MIT 许可证。第三方组件条款见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
