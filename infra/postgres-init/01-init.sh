#!/bin/bash
# chmod +x this file on Linux before committing
set -e

# POSTGRES_DB is already created by the postgres image via the POSTGRES_DB env var.
# This script is a hook for future schema bootstrapping or extension setup.

echo "PostgreSQL sidedecked-db init complete"
