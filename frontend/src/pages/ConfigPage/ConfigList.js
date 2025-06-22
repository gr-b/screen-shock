import React from 'react';
import './ConfigList.css';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';

const ConfigList = ({ items, onChange, placeholder }) => {
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  const addItem = () => {
    onChange([...items, { website: '', intent: '' }]);
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  // Ensure at least one empty item exists
  const displayItems = items.length === 0 ? [{ website: '', intent: '' }] : items;

  return (
    <div className="config-list">
      <div className="list-container">
        {displayItems.map((item, index) => (
          <div key={index} className="list-item">
            <Input
              type="text"
              placeholder={placeholder.website}
              value={item.website || ''}
              onChange={(e) => updateItem(index, 'website', e.target.value)}
              className="list-input"
            />
            <Input
              type="text"
              placeholder={placeholder.intent}
              value={item.intent || ''}
              onChange={(e) => updateItem(index, 'intent', e.target.value)}
              className="list-input"
            />
            {displayItems.length > 1 && (
              <Button
                variant="danger"
                size="medium"
                onClick={() => removeItem(index)}
                className="remove-btn"
              >
                ×
              </Button>
            )}
          </div>
        ))}
      </div>
      <Button
        variant="secondary"
        onClick={addItem}
        className="btn-add"
      >
        + Add Item
      </Button>
    </div>
  );
};

export default ConfigList;