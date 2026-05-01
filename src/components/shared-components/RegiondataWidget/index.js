import React, { useMemo, useState } from "react";
import { Card, Row, Col, Badge, Grid } from "antd";
import PropTypes from "prop-types";
import { geoMercator, geoPath } from "d3-geo";
import { feature as topojsonFeature } from "topojson-client";
import ReactTooltip from "react-tooltip";
import WorldMap from "assets/maps/world-countries-sans-antarctica.json";
import utils from "utils";
import Flag from "react-world-flags";

const { useBreakpoint } = Grid;
const geoUrl = WorldMap;
const mapColor = "#F5F4F6";
const hoverPercentage = -10;
const mapHeight = 580;
const mapWidth = 1000;
const worldVerticalOffset = 62;

const getHighlightedRegion = (name, data) => {
  if (data.length > 0 || name) {
    for (let i = 0; i < data.length; i++) {
      const elm = data[i];
      if (
        name === elm.name ||
        name === elm.nativeName ||
        name === elm.name?.replaceAll(" ", "") ||
        name === elm.nativeName?.replaceAll(" ", "")
      ) {
        return elm.color;
      }
    }
    return mapColor;
  }
  return mapColor;
};

const getRegionHoverColor = (name, data) => {
  if (data.length > 0 || name) {
    for (let i = 0; i < data.length; i++) {
      const elm = data[i];
      if (
        name === elm.name ||
        name === elm.nativeName ||
        name === elm.name?.replaceAll(" ", "") ||
        name === elm.nativeName?.replaceAll(" ", "")
      ) {
        return utils.shadeColor(elm.color, hoverPercentage);
      }
    }
    return utils.shadeColor(mapColor, hoverPercentage);
  }
  return utils.shadeColor(mapColor, hoverPercentage);
};

const getRegionValue = (name, data) => {
  if (data.length > 0 || name) {
    for (let i = 0; i < data.length; i++) {
      const elm = data[i];
      if (
        name === elm.name ||
        name === elm.nativeName ||
        name === elm.name?.replaceAll(" ", "") ||
        name === elm.nativeName?.replaceAll(" ", "")
      ) {
        return (
          <>
            <Flag code={elm?.countryId} style={{ width: 20, marginRight: 10 }} />
            {`${elm.nativeName} — ${elm.count ?? elm.value}`}
          </>
        );
      }
    }
    return "";
  }
  return "";
};

const getProjectionConfig = (mapType) => {
  switch (mapType) {
    case "world":
      return { scale: 145, center: [0, 0] };
    case "AR":
      return { scale: 780, center: [-60, -37] };
    case "BO":
      return { scale: 1450, center: [-65, -17] };
    case "BR":
      return { scale: 580, center: [-55, -13] };
    case "CL":
      return { scale: 800, center: [-68, -35] };
    case "CO":
      return { scale: 1450, center: [-70, 3] };
    case "PY":
      return { scale: 3000, center: [-58, -24] };
    case "PE":
      return { scale: 1500, center: [-75, -9] };
    case "CA":
      return { scale: 560, center: [-90, 53] };
    case "MX":
      return { scale: 1550, center: [-100, 23] };
    case "US":
      return { scale: 650, center: [-105, 40] };
    case "CR":
      return { scale: 7000, center: [-84, 9.6] };
    case "UY":
      return { scale: 4500, center: [-56, -33] };
    case "VE":
      return { scale: 2000, center: [-66, 6.3] };
    case "GT":
      return { scale: 8000, center: [-90.2, 15.3] };
    case "DO":
    case "PR":
      return { scale: 10000, center: [-70.1, 18.7] };
    case "EC":
      return { scale: 4000, center: [-78, -2] };
    case "SV":
      return { scale: 15000, center: [-88.8, 13.6] };
    case "IT":
      return { scale: 2550, center: [13, 41] };
    case "FR":
      return { scale: 2550, center: [3, 45] };
    case "ES":
      return { scale: 2550, center: [-3, 38] };
    case "HN":
      return { scale: 6550, center: [-86.3, 14.5] };
    case "NI":
      return { scale: 6050, center: [-85, 12.9] };
    case "PA":
      return { scale: 7550, center: [-80, 8] };
    case "GI":
      return { scale: 100, center: [-55, 0] };
    case "JP":
      return { scale: 1620, center: [137, 36] };
    case "CU":
      return { scale: 4000, center: [-79, 21] };
    default:
      return { scale: 100, center: [-55, -20] };
  }
};

/**
 * Converts a mapSource (TopoJSON or GeoJSON) into an array of GeoJSON features.
 */
const getMapFeatures = (mapSource, mapType) => {
  if (!mapSource) {
    return [];
  }

  // Already a GeoJSON FeatureCollection
  if (mapSource.type === "FeatureCollection" && Array.isArray(mapSource.features)) {
    return mapSource.features;
  }

  // TopoJSON — convert to GeoJSON
  if (mapSource.type === "Topology" && mapSource.objects) {
    const objectKeys = Object.keys(mapSource.objects);
    if (objectKeys.length === 0) {
      return [];
    }

    // For world maps, prefer an object key containing "countries"
    const preferredObjectKey =
      mapType === "world"
        ? objectKeys.find((key) => key.toLowerCase().includes("countries")) || objectKeys[0]
        : objectKeys[0];

    const converted = topojsonFeature(mapSource, mapSource.objects[preferredObjectKey]);

    if (converted?.type === "FeatureCollection" && Array.isArray(converted.features)) {
      return converted.features;
    }
    if (converted?.type === "Feature") {
      return [converted];
    }
  }

  return [];
};

/**
 * Extracts the display name from a GeoJSON feature.
 * World maps use properties.name; country subdivision maps may use NAME_1.
 */
const getFeatureRegionName = (geoFeature, mapType) => {
  const props = geoFeature?.properties;
  if (!props) return "";
  if (mapType === "world") return props.name || "";
  return props.NAME_1 || props.name || "";
};

const MapChart = ({ setTooltipContent, data, mapSource, mapType }) => {
  const [hoveredRegionName, setHoveredRegionName] = useState("");
  const projectionConfig = getProjectionConfig(mapType);
  const features = useMemo(() => getMapFeatures(mapSource, mapType), [mapSource, mapType]);

  const pathGenerator = useMemo(() => {
    const projection = geoMercator()
      .scale(projectionConfig?.scale || 100)
      .center(projectionConfig?.center || [0, 0])
      .translate([mapWidth / 2, mapHeight / 2]);

    return geoPath().projection(projection);
  }, [projectionConfig]);

  return (
    <div style={{ transform: mapType === "world" ? `translateY(${worldVerticalOffset}px)` : "none" }}>
      <svg
        data-tip=""
        width="100%"
        height={mapHeight}
        viewBox={`0 0 ${mapWidth} ${mapHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {features.map((geoFeature, index) => {
          const geoName = getFeatureRegionName(geoFeature, mapType);
          const pathData = pathGenerator(geoFeature);

          if (!pathData) {
            return null;
          }

          const isHovered = hoveredRegionName === geoName;
          const fill = isHovered
            ? getRegionHoverColor(geoName, data)
            : getHighlightedRegion(geoName, data);

          return (
            <path
              key={`${geoFeature?.id ?? geoName}-${index}`}
              d={pathData}
              fill={fill}
              stroke="#D6D6DA"
              strokeWidth={0.75}
              onMouseEnter={() => {
                setHoveredRegionName(geoName);
                setTooltipContent(getRegionValue(geoName, data));
              }}
              onMouseLeave={() => {
                setHoveredRegionName("");
                setTooltipContent("");
              }}
              style={{ cursor: "pointer", transition: "fill 120ms ease-in-out" }}
            />
          );
        })}
      </svg>
    </div>
  );
};

const Map = (props) => {
  const { data, mapSource, mapType } = props;
  const [content, setContent] = useState("");
  return (
    <>
      <MapChart data={data} mapSource={mapSource} mapType={mapType} setTooltipContent={setContent} />
      <ReactTooltip>{content}</ReactTooltip>
    </>
  );
};

const renderDataList = (data) => {
  const list = data?.map((elm) => (
    <div className="d-flex align-items-center justify-content-between mb-3" key={elm?.name}>
      <div className="d-flex align-items-center">
        <Badge color={elm?.color} style={{ marginRight: 10 }} />
        <Flag code={elm?.countryId} style={{ width: 20, marginRight: 10 }} />
        <span className="text-gray-light">{elm?.nativeName}</span>
      </div>
      <span className="font-weight-bold text-dark">{elm?.value}</span>
    </div>
  ));
  return list;
};

export const RegiondataWidget = (props) => {
  const { data = [], mapSource = geoUrl, mapType = "world", title, content, list } = props;
  const isMobile = !utils.getBreakPoint(useBreakpoint()).includes("lg");
  return (
    <Card styles={{ body: { padding: 0 } }}>
      <Row>
        <Col xs={24} sm={24} md={24} lg={7} className="border-right">
          <div className="d-flex flex-column p-3 justify-content-between">
            <div>{title && <h4 className="font-weight-bold">{title}</h4>}</div>
            <div>{content}</div>
            <div>{list ? list : renderDataList(data)}</div>
          </div>
        </Col>
        <Col xs={24} sm={24} md={24} lg={17}>
          <div className="d-flex flex-column justify-content-center" style={{ minHeight: isMobile ? 200 : 435 }}>
            <div className="p-3 w-100">
              <Map data={data} mapSource={mapSource} mapType={mapType} />
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

RegiondataWidget.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  data: PropTypes.array,
  mapSource: PropTypes.object,
  mapType: PropTypes.string,
  content: PropTypes.element,
  list: PropTypes.element,
};

export default RegiondataWidget;