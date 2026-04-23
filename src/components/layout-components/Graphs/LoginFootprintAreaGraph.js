import React from 'react';
import { Area } from '@ant-design/plots';
import { Card, Empty } from 'antd';
import { connect } from 'react-redux';
import IntlMessage from "components/util-components/IntlMessage";

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const buildEmailUsageTooltipHtml = (emailUsageSummary = []) => {
  if (!Array.isArray(emailUsageSummary) || emailUsageSummary.length === 0) return '';

  return `
    <div style="margin-top: 8px;">
      <div style="font-size: 12px; opacity: 0.78; margin-bottom: 4px;">Emails used</div>
      ${emailUsageSummary.map(item => `
        <div>${escapeHtml(item?.emailId)} (${escapeHtml(item?.count ?? 0)})</div>
      `).join('')}
    </div>
  `;
};

const LoginFootprintAreaGraph = ({
  localizedTitle,
  trendData = [],
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
  const areaFill = isDark
    ? 'linear-gradient(-90deg, rgba(15, 23, 42, 0.1) 0%, rgba(34, 197, 94, 0.42) 100%)'
    : 'linear-gradient(-90deg, rgba(255, 255, 255, 0.2) 0%, rgba(21, 128, 61, 0.32) 100%)';
  const lineStroke = isDark ? '#4ade80' : '#15803d';
  const chartData = (trendData || []).filter(item => item?.date && Number(item?.count) >= 0);
  const chartDataByDate = chartData.reduce((groups, item) => {
    if (item?.date) groups[item.date] = item;
    return groups;
  }, {});

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
    min-width: 220px;
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
    height: 260,
    autoFit: true,
    xField: 'date',
    yField: 'count',
    theme: isDark ? 'classicDark' : 'classic',
    style: {
      shape: 'smooth',
      fill: areaFill
    },
    line: {
      style: {
        stroke: lineStroke,
        strokeWidth: 2.25
      }
    },
    point: {
      size: 2.5,
      style: {
        fill: lineStroke,
        stroke: isDark ? '#0f172a' : '#ffffff',
        lineWidth: 1
      }
    },
    axis: {
      x: {
        title: false,
        labelFill: axisLabelColor
      },
      y: {
        title: false,
        labelFill: axisLabelColor
      },
    },
    slider: {
      x: { labelFormatter: (d) => d }
    },
    interaction: {
      tooltip: {
        render: (e, { title, items }) => {
          const item = items?.[0];
          const fallbackDate = item?.data?.date || item?.datum?.date || title;
          const datum = chartDataByDate[fallbackDate] || item?.data || item?.datum || {};
          return `
            <div style="${tooltipStyle}">
              <strong>${escapeHtml(datum?.date || title)}</strong><br/>
              <span>${escapeHtml(datum?.count ?? item?.value ?? 0)} logins</span>
              ${buildEmailUsageTooltipHtml(datum?.emailUsageSummary)}
            </div>
          `;
        },
      },
    },
  };

  const chartContent = <Area {...config} />;

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
export default connect(mapStateToProps)(LoginFootprintAreaGraph);
