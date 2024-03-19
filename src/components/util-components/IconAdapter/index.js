import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Icon from "components/util-components/Icon";
import IconFallback from "components/util-components/IconFallback";
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';

export class IconAdapter extends Component {
	render() {
		const { className, icon, iconType, iconPosition } = this.props;
		switch (iconType) {
			case ICON_LIBRARY_TYPE_CONFIG.fontAwesome:
				return (
					<span class="titulino-fontawesome side-nav-icon-adapter"><FontAwesomeIcon icon={icon} /></span>
				)
			case ICON_LIBRARY_TYPE_CONFIG.antd:
				return (
					<span class="titulino-antd side-nav-icon-adapter"><Icon type={icon} className={className} /></span>
				)
			case ICON_LIBRARY_TYPE_CONFIG.hostedSvg:
			default:
				return (
					<span class="titulino-hostedsvg side-nav-icon-adapter"><IconFallback path={icon} iconPosition={iconPosition}/></span>
				)

		}
	}
}

export default IconAdapter
