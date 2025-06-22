import React, { useState } from 'react';
import './App.css';
import DescriptionPage from './pages/DescriptionPage/DescriptionPage';
import ConfigPage from './pages/ConfigPage/ConfigPage';
import MonitoringPage from './pages/MonitoringPage/MonitoringPage';
import LoadingOverlay from './components/LoadingOverlay/LoadingOverlay';
import { ErrorModal } from './components/Modal/Modal';
import { mockApi } from './services/mockApi';

function App() {
  const [currentPage, setCurrentPage] = useState('description');
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ show: false, message: '' });

  const handleDescriptionNext = async (description) => {
    setLoading(true);
    
    try {
      const generatedConfig = await mockApi.generateConfig(description);
      setConfig(generatedConfig);
      setCurrentPage('config');
    } catch (err) {
      throw new Error('Failed to generate configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigNext = async (finalConfig) => {
    try {
      setConfig(finalConfig);
      setCurrentPage('monitoring');
    } catch (err) {
      setError({
        show: true,
        message: 'Screen capture permission is required for monitoring to work.'
      });
    }
  };

  const handleMonitoringStop = () => {
    setCurrentPage('description');
    setConfig(null);
  };

  const handleErrorRetry = () => {
    setError({ show: false, message: '' });
    // Retry the monitoring setup
    if (config) {
      setCurrentPage('monitoring');
    }
  };

  const handleErrorClose = () => {
    setError({ show: false, message: '' });
    setCurrentPage('config');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'description':
        return <DescriptionPage onNext={handleDescriptionNext} />;
      case 'config':
        return <ConfigPage config={config} onNext={handleConfigNext} />;
      case 'monitoring':
        return <MonitoringPage config={config} onStop={handleMonitoringStop} />;
      default:
        return <DescriptionPage onNext={handleDescriptionNext} />;
    }
  };

  return (
    <div className="App">
      {renderCurrentPage()}
      
      <LoadingOverlay 
        isVisible={loading} 
        message="Processing your request..." 
      />
      
      <ErrorModal
        isOpen={error.show}
        onClose={handleErrorClose}
        onRetry={handleErrorRetry}
        message={error.message}
      />
    </div>
  );
}

export default App;