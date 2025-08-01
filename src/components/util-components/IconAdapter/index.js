import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Icon from "components/util-components/Icon";
import IconFallback from "components/util-components/IconFallback/index";
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';

export class IconAdapter extends Component {
	render() {
		const { className, style, icon, iconType, iconPosition } = this.props;
		switch (iconType) {
			case ICON_LIBRARY_TYPE_CONFIG.fontAwesome:
				return (
					<span className={`titulino-fontawesome side-nav-icon-adapter ${className || ''}`} style={style}>
						<FontAwesomeIcon icon={icon} />
					</span>
				)
			case ICON_LIBRARY_TYPE_CONFIG.antd:
				return (
					<span className={`titulino-antd side-nav-icon-adapter ${className || ''}`} style={style}>
						<Icon type={icon} className={className} />
					</span>
				)
			case ICON_LIBRARY_TYPE_CONFIG.hostedSvg:
			default:
				return (
					<span className={`titulino-hostedsvg side-nav-icon-adapter ${className || ''}`} style={style}>
						<IconFallback path={icon} iconPosition={iconPosition}/>
					</span>
				)
		}
	}
}

export default IconAdapter;
