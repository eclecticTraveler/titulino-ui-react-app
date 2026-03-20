import React from 'react';
import { Pie } from '@ant-design/plots';
import { Card } from 'antd';
import { connect } from 'react-redux';
import IntlMessage from "components/util-components/IntlMessage";

const PieGraph = (props) => {
  const { localizedTitle, graphData, passedValue, passedType, currentTheme } = props;
  const isDark = currentTheme === 'dark';
  const labelColor = isDark ? '#b4bed2' : '#000';
    const locale = true;
    const setLocale = (isLocaleOn, localeKey) => {
      return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
    };

  const pieData = graphData?.map(item => ({
    type: item[passedType],
    value: item[passedValue],
  })) || [];


  const config = {
    data: pieData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    theme: isDark ? 'classicDark' : 'classic',
    label: {
      text: ({ type, value }) => `${type}: ${value}%`,
      position: 'outside',
      style: { fill: labelColor },
    },
    interaction: {
      elementHighlight: true,
      legendFilter: true,
    },
    legend: {
      color: { itemLabelFill: labelColor },
    },
    color: ['#e35aff', '#3e82f7'],
  };

  const title = localizedTitle || "unavailable";
  return (
    <div>	
      <Card bordered={true} title={setLocale(locale, title)}>
        <Pie {...config} />
      </Card>	
    </div>
  )
};

const mapStateToProps = ({ theme }) => ({ currentTheme: theme.currentTheme });
export default connect(mapStateToProps)(PieGraph);
