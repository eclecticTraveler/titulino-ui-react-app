import React from 'react';
import { Liquid } from '@ant-design/plots';

export const LiquidStarPercent = (props) => {
  const { percent = 0.0 } = props;
    const config = {
      percent: percent,
      width: 300,
      height: 300,
      interaction: {},
      style: {
        shape: (x, y, width, height) => {
          const path = [];
          const w = Math.min(width, height);
    
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
        outlineBorder: 2,
        outlineDistance: 4,
        outlineStroke: '#FFC100',
        outlineStrokeOpacity: 0.65,
        waveLength: 328,
        fill: '#FAAD14',
        textFontSize: 36,
      },
    };
    return <Liquid {...config} />;
  };

  export default LiquidStarPercent;