import React from 'react';

import { CloseOutlined } from '@ant-design/icons';

const Numpad = ({ onKeyPress, onDelete, valueNumpad}) => {

  const handleKeyPress = (key) => {
    onKeyPress(key);
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', margin: 10, gap: 5 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
          <button key={number} onClick={() => handleKeyPress(number)}>
            {number}
          </button>
        ))}
        <div></div>
        <button onClick={() => handleKeyPress(0)} disabled={valueNumpad === ''}
        >
          0
        </button>
        <button onClick={() => onDelete()}><CloseOutlined /></button>
      </div>
    </div>
  );
};

export default Numpad;
