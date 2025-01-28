import React from 'react';
import { Column } from '@ant-design/plots';
import { Card } from 'antd';
import IntlMessage from "components/util-components/IntlMessage";

const ColumnBar = (props) => {
  const { localizedTitle, graphData, passedValue, passedType, symbol } = props;
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
    color: () => generateSoberColorV2(), // Directly call the external function
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
      content: ({ value }) => `${value}${sign}`,
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      [passedValue]: {
        alias: 'Category',
      },
      [passedType]: {
        alias: 'Value',
      },
    },
  };

 
  const title = localizedTitle || "Unavailable";

  return (
    <div>
      <Card bordered={true} title={setLocale(locale, title)}>
        <Column {...config} />
      </Card>
    </div>
  );
};

export default ColumnBar;
