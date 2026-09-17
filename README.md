# BESO Lab · TO Tutorial

面向教学的二维／三维 BESO 拓扑优化网页工具，支持中英文切换。
支持 **Q4 四节点四边形（平面应力）** 和 **H8 八节点六面体**。

默认算例：2D **80×50** 悬臂梁；3D **80×50×4**。左端固定，自由端中点向下受力。

- 网格、体积分数、演化率、滤波半径、惩罚指数、材料和载荷可调。
- 暂停、单步、继续、停止、历史回放、敏度场、3D 旋转缩放。
- 导出包含参数、逐步结果及构建哈希的 JSON。
- 中英文即时切换并记住语言选择，切换时保留计算进度和参数。

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

数值结果已通过基准算例校对，覆盖 80×50、12×8×4 和 80×50×4 悬臂梁的完整迭代过程。
已校对算例的每步拓扑一致；Linux amd64／arm64 的目标函数最大相对误差约为
`8.32e-13`。这些结果适用于已验证算例，不代表所有参数组合的浮点结果逐位相同。

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

包含空间查询检查、有限元单元检查、独立建模路径比较、
三个基准算例的完整迭代校对及 HTTP 生命周期检查。报告写入 `artifacts/`。

## 项目结构

- `server/Numerics/`：独立 Q4/H8 有限元、稀疏装配与 BESO。
- `server/Spatial/`：空间邻域查询及测试。
- `native/BesoNative/`：仅 CHOLMOD 的精简 C 接口。
- `server/Engine.cs`：参数、悬臂梁网格及任务生命周期。
- `server/wwwroot/`：中英文教学界面。
- `.github/workflows/docker.yml`：双架构构建、验证及可选 GHCR 发布。

沿用本仓库 MIT 许可证。第三方组件条款见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
