import React, { useMemo } from 'react';
import { Line } from '@ant-design/plots';
import { Card } from 'antd';
import { connect } from 'react-redux';
import IntlMessage from "components/util-components/IntlMessage";

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const TimelineTrendGraph = (props) => {
  const {
    localizedTitle,
    dates,
    lineColor,
    currentTheme,
    trendData,
    seriesField,
    hideCard,
    emptyDescriptionKey,
    legendPosition = 'top-right',
    chartSpacingTop = 0
  } = props;
  const isDark = currentTheme === 'dark';
  const axisLabelColor = isDark ? '#b4bed2' : '#000';
  const color = lineColor || '#3e82f7';

  const chartData = useMemo(() => {
    if (Array.isArray(trendData) && trendData.length > 0) {
      return trendData
        .filter(item => item?.date && item?.count != null)
        .map(item => ({ ...item, count: Number(item.count) || 0 }))
        .sort((a, b) => String(a.date).localeCompare(String(b.date)));
    }

    if (!dates || dates.length === 0) return [];

    const counts = {};
    dates.forEach((isoStr) => {
      const day = isoStr?.substring(0, 10);
      if (day) counts[day] = (counts[day] || 0) + 1;
    });

    return Object.keys(counts)
      .sort()
      .map((day) => ({ date: day, count: counts[day] }));
  }, [dates, trendData]);

  const emptyContent = (
    <p style={{ textAlign: 'center', color: '#999', padding: 40 }}>
      <IntlMessage id={emptyDescriptionKey || "admin.dashboard.insights.trends.noData"} />
    </p>
  );

  if (chartData.length === 0) {
    if (hideCard) return emptyContent;

    return (
      <div>
        <Card variant="outlined" title={<IntlMessage id={localizedTitle || 'unavailable'} />}>
          {emptyContent}
        </Card>
      </div>
    );
  }

  const hasSeries = !!seriesField;

  const config = {
    data: chartData,
    xField: 'date',
    yField: 'count',
    ...(hasSeries ? { colorField: seriesField } : {}),
    theme: isDark ? 'classicDark' : 'classic',
    smooth: true,
    style: hasSeries ? { lineWidth: 2 } : { stroke: color, lineWidth: 2 },
    point: hasSeries
      ? { sizeField: 3 }
      : { shapeField: 'point', sizeField: 3, style: { fill: color } },
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
    ...(hasSeries ? {
      legend: {
        color: { itemLabelFill: axisLabelColor, position: legendPosition },
      },
    } : {}),
    slider: {
      x: { labelFormatter: (d) => d },
      y: { labelFormatter: '~s' },
    },
    interaction: {
      tooltip: {
        render: (e, { title, items }) => {
          const item = items?.[0];
          const datum = item?.data || item?.datum || chartData.find(d =>
            String(d?.date) === String(title) &&
            (!seriesField || String(d?.[seriesField]) === String(item?.name))
          );
          const courseTitle = datum?.course || item?.name;
          const courseCodeId = datum?.courseCodeId;

          if (hasSeries) {
            return `
              <div>
                <strong>${escapeHtml(title)}</strong><br/>
                <span>${escapeHtml(courseTitle)}</span><br/>
                ${courseCodeId ? `<span style="color:#888">${escapeHtml(courseCodeId)}</span><br/>` : ''}
                <span>${escapeHtml(item?.value)} activity records</span>
              </div>
            `;
          }

          return `<div><strong>${escapeHtml(title)}</strong><br/>${escapeHtml(item?.name)}: ${escapeHtml(item?.value)}</div>`;
        },
      },
    },
  };

  const chartContent = <Line {...config} />;

  if (hideCard) {
    return <div style={{ paddingTop: chartSpacingTop }}>{chartContent}</div>;
  }

  return (
    <div>
      <Card variant="outlined" title={<IntlMessage id={localizedTitle || 'unavailable'} />}>
        {chartContent}
      </Card>
    </div>
  );
};

const mapStateToProps = ({ theme }) => ({ currentTheme: theme.currentTheme });
export default connect(mapStateToProps)(TimelineTrendGraph);
