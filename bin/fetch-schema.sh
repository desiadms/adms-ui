#!/bin/bash

# Check if variables are already exported and capture them. If not, fetch from netlify.
if [[ -z "$HASURA_ADMIN_SECRET" ]]; then
  HASURA_ADMIN_SECRET=$(bun run netlify env:get HASURA_ADMIN_SECRET | grep -v "bun\|netlify\|Done")
fi

if [[ -z "$VITE_HASURA_ENDPOINT" ]]; then
  VITE_HASURA_ENDPOINT=$(bun run netlify env:get VITE_HASURA_ENDPOINT | grep -v "bun\|netlify\|Done")
fi

echo "HASURA_ADMIN_SECRET: $HASURA_ADMIN_SECRET"
echo "VITE_HASURA_ENDPOINT: $VITE_HASURA_ENDPOINT"

# Make sure they're not empty
if [[ -z "$HASURA_ADMIN_SECRET" || -z "$VITE_HASURA_ENDPOINT" ]]; then
    echo "Environment variables not set. Exiting."
    exit 1
fi

# Otherwise, introspect the GraphQL endpoint
bun run graphql-inspector introspect "$VITE_HASURA_ENDPOINT" --header "X-Hasura-Admin-Secret: $HASURA_ADMIN_SECRET"
