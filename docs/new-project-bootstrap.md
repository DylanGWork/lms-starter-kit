# New Project Bootstrap

Use this when you want to stand up a new LMS project from the starter on a fresh VM.

## Assumptions

- Ubuntu/Debian-style Linux VM
- Docker and Docker Compose plugin available
- Git available
- You are starting from the reusable repo:
  - `https://github.com/DylanGWork/lms-starter-kit.git`
- The repo is private, so the VM must have GitHub access configured first
- You will rebrand the project after the first successful boot

## 1. Install base packages

```bash
sudo apt update
sudo apt install -y git curl ca-certificates
```

If Docker is not already installed:

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
newgrp docker
docker --version
docker compose version
```

## 2. Clone the starter

Because the starter repo is private, anonymous clone attempts will usually return `404`. That is expected.

Set up GitHub access first, then clone.

### Option A: SSH key access

Generate a key on the VM if needed:

```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
cat ~/.ssh/id_ed25519.pub
```

Add that public key to your GitHub account, then test:

```bash
ssh -T git@github.com
```

Clone with SSH:

```bash
cd /opt
sudo git clone git@github.com:DylanGWork/lms-starter-kit.git my-lms
sudo chown -R "$USER":"$USER" /opt/my-lms
cd /opt/my-lms
```

### Option B: Personal access token over HTTPS

If you prefer HTTPS, create a GitHub personal access token with repo read access and use:

```bash
cd /opt
sudo git clone https://github.com/DylanGWork/lms-starter-kit.git my-lms
sudo chown -R "$USER":"$USER" /opt/my-lms
cd /opt/my-lms
```

Git will prompt for credentials:

- username: your GitHub username
- password: your GitHub personal access token

If you prefer to keep it under your home directory:

```bash
git clone git@github.com:DylanGWork/lms-starter-kit.git ~/my-lms
cd ~/my-lms
```

## 3. Create the environment file

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

```dotenv
POSTGRES_PASSWORD=change_this_to_a_real_password
NEXTAUTH_SECRET=generate_a_long_random_secret
NEXTAUTH_URL=http://YOUR_VM_IP:3000
NEXTAUTH_URL_INTERNAL=http://127.0.0.1:3000
AUTH_TRUST_HOST=true
APP_DISPLAY_NAME=Your Project Academy
APP_SUPPORT_NAME=Platform Admin
APP_SUPPORT_EMAIL=admin@example.internal
```

Generate a good `NEXTAUTH_SECRET` with:

```bash
openssl rand -base64 32
```

## 4. Start the stack

```bash
docker compose up -d --build
```

Watch startup if you want:

```bash
docker compose logs -f app
```

## 5. Open the LMS

Browse to:

```text
http://YOUR_VM_IP:3000
```

The starter seeds a generic admin account:

```text
admin@example.internal
ChangeMe123!
```

Change that password immediately after first sign-in.

## 6. First-pass rebrand checklist

Before inviting anyone in, update these areas:

- `.env` display/support values
- `app/src/app/layout.tsx`
- `app/src/app/(auth)/login/page.tsx`
- `app/src/components/layout/Sidebar.tsx`
- `app/src/components/layout/MobileHeader.tsx`
- `app/prisma/seed.ts`
- `app/prisma/seed.js`

Then rebuild:

```bash
docker compose up -d --build app
```

## 7. If this will become its own project repo

Create a new repo for the real project, then point this working copy at it:

```bash
git remote rename origin starter-origin
git remote add origin https://github.com/YOUR-ACCOUNT/YOUR-PROJECT-LMS.git
git push -u origin main
```

That keeps the starter as the source pattern while giving the new project its own history.

## 8. Optional reverse proxy later

For a clean hostname later, put Caddy or nginx in front of it.

Example Caddy block:

```caddy
training.example.internal {
    encode gzip zstd
    reverse_proxy 127.0.0.1:3000
}
```

Then set:

```dotenv
NEXTAUTH_URL=https://training.example.internal
NEXTAUTH_URL_INTERNAL=http://127.0.0.1:3000
AUTH_TRUST_HOST=true
```

And rebuild the app:

```bash
docker compose up -d --build app
```

## 9. Training import workflow

If you want to use draft-import from recorded training videos, adjust the helper script defaults or export overrides first:

```bash
export REPO_ROOT=/opt/my-lms
export TRAINING_DIR=/srv/training-assets
export UPLOAD_VOLUME=lms_starter_uploads_data
export NETWORK_NAME=my-lms_default
export DATABASE_URL=postgresql://lms:change_this_to_a_real_password@postgres:5432/lms_platform
/opt/my-lms/scripts/run-training-import.sh
```

## 10. Useful commands

Bring the stack up:

```bash
docker compose up -d
```

Rebuild the app only:

```bash
docker compose up -d --build app
```

Stop the stack:

```bash
docker compose down
```

Follow app logs:

```bash
docker compose logs -f app
```

Follow database logs:

```bash
docker compose logs -f postgres
```

## 11. What to do next

After the platform boots successfully:

1. Replace branding.
2. Replace seed content.
3. Replace screenshots and videos.
4. Rebuild the QA board for the new project.
5. Decide whether multilingual support is needed on day one or later.
6. Run a first dogfood pass before giving users access.
