class ScreenShockApp {
  constructor() {
    this.currentPage = 'description';
    this.mediaStream = null;
    this.captureInterval = null;
    this.config = {
      allowlist: [],
      blocklist: [],
      pavlokToken: ''
    };
    this.stats = {
      captures: 0,
      triggers: 0
    };
    
    this.initializeApp();
  }

  initializeApp() {
    this.bindEvents();
    this.showPage('description');
  }

  bindEvents() {
    // Page 1: Description
    document.getElementById('start-monitoring-btn').addEventListener('click', () => {
      this.handleStartMonitoring();
    });

    // Page 2: Configuration
    document.getElementById('add-allowlist-btn').addEventListener('click', () => {
      this.addListItem('allowlist');
    });

    document.getElementById('add-blocklist-btn').addEventListener('click', () => {
      this.addListItem('blocklist');
    });

    document.getElementById('toggle-token-btn').addEventListener('click', () => {
      this.toggleTokenVisibility();
    });

    document.getElementById('begin-monitoring-btn').addEventListener('click', () => {
      this.beginScreenMonitoring();
    });

    // Page 3: Monitoring
    document.getElementById('stop-monitoring-btn').addEventListener('click', () => {
      this.stopMonitoring();
    });

    // Modal events
    document.getElementById('retry-permission-btn').addEventListener('click', () => {
      this.hideModal();
      this.beginScreenMonitoring();
    });

    document.getElementById('close-error-btn').addEventListener('click', () => {
      this.hideModal();
      this.showPage('config');
    });
  }

  showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    document.getElementById(`${pageId}-page`).classList.add('active');
    this.currentPage = pageId;
  }

  showLoading() {
    document.getElementById('loading-overlay').classList.remove('hidden');
  }

  hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
  }

  showModal(message) {
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-dialog').classList.remove('hidden');
  }

  hideModal() {
    document.getElementById('error-dialog').classList.add('hidden');
  }

  async handleStartMonitoring() {
    const description = document.getElementById('description-input').value.trim();
    
    if (!description) {
      this.showModal('Please enter a description of what you want to monitor.');
      return;
    }

    const btn = document.getElementById('start-monitoring-btn');
    const btnText = btn.querySelector('.btn-text');
    const spinner = btn.querySelector('.spinner');
    
    btn.disabled = true;
    btnText.textContent = 'Processing...';
    spinner.classList.remove('hidden');

    try {
      const response = await fetch('/api/generate-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description })
      });

      if (!response.ok) {
        throw new Error('Failed to generate configuration');
      }

      const config = await response.json();
      this.config.allowlist = config.allowlist || [];
      this.config.blocklist = config.blocklist || [];
      
      this.populateConfigurationPage();
      this.showPage('config');
      
    } catch (error) {
      console.error('Error generating config:', error);
      this.showModal('Failed to generate configuration. Please try again.');
    } finally {
      btn.disabled = false;
      btnText.textContent = 'Start Monitoring';
      spinner.classList.add('hidden');
    }
  }

  populateConfigurationPage() {
    this.populateList('allowlist', this.config.allowlist);
    this.populateList('blocklist', this.config.blocklist);
  }

  populateList(listType, items) {
    const container = document.getElementById(`${listType}-container`);
    container.innerHTML = '';
    
    items.forEach((item, index) => {
      this.createListItem(listType, item, index);
    });

    // Add at least one empty item if list is empty
    if (items.length === 0) {
      this.addListItem(listType);
    }
  }

  createListItem(listType, item, index) {
    const container = document.getElementById(`${listType}-container`);
    const listItem = document.createElement('div');
    listItem.className = 'list-item';
    listItem.innerHTML = `
      <input type="text" placeholder="Website (e.g., facebook.com)" value="${item.website || ''}" 
             data-field="website" data-index="${index}">
      <input type="text" placeholder="Intent (e.g., scrolling social media)" value="${item.intent || ''}" 
             data-field="intent" data-index="${index}">
      <button class="remove-btn" data-index="${index}">×</button>
    `;

    // Bind events for this item
    listItem.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', (e) => {
        this.updateListItem(listType, e.target.dataset.index, e.target.dataset.field, e.target.value);
      });
    });

    listItem.querySelector('.remove-btn').addEventListener('click', (e) => {
      this.removeListItem(listType, e.target.dataset.index);
    });

    container.appendChild(listItem);
  }

  addListItem(listType) {
    const newItem = { website: '', intent: '' };
    this.config[listType].push(newItem);
    this.createListItem(listType, newItem, this.config[listType].length - 1);
  }

  updateListItem(listType, index, field, value) {
    if (this.config[listType][index]) {
      this.config[listType][index][field] = value;
    }
  }

  removeListItem(listType, index) {
    this.config[listType].splice(index, 1);
    this.populateList(listType, this.config[listType]);
  }

  toggleTokenVisibility() {
    const tokenInput = document.getElementById('pavlok-token');
    const toggleBtn = document.getElementById('toggle-token-btn');
    
    if (tokenInput.type === 'password') {
      tokenInput.type = 'text';
      toggleBtn.textContent = 'Hide';
    } else {
      tokenInput.type = 'password';
      toggleBtn.textContent = 'Show';
    }
  }

  async beginScreenMonitoring() {
    const pavlokToken = document.getElementById('pavlok-token').value.trim();
    
    if (!pavlokToken) {
      this.showModal('Please enter your Pavlok bearer token.');
      return;
    }

    this.config.pavlokToken = pavlokToken;

    try {
      // Request screen capture permission
      this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      this.showPage('monitoring');
      this.startScreenCapture();
      
    } catch (error) {
      console.error('Screen capture permission denied:', error);
      this.showModal('Screen capture permission is required for monitoring to work. Please allow access and try again.');
    }
  }

  startScreenCapture() {
    if (!this.mediaStream) return;

    const video = document.createElement('video');
    video.srcObject = this.mediaStream;
    video.play();

    video.addEventListener('loadedmetadata', () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      this.captureInterval = setInterval(async () => {
        try {
          // Draw video frame to canvas
          ctx.drawImage(video, 0, 0);
          
          // Convert to base64
          const imageData = canvas.toDataURL('image/jpeg', 0.8);
          const base64Data = imageData.split(',')[1];
          
          // Send to backend for evaluation
          await this.evaluateCapture(base64Data);
          
          // Update stats
          this.stats.captures++;
          this.updateStatsDisplay();
          
        } catch (error) {
          console.error('Error capturing screen:', error);
        }
      }, 2000); // Capture every 2 seconds
    });

    // Handle stream end
    this.mediaStream.getTracks().forEach(track => {
      track.addEventListener('ended', () => {
        this.stopMonitoring();
      });
    });
  }

  async evaluateCapture(base64Image) {
    try {
      const response = await fetch('/api/evaluate-capture-for-trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          screenshot: base64Image,
          blocklist: this.config.blocklist,
          pavlok_token: this.config.pavlokToken
        })
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate capture');
      }

      const result = await response.json();
      
      // Check if any triggers were activated
      const triggeredItems = Object.entries(result.triggers).filter(([key, value]) => value);
      
      if (triggeredItems.length > 0) {
        this.stats.triggers++;
        this.updateStatsDisplay();
        
        // Deliver stimulus (only once per trigger)
        await this.deliverStimulus(triggeredItems[0][0]);
      }
      
    } catch (error) {
      console.error('Error evaluating capture:', error);
    }
  }

  async deliverStimulus(triggerReason) {
    try {
      const response = await fetch('/api/deliver-stimulus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pavlok_token: this.config.pavlokToken,
          trigger_reason: triggerReason
        })
      });

      if (!response.ok) {
        throw new Error('Failed to deliver stimulus');
      }

      const result = await response.json();
      console.log('Stimulus delivered:', result);
      
    } catch (error) {
      console.error('Error delivering stimulus:', error);
    }
  }

  updateStatsDisplay() {
    document.getElementById('captures-count').textContent = this.stats.captures;
    document.getElementById('triggers-count').textContent = this.stats.triggers;
  }

  stopMonitoring() {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.showPage('description');
    
    // Reset stats
    this.stats = { captures: 0, triggers: 0 };
    this.updateStatsDisplay();
    
    // Clear description input
    document.getElementById('description-input').value = '';
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ScreenShockApp();
});