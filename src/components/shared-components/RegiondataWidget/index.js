import React, { useState } from 'react'
import { Card, Row, Col, Badge, Grid } from 'antd';
import PropTypes from 'prop-types'
import {
  ComposableMap,
  Geographies,
  Geography
} from "react-simple-maps";
import ReactTooltip from 'react-tooltip'
import WorldMap from 'assets/maps/world-countries-sans-antarctica.json'
import utils from 'utils';
import Flag from "react-world-flags";

const { useBreakpoint } = Grid;
const geoUrl = WorldMap;
const mapColor = '#F5F4F6';
const hoverPercentage = -10;

const getHighlightedRegion = (name, data) => {
	if(data.length > 0 || name) {
		for (let i = 0; i < data.length; i++) {
			const elm = data[i];
			if(name === elm.name || name === elm.nativeName || (name === elm.name?.replaceAll(' ', '') || name === elm.nativeName?.replaceAll(' ', ''))) {
				return elm.color
			}
		}
		return mapColor
	}
	return mapColor
}

const getRegionHoverColor = (name, data) => {
	if(data.length > 0 || name) {
		for (let i = 0; i < data.length; i++) {
			const elm = data[i];
			if(name === elm.name || name === elm.nativeName || (name === elm.name?.replaceAll(' ', '') || name === elm.nativeName?.replaceAll(' ', ''))) {
				return utils.shadeColor(elm.color, hoverPercentage)
			}
		}
		return utils.shadeColor(mapColor, hoverPercentage)
	}
	return utils.shadeColor(mapColor, hoverPercentage)
}

const getRegionValue = (name, data) => {
	if(data.length > 0 || name) {
		for (let i = 0; i < data.length; i++) {
			const elm = data[i];
			if(name === elm.name || name === elm.nativeName || (name === elm.name?.replaceAll(' ', '') || name === elm.nativeName?.replaceAll(' ', ''))) {
				return (
				<>
				<Flag code={elm?.countryId} style={{ width: 20, marginRight: 10 }} />
				{`${elm.nativeName} — ${elm.count ?? elm.value}`}
				</>)
			}
		}
		return ''
	}
	return ''
}

const getProjectionConfig = (mapType) => {
	console.log("mapType", mapType);
	if (mapType === 'world') {
	  return {
		scale: 145, // World map scale
		center: [0, 0] 
	  };
	} else {
	  // Adjust scale and center for country maps
	  switch (mapType) {
		case 'AR':
		  return {
			scale: 650,
			center: [-60, -35]
		  };
		case 'BO':
		  return {
			scale: 950, 
			center: [-65, -17] //mas neg mas arriba // -65 mas a la derecha
		  };
		case 'BR':
		  return {
			scale: 450, 
			center: [-55, -15] 
		  };
		case 'CL':
			return {
				scale: 500, 
				center: [-53, -5] 
			};
		case 'CO':
			return {
				scale: 750, 
				center: [-70, -10] 
			};
		case 'PY':
			return {
				scale: 980, 
				center: [-55, -25] 
			};
		case 'PE':
			return {
				scale: 950, 
				center: [-75, -10] 
			};
		case 'CA':
			return {
				scale: 250, 
				center: [-55, -10] 
			};
		case 'MX':
			return {
				scale: 350, 
				center: [-80, -35] 
			};
		case 'US':
			return {
				scale: 450, 
				center: [-105, 40] 
			};
		case 'CR':
			return {
				scale: 200, 
				center: [-55, -20] 
			};
		case 'UY':
			return {
				scale: 2000, 
				center: [-55, -32] 
			};
		case 'VE':
			return {
				scale: 1350, 
				center: [-53, 5] 
			};
		default:
		  return {
			scale: 350, // Default for other countries
			center: [-55, -20] // Default center
		  };
	  }
	}
  }

const MapChart = ({ setTooltipContent, data, mapSource, mapType }) => {
	const projectionConfig = getProjectionConfig(mapType);
  	return (
		<ComposableMap style={{transform: `${mapType === 'worlda' ? 'translateY(20px)' : 'none'}`}} data-tip="" height={480} projectionConfig={projectionConfig}>
			<Geographies geography={mapSource}>
				{({ geographies }) =>
					geographies.map(geo => {
						const geoName = mapType === 'world' ? geo.properties.name : geo.properties.NAME_1 
						return (
							<Geography
								key={geo.rsmKey}
								geography={geo}
								onMouseEnter={() => {
									setTooltipContent(getRegionValue(geoName, data));
								}}
								onMouseLeave={() => {
									setTooltipContent("");
								}}
								fill={getHighlightedRegion(geoName, data)}
								stroke="#D6D6DA"
								style={{
									hover: {
										fill: getRegionHoverColor(geoName, data),
										outline: "none"
									}
								}}
							/>
						)
					})
				}
			</Geographies>
		</ComposableMap>
    )
}

const Map = props => {
	const { data, mapSource, mapType } = props
	const [content, setContent] = useState("");
	return (
    <>
      <MapChart data={data} mapSource={mapSource} mapType={mapType} setTooltipContent={setContent} />
      <ReactTooltip>{content}</ReactTooltip>
    </>
  );
}

const renderDataList = data => {
	const list = data?.map(elm => (
		<div className="d-flex align-items-center justify-content-between mb-3" key={elm?.name}>
			<div>
				<Badge color={elm?.color} />
				<Flag code={elm?.countryId} style={{ width: 20, marginRight: 10 }} />
				<span className="text-gray-light">{elm?.nativeName}</span>
			</div>
			<span className="font-weight-bold text-dark">{elm?.value}</span>
		</div>
	))
	return list
}  

export const RegiondataWidget = props => {
	const { data, mapSource, mapType, title, content, list } = props
	const isMobile = !utils.getBreakPoint(useBreakpoint()).includes('lg')
	return (
		<Card bodyStyle={{padding: 0}}>
			<Row>
				<Col xs={24} sm={24} md={24} lg={7} className="border-right">
				{/* h-100 to be used only if we incorporate adding top region or performer*/}
					<div className="d-flex flex-column p-3 justify-content-between">
						<div>{title && <h4 className="font-weight-bold">{title}</h4>}</div>
						<div>{content}</div>
						<div>{list ? list : renderDataList(data)}</div>
					</div>
				</Col>
				<Col xs={24} sm={24} md={24} lg={17}>
					<div className="d-flex flex-column justify-content-center" style={{minHeight: isMobile ? 200 : 435 }}>
						<div className="p-3 w-100" >
							<Map data={data} mapSource={mapSource} mapType={mapType}/>
						</div>
					</div>
				</Col>
			</Row>
		</Card>
	)
}

RegiondataWidget.propTypes = {
	title: PropTypes.string,
	data: PropTypes.array,
	mapSource: PropTypes.object,
	mapType: PropTypes.string,
	content: PropTypes.element,
	list: PropTypes.element
}

RegiondataWidget.defaultProps = {
	data: [],
	mapSource: geoUrl,
	mapType: 'world'
};

export default RegiondataWidget