import React, { useState, useEffect, useCallback } from 'react';
import './MonitoringPage.css';
import Button from '../../components/Button/Button';
import { useScreenCapture } from '../../hooks/useScreenCapture';
import { mockApi } from '../../services/mockApi';

const MonitoringPage = ({ config, onStop }) => {
  const [stats, setStats] = useState({ captures: 0, triggers: 0 });
  const { isCapturing, error, startCapture, stopCapture } = useScreenCapture();

  const handleCapture = useCallback(async (base64Image) => {
    try {
      // Evaluate the capture
      const triggers = await mockApi.evaluateCaptureForTrigger(
        base64Image,
        config.blocklist
      );

      // Update capture count
      setStats(prev => ({ ...prev, captures: prev.captures + 1 }));

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
  }, [config.blocklist, config.pavlokToken]);

  const handleStop = () => {
    stopCapture();
    onStop();
  };

  useEffect(() => {
    // Start capturing when component mounts
    startCapture(handleCapture).catch((err) => {
      console.error('Failed to start capture:', err);
      // Handle permission error or other issues
    });

    // Cleanup when component unmounts
    return () => {
      stopCapture();
    };
  }, [startCapture, stopCapture, handleCapture]);

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
      </div>
    </div>
  );
};

export default MonitoringPage;