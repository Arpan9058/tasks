FROM python:3.11-slim
WORKDIR /app

# frozen-requirements.txt pins several packages as `-e git+https://...` VCS
# installs. The slim base has no git, so these must be installed before pip runs
# or the whole requirements install aborts (and httpx never lands).
RUN apt-get update \
    && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY repo/ .
COPY frozen-requirements.txt /tmp/frozen-requirements.txt
RUN pip install --no-cache-dir -r /tmp/frozen-requirements.txt
RUN pip install --no-cache-dir -e . 2>/dev/null || pip install --no-cache-dir -r requirements.txt 2>/dev/null || true
CMD ["sh", "-c", "python -m pytest"]
RUN mkdir -p /installed-agent
RUN command -v patch >/dev/null 2>&1 || ( (apt-get update && apt-get install -y --no-install-recommends patch && rm -rf /var/lib/apt/lists/*) 2>/dev/null || apk add --no-cache patch 2>/dev/null || yum install -y patch 2>/dev/null || true )
RUN command -v git >/dev/null 2>&1 || ( (apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*) 2>/dev/null || apk add --no-cache git 2>/dev/null || dnf install -y git 2>/dev/null || yum install -y git 2>/dev/null || true )
RUN (command -v tmux >/dev/null 2>&1 && command -v asciinema >/dev/null 2>&1) || ( (apt-get update && apt-get install -y --no-install-recommends tmux asciinema && rm -rf /var/lib/apt/lists/*) 2>/dev/null || apk add --no-cache tmux asciinema 2>/dev/null || dnf install -y tmux asciinema 2>/dev/null || yum install -y tmux asciinema 2>/dev/null || true )
COPY test-requirements.txt /tmp/test-requirements.txt
RUN pip install --no-cache-dir -r /tmp/test-requirements.txt

# The pydantic packages are pulled from VCS by frozen-requirements.txt, which
# would otherwise shadow the in-repo sources. Put the repo copies first so the
# code under test (and any patch applied to it) is what actually runs.
ENV PYTHONPATH=/app/pydantic_ai_slim:/app/pydantic_evals:/app/pydantic_graph
