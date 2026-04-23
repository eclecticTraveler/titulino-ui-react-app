import React from 'react';
import { Heatmap } from '@ant-design/plots';
import { Card, Empty } from 'antd';
import { connect } from 'react-redux';
import IntlMessage from "components/util-components/IntlMessage";

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const LoginFootprintHeatmapGraph = ({
  localizedTitle,
  heatmapData = [],
  currentTheme,
  hideCard,
  emptyDescriptionKey
}) => {
  const isDark = currentTheme === 'dark';
  const axisLabelColor = isDark ? '#b4bed2' : '#1f2937';
  const tooltipBackgroundColor = isDark ? 'rgba(15, 23, 42, 0.96)' : '#ffffff';
  const tooltipTextColor = isDark ? '#f8fafc' : '#1f2937';
  const tooltipBorderColor = isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)';
  const tooltipBoxShadow = isDark ? '0 8px 20px rgba(0, 0, 0, 0.35)' : '0 8px 20px rgba(0, 0, 0, 0.12)';
  const activeData = (heatmapData || []).filter(item => Number(item?.count) > 0);

  const emptyContent = (
    <Empty
      description={<IntlMessage id={emptyDescriptionKey || "admin.dashboard.insights.trends.noData"} />}
      style={{ padding: 40 }}
    />
  );

  if (activeData.length === 0) {
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
    min-width: 180px;
    padding: 10px 12px;
    border-radius: 6px;
    background: ${tooltipBackgroundColor};
    color: ${tooltipTextColor};
    border: 1px solid ${tooltipBorderColor};
    box-shadow: ${tooltipBoxShadow};
    line-height: 1.45;
  `;

  const config = {
    data: heatmapData,
    height: 320,
    autoFit: true,
    xField: 'date',
    yField: 'hour',
    colorField: 'count',
    mark: 'cell',
    theme: isDark ? 'classicDark' : 'classic',
    style: { inset: 0.5 },
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
    interaction: {
      tooltip: {
        render: (e, { title, items }) => {
          const item = items?.[0];
          const datum = item?.data || item?.datum || {};
          const hourLabel = datum?.hourLabel || `${String(datum?.hour ?? title).padStart(2, '0')}:00 UTC`;
          const count = datum?.count ?? item?.value ?? 0;

          return `
            <div style="${tooltipStyle}">
              <strong>${escapeHtml(datum?.date || title)}</strong><br/>
              <span>${escapeHtml(hourLabel)}</span><br/>
              <span>${escapeHtml(count)} logins</span>
            </div>
          `;
        },
      },
    },
  };

  const chartContent = <Heatmap {...config} />;

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
export default connect(mapStateToProps)(LoginFootprintHeatmapGraph);
