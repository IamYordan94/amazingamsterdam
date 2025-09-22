# Deployment Guide for Location Gaming Platform

This guide will help you deploy the Location Gaming Platform to Vercel via GitHub.

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- OpenAI API key
- No additional accounts needed (uses built-in SQLite)

## Step 1: Set up GitHub Repository

### Option A: Create a new repository on GitHub

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name your repository (e.g., `location-gaming-platform`)
5. Make it public or private (your choice)
6. Don't initialize with README (we already have one)
7. Click "Create repository"

### Option B: Use GitHub CLI (if you have it installed)

```bash
# Initialize git repository
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Location Gaming Platform"

# Create repository on GitHub and push
gh repo create location-gaming-platform --public --source=. --remote=origin --push
```

## Step 2: Push your code to GitHub

If you haven't already set up git:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Location Gaming Platform"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/location-gaming-platform.git

# Push to GitHub
git push -u origin main
```

## Step 3: Set up Vercel Deployment

### Method 1: Deploy via Vercel Dashboard

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect it's a Next.js project
5. Configure environment variables (see Step 4)
6. Click "Deploy"

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? location-gaming-platform
# - Directory? ./
# - Override settings? No
```

## Step 4: Configure Environment Variables

### In Vercel Dashboard:

1. Go to your project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables"
4. Add the following variables:

```
OPENAI_API_KEY = your_openai_api_key_here
MAPBOX_ACCESS_TOKEN = your_mapbox_access_token_here (optional)
NEXTAUTH_URL = https://your-project-name.vercel.app
NEXTAUTH_SECRET = generate_a_random_secret_string
```

### Using Vercel CLI:

```bash
# Add environment variables
vercel env add OPENAI_API_KEY
vercel env add MAPBOX_ACCESS_TOKEN
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET

# Redeploy with new environment variables
vercel --prod
```

## Step 5: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign in or create an account
3. Go to API Keys section
4. Create a new API key
5. Copy the key and add it to Vercel environment variables as `OPENAI_API_KEY`

## Step 6: Optional - Set up Mapbox (for enhanced maps)

1. Go to [Mapbox](https://mapbox.com) and sign up
2. Go to your account page
3. Create a new access token
4. Add it to Vercel environment variables as `MAPBOX_ACCESS_TOKEN`

## Step 7: Deploy and Test

1. After setting up environment variables, redeploy your project
2. Go to your Vercel deployment URL
3. Test the application:
   - Sign up for a new account
   - Create a route (as admin)
   - Join a game (as player)

## Step 8: Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click on "Settings" tab
3. Click on "Domains"
4. Add your custom domain
5. Follow the DNS configuration instructions

## Troubleshooting

### Common Issues:

1. **Build Errors**: Check that all dependencies are in package.json
2. **Environment Variables**: Ensure all required variables are set in Vercel
3. **Database**: SQLite database is automatically created, no setup needed
4. **API Keys**: Make sure OpenAI API key is valid and has credits

### Debug Steps:

1. Check Vercel build logs for errors
2. Use Vercel CLI to test locally: `vercel dev`
3. Check browser console for client-side errors
4. Verify environment variables are loaded correctly

## Continuous Deployment

Once set up, every push to your main branch will automatically trigger a new deployment on Vercel. You can also set up preview deployments for pull requests.

## Monitoring

- Use Vercel Analytics to monitor performance
- Check Vercel Functions logs for server-side issues
- Monitor your OpenAI API usage to avoid overages

## Cost Considerations

- **Vercel**: Free tier includes 100GB bandwidth and 100 serverless function executions
- **OpenAI**: Pay-per-use API pricing
- **SQLite**: Free (built-in database)
- **Mapbox**: Free tier includes 50,000 map loads per month

Your Location Gaming Platform should now be live and accessible to users worldwide! 🚀
