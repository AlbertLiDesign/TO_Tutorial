#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
dotnet build server/TopTeach.csproj -c Release -p:RestoreLockedMode=true --nologo
python3 scripts/generate-provenance.py --artifacts server/bin/Release/net9.0 --output server/provenance.json
cd server
exec dotnet bin/Release/net9.0/TopTeach.dll
