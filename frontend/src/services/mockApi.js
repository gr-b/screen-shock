// Mock API functions for development

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  async generateConfig(description) {
    await delay(2000); // Simulate network delay
    
    // Generate mock config based on description keywords
    const allowlist = [
      { website: 'docs.google.com', intent: 'writing documents' },
      { website: 'github.com', intent: 'coding projects' },
      { website: 'stackoverflow.com', intent: 'learning programming' }
    ];
    
    const blocklist = [];
    
    // Add different blocklist items based on description content
    if (description.toLowerCase().includes('social')) {
      blocklist.push(
        { website: 'facebook.com', intent: 'scrolling social media' },
        { website: 'instagram.com', intent: 'browsing photos' },
        { website: 'twitter.com', intent: 'reading tweets' }
      );
    }
    
    if (description.toLowerCase().includes('video') || description.toLowerCase().includes('youtube')) {
      blocklist.push(
        { website: 'youtube.com', intent: 'watching videos' },
        { website: 'netflix.com', intent: 'streaming shows' }
      );
    }
    
    if (description.toLowerCase().includes('news')) {
      blocklist.push(
        { website: 'reddit.com', intent: 'browsing news' },
        { website: 'cnn.com', intent: 'reading news' }
      );
    }
    
    // Default blocklist if no specific keywords found
    if (blocklist.length === 0) {
      blocklist.push(
        { website: 'facebook.com', intent: 'social media browsing' },
        { website: 'youtube.com', intent: 'watching videos' }
      );
    }
    
    return { allowlist, blocklist };
  },

  async evaluateCaptureForTrigger(screenshot, blocklist, allowlist) {
    await delay(500); // Simulate processing time
    
    // Mock evaluation - randomly trigger some blocklist and allowlist items
    const triggers = {};
    
    // Process blocklist items
    blocklist.forEach(item => {
      // Simulate detection logic - higher chance for blocklist triggers
      const websiteTrigger = Math.random() > 0.6; // 40% chance
      const intentTrigger = Math.random() > 0.7; // 30% chance
      
      triggers[item.website] = websiteTrigger;
      triggers[item.intent] = intentTrigger;
    });
    
    // Process allowlist items (typically lower trigger rates)
    allowlist.forEach(item => {
      // Simulate detection logic - lower chance for allowlist triggers
      const websiteTrigger = Math.random() > 0.8; // 20% chance
      const intentTrigger = Math.random() > 0.9; // 10% chance
      
      triggers[item.website] = websiteTrigger;
      triggers[item.intent] = intentTrigger;
    });
    
    return triggers;
  },

  async deliverStimulus(pavlokToken) {
    await delay(300); // Simulate stimulus delivery
    
    console.log(`Mock stimulus delivered with token: ${pavlokToken.substring(0, 10)}...`);
    
    return {
      success: true,
      message: 'Stimulus delivered successfully'
    };
  }
};