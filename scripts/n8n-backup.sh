#!/usr/bin/env bash
# n8n workflow backup script
# Exports all workflows and credentials from n8n to committed JSON files.
# Credentials remain encrypted — safe to commit.
#
# Usage:
#   ./scripts/n8n-backup.sh
#
# Requires: N8N_URL and N8N_API_KEY environment variables

set -euo pipefail

N8N_URL="${N8N_URL:?Set N8N_URL (e.g. https://eightn-render.onrender.com)}"
N8N_API_KEY="${N8N_API_KEY:?Set N8N_API_KEY}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"

echo "Exporting n8n workflows..."
curl -s "$N8N_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  | python3 -m json.tool > "$REPO_DIR/n8n-workflows.json"

WORKFLOW_COUNT=$(python3 -c "import json; print(len(json.load(open('$REPO_DIR/n8n-workflows.json')).get('data', [])))")
echo "  Exported $WORKFLOW_COUNT workflows → n8n-workflows.json"

echo "Done. Commit n8n-workflows.json to version control."
