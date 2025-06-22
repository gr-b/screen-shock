// Real API service for connecting to the backend

// No need for complex API URL logic - just use relative URLs
// Works in both development (with proxy) and production (same domain)

class ApiError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (e) {
      // If we can't parse the error response, use the default message
    }
    throw new ApiError(errorMessage, response.status, response);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return await response.text();
};

export const api = {
  async generateConfig(description) {
    const response = await fetch('/api/generate-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description })
    });
    
    return await handleResponse(response);
  },

  async evaluateCaptureForTrigger(screenshot, blocklist, allowlist) {
    const response = await fetch('/api/evaluate-capture-for-trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        screenshot,
        blocklist: blocklist.map(item => ({ website: item.website, intent: item.intent })),
        allowlist: allowlist.map(item => ({ website: item.website, intent: item.intent }))
      })
    });
    
    return await handleResponse(response);
  },

  async deliverStimulus(pavlokToken) {
    const response = await fetch('/api/deliver-stimulus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pavlok_token: pavlokToken })
    });
    
    return await handleResponse(response);
  }
};

export default api;