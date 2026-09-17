# 构建、验证和未来发布

## 本地 Docker

安装 Docker Desktop（macOS / Windows）或 Docker Engine + Compose plugin（Linux），并启动引擎。

```sh
docker compose up --build -d
docker compose ps
```

浏览器打开 http://127.0.0.1:5080 。宿主机已有同端口服务时：

```sh
BESO_PORT=5081 docker compose up --build -d
```

停止：`docker compose down`。任务仅在内存中，重启后丢失；无需数据库或 volume。
默认仅绑定宿主机回环地址。需要局域网访问时，在 `.env` 中显式设置
`BESO_BIND_ADDRESS=0.0.0.0`。长期公网部署应在反向代理层提供 HTTPS 和访问控制。

容器以非 root 身份运行，Compose 使用只读根文件系统和可写 `/tmp`。
Docker 默认构建当前主机架构；CI 分别在原生 amd64 / arm64 runner 上验证。
不能把 macOS 的 `BesoNative.dll` 放入 Linux 镜像，Dockerfile 会从仓库中的
`native/BesoNative` 编译 Linux ELF 动态库，在所有平台保留 `.dll` 扩展名，方便托管代码统一加载。

## 验证容器

```sh
docker build -t beso-lab:local .
./scripts/test-container.sh beso-lab:local
```

脚本先在发布镜像内运行完整独立建模对照，再启动 HTTP 服务验证暂停、单步、
继续、停止、3D、输入校验和构建溯源。测试默认使用 5088 端口，可通过
`BESO_TEST_PORT` 调整。报告输出到 `artifacts/`，不提交 Git。

测试要求同一环境中的两种独立建模路径完全一致；Linux 与 macOS、
不同架构的数值库可能不同，不将同环境测试解释为跨平台位级一致。

## 独立构建原生库

Linux (Debian bookworm):

```sh
sudo apt-get install cmake g++ make libeigen3-dev libsuitesparse-dev libblas-dev liblapack-dev
./scripts/build-native.sh
./scripts/start.sh
```

macOS:

```sh
brew install cmake eigen suite-sparse
./scripts/build-native.sh
./scripts/start.sh
```

本机启动还需要 .NET 9 SDK。Docker 不要求宿主机安装 .NET。
当前 .NET 9 的支持截止日期为 2026-11-10；长期公开部署前应升级到受支持的
LTS SDK/runtime，并重新运行全部一致性测试。
参考：https://dotnet.microsoft.com/en-us/platform/support/policy

## 准备提交 GitHub

独立 Q4/H8、BESO、KD-tree 与原生 CHOLMOD 接口均在本仓库。
保留远端原有的 MIT 许可证。
第三方声明见 `THIRD_PARTY_NOTICES.md`，不再包含旧 KDTree 程序集。

仓库忽略原生二进制、旧 Math.NET DLL、构建目录、日志、`.env` 和测试产物。
保留原创 KD-tree 与 Q4/H8 源码、NuGet 锁文件和测试输入。
检查待提交文件，然后使用你选择的 GitHub 仓库：

```sh
git add .
git diff --cached --stat
git commit -m "Prepare BESO Lab container and CI"
git remote add origin https://github.com/AlbertLiDesign/TO_Tutorial.git
git push -u origin main
```

首次提交后无需重新添加 origin；后续只需提交并推送。镜像发布是独立的显式操作。

## CI 与 GHCR 镜像

`.github/workflows/docker.yml` 在 main 提交、PR、v* 标签和手动触发时执行：

1. 在 `ubuntu-24.04` / `ubuntu-24.04-arm` 构建当前架构镜像。
2. 验证 Compose、镜像内原生求解、完整一致性对照及 HTTP API。
3. 上传两种架构各自的报告和实际构建哈希。

如果当前 GitHub 仓库无法使用 ARM runner，应调整 runner 配置或使用自托管
ARM runner；不能跳过 ARM 测试后将其标记为已验证。

发布工作仅在测试通过后且仓库变量 `ENABLE_IMAGE_PUBLISH=true` 时启用。
准备发布时设置该变量，再推送 `v0.1.0` 标签，或在手动工作流中
勾选 `publish_image`。使用仓库的 `GITHUB_TOKEN` 写入 GHCR，无需把 token 存入代码。
镜像名自动取 GitHub 仓库全名的小写形式，生成版本标签与 commit SHA 标签。
镜像包含 SBOM 和构建 provenance；GHCR 的可见性由仓库所有者配置。

发布时附带相同 Git revision 的源码压缩包与许可证，验证标签镜像后再对外公布。
基础镜像和 Debian 包使用发行版标签，构建并非按字节可重复；正式版本应记录
镜像 digest、CI 报告和包清单，不把滚动镜像标签当作固定数值环境。

## 离线分发

```sh
docker save beso-lab:local | gzip > beso-lab.tar.gz
# 接收方
gunzip -c beso-lab.tar.gz | docker load
docker run --rm -p 127.0.0.1:5080:8080 beso-lab:local
```

离线 tar 是构建主机的架构，请随包注明 amd64 或 arm64；同时提供匹配源码和
适用许可证。
