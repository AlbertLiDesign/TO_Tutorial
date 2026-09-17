#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
image="${1:-beso-lab:local}"
port="${BESO_TEST_PORT:-5088}"
name="beso-test-$$"
mkdir -p artifacts
cleanup() {
  docker logs "$name" > artifacts/container.log 2>&1 || true
  docker rm -f "$name" >/dev/null 2>&1 || true
}
trap cleanup EXIT
# Run the exact published image; no SDK/source tree required in the container.
docker run --rm --read-only --tmpfs /tmp:rw,size=256m,mode=1777 \
  --user "$(id -u):$(id -g)" \
  -v "$PWD/artifacts:/reports" -e TOPTEACH_REPORT_DIR=/reports \
  "$image" --verify > artifacts/parity.log

docker run --rm --read-only --tmpfs /tmp:rw,size=256m,mode=1777 \
  "$image" --verify-spatial > artifacts/spatial.log
# The legacy fixture is from macOS. Record cross-platform differences explicitly;
# same-platform independent-model comparison and exact spatial tests above are required.
if docker run --rm --read-only --tmpfs /tmp:rw,size=256m,mode=1777 \
  --user "$(id -u):$(id -g)" -v "$PWD/artifacts:/reports" \
  -e TOPTEACH_REPORT_DIR=/reports "$image" --verify-legacy > artifacts/legacy-parity.log 2>&1; then
  echo 'Legacy macOS topology/energy regression also passed.'
else
  echo 'Legacy macOS comparison differs: inspect artifacts/legacy-parity-report.json.'
  # A numerical mismatch produces a report; a crash or missing fixture is an error.
  test -s artifacts/legacy-parity-report.json
fi

docker run --rm --read-only --tmpfs /tmp:rw,size=256m,mode=1777 \
  "$image" --verify-elements > artifacts/elements.log

docker run -d --name "$name" --read-only --tmpfs /tmp:rw,size=256m,mode=1777 \
  --cap-drop ALL --security-opt no-new-privileges:true \
  -p "127.0.0.1:$port:8080" "$image" >/dev/null
ready=false
for ((attempt=0;attempt<60;attempt++)); do
  if curl -fsS "http://127.0.0.1:$port/api/health" > artifacts/health.json; then ready=true; break; fi
  sleep 1
done
if [[ "$ready" != true ]]; then echo 'Container did not become ready.' >&2; exit 1; fi
TOPTEACH_TEST_URL="http://127.0.0.1:$port" TOPTEACH_REPORT_DIR="$PWD/artifacts" python3 tests/api_smoke.py
curl -fsS "http://127.0.0.1:$port/api/provenance" > artifacts/provenance.json
python3 - <<'PY'
import json
p=json.load(open('artifacts/provenance.json'))
assert p['buildPlatform'].startswith('Linux '),p
assert 'KDTree.dll' not in p['binaries'],p
assert all(name in p['binaries'] for name in ['BesoNative.dll','MathNet.Numerics.dll','TopTeach.dll'])
print('Container parity, API lifecycle and Linux build provenance passed.')
PY
