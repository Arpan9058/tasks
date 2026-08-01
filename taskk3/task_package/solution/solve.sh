#!/usr/bin/env bash
set -e
cd /app
if git apply -p1 --whitespace=nowarn /solution/golden.patch 2>/dev/null; then
  :
elif git apply -p1 --3way --whitespace=nowarn /solution/golden.patch 2>/dev/null; then
  :
elif git apply -p1 -R --check --whitespace=nowarn /solution/golden.patch 2>/dev/null; then
  # The solution is already applied; keep repeated oracle runs idempotent.
  :
else
  echo "ERROR: golden.patch could not be applied" >&2
  exit 1
fi
