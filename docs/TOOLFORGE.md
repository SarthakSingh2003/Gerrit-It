# Deploying WikiGerritTracker on Wikimedia Toolforge (Node 20)

This guide provides step-by-step instructions for publishing and operating **WikiGerritTracker** on [Wikimedia Toolforge](https://wikitech.wikimedia.org/wiki/Help:Toolforge) using the **Node 20** runtime.

---

## 1. Prerequisites

1. A Wikimedia developer account with Toolforge access.
2. A registered tool account on Toolforge (e.g. `wikigerrittracker` or your custom tool name).
3. SSH access configured to `login.tools.wmflabs.org`.

---

## 2. Environment & Architectural Details

- **Ingress Port:** Wikimedia Toolforge Kubernetes ingress directs external HTTPS web traffic (`https://<toolname>.toolforge.org`) to container port **`8000`**.
- **Dual-Mode Node.js Server:** In production mode (`NODE_ENV=production`), WikiGerritTracker automatically binds to port `8000` (or the `$PORT` environment variable).
- **Unified Service:** The Express backend serves both the `/api/*` endpoints and the compiled static Vite frontend bundle from `frontend/dist/`.

---

## 3. Deployment Method A: Toolforge Build Service (Recommended)

The Toolforge Build Service builds your application using standard Cloud Native Buildpacks directly from Git.

### Step 1: Connect to Toolforge and switch to your tool
```bash
ssh <your-username>@login.tools.wmflabs.org
become <toolname>
```

### Step 2: Trigger a Build
Run the build command specifying your git repository URL:
```bash
toolforge build start https://github.com/<your-username>/WikiGerritTracker
```

To follow the build output:
```bash
toolforge build logs
```

### Step 3: Start the Webservice
Once the build completes successfully, start the webservice using the build service runner:
```bash
toolforge webservice buildservice start --mount=all
```

---

## 4. Deployment Method B: Toolforge Kubernetes Web Service (`node20`)

If you prefer building and running directly from source on the shared NFS storage:

### Step 1: Connect and switch to your tool
```bash
ssh <your-username>@login.tools.wmflabs.org
become <toolname>
```

### Step 2: Clone or Update the Repository
```bash
# If initial setup:
git clone https://github.com/<your-username>/WikiGerritTracker.git app
cd app

# If updating existing checkout:
cd app
git pull origin main
```

### Step 3: Install Dependencies and Build
Run an interactive Kubernetes container with Node 20 to install packages and compile TypeScript:
```bash
webservice --backend=kubernetes node20 shell
```

Inside the container shell:
```bash
npm ci
npm run build
exit
```

### Step 4: Start the Web Service
From the tool directory containing `package.json` and `Procfile`:
```bash
webservice --backend=kubernetes node20 start
```

---

## 5. Monitoring & Maintenance

### Check Service Status
```bash
webservice status
```

### View Live Logs
```bash
webservice logs -f
```

### Restart Web Service
```bash
webservice restart
```

### Stop Web Service
```bash
webservice stop
```

---

## 6. Optional: Redis In-Memory Cache on Toolforge

By default, WikiGerritTracker runs with a high-performance, bounded in-process LRU cache (`MemoryLruCache`) that requires zero external infrastructure.

If you wish to use a shared Redis instance on Toolforge:
1. Request or configure a Redis service on Toolforge.
2. Set the `REDIS_URL` environment variable:
   ```bash
   toolforge envvars set REDIS_URL "redis://:<password>@<host>:<port>"
   ```
3. Restart the webservice:
   ```bash
   webservice restart
   ```
