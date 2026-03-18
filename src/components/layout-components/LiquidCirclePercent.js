import React from 'react';
import { Liquid } from '@ant-design/plots';

export const LiquidPercent = (props) => {
  const { percent = 0.0 } = props;
  const normalizedPercent = Number(percent) > 1 ? Number(percent) / 100 : Number(percent || 0);

  const config = {
    percent: normalizedPercent,
    height: 360,
    autoFit: true,
    tooltip: false,
    style: {
      fill: '#4f84e3',
      stroke: '#4f84e3',
      lineWidth: 4,
      outlineBorder: 4,
      outlineDistance: 8,
      waveLength: 328,
    },
    statistic: {
      content: {
        style: {
          fontSize: '62px',
          fontWeight: 700,
          fill: '#5f5872',
        },
        formatter: () => `${(normalizedPercent * 100).toFixed(2)}%`,
      },
    },
  };

  return <Liquid {...config} />;
};

export default LiquidPercent;
