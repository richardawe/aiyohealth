# Railway Deployment Guide

This guide will walk you through deploying Aiyo Health to Railway.

## Prerequisites

1. **GitHub Account** - Your code must be in a GitHub repository
2. **Railway Account** - Sign up at [railway.app](https://railway.app)
3. **Railway CLI** - Install with `npm install -g @railway/cli`

## Step 1: Prepare Your Repository

### Repository Structure
Ensure your repository has this structure:
```
aiyohealth/
├── frontend/          # React app
├── backend/           # Flask app
├── models/            # ML models
├── railway.json       # Railway config
├── docker-compose.yml # Local dev
└── README.md
```

### Environment Files
- Copy `backend/env.production.template` to `backend/.env.production`
- Update with your production values
- **Never commit `.env` files to git**

## Step 2: Connect to Railway

### Login to Railway
```bash
railway login
```

### Initialize Project
```bash
railway init
```

### Link to Existing Project (if you created one on Railway dashboard)
```bash
railway link
```

## Step 3: Configure Services

### 1. PostgreSQL Database
- Go to Railway dashboard
- Click "New Service" → "Database" → "PostgreSQL"
- Note the connection details

### 2. Backend Service
- Click "New Service" → "GitHub Repo"
- Select your repository
- Set the root directory to `/backend`
- Configure environment variables (see below)

### 3. Environment Variables
Set these in your Railway backend service:

```bash
FLASK_ENV=production
FLASK_SECRET_KEY=your_super_secret_key_here
DATABASE_URI=postgresql://username:password@host:port/database_name
CORS_ORIGINS=https://your-app-name.railway.app
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_SAMESITE=None
```

## Step 4: Deploy Backend

### Automatic Deployment
Railway will automatically deploy when you push to your main branch.

### Manual Deployment
```bash
railway up
```

### Check Deployment
```bash
railway status
railway logs
```

## Step 5: Test Backend

### Health Check
Visit: `https://your-app-name.railway.app/api/session-debug`

You should see a JSON response indicating the backend is running.

### Test Database Connection
Check the logs to ensure the database connection is successful.

## Step 6: Deploy Frontend

### Option 1: Serve from Backend (Recommended)
1. Build your frontend locally:
   ```bash
   cd frontend
   npm run build
   ```

2. Copy the build to backend:
   ```bash
   cp -r dist ../backend/static
   ```

3. Update your Flask app to serve static files:
   ```python
   @app.route('/')
   def serve_frontend():
       return send_from_directory('static', 'index.html')
   
   @app.route('/<path:path>')
   def serve_static(path):
       return send_from_directory('static', path)
   ```

4. Redeploy backend:
   ```bash
   railway up
   ```

### Option 2: Separate Frontend Service
1. Create a new service for frontend
2. Set root directory to `/frontend`
3. Configure build command: `npm run build`
4. Set start command: `npm run preview`

## Step 7: Configure Domain

### Railway Subdomain
Your app will be available at: `https://your-app-name.railway.app`

### Custom Domain (Optional)
1. Go to your Railway service settings
2. Click "Custom Domains"
3. Add your domain
4. Update DNS records as instructed

## Step 8: Final Configuration

### Update CORS Origins
If using a custom domain, update `CORS_ORIGINS` in your environment variables.

### Test Full Application
1. Visit your app URL
2. Test user registration/login
3. Test core functionality
4. Check admin features

## Troubleshooting

### Common Issues

#### Database Connection Failed
- Check `DATABASE_URI` format
- Ensure PostgreSQL service is running
- Verify network policies

#### Frontend Not Loading
- Check if static files are being served
- Verify build output exists
- Check Railway logs for errors

#### CORS Errors
- Verify `CORS_ORIGINS` includes your domain
- Check if `supports_credentials` is set correctly

#### Environment Variables Not Loading
- Ensure variables are set in Railway dashboard
- Check variable names match your code
- Restart the service after changing variables

### Useful Commands

```bash
# Check service status
railway status

# View logs
railway logs

# Connect to service shell
railway shell

# View environment variables
railway variables

# Redeploy service
railway up
```

## Monitoring & Maintenance

### Health Checks
Railway will automatically restart your service if it becomes unhealthy.

### Logs
Monitor logs in the Railway dashboard or via CLI.

### Scaling
Railway automatically scales based on traffic. You can also set manual limits.

### Backups
PostgreSQL service includes automatic backups.

## Next Steps

After successful deployment:
1. Set up monitoring and alerting
2. Configure custom domain (if desired)
3. Set up CI/CD pipeline
4. Plan for future updates

## Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **GitHub Issues**: Create an issue in your repository 