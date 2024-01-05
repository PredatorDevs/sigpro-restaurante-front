import React from 'react';
import { SwatchesPicker } from 'react-color';

const ColorPicker = ({ color, onChange, width, height }) => {
    return (
        <SwatchesPicker
            width={width}
            height={height}
            color={color}
            onChange={onChange}
        />
    );
};

export default ColorPicker;