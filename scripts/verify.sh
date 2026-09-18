#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
dotnet build server/TopTeach.csproj -c Release -p:RestoreLockedMode=true --nologo
TOPTEACH_REPORT_DIR="$PWD/artifacts" dotnet server/bin/Release/net9.0/TopTeach.dll --verify

dotnet server/bin/Release/net9.0/TopTeach.dll --verify-spatial
TOPTEACH_REPORT_DIR="$PWD/artifacts" dotnet server/bin/Release/net9.0/TopTeach.dll --verify-legacy

dotnet server/bin/Release/net9.0/TopTeach.dll --verify-elements

TOPTEACH_REPORT_DIR="$PWD/artifacts" dotnet server/bin/Release/net9.0/TopTeach.dll --verify-methods
