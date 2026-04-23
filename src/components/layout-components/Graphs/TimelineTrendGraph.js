import React, { useMemo } from 'react';
import { Area, Line } from '@ant-design/plots';
import { Card } from 'antd';
import { connect } from 'react-redux';
import IntlMessage from "components/util-components/IntlMessage";

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const toRgba = (color, alpha) => {
  if (!color) return `rgba(62, 130, 247, ${alpha})`;

  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const normalizedHex = hex.length === 3
      ? hex.split('').map((char) => char + char).join('')
      : hex.substring(0, 6);

    const red = parseInt(normalizedHex.substring(0, 2), 16);
    const green = parseInt(normalizedHex.substring(2, 4), 16);
    const blue = parseInt(normalizedHex.substring(4, 6), 16);

    if ([red, green, blue].some(Number.isNaN)) return color;
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
  }

  if (color.startsWith('rgba(')) {
    return color.replace(/rgba\(([^,]+),([^,]+),([^,]+),([^)]+)\)/, `rgba($1,$2,$3,${alpha})`);
  }

  return color;
};

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
    chartSpacingTop = 0,
    enableGradientArea = false
  } = props;
  const isDark = currentTheme === 'dark';
  const axisLabelColor = isDark ? '#b4bed2' : '#000';
  const color = lineColor || '#3e82f7';
  const areaFill = `linear-gradient(-90deg, ${isDark ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.18)'} 0%, ${toRgba(color, isDark ? 0.45 : 0.32)} 100%)`;

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
  const activeSeriesCount = hasSeries
    ? new Set(chartData.map(item => item?.[seriesField]).filter(Boolean)).size
    : 0;
  const shouldUseGradientArea = enableGradientArea && (!hasSeries || activeSeriesCount <= 1);
  const tooltipBackgroundColor = isDark ? 'rgba(15, 23, 42, 0.96)' : '#ffffff';
  const tooltipTextColor = isDark ? '#f8fafc' : '#1f2937';
  const tooltipMutedColor = isDark ? '#cbd5e1' : '#666666';
  const tooltipBorderColor = isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)';
  const tooltipBoxShadow = isDark ? '0 8px 20px rgba(0, 0, 0, 0.35)' : '0 8px 20px rgba(0, 0, 0, 0.12)';
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

  const sharedConfig = {
    data: chartData,
    xField: 'date',
    yField: 'count',
    theme: isDark ? 'classicDark' : 'classic',
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
    ...((hasSeries && !shouldUseGradientArea) ? {
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
              <div style="${tooltipStyle}">
                <strong>${escapeHtml(title)}</strong><br/>
                <span>${escapeHtml(courseTitle)}</span><br/>
                ${courseCodeId ? `<span style="color:${tooltipMutedColor}">${escapeHtml(courseCodeId)}</span><br/>` : ''}
                <span>${escapeHtml(item?.value)} activity records</span>
              </div>
            `;
          }

          return `<div style="${tooltipStyle}"><strong>${escapeHtml(title)}</strong><br/>${escapeHtml(item?.name)}: ${escapeHtml(item?.value)}</div>`;
        },
      },
    },
  };

  const config = shouldUseGradientArea
    ? {
      ...sharedConfig,
      style: {
        shape: 'smooth',
        fill: areaFill
      },
      line: {
        style: {
          stroke: color,
          strokeWidth: 2.25
        }
      },
      point: {
        size: 2.5,
        style: {
          fill: color,
          stroke: isDark ? '#0f172a' : '#ffffff',
          lineWidth: 1
        }
      }
    }
    : {
      ...sharedConfig,
      ...(hasSeries ? { colorField: seriesField } : {}),
      smooth: true,
      style: hasSeries ? { lineWidth: 2 } : { stroke: color, lineWidth: 2 },
      point: hasSeries
        ? { sizeField: 3 }
        : { shapeField: 'point', sizeField: 3, style: { fill: color } },
    };

  const chartContent = shouldUseGradientArea
    ? <Area {...config} />
    : <Line {...config} />;

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
