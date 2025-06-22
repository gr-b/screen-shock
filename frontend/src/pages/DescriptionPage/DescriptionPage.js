import React, { useState } from 'react';
import './DescriptionPage.css';
import Button from '../../components/Button/Button';
import { TextArea } from '../../components/Input/Input';
import api from '../../services/api';

const DescriptionPage = ({ onNext }) => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Please enter a description of what you want to monitor.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onNext(description);
    } catch (err) {
      setError('Failed to generate configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="description-page">
      <div className="page-content">
        <h1 className="rainbow-text">Get some Pavlov help to finally change your habits</h1>
        <p className="subtitle">Describe the behavior you're trying to change and choose your reinforcement signal</p>
        
        <TextArea
          label="Whenever I..."
          placeholder="watch youtube comedy videos, shock me&#10;go to Reddit, beep me"
          value={description}
          onChange={handleDescriptionChange}
          error={error}
          rows={4}
        />
        
        <Button
          variant="primary"
          size="large"
          loading={loading}
          onClick={handleSubmit}
        >
          Start Monitoring
        </Button>
      </div>
    </div>
  );
};

export default DescriptionPage;