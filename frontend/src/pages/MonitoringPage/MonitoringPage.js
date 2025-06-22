import React, { useState, useEffect, useCallback } from 'react';
import './MonitoringPage.css';
import Button from '../../components/Button/Button';
import { useScreenCapture } from '../../hooks/useScreenCapture';
import { mockApi } from '../../services/mockApi';

const MonitoringPage = ({ config, onStop }) => {
  const [stats, setStats] = useState({ captures: 0, triggers: 0 });
  const [captureHistory, setCaptureHistory] = useState([]);
  const [debugExpanded, setDebugExpanded] = useState(false);
  const { isCapturing, error, startCapture, stopCapture } = useScreenCapture();

  const handleCapture = useCallback(async (base64Image) => {
    try {
      // Evaluate the capture
      const triggers = await mockApi.evaluateCaptureForTrigger(
        base64Image,
        config.blocklist,
        config.allowlist
      );

      // Update capture count
      setStats(prev => ({ ...prev, captures: prev.captures + 1 }));

      // Add to capture history for debug
      const captureData = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        image: `data:image/jpeg;base64,${base64Image}`,
        response: triggers
      };
      
      setCaptureHistory(prev => [captureData, ...prev.slice(0, 9)]); // Keep last 10

      // Check if any triggers were activated
      const activeTriggers = Object.entries(triggers).filter(([key, value]) => value);
      
      if (activeTriggers.length > 0) {
        setStats(prev => ({ ...prev, triggers: prev.triggers + 1 }));
        
        // Deliver stimulus for the first trigger only
        const triggerReason = activeTriggers[0][0];
        await mockApi.deliverStimulus(config.pavlokToken, triggerReason);
        
        console.log(`Stimulus delivered for: ${triggerReason}`);
      }
      
    } catch (error) {
      console.error('Error processing capture:', error);
    }
  }, [config.blocklist, config.allowlist, config.pavlokToken]);

  const handleStop = () => {
    stopCapture();
    onStop();
  };

  useEffect(() => {
    let mounted = true;
    
    const initializeCapture = async () => {
      if (mounted) {
        try {
          await startCapture(handleCapture);
        } catch (err) {
          console.error('Failed to start capture:', err);
        }
      }
    };

    initializeCapture();

    return () => {
      mounted = false;
      stopCapture();
    };
  }, []); // Empty dependency array to prevent double initialization

  return (
    <div className="monitoring-page">
      <div className="page-content">
        <div className="monitoring-status">
          <div className="status-indicator">
            <div className="pulse-ring"></div>
            <div className="pulse-dot"></div>
          </div>
          
          <h1>Monitoring Active</h1>
          <p className="monitoring-info">
            {isCapturing 
              ? 'Screen capture is running every 2 seconds'
              : 'Starting screen capture...'
            }
          </p>
          
          {error && (
            <p className="error-info">
              Error: {error}
            </p>
          )}
          
          <div className="stats-container">
            <div className="stat-item">
              <span className="stat-number">{stats.captures}</span>
              <span className="stat-label">Captures</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.triggers}</span>
              <span className="stat-label">Triggers</span>
            </div>
          </div>

          <Button
            variant="danger"
            size="large"
            onClick={handleStop}
            className="stop-monitoring-btn"
          >
            Stop Monitoring
          </Button>
        </div>

        {/* Debug Section */}
        <div className="debug-section">
          <Button
            variant="outline"
            onClick={() => setDebugExpanded(!debugExpanded)}
            className="debug-toggle"
          >
            {debugExpanded ? '🔼' : '🔽'} Debug Info ({captureHistory.length} captures)
          </Button>
          
          {debugExpanded && (
            <div className="debug-content">
              <h3>Recent Captures & Server Responses</h3>
              {captureHistory.length === 0 ? (
                <p className="debug-empty">No captures yet...</p>
              ) : (
                <div className="capture-grid">
                  {captureHistory.map((capture) => (
                    <div key={capture.id} className="capture-item">
                      <div className="capture-header">
                        <span className="capture-time">{capture.timestamp}</span>
                      </div>
                      <div className="capture-image">
                        <img 
                          src={capture.image} 
                          alt={`Capture at ${capture.timestamp}`}
                          loading="lazy"
                        />
                      </div>
                      <div className="capture-response">
                        <h4>Server Response:</h4>
                        <pre>{JSON.stringify(capture.response, null, 2)}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonitoringPage;