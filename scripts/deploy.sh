#!/usr/bin/env bash
set -e

# ============================================================
# StacksLance — Mainnet Deployment Script
# ============================================================
# Usage: ./scripts/deploy.sh
# ============================================================

echo ""
echo "  StacksLance Contract Deployment"
echo "  Network: mainnet"
echo ""

if ! command -v clarinet &> /dev/null; then
  echo "  ERROR: clarinet not found."
  exit 1
fi

# Step 1 — check contract syntax
echo "  [1/3] Checking contract..."
clarinet check contracts/freelance-marketplace.clar
echo "  Contract OK"

# Step 2 — regenerate plan with latest contract state
echo ""
echo "  [2/3] Generating deployment plan..."
clarinet deployments generate --mainnet --medium-cost
echo "  Plan written to deployments/default.mainnet-plan.yaml"

# Step 3 — confirm and deploy
echo ""
echo "  Deployer: $(grep expected-sender deployments/default.mainnet-plan.yaml | awk '{print $2}')"
echo "  Estimated fee: $(grep 'cost:' deployments/default.mainnet-plan.yaml | awk '{print $2}') microSTX"
echo ""
echo "  WARNING: This deploys to MAINNET with real STX."
read -p "  Type 'deploy' to continue: " confirm
if [ "$confirm" != "deploy" ]; then
  echo "  Aborted."
  exit 0
fi

echo ""
echo "  [3/3] Deploying..."
clarinet deployments apply --mainnet --no-dashboard

echo ""
echo "  Deployment submitted. Check status at:"
echo "  https://explorer.hiro.so/address/$(grep expected-sender deployments/default.mainnet-plan.yaml | awk '{print $2}')?chain=mainnet"
echo ""
echo "  Once confirmed, update frontend/lib/constants.ts:"
echo "    CONTRACT_ADDRESS = \"$(grep expected-sender deployments/default.mainnet-plan.yaml | awk '{print $2}')\""
echo "    NETWORK = \"mainnet\""
echo ""
