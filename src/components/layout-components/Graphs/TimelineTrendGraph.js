import React, { useMemo } from 'react';
import { Line } from '@ant-design/plots';
import { Card } from 'antd';
import { connect } from 'react-redux';
import IntlMessage from "components/util-components/IntlMessage";

const TimelineTrendGraph = (props) => {
  const { localizedTitle, dates, lineColor, currentTheme } = props;
  const isDark = currentTheme === 'dark';
  const axisLabelColor = isDark ? '#b4bed2' : '#000';
  const color = lineColor || '#3e82f7';

  const chartData = useMemo(() => {
    if (!dates || dates.length === 0) return [];

    const counts = {};
    dates.forEach((isoStr) => {
      const day = isoStr?.substring(0, 10);
      if (day) counts[day] = (counts[day] || 0) + 1;
    });

    return Object.keys(counts)
      .sort()
      .map((day) => ({ date: day, count: counts[day] }));
  }, [dates]);

  if (chartData.length === 0) {
    return (
      <div>
        <Card variant="outlined" title={<IntlMessage id={localizedTitle || 'unavailable'} />}>
          <p style={{ textAlign: 'center', color: '#999', padding: 40 }}>
            <IntlMessage id="admin.dashboard.insights.trends.noData" />
          </p>
        </Card>
      </div>
    );
  }

  const config = {
    data: chartData,
    xField: 'date',
    yField: 'count',
    theme: isDark ? 'classicDark' : 'classic',
    smooth: true,
    style: { stroke: color, lineWidth: 2 },
    point: { shapeField: 'point', sizeField: 3, style: { fill: color } },
    axis: {
      x: {
        title: false,
        size: 40,
        labelFill: axisLabelColor,
      },
      y: {
        title: false,
        size: 36,
        labelFill: axisLabelColor,
      },
    },
    slider: {
      x: { labelFormatter: (d) => d },
      y: { labelFormatter: '~s' },
    },
    interaction: {
      tooltip: {
        render: (e, { title, items }) => {
          const item = items?.[0];
          return `<div><strong>${title}</strong><br/>${item?.name}: ${item?.value}</div>`;
        },
      },
    },
  };

  return (
    <div>
      <Card variant="outlined" title={<IntlMessage id={localizedTitle || 'unavailable'} />}>
        <Line {...config} />
      </Card>
    </div>
  );
};

const mapStateToProps = ({ theme }) => ({ currentTheme: theme.currentTheme });
export default connect(mapStateToProps)(TimelineTrendGraph);
