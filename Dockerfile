# syntax=docker/dockerfile:1
ARG DOTNET_VERSION=9.0
FROM debian:bookworm-slim AS native
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates cmake g++ make libeigen3-dev libsuitesparse-dev libblas-dev liblapack-dev \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /src
COPY native/BesoNative/ ./BesoNative/
RUN cmake -S BesoNative -B build -DCMAKE_BUILD_TYPE=Release \
    && cmake --build build --parallel 2

FROM mcr.microsoft.com/dotnet/sdk:${DOTNET_VERSION}-bookworm-slim AS managed
RUN apt-get update && apt-get install -y --no-install-recommends python3 \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /src
COPY server/TopTeach.csproj server/packages.lock.json ./server/
RUN dotnet restore server/TopTeach.csproj --locked-mode
COPY server/ ./server/
COPY tests/reference-cantilever-80x50.txt ./tests/
COPY tests/baselines/ ./tests/baselines/
COPY native/ ./native/
COPY scripts/generate-provenance.py ./scripts/
COPY --from=native /src/build/BesoNative.dll ./server/lib/BesoNative.dll
RUN dotnet publish server/TopTeach.csproj -c Release --no-restore -o /out /p:UseAppHost=false \
    && python3 scripts/generate-provenance.py --artifacts /out --output /out/provenance.json

FROM mcr.microsoft.com/dotnet/aspnet:${DOTNET_VERSION}-bookworm-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcholmod3 libblas3 liblapack3 curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=managed /out/ ./
COPY LICENSE THIRD_PARTY_NOTICES.md ./
COPY licenses/ ./licenses/
ENV TOPTEACH_URLS=http://0.0.0.0:8080 \
    DOTNET_EnableDiagnostics=0 \
    OPENBLAS_NUM_THREADS=1 \
    OMP_NUM_THREADS=1
EXPOSE 8080
USER $APP_UID
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl --fail --silent http://127.0.0.1:8080/api/health || exit 1
ENTRYPOINT ["dotnet", "TopTeach.dll"]
