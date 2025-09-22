# 🚀 Quick Start Guide - Deploy to Vercel

## Step 1: Prepare Your Project

1. **Run the setup script** (optional but helpful):
```bash
npm run setup
```

2. **Initialize Git** (if not already done):
```bash
git init
git add .
git commit -m "Initial commit: Location Gaming Platform"
```

## Step 2: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** button → **"New repository"**
3. Name it: `location-gaming-platform`
4. Make it **Public** (required for free Vercel deployment)
5. **Don't** check "Initialize with README" (we already have files)
6. Click **"Create repository"**

## Step 3: Push to GitHub

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/location-gaming-platform.git

# Push your code
git push -u origin main
```

## Step 4: Deploy to Vercel

### Option A: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/location-gaming-platform)

### Option B: Manual Deploy
1. Go to [Vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"New Project"**
3. Import your `location-gaming-platform` repository
4. Vercel will auto-detect it's a Next.js project
5. Click **"Deploy"**

## Step 5: Add Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add these variables:

| Variable | Value | Required |
|----------|-------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | ✅ Yes |
| `NEXTAUTH_SECRET` | Any random string (e.g., `my-secret-key-123`) | ✅ Yes |
| `MAPBOX_ACCESS_TOKEN` | Your Mapbox token (optional) | ❌ No |

## Step 6: Get Your API Keys

### OpenAI API Key (Required)
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in/Create account
3. Click **"Create new secret key"**
4. Copy the key and add to Vercel

### Database (Built-in SQLite)
✅ **No setup required!** The app uses SQLite database that's automatically created when deployed.

### Mapbox Token (Optional)
1. Go to [Mapbox.com](https://mapbox.com)
2. Sign up for free account
3. Go to **Account** → **Access tokens**
4. Copy default public token
5. Add to Vercel as `MAPBOX_ACCESS_TOKEN`

## Step 7: Redeploy

After adding environment variables:
1. Go to **Deployments** tab in Vercel
2. Click **"Redeploy"** on the latest deployment
3. Wait for deployment to complete

## Step 8: Test Your App

1. Visit your Vercel URL (e.g., `https://your-project.vercel.app`)
2. Sign up for a new account
3. Create a route as admin
4. Join a game as player

## 🎉 You're Live!

Your Location Gaming Platform is now deployed and accessible worldwide!

## Troubleshooting

### Build Fails?
- Check that all environment variables are set
- Ensure your OpenAI API key is valid
- Check Vercel build logs for specific errors

### Database Issues?
- Verify your Replit database URL is correct
- Make sure the database is accessible

### Need Help?
- Check the full [DEPLOYMENT.md](DEPLOYMENT.md) guide
- Review [README.md](README.md) for feature documentation

## Cost Breakdown

- **Vercel**: Free (100GB bandwidth, 100 function executions)
- **OpenAI**: ~$5-20/month depending on usage
- **SQLite Database**: Free (built-in)
- **Mapbox**: Free (50,000 map loads/month)

**Total estimated cost: $5-20/month** 🎯
