#!/bin/bash

# Azure App Service Deployment Script
# Prerequisites: Azure CLI installed and logged in (az login)

# Configuration - Update these values
RESOURCE_GROUP="test-data-generator-rg"
APP_NAME="test-data-generator"
LOCATION="australiaeast"  # Change to your preferred region
SKU="B1"  # Basic tier, good for internal tools

echo "=== Test Data Generator - Azure Deployment ==="

# Create resource group if it doesn't exist
echo "Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service Plan
echo "Creating App Service Plan..."
az appservice plan create \
  --name "${APP_NAME}-plan" \
  --resource-group $RESOURCE_GROUP \
  --sku $SKU \
  --is-linux

# Create Web App with Node.js runtime
echo "Creating Web App..."
az webapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --plan "${APP_NAME}-plan" \
  --runtime "NODE:18-lts"

# Configure app settings
echo "Configuring app settings..."
az webapp config appsettings set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    NODE_ENV=production \
    WEBSITE_NODE_DEFAULT_VERSION=~18

# Configure startup command for monorepo
echo "Setting startup command..."
az webapp config set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --startup-file "node backend/dist/index.js"

# Enable logging
echo "Enabling logging..."
az webapp log config \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --application-logging filesystem \
  --level information

# Deploy from local (requires building first)
echo ""
echo "=== Deployment Complete ==="
echo "App URL: https://${APP_NAME}.azurewebsites.net"
echo ""
echo "To deploy code, run:"
echo "  npm run build"
echo "  az webapp deployment source config-zip --resource-group $RESOURCE_GROUP --name $APP_NAME --src <zip-file>"
echo ""
echo "Or use GitHub Actions for CI/CD (see .github/workflows/azure-deploy.yml)"
