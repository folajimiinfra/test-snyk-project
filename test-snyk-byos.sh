#!/bin/bash

# Configuration
CODEFABRIC_URL="http://localhost:8080"

# Check if Snyk is installed
if ! command -v snyk &> /dev/null
then
    echo "Snyk CLI not found. Please install it with 'npm install -g snyk'"
    exit 1
fi

echo "--- Running Snyk SCA Scan (Dependencies) ---"
snyk test --json > snyk-sca-results.json || true

echo "--- Running Snyk Code Scan (SAST) ---"
snyk code test --json > snyk-code-results.json || true

echo "Combining results..."
echo "{}" > combined-results.json
if [ -s snyk-sca-results.json ]; then
    jq -s '.[0] * .[1]' combined-results.json snyk-sca-results.json > tmp.json && mv tmp.json combined-results.json
fi
if [ -s snyk-code-results.json ]; then
    jq -s '.[0] * .[1]' combined-results.json snyk-code-results.json > tmp.json && mv tmp.json combined-results.json
fi

echo "Preparing combined payload..."
jq -n --slurpfile snyk combined-results.json \
'{
    tool: "snyk",
    tool_instance_id: "local-combined",
    scan_type: "SCA",
    format: "json",
    tenant_id: "local-tenant",
    asset_id: "local-test-project",
    trigger: "MANUAL",
    scanner_output: $snyk[0]
}' > payload.json

echo "Sending combined report to CodeFabric at $CODEFABRIC_URL..."
curl -s -X POST "$CODEFABRIC_URL/api/v1/byos/ingest" \
  -H "Content-Type: application/json" \
  -d @payload.json | jq .

echo -e "\nDone!"
rm payload.json combined-results.json
