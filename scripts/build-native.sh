#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
cmake -S native/BesoNative -B build/native -DCMAKE_BUILD_TYPE=Release
cmake --build build/native --parallel "${BUILD_JOBS:-2}"
mkdir -p server/lib
cp build/native/BesoNative.dll server/lib/BesoNative.dll
