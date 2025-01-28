import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Pie } from '@ant-design/plots';
import { Card } from 'antd';
import IntlMessage from "components/util-components/IntlMessage";

const PieGraph = (props) => {
  const { localizedTitle, graphData, passedValue, passedType } = props;
    const locale = true;
    const setLocale = (isLocaleOn, localeKey) => {
      return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
    };

  const pieData = graphData?.map(item => ({
    type: item[passedType],
    value: item[passedValue],
  })) || [];


  const config = {
    appendPadding: 10,
    data: pieData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: ({ type, value }) => `${type}: ${value}%`, // Dynamic label content
    },
    interactions: [
      { type: 'pie-legend-active' },
      { type: 'element-active' },
    ],
    color: ['#e35aff', '#3e82f7'], // Custom color palette for your dataset
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

export default PieGraph;
