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

  async evaluateCaptureForTrigger(screenshot, blocklist) {
    await delay(500); // Simulate processing time
    
    // Mock evaluation - randomly trigger some blocklist items
    const triggers = {};
    
    blocklist.forEach(item => {
      // Simulate detection logic
      const websiteTrigger = Math.random() > 0.7; // 30% chance
      const intentTrigger = Math.random() > 0.8; // 20% chance
      
      triggers[item.website] = websiteTrigger;
      triggers[item.intent] = intentTrigger;
    });
    
    return triggers;
  },

  async deliverStimulus(pavlokToken, triggerReason) {
    await delay(300); // Simulate stimulus delivery
    
    console.log(`Mock stimulus delivered for: ${triggerReason}`);
    
    return {
      success: true,
      message: `Stimulus delivered successfully for ${triggerReason}`
    };
  }
};