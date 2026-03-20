import React from 'react';
import { Column } from '@ant-design/plots';
import { Card } from 'antd';
import { connect } from 'react-redux';
import IntlMessage from "components/util-components/IntlMessage";

const ColumnBar = (props) => {
  const { localizedTitle, graphData, passedValue, passedType, symbol, currentTheme } = props;
  const isDark = currentTheme === 'dark';
  const axisLabelColor = isDark ? '#b4bed2' : '#000';
  const locale = true;
  const sign = symbol || "";

  // Locale setting function
  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  };

  // Map data and ensure fallback if no data provided
  const columnData = graphData?.map(item => ({
    [passedType]: item[passedType],
    value: item[passedValue],
  })) || [];

  const generateSoberColor = () => {
    const randomComponent = () => Math.floor(Math.random() * 100); // Restrict to lower values for darker colors
    return `rgb(${randomComponent()}, ${randomComponent()}, ${randomComponent()})`;
  };

  const soberColors = [
    '#2C3E50', // Dark Blue-Gray
    '#34495E', // Midnight Blue
    '#7F8C8D', // Grayish
    '#5D6D7E', // Steel Blue
    '#273746', // Charcoal
    '#2E4053', // Deep Navy
    '#1C2833'  // Slate Black
  ];
  
  const generateSoberColorV2 = () => {
    return soberColors[Math.floor(Math.random() * soberColors.length)];
  };


  const config = {
    data: columnData,
    xField: passedType,
    yField: 'value',
    color: () => generateSoberColorV2(),
    theme: isDark ? 'classicDark' : 'classic',
    axis: {
      x: {
        label: {
          autoHide: true,
          autoRotate: false,
        },
        labelFill: axisLabelColor,
        titleFill: axisLabelColor,
      },
      y: { labelFill: axisLabelColor, titleFill: axisLabelColor },
    },
    legend: {
      color: { itemLabelFill: axisLabelColor },
    },
    label: {
      text: ({ value }) => `${value}${sign}`,
      position: 'inside',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    interaction: {
      elementHighlight: true,
    },
  };

 
  const title = localizedTitle || "Unavailable";

  return (
    <div>
      <Card variant="outlined" title={setLocale(locale, title)}>
        <Column {...config} />
      </Card>
    </div>
  );
};

const mapStateToProps = ({ theme }) => ({ currentTheme: theme.currentTheme });
export default connect(mapStateToProps)(ColumnBar);
