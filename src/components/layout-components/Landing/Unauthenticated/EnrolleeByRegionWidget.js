import React, {Component} from 'react'
import { Row, Col, Card } from 'antd';
import RegiondataWidget from 'components/shared-components/RegiondataWidget';

export const regionData = [
	{
		color: '#3e82f7',
		name: 'United States of America',
		value: '37.61%'
  	},
  	{
		color: '#04d182',
		name: 'Brazil',
		value: '16.79%'
  	},
 	 {
		color: '#ffc542',
		name: 'India',
		value: '12.42%'
 	},
  	{
		color: '#fa8c16',
		name: 'China',
		value: '9.85%'
	},
	{
		color: '#ff6b72',
		name: 'Malaysia',
		value: '7.68%'
	},
	{
		color: '#a461d8',
		name: 'Thailand',
		value: '5.11%'
	}
]

const rederRegionTopEntrance = (
	<div className="mb-4">
	  <div className="d-flex align-items-center">
		{/* <Avatar size={20} src="/img/flags/us.png"/> */}
		<h2 className="mb-0 ml-2 font-weight-bold">37.61%</h2>
	  </div>
	  <span className="text-muted">Top entrance region</span>
	</div>
  )

export const EnrolleeByRegionWidget = ({enrolleeRegionData}) => {
	console.log("enrolleeRegionData", enrolleeRegionData)   
	return (
	  <>
		<RegiondataWidget 
			title="Our Students by Region"
			data={enrolleeRegionData}
			// content={rederRegionTopEntrance}
		/>
	  </>
	)
  }
  
  export default EnrolleeByRegionWidget
