Sidedecked Workspace
====================

Public VS Code workspace that loads four private repos: `backend`, `customer-backend`, `storefront`, and `vendorpanel`. Changes and commits remain scoped to each private repo. The workspace is Codespaces-ready and provisions Postgres.

Structure
---------
- This public repo contains only workspace config and devcontainer files.
- The four app folders are separate git repos and are ignored by this repo.

Getting Started (Locally)
-------------------------
1. Ensure the four private repos are cloned into the sibling folders:
   - `backend/`
   - `customer-backend/`
   - `storefront/`
   - `vendorpanel/`
2. Open `sidedecked-workspace.code-workspace` in VS Code.

Codespaces
----------
1. Open this repository in GitHub Codespaces.
2. The dev container starts using Docker Compose and provisions Postgres on port 5432.
3. On first create, the bootstrap script can clone the four private repos if you provide slugs:
   - Copy `.devcontainer/repos.env.example` to `.devcontainer/repos.env` and set:
     - `BACKEND_REPO=owner/backend-repo`
     - `CUSTOMER_BACKEND_REPO=owner/customer-backend-repo`
     - `STOREFRONT_REPO=owner/storefront-repo`
     - `VENDORPANEL_REPO=owner/vendorpanel-repo`
4. Rebuild the container if you add/update `repos.env` (Command Palette → Rebuild Container).

Notes
-----
- This repo intentionally ignores the four app folders so commits remain tied to their respective repos.
- Postgres credentials (dev only): user `postgres`, password `postgres`, db `app`, host `db` inside the container or `localhost:5432` from VS Code.
- If your private repos require additional permissions, ensure `gh auth status` passes inside the Codespace or grant the Codespace token access.

