import React from 'react';
import { Liquid } from '@ant-design/plots';

export const LiquidPercent = (props) => {
  const { percent = 0.0 } = props;

  const config = {
    percent: percent,
    outline: {
      border: 4,
      distance: 8,
    },
    wave: {
      length: 328,
    }
  };

  return <Liquid {...config} />; 
};

export default LiquidPercent;

