# Screen Shock - Product Requirements & Technical Design Document

## Overview
Screen Shock is a web application that monitors user screen activity and delivers stimuli (via Pavlok device) based on configurable allowlists and blocklists of websites and intents.

## Product Requirements

### Core User Flow
1. **Initial Setup**: User enters description of what they want to start/stop doing
2. **Configuration**: System generates default allowlist/blocklist, user configures Pavlok token
3. **Monitoring**: User grants screen capture permission, system monitors every 2 seconds
4. **Stimulus Delivery**: System triggers Pavlok when blocklist conditions are met

### User Interface Requirements

#### Page 1: Initial Description
- Text input field for user description
- "Start monitoring" button
- Loading spinner during backend processing

#### Page 2: Configuration Screen
- **Allowlist Section**
  - Dynamic list of items with "website" and "intent" text fields
  - "+" button to add new empty items
  - Editable existing entries
- **Blocklist Section** 
  - Same structure as allowlist
- **Pavlok Token Section**
  - Text input field for bearer token
  - Button to hide/show token field
  - Toggle functionality for security
- **Start Monitoring Button**
  - Distinctive styling to indicate final action

#### Page 3: Monitoring State
- Screen capture permission request
- Error dialog for permission failures
- Active monitoring indicator

## Technical Design

### Frontend-Backend API Interface

#### Endpoints

##### POST /api/generate-config
**Request:**
```json
{
  "description": "string - user's description of what they want to monitor"
}
```

**Response:**
```json
{
  "allowlist": [
    {"website": "string", "intent": "string"}
  ],
  "blocklist": [
    {"website": "string", "intent": "string"}
  ]
}
```

##### POST /api/evaluate-capture-for-trigger
**Request:**
```json
{
  "screenshot": "base64 encoded image",
  "blocklist": [
    {"website": "string", "intent": "string"}
  ]
}
```

**Response:**
```json
{
  "facebook.com": true,
  "scrolling social media": false,
  "youtube.com": true,
  "watching videos": true
}
```

##### POST /api/deliver-stimulus
**Request:**
```json
{
  "pavlok_token": "string",
  "trigger_reason": "string"
}
```

**Response:**
```json
{
  "success": boolean,
  "message": "string"
}
```

### Screen Capture Technical Requirements
- Use `navigator.mediaDevices.getDisplayMedia()` API
- Request permissions for screen, window, and tab capture
- Capture frequency: Every 2 seconds
- Handle permission denial gracefully
- Convert captures to base64 for API transmission

### Error Handling
- Network connectivity issues
- Screen capture permission denial
- Pavlok API failures
- Invalid configuration data

## Style Guide - Rainbow Theme

### Color Palette
```css
--rainbow-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--rainbow-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
--rainbow-accent: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
--rainbow-success: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
--rainbow-warning: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
--rainbow-danger: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
```

### Button Styling
- **Primary Buttons**: Rainbow gradient background with hover effects
- **Secondary Buttons**: Transparent with rainbow border
- **Disabled State**: Grayscale with reduced opacity
- **Hover Animation**: Gentle scale transform (1.05x) with transition

### Animation Guidelines
- **Loading Spinners**: Rotating rainbow gradient
- **Page Transitions**: Fade in/out with 300ms duration
- **Button Interactions**: 200ms ease-in-out transitions
- **Input Focus**: Rainbow border animation

### Typography
- **Headers**: Bold, high contrast against backgrounds
- **Body Text**: Dark gray (#333) for readability
- **Input Labels**: Medium weight, rainbow accent color

### Layout Principles
- **Spacing**: 8px base unit system (8, 16, 24, 32px)
- **Border Radius**: 8px for cards, 24px for buttons
- **Shadows**: Subtle rainbow-tinted shadows for depth
- **Responsive**: Mobile-first design approach

## Success Metrics
- Screen capture permission grant rate > 90%
- Configuration completion rate > 85%
- Stimulus delivery accuracy > 95%
- User session duration tracking

## Security Considerations
- Pavlok token encryption in browser storage
- Screen capture data transmission over HTTPS only
- No persistent storage of screen captures
- User consent for all data collection