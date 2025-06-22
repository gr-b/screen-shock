import React, { useState } from 'react';
import './ConfigPage.css';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import ConfigList from './ConfigList';

const ConfigPage = ({ config, onNext }) => {
  const [allowlist, setAllowlist] = useState(config.allowlist || []);
  const [blocklist, setBlocklist] = useState(config.blocklist || []);
  const [pavlokToken, setPavlokToken] = useState('');
  const [tokenVisible, setTokenVisible] = useState(false);
  const [error, setError] = useState('');

  const handleBeginMonitoring = () => {
    if (!pavlokToken.trim()) {
      setError('Please enter your Pavlok bearer token.');
      return;
    }

    setError('');
    onNext({
      allowlist,
      blocklist,
      pavlokToken: pavlokToken.trim()
    });
  };

  const handleTokenChange = (e) => {
    setPavlokToken(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="config-page">
      <div className="page-content">
        <h1>Configure Your Monitoring</h1>
        
        <div className="config-section">
          <h2 className="section-title">It's OK if I do this..</h2>
          <p className="section-description">Websites and activities you want to encourage</p>
          <ConfigList
            items={allowlist}
            onChange={setAllowlist}
            placeholder={{
              website: 'Website (e.g., docs.google.com)',
              intent: 'Intent (e.g., writing documents)'
            }}
          />
        </div>

        <div className="config-section">
          <h2 className="section-title">Alert me when I do that</h2>
          <p className="section-description">Websites and activities you want to avoid</p>
          <ConfigList
            items={blocklist}
            onChange={setBlocklist}
            placeholder={{
              website: 'Website (e.g., facebook.com)',
              intent: 'Intent (e.g., scrolling social media)'
            }}
          />
        </div>

        <div className="config-section">
          <h2 className="section-title">Pavlok Integration</h2>
          <p className="section-description">Enter your Pavlok bearer token for stimulus delivery</p>
          <div className="token-input-group">
            <Input
              type={tokenVisible ? 'text' : 'password'}
              placeholder="Enter your Pavlok bearer token"
              value={pavlokToken}
              onChange={handleTokenChange}
              error={error}
              className="token-input"
            />
            <Button
              variant="outline"
              onClick={() => setTokenVisible(!tokenVisible)}
              className="toggle-token-btn"
            >
              {tokenVisible ? 'Hide' : 'Show'}
            </Button>
          </div>
        </div>

        <Button
          variant="primary"
          size="large"
          onClick={handleBeginMonitoring}
          className="begin-monitoring-btn"
        >
          Begin Screen Monitoring
        </Button>
      </div>
    </div>
  );
};

export default ConfigPage;