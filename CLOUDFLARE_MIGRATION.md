# CLOUDFLARE MIGRATION GUIDE
# =========================

## STEP 0: Prerequisites
```bash
npm install -g wrangler
wrangler login
# Create Cloudinary account at https://cloudinary.com (free tier)
# Note your Cloud Name from the dashboard
```

## STEP 1: Install Dependencies
```bash
npm install @cloudflare/next-on-pages next-cloudinary
```

## STEP 2: Upload Images to Cloudinary
```bash
# Via Cloudinary Dashboard > Media Library > Upload
# Upload all files from public/assets/tantra/ to a folder called "kalki"
# Set public_id to the filename without extension
# OR use the upload API:

CLOUD_NAME="your-cloud-name"
API_KEY="your-api-key"
API_SECRET="your-api-secret"

for f in public/assets/tantra/*.jpeg public/assets/tantra/*.jpg; do
  name=$(basename "$f" | sed 's/\.[^.]*$//')
  curl https://api.cloudinary.com/v1_1/$CLOUD_NAME/image/upload \
    -X POST \
    -H "Authorization: Basic $(echo -n "$API_KEY:$API_SECRET" | base64)" \
    -F "file=@$f" \
    -F "public_id=kalki/$name" \
    -F "folder=kalki" \
    -F "overwrite=true"
done
```

## STEP 3: Configure Next.js for Cloudflare Pages
Add to package.json scripts:
```json
{
  "pages:build": "npx @cloudflare/next-on-pages",
  "pages:dev": "npx wrangler pages dev .vercel/output/static --compatibility-date=2024-01-01",
  "pages:deploy": "npm run pages:build && wrangler pages deploy .vercel/output/static"
}
```

Create wrangler.toml:
```toml
name = "kalki-mirror"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[vars]
NODE_ENV = "production"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

## STEP 4: Set Environment Variables
In Cloudflare Dashboard > Pages > kalki-mirror > Settings > Environment Variables:
```
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

## STEP 5: Clean Git History of Heavy Images
```bash
# Install BFG Repo-Cleaner
wget -q https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

# Remove all images from Git history
java -jar bfg-1.14.0.jar --delete-folders public/assets/tantra

# Clean up
rm -rf public/assets/tantra/*.jpeg public/assets/tantra/archetypes/*.jpeg

# Add to .gitignore
echo "public/assets/tantra/*.jpeg" >> .gitignore
echo "public/assets/tantra/*.jpg" >> .gitignore
echo "public/assets/tantra/archetypes/" >> .gitignore

# Commit and force push
git add .gitignore
git commit -m "chore: remove heavy images, serve via Cloudinary CDN"
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force --all
```

## STEP 6: Deploy to Cloudflare Pages
```bash
# Via CLI
wrangler pages project create kalki-mirror --production-branch=main
npm run pages:build
wrangler pages deploy .vercel/output/static --project-name=kalki-mirror

# Or via Cloudflare Dashboard:
# 1. Pages > Create a project > Connect to Git
# 2. Select Kalki-Mirror repo, branch: main
# 3. Build command: npx @cloudflare/next-on-pages
# 4. Build output: .vercel/output/static
# 5. Set environment variables (Step 4)
# 6. Deploy
```

## STEP 7: Update DNS
```bash
# In Cloudflare DNS:
# CNAME: kalki.yourdomain.com -> kalki-mirror.pages.dev
# Or use Cloudflare as your domain's nameserver
```

## STEP 8: Switch to Cloudinary Images
After deploying, update CinematicImage to pass cloudinaryId:
Before: src="/assets/tantra/hero-runes-manuscript.jpeg"
After:  cloudinaryId="kalki/hero-runes-manuscript"
