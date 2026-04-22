import React from 'react';
import { Card } from 'antd';
import IntlMessage from "components/util-components/IntlMessage";

const DoubleCounterDisplayV2 = ({ localizedTitle, firstCount, secondCount, firstLabelKey, secondLabelKey }) => {
  const countOne = firstCount || 0;
  const countTwo = secondCount || 0;
  const title = localizedTitle || "unavailable";
  const percentage = countOne > 0 ? Math.min(Math.round((countTwo / countOne) * 100), 100) : 0;

  return (
    <div>
      <Card variant="outlined" title={<IntlMessage id={title} />}>
        <div className="double-count-card-v2">
          <div className="double-count-card-v2-stat">
            <div className="double-count-card-v2-number double-count-card-v2-first">{countOne}</div>
            <div className="double-count-card-v2-label"><IntlMessage id={firstLabelKey} /></div>
          </div>
          <div className="double-count-card-v2-divider" />
          <div className="double-count-card-v2-stat">
            <div className="double-count-card-v2-number double-count-card-v2-second">{countTwo}</div>
            <div className="double-count-card-v2-label"><IntlMessage id={secondLabelKey} /></div>
          </div>
        </div>
        <div className="double-count-card-v2-progress">
          <div className="double-count-card-v2-bar">
            <div className="double-count-card-v2-bar-fill" style={{ width: `${percentage}%` }} />
          </div>
          <span className="double-count-card-v2-bar-text">{percentage}%</span>
        </div>
      </Card>
    </div>
  );
};

export default DoubleCounterDisplayV2;
