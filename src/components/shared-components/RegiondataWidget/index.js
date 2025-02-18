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
			scale: 780,
			center: [-60, -37]
		  };
		case 'BO':
		  return {
			scale: 1450, 
			center: [-65, -17] //mas neg mas arriba // -65 mas a la derecha
		  };
		case 'BR':
		  return {
			scale: 580, 
			center: [-55, -13] 
		  };
		case 'CL':
			return {
				scale: 800, 
				center: [-68, -35] 
			};
		case 'CO':
			return {
				scale: 1450, 
				center: [-70, 3] 
			};
		case 'PY':
			return {
				scale: 3000, 
				center: [-58, -24] 
			};
		case 'PE':
			return {
				scale: 1500, 
				center: [-75, -9] 
			};
		case 'CA':
			return {
				scale: 560, 
				center: [-90, 53] 
			};
		case 'MX':
			return {
				scale: 1550, 
				center: [-100, 23] 
			};
		case 'US':
			return {
				scale: 650, 
				center: [-105, 40] 
			};
		case 'CR':
			return {
				scale: 7000, 
				center: [-84, 9.6] 
			};
		case 'UY':
			return {
				scale: 4500, 
				center: [-56, -33] 
			};
		case 'VE':
			return {
				scale: 2000, 
				center: [-66, 6.3] 
			};
		case 'GT':
			return {
				scale: 8000, 
				center: [-90.2, 15.3] 
			};
		case 'DO':
			return {
				scale: 10000, 
				center: [-70.1, 18.7] 
			};
		case 'EC':
			return {
				scale: 4000, 
				center: [-78, -2] 
			};
		case 'SV':
			return {
				scale: 15000, 
				center: [-88.8, 13.6] 
			};		
		case 'IT':
		return {
				scale: 2550, 
				center: [13, 41] 
			};
		case 'FR':
		return {
				scale: 2550, 
				center: [3, 45] 
			};
		case 'ES':
		return {
				scale: 2550, 
				center: [-3, 38] 
			};
		case 'HN':
			return {
					scale: 6550, 
					center: [-86.3, 14.5] 
				};
		case 'NI':
			return {
					scale: 6050, 
					center: [-85, 12.9] 
				};
		case 'PA':
			return {
				scale: 7550,
				center: [-80, 8]
				};
		case 'GI':
			return {
				scale: 100,
				center: [-55, 0] 
				};
		case 'JP':
			return {
				scale: 1620,
				center: [137, 36] 
				};
		default:
		  return {
			scale: 100, // Default for other countries
			center: [-55, -20] // Default center
		  };
	  }
	}
  }

const MapChart = ({ setTooltipContent, data, mapSource, mapType }) => {
	const projectionConfig = getProjectionConfig(mapType);
  	return (
		<ComposableMap style={{transform: `${mapType === 'world' ? 'translateY(20px)' : 'none'}`}} data-tip="" height={580} projectionConfig={projectionConfig}>
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
	const { data = [], mapSource = geoUrl, mapType = 'world', title, content, list } = props
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
	title: PropTypes.oneOfType([
	  PropTypes.string,
	  PropTypes.object
	]),
	data: PropTypes.array,
	mapSource: PropTypes.object,
	mapType: PropTypes.string,
	content: PropTypes.element,
	list: PropTypes.element
  };
  
export default RegiondataWidget