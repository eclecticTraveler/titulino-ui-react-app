import React from 'react';
import { Liquid } from '@ant-design/plots';

export const LiquidPercent = (props) => {
  const { percent = 0.0 } = props;

  const config = {
    percent: percent,
    width: 300,
    height: 300,
    interaction: {},
    style: {
      outlineBorder: 4,
      outlineDistance: 8,
      waveLength: 328,
      textFontSize: 36,
    },
  };

  return <Liquid {...config} />; 
};

export default LiquidPercent;

