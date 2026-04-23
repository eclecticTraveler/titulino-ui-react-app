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

const getTooltipFields = (items = []) => (
  (items || []).reduce((fields, item) => {
    if (item?.name) fields[item.name] = item?.value;
    return fields;
  }, {})
);

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
  const chartDataByKey = chartData.reduce((groups, item) => {
    const key = `${item?.date}|${item?.hour}|${item?.segment}`;
    groups[key] = item;
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
          const tooltipFields = getTooltipFields(items);
          const rawDatum = item?.data || item?.datum || {};
          const resolvedDate = rawDatum?.date || tooltipFields?.date;
          const resolvedHourValue = rawDatum?.hour ?? tooltipFields?.hour;
          const resolvedHour = Number.isFinite(Number(resolvedHourValue)) ? Number(resolvedHourValue) : null;
          const resolvedSegment = rawDatum?.segment || tooltipFields?.segment || title;
          const chartDatum = chartDataByKey[`${resolvedDate}|${resolvedHour}|${resolvedSegment}`] || rawDatum;
          const count = chartDatum?.count ?? (Number.isFinite(Number(tooltipFields?.count)) ? Number(tooltipFields.count) : 0);
          const uniqueUsers = chartDatum?.uniqueUsers ?? 0;
          const hasKnownCountry = chartDatum?.countryOfResidency && chartDatum.countryOfResidency !== 'Unknown';
          const resolvedHourLabel = chartDatum?.hourLabel || (
            resolvedHour !== null ? `${String(resolvedHour).padStart(2, '0')}:00 UTC` : 'Unknown time'
          );

          return `
            <div style="${tooltipStyle}">
              <strong>${escapeHtml(chartDatum?.segment || resolvedSegment || 'Logins')}</strong><br/>
              <span>${escapeHtml(resolvedHourLabel)}</span><br/>
              <span style="color:${tooltipMutedColor}">${escapeHtml(chartDatum?.date || resolvedDate || title || 'Unknown date')}</span><br/>
              <span>${escapeHtml(count)} logins</span><br/>
              ${uniqueUsers ? `<span style="color:${tooltipMutedColor}">${escapeHtml(uniqueUsers)} unique users</span><br/>` : ''}
              ${chartDatum?.gender ? `<span style="color:${tooltipMutedColor}">Gender: ${escapeHtml(chartDatum.gender)}</span><br/>` : ''}
              ${chartDatum?.ageGroup && chartDatum.ageGroup !== 'Unknown' ? `<span style="color:${tooltipMutedColor}">Age group: ${escapeHtml(chartDatum.ageGroup)}</span><br/>` : ''}
              ${hasKnownCountry ? `<span style="color:${tooltipMutedColor}">${escapeHtml(chartDatum.countryOfResidency)}</span>` : ''}
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
