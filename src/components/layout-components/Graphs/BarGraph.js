import React from 'react';
import { Bar } from '@ant-design/plots';
import { Card } from 'antd';
import IntlMessage from "components/util-components/IntlMessage";

const BarGraph = (props) => {
  const { localizedTitle, graphData, passedValue, passedType, symbol } = props;
  const locale = true;

  // Locale setting function
  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  };
  const sign = symbol || "";
  // Mapping the data to match what the Bar chart expects
  const barData = graphData?.map(item => ({
    [passedType]: item[passedType],
    value: item[passedValue],
  })) || [];

  const config = {
    data: barData,
    xField: 'value',
    yField: passedType, // Use dynamic passedType for y-axis labels
    seriesField: passedType, // Dynamically bind series with passedType
    legend: {
      position: 'top-left',
    },
    label: {
      position: 'middle', // Label position in the middle of bars
      style: {
        fill: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
      },
      content: ({ value }) => `${value}${sign}`, // Showing percentage on top of bars
    },
    // color: ['#e35aff', '#3e82f7'], // Custom colors for your dataset
  };

  const title = localizedTitle || "Unavailable";

  return (
    <div>
      <Card bordered={true} title={setLocale(locale, title)}>
        <Bar {...config} />
      </Card>
    </div>
  );
};

export default BarGraph;
