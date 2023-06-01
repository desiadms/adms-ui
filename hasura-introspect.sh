#!/bin/bash

gq https://cgjgnshvokexivmuttxh.hasura.eu-central-1.nhost.run/v1/graphql -H 'X-Hasura-Admin-Secret: X!k^AGS#6MRzyGGbLl&B0ZR74xY2FA*l' --introspect > schema.graphql