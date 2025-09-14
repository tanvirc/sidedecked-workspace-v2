# 🃏 SideDecked Workspace

> **Multi-Repository Development Environment for SideDecked TCG Marketplace**

This repository provides a unified development workspace that orchestrates all four SideDecked repositories in a single GitHub Codespace environment.

## Sidedecked Workspace

Public VS Code workspace that loads four private repos: `backend`, `customer-backend`, `storefront`, and `vendorpanel`. Changes and commits remain scoped to each private repo. The workspace is Codespaces-ready and provisions Postgres.

### Structure
- This public repo contains only workspace config and devcontainer files.
- The four app folders are separate git repos and are ignored by this repo.

### Getting Started (Locally)
1. Ensure the four private repos are cloned into the sibling folders:
   - `backend/`
   - `customer-backend/`
   - `storefront/`
   - `vendorpanel/`
2. Open `sidedecked-workspace.code-workspace` in VS Code.

### Codespaces
1. Open this repository in GitHub Codespaces.
2. The dev container starts using Docker Compose and provisions Postgres on port 5432.
3. On first create, the bootstrap script can clone the four private repos if you provide slugs:
   - Copy `.devcontainer/repos.env.example` to `.devcontainer/repos.env` and set:
     - `BACKEND_REPO=owner/backend-repo`
     - `CUSTOMER_BACKEND_REPO=owner/customer-backend-repo`
     - `STOREFRONT_REPO=owner/storefront-repo`
     - `VENDORPANEL_REPO=owner/vendorpanel-repo`
4. Rebuild the container if you add/update `repos.env` (Command Palette → Rebuild Container).

### Notes
- This repo intentionally ignores the four app folders so commits remain tied to their respective repos.
- Postgres credentials (dev only): user `postgres`, password `postgres`, db `app`, host `db` inside the container or `localhost:5432` from VS Code.
- If your private repos require additional permissions, ensure `gh auth status` passes inside the Codespace or grant the Codespace token access.

## 🚀 Quick Start

### Option 1: GitHub Codespace (Recommended)

1. Click "Code" → "Codespaces" → "Create codespace on main"
2. Wait for the environment to initialize (automatic setup runs)
3. **Setup Authentication**: `./.github/setup-auth.sh` (run once)
4. Open the workspace: `File` → `Open Workspace from File` → `sidedecked.code-workspace`
5. Start development: `Ctrl+Shift+P` → `Tasks: Run Task` → `🚀 Start All Services`

### Option 2: Local Development

1. Clone this repository:

   ```bash
   git clone https://github.com/yourusername/sidedecked-workspace.git
   cd sidedecked-workspace
   ```

2. Run setup script:

   ```bash
   bash scripts/setup.sh
   ```

3. Start Docker services:

   ```bash
   docker-compose up -d
   ```

4. Start all development servers:
   ```bash
   bash scripts/start-all.sh
   ```

## 📁 Repository Structure

This workspace manages four separate git repositories:

```
sidedecked-workspace/
├── 🏗️ backend/              # MercurJS Commerce Engine
├── 🔧 customer-backend/     # TCG Catalog & Customer Services
├── 🛒 storefront/           # Next.js Customer UI
├── 🏪 vendorpanel/          # React Admin Dashboard
├── .devcontainer/           # Codespace configuration
├── .vscode/                 # Multi-root workspace settings
├── scripts/                 # Automation scripts
└── docker-compose.yml       # Infrastructure services
```

## 🛠️ Services & Ports

| Service                  | Port      | Description                 |
| ------------------------ | --------- | --------------------------- |
| 🏗️ Backend (MercurJS)    | 9000      | Commerce engine & admin API |
| 🔧 Customer Backend      | 7000      | TCG services & customer API |
| 🛒 Storefront            | 3000      | Next.js customer interface  |
| 🏪 Vendor Panel          | 5173      | React admin dashboard       |
| 🐘 PostgreSQL (Backend)  | 5432      | Commerce database           |
| 🐘 PostgreSQL (Customer) | 5433      | TCG & customer database     |
| 🔴 Redis                 | 6379      | Cache & job queues          |
| 📦 MinIO                 | 9000/9001 | S3-compatible storage       |
| 📧 MailHog               | 8025      | Email testing UI            |

## 📋 Available Scripts

### Workspace Management

```bash
npm run setup          # Clone repos & install dependencies
npm run start           # Start all services
npm run stop            # Stop all services
npm run services:up     # Start Docker services
npm run services:down   # Stop Docker services
```

### Development

```bash
npm run dev:backend          # Start backend only
npm run dev:customer-backend # Start customer backend only
npm run dev:storefront       # Start storefront only
npm run dev:vendorpanel      # Start vendor panel only
```

### Testing & Building

```bash
npm run test:all    # Run tests for all projects
npm run build:all   # Build all projects
npm run lint:all    # Lint all projects
npm run clean       # Clean all build artifacts
```

## 🎯 VS Code Tasks

Access via `Ctrl+Shift+P` → `Tasks: Run Task`:

- **🚀 Start All Services** - Start all development servers
- **🧪 Run All Tests** - Execute test suites across all projects
- **🔨 Build All** - Build all projects for production
- **Individual service tasks** - Start, test, or build specific services

## 🔧 Configuration

### Environment Variables

1. Copy the environment template:

   ```bash
   cp .env.template .env
   ```

2. Update with your actual values:
   - Database credentials
   - API keys (Stripe, social login, TCG APIs)
   - Secret keys (JWT, cookies)
   - Repository URLs

### Repository URLs

Update the repository URLs in:

- `.env` file (for automated cloning)
- `scripts/setup.sh` (manual updates)

Replace `yourusername` with your actual GitHub username:

```bash
BACKEND_REPO=https://github.com/yourusername/backend.git
CUSTOMER_BACKEND_REPO=https://github.com/yourusername/customer-backend.git
STOREFRONT_REPO=https://github.com/yourusername/storefront.git
VENDORPANEL_REPO=https://github.com/yourusername/vendorpanel.git
```

## 🛡️ Development Workflow

### 1. Initial Setup

- Codespace automatically runs setup script
- All repositories are cloned and dependencies installed
- Environment files are created from templates
- Docker services are started
- Database migrations are executed

### 2. Daily Development

- Open VS Code workspace: `sidedecked.code-workspace`
- Start services: Use VS Code task or `npm run start`
- Work across all repositories in unified interface
- Use individual terminals for each service

### 3. Testing & Deployment

- Run tests frequently: `npm run test:all`
- Build before commits: `npm run build:all`
- Each repository maintains its own git history
- Deploy services independently

## 🔐 Authentication Setup

If you encounter git push/pull failures, run the authentication setup script:

```bash
# Fix authentication issues
./.github/setup-auth.sh
```

This script will:

- Clean up conflicting credential configurations
- Configure secure GitHub CLI authentication
- Update all repository remotes to use standard HTTPS URLs
- Test authentication for all repositories

**Security Features:**

- No tokens stored in git remotes
- Authentication handled by GitHub CLI
- Credentials managed by system credential store

## 🐛 Troubleshooting

### Authentication Issues

```bash
# Run authentication setup
./.github/setup-auth.sh

# For individual repositories, use this format:
GITHUB_TOKEN= git pull origin main
GITHUB_TOKEN= git push origin main

# Check GitHub CLI status
gh auth status

# Re-authenticate if needed
gh auth login
```

**Note**: In Codespace environments, the `GITHUB_TOKEN` environment variable has limited permissions. For individual repositories (backend, customer-backend, storefront, vendorpanel), prefix git commands with `GITHUB_TOKEN=` to use CLI authentication instead.

### Services Not Starting

```bash
# Check Docker services
docker-compose ps

# View service logs
docker-compose logs -f

# Restart everything
npm run stop && npm run services:down
npm run services:up && npm run start
```

### Port Conflicts

```bash
# Kill processes on specific ports
lsof -ti:3000 | xargs kill
lsof -ti:9000 | xargs kill

# Or use the cleanup script
bash scripts/stop-all.sh
```

### Missing Dependencies

```bash
# Reinstall all dependencies
bash scripts/setup.sh

# Or manually for specific service
cd backend && npm install
cd customer-backend && npm install
# etc...
```

### Environment Issues

```bash
# Recreate environment files
cp .env.template .env
# Update with your actual values

# Check service connectivity
curl http://localhost:9000/health
curl http://localhost:7000/health
```

## 📚 Documentation

- **Project Overview**: See main `CLAUDE.md` in each repository
- **API Documentation**: Available at `/docs` endpoint of each service
- **Architecture**: Detailed in `docs/architecture/`
- **Phase Guides**: Phase-specific documentation in `docs/specifications/` directory

## 🤝 Contributing

1. Work in this unified workspace
2. Make changes in appropriate repositories
3. Test across all services: `npm run test:all`
4. Build everything: `npm run build:all`
5. Commit changes in individual repositories
6. Deploy services independently

## 🔗 Links

- **Storefront**: http://localhost:3000
- **Vendor Panel**: http://localhost:5173
- **Backend Admin**: http://localhost:9000/admin
- **MinIO Console**: http://localhost:9001
- **MailHog**: http://localhost:8025

## 📄 License

MIT License - see individual repositories for specific licensing terms.

---

**Happy coding! 🚀** Built with ❤️ by the SideDecked team.
