# Screen Shock

A web application that monitors user screen activity and delivers stimuli via Pavlok device based on configurable allowlists and blocklists.

## Architecture

- **Frontend**: React application with rainbow-themed UI
- **Backend**: FastAPI server with OpenAI GPT-4 vision integration
- **Features**: Screen capture, AI-powered content analysis, Pavlok integration

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8 or higher
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install fastapi uvicorn litellm python-multipart
   ```

3. Set your OpenAI API key:
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   ```

4. Run the backend server:
   ```bash
   python main.py
   ```
   
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```
   
   The frontend will be available at `http://localhost:3000`

## API Endpoints

### POST /api/generate-config
Generate allowlist and blocklist based on user description.

**Request:**
```json
{
  "description": "I want to focus on programming for the next 2 hours"
}
```

**Response:**
```json
{
  "allowlist": [
    {"website": "github.com", "intent": "all"},
    {"website": "stackoverflow.com", "intent": "all"}
  ],
  "blocklist": [
    {"website": "facebook.com", "intent": "all"},
    {"website": "youtube.com", "intent": "entertainment videos"}
  ]
}
```

### POST /api/evaluate-capture-for-trigger
Evaluate a screenshot against allowlist and blocklist.

**Request:**
```json
{
  "screenshot": "base64-encoded-image",
  "allowlist": [...],
  "blocklist": [...]
}
```

**Response:**
```json
{
  "facebook.com": true,
  "scrolling social media": false,
  "github.com": false
}
```

### POST /api/deliver-stimulus
Deliver stimulus via Pavlok device.

**Request:**
```json
{
  "pavlok_token": "your-pavlok-token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stimulus delivered successfully"
}
```

## Features

### ✨ Rainbow-Themed UI
- Animated gradient backgrounds
- Rainbow buttons with shimmer effects
- Glass morphism design
- Responsive layout

### 🖼️ Screen Monitoring
- Real-time screen capture every 2 seconds
- AI-powered content analysis using GPT-4 Vision
- Debug panel showing captures and API responses

### ⚡ Pavlok Integration
- Automatic stimulus delivery when blocklist items are detected
- Configurable token-based authentication

### 🔧 Configuration Management
- Dynamic allowlist/blocklist editing
- Smart suggestions based on user goals
- Real-time validation

## Development

### Running in Development Mode

1. Start the backend:
   ```bash
   cd backend && python main.py
   ```

2. Start the frontend:
   ```bash
   cd frontend && npm start
   ```

### Environment Variables

**Frontend (.env):**
```
REACT_APP_API_URL=http://localhost:8000
```

**Backend:**
```
OPENAI_API_KEY=your-api-key-here
```

## Troubleshooting

### CORS Issues
The backend is configured to allow requests from `http://localhost:3000`. If you're running on different ports, update the CORS configuration in `backend/main.py`.

### Screen Capture Permissions
Modern browsers require HTTPS for screen capture in production. For development, localhost is allowed.

### API Key Issues
Ensure your OpenAI API key is set and has access to GPT-4 with vision capabilities.

## Next Steps

- [ ] Implement actual Pavlok API integration
- [ ] Add user authentication
- [ ] Implement data persistence
- [ ] Add configuration presets
- [ ] Mobile app companion
