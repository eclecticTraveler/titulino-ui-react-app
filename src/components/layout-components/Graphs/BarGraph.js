import React from 'react';
import { Bar } from '@ant-design/plots';
import { Card } from 'antd';
import { connect } from 'react-redux';
import IntlMessage from "components/util-components/IntlMessage";

const BarGraph = (props) => {
  const { localizedTitle, graphData, passedValue, passedType, symbol, currentTheme } = props;
  const isDark = currentTheme === 'dark';
  const axisLabelColor = isDark ? '#b4bed2' : '#000';
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
    xField: passedType,
    yField: 'value',
    colorField: passedType,
    theme: isDark ? 'classicDark' : 'classic',
    interaction: {
      elementHighlight: true,
    },
    axis: {
      x: { labelFill: axisLabelColor, titleFill: axisLabelColor },
      y: { labelFill: axisLabelColor, titleFill: axisLabelColor },
    },
    legend: {
      color: { itemLabelFill: axisLabelColor, position: 'top-left' },
    },
    label: {
      text: ({ value }) => `${value}${sign}`,
      position: 'inside',
      style: {
        fill: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
      },
    },
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

const mapStateToProps = ({ theme }) => ({ currentTheme: theme.currentTheme });
export default connect(mapStateToProps)(BarGraph);
