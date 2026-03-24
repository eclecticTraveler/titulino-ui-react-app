import React from 'react';
import { Liquid } from '@ant-design/plots';

export const LiquidPercent = (props) => {
  const { percent = 0.0 } = props;
  const normalizedPercent = Number(percent) > 1 ? Number(percent) / 100 : Number(percent || 0);

  const config = {
    percent: normalizedPercent,
    height: 400,
    autoFit: true,
    tooltip: false,
    interaction: {},
    style: {
      fill: '#4f84e3',
      stroke: '#4f84e3',
      lineWidth: 4,
      outlineBorder: 4,
      outlineDistance: 8,
      waveLength: 328,
      contentFontSize: 40,
      textFontFamily: "'Archivo', sans-serif",
      textFontWeight: 500,
      textFill: '#5f5872',
    },
  };

  return <Liquid {...config} />;
};

export default LiquidPercent;

