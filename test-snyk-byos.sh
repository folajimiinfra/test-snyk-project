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

function push_to_codefabric() {
    FILE=$1
    SCAN_TYPE=$2
    INSTANCE=$3
    
    if [ ! -s "$FILE" ]; then
        echo "Error: $FILE is empty, skipping $SCAN_TYPE push"
        return
    fi

    echo "Preparing $SCAN_TYPE payload..."
    jq -n --slurpfile snyk "$FILE" \
    --arg scan_type "$SCAN_TYPE" \
    --arg instance "$INSTANCE" \
    '{
        tool: "snyk",
        tool_instance_id: $instance,
        scan_type: $scan_type,
        format: "json",
        tenant_id: "local-tenant",
        asset_id: "local-test-project",
        trigger: "MANUAL",
        scanner_output: $snyk[0]
    }' > payload.json

    echo "Sending $SCAN_TYPE to CodeFabric at $CODEFABRIC_URL..."
    curl -s -X POST "$CODEFABRIC_URL/api/v1/byos/ingest" \
      -H "Content-Type: application/json" \
      -d @payload.json | jq .
}

push_to_codefabric "snyk-sca-results.json" "SCA" "local-sca"
push_to_codefabric "snyk-code-results.json" "SAST" "local-code"

echo -e "\nDone!"
rm payload.json
