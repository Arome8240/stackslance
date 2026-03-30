#!/usr/bin/env bash
set -e

echo ""
echo "  StacksLance — Mainnet Deployment"
echo ""

# Check contract
clarinet check contracts/freelance-marketplace.clar
echo "  Contract OK"

# Regenerate plan
clarinet deployments generate --mainnet --medium-cost

# Deploy
clarinet deployments apply --mainnet --no-dashboard

echo ""
echo "  Done. Contract: SP25H46Z9YCAB1TW93YG42WM0SREG9SC5EZB977TJ.freelance-marketplace"
echo "  https://explorer.hiro.so/address/SP25H46Z9YCAB1TW93YG42WM0SREG9SC5EZB977TJ?chain=mainnet"
