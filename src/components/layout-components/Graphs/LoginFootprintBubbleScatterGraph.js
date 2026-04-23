import React from 'react';
import { Scatter } from '@ant-design/plots';
import { Card, Empty } from 'antd';
import { connect } from 'react-redux';
import IntlMessage from "components/util-components/IntlMessage";

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const LoginFootprintBubbleScatterGraph = ({
  localizedTitle,
  scatterData = [],
  currentTheme,
  hideCard,
  emptyDescriptionKey
}) => {
  const isDark = currentTheme === 'dark';
  const axisLabelColor = isDark ? '#b4bed2' : '#1f2937';
  const tooltipBackgroundColor = isDark ? 'rgba(15, 23, 42, 0.96)' : '#ffffff';
  const tooltipTextColor = isDark ? '#f8fafc' : '#1f2937';
  const tooltipMutedColor = isDark ? '#cbd5e1' : '#666666';
  const tooltipBorderColor = isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)';
  const tooltipBoxShadow = isDark ? '0 8px 20px rgba(0, 0, 0, 0.35)' : '0 8px 20px rgba(0, 0, 0, 0.12)';
  const chartData = (scatterData || []).filter(item => Number(item?.count) > 0);

  const emptyContent = (
    <Empty
      description={<IntlMessage id={emptyDescriptionKey || "admin.dashboard.insights.trends.noData"} />}
      style={{ padding: 40 }}
    />
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

  const tooltipStyle = `
    min-width: 210px;
    padding: 10px 12px;
    border-radius: 6px;
    background: ${tooltipBackgroundColor};
    color: ${tooltipTextColor};
    border: 1px solid ${tooltipBorderColor};
    box-shadow: ${tooltipBoxShadow};
    line-height: 1.45;
  `;

  const config = {
    data: chartData,
    height: 320,
    autoFit: true,
    xField: 'date',
    yField: 'hour',
    colorField: 'segment',
    sizeField: 'count',
    shapeField: 'point',
    theme: isDark ? 'classicDark' : 'classic',
    style: {
      fillOpacity: 0.45,
      lineWidth: 1,
    },
    scale: {
      size: { range: [5, 28] },
      y: { domain: [0, 23] }
    },
    axis: {
      x: {
        title: false,
        labelFill: axisLabelColor
      },
      y: {
        title: false,
        labelFill: axisLabelColor,
        labelFormatter: (value) => `${String(value).padStart(2, '0')}:00`
      },
    },
    legend: {
      color: {
        itemLabelFill: axisLabelColor,
        titleFill: axisLabelColor,
        position: 'top-right'
      }
    },
    slider: {
      x: { labelFormatter: (d) => d }
    },
    interaction: {
      tooltip: {
        render: (e, { title, items }) => {
          const item = items?.[0];
          const datum = item?.data || item?.datum || {};
          const count = datum?.count ?? item?.value ?? 0;
          const uniqueUsers = datum?.uniqueUsers ?? 0;

          return `
            <div style="${tooltipStyle}">
              <strong>${escapeHtml(datum?.date || title)}</strong><br/>
              <span>${escapeHtml(datum?.hourLabel || `${datum?.hour}:00 UTC`)}</span><br/>
              <span>${escapeHtml(datum?.segment || item?.name || 'Logins')}</span><br/>
              <span>${escapeHtml(count)} logins</span><br/>
              ${uniqueUsers ? `<span style="color:${tooltipMutedColor}">${escapeHtml(uniqueUsers)} unique users</span><br/>` : ''}
              ${datum?.countryOfResidency ? `<span style="color:${tooltipMutedColor}">${escapeHtml(datum.countryOfResidency)}</span>` : ''}
            </div>
          `;
        },
      },
    },
  };

  const chartContent = <Scatter {...config} />;

  if (hideCard) return chartContent;

  return (
    <div>
      <Card variant="outlined" title={<IntlMessage id={localizedTitle || 'unavailable'} />}>
        {chartContent}
      </Card>
    </div>
  );
};

const mapStateToProps = ({ theme }) => ({ currentTheme: theme.currentTheme });
export default connect(mapStateToProps)(LoginFootprintBubbleScatterGraph);
