import React from 'react';
import { Liquid } from '@ant-design/plots';

export const LiquidStarPercent = (props) => {
  const { percent = 0 } = props;

  const normalizedPercent = Number(percent) > 1 ? Number(percent) / 100 : Number(percent || 0);

  const config = {
    percent: normalizedPercent,
    height: 360,
    autoFit: true,
    tooltip: false,

    shape: (x, y, r) => {
      const path = [];
      const w = r * 2;

      for (let i = 0; i < 5; i++) {
        path.push([
          i === 0 ? 'M' : 'L',
          (Math.cos(((18 + i * 72) * Math.PI) / 180) * w) / 2 + x,
          (-Math.sin(((18 + i * 72) * Math.PI) / 180) * w) / 2 + y,
        ]);

        path.push([
          'L',
          (Math.cos(((54 + i * 72) * Math.PI) / 180) * w) / 4 + x,
          (-Math.sin(((54 + i * 72) * Math.PI) / 180) * w) / 4 + y,
        ]);
      }

      path.push(['Z']);
      return path;
    },

    style: {
      fill: '#FFC100',
      stroke: '#FFC100',
      strokeOpacity: 0.65,
      lineWidth: 5,
    },

    outline: {
      border: 4,
      distance: 4,
    },

    wave: {
      length: 328,
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

export default LiquidStarPercent;
