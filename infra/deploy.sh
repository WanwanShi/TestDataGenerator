#!/bin/bash

# Bicep Deployment Script for Test Data Generator
# Prerequisites: Azure CLI installed and logged in (az login)
#
# Usage:
#   ./infra/deploy.sh                           # Uses defaults
#   APP_NAME=my-app LOCATION=eastus ./infra/deploy.sh  # Override with env vars

set -e

# Configuration - Override with environment variables
RESOURCE_GROUP="${RESOURCE_GROUP:-test-data-generator-rg}"
APP_NAME="${APP_NAME:-test-data-generator}"
LOCATION="${LOCATION:-australiaeast}"
SKU="${SKU:-B1}"
BICEP_FILE="./infra/main.bicep"

echo "=== Test Data Generator - Bicep Deployment ==="

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo "Please login to Azure first: az login"
    exit 1
fi

# Create resource group if it doesn't exist
echo "Creating resource group '$RESOURCE_GROUP' in '$LOCATION'..."
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --output none

# Deploy Bicep template
echo "Deploying Bicep template..."
echo "  App Name: $APP_NAME"
echo "  Location: $LOCATION"
echo "  SKU: $SKU"
DEPLOYMENT_OUTPUT=$(az deployment group create \
  --resource-group "$RESOURCE_GROUP" \
  --template-file "$BICEP_FILE" \
  --parameters appName="$APP_NAME" location="$LOCATION" sku="$SKU" \
  --query "properties.outputs" \
  --output json)

# Extract outputs
APP_NAME=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.webAppName.value')
APP_URL=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.webAppUrl.value')

echo ""
echo "=== Deployment Complete ==="
echo "Web App Name: $APP_NAME"
echo "Web App URL:  $APP_URL"
echo ""
echo "Next steps:"
echo "1. Download publish profile from Azure Portal:"
echo "   Azure Portal → App Services → $APP_NAME → Download publish profile"
echo ""
echo "2. Add to GitHub Secrets:"
echo "   - Name: AZURE_WEBAPP_PUBLISH_PROFILE"
echo "   - Value: (paste the XML content)"
echo ""
echo "3. Push to 'main' branch to trigger deployment"
