# Railway Deployment Guide

This guide explains how to deploy Screen Shock to Railway with both frontend and backend in a single container.

## Architecture

- **Single Container**: Both React frontend and FastAPI backend
- **Multi-stage Build**: Builds React app, then serves it via FastAPI
- **Static File Serving**: FastAPI serves the built React files
- **SPA Routing**: Proper handling of React Router routes

## Deployment Steps

### 1. Prepare Your Repository

Make sure your repository has the following structure:
```
screen-shock/
├── backend/
│   ├── Dockerfile
│   ├── main.py
│   ├── requirements.txt
│   └── ...
├── frontend/
│   ├── package.json
│   ├── src/
│   └── ...
├── railway.json
└── .dockerignore
```

### 2. Deploy to Railway

#### Option A: GitHub Integration (Recommended)

1. Push your code to GitHub
2. Go to [Railway](https://railway.app)
3. Create a new project
4. Connect your GitHub repository
5. Railway will automatically detect the `railway.json` and build using the Dockerfile

#### Option B: Railway CLI

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login and deploy:
   ```bash
   railway login
   railway init
   railway up
   ```

### 3. Environment Variables

Set these environment variables in Railway:

#### Required
- `OPENROUTER_API_KEY` - Your OpenRouter API key for Gemini models
- `PORT` - (Automatically set by Railway)

#### Optional
- `OPENAI_API_KEY` - If you want to use OpenAI models instead
- `PYTHONUNBUFFERED` - Set to `1` (for better logging)

### 4. Verify Deployment

1. **Health Check**: Visit `https://your-app.railway.app/health`
2. **API**: Test `https://your-app.railway.app/api/`
3. **Frontend**: Visit `https://your-app.railway.app/`

## How It Works

### Build Process

1. **Stage 1**: Node.js container builds React frontend
   - Installs npm dependencies
   - Runs `npm run build`
   - Creates optimized production bundle

2. **Stage 2**: Python container runs FastAPI backend
   - Installs Python dependencies
   - Copies backend code
   - Copies built frontend from Stage 1
   - Serves both API and static files

### Runtime Behavior

- **API Routes** (`/api/*`): Handled by FastAPI backend
- **Static Assets** (`/static/*`): Served directly by FastAPI
- **Frontend Routes** (`/*`): Served React `index.html` for SPA routing
- **Health Check** (`/health`): Returns API status

## Troubleshooting

### Build Issues

1. **Frontend build fails**:
   ```bash
   # Check if package.json exists
   ls frontend/package.json
   
   # Verify build script
   cat frontend/package.json | grep build
   ```

2. **Python dependencies fail**:
   ```bash
   # Check requirements.txt
   cat backend/requirements.txt
   ```

### Runtime Issues

1. **API not responding**:
   - Check Railway logs for Python errors
   - Verify environment variables are set
   - Test health endpoint

2. **Frontend not loading**:
   - Check if static files were copied correctly
   - Verify React build was successful
   - Check browser console for errors

3. **SPA routing not working**:
   - Ensure catch-all route is properly configured
   - Check FastAPI route order (specific routes before catch-all)

### Logs

View Railway logs:
```bash
railway logs
```

Or through the Railway dashboard.

## Production Considerations

### Performance
- Static files are served by FastAPI (efficient for small-medium apps)
- Consider CDN for larger deployments
- Enable gzip compression in FastAPI

### Security
- CORS is configured for production (`allow_origins=["*"]`)
- Non-root user in container
- Environment variables for secrets

### Monitoring
- Health check endpoint available
- Railway provides basic monitoring
- Consider adding application monitoring (Sentry, etc.)

## Cost Optimization

- **Railway Free Tier**: Suitable for development/testing
- **Paid Plans**: Required for production usage
- **Sleep Mode**: Disabled to ensure availability
- **Single Container**: More cost-effective than separate services

## Custom Domain

1. Add domain in Railway dashboard
2. Update CORS settings if needed
3. Configure DNS records as instructed by Railway