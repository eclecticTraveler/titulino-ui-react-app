import React, {useState} from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu } from "antd";
import IntlMessage from "../util-components/IntlMessage";
import IconAdapter from "components/util-components/IconAdapter";
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import {getUpperNavigationBasedOnUserConfig, toggleUpperNavigationLevelSelection, toggleSelectedUpperNavigationTabOnLoad} from '../../redux/actions/Lrn';
import { useLocation } from 'react-router-dom';
import { env } from '../../configs/EnvironmentConfig';

const setLocale = (isLocaleOn, localeKey) =>
	isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();

const MenuContentTop = (props) => {
	const [expanded, setExpanded] = useState(false);
	const {dynamicUpperMainNavigation, topNavColor, localization, toggleUpperNavigationLevelSelection, getUpperNavigationBasedOnUserConfig} = props;
	// const { keycloak } = useKeycloak();
	// const isLoggedIn = keycloak.authenticated;
	getUpperNavigationBasedOnUserConfig();
	toggleSelectedUpperNavigationTabOnLoad(useLocation()?.pathname, dynamicUpperMainNavigation);
	// TITULINO: Verify that menu is loading well and see if there is a need to do a version of load on tab like in line 21 but in lrn redux
	// Do spefic content that is only render on log in check linke 30, this was the only way that was smooth, did not cause white page, or infinity loops and updates
	// redux, to use.
	return (						
		<Menu mode="horizontal" style={{ backgroundColor: topNavColor }}>
			{dynamicUpperMainNavigation?.filter(menu => menu.isToDisplayInNavigation).map((menu, index) =>
				<Menu.Item key={menu.key} className={menu.current ? 'current' : null } onClick={() => toggleUpperNavigationLevelSelection(menu)}>
					<IconAdapter icon={menu.icon} iconPosition={menu.iconPosition} />
					<span>{setLocale(localization, menu?.title)}</span>
					{/* TODO: TITULINO Keycloak FEATURE */}
					{menu.path ? <NavLink to={menu.path} /> : null}
					{/* {env.KC_ENABLED_FEATURE ? 
						(!menu.isFree & !isLoggedIn) ? <Link onClick={() => keycloak.login()}/> : (menu.path ? <NavLink to={menu.path}/> : null)
						:
						(menu.path ? <NavLink to={menu.path}/> : null)
					} */}
				</Menu.Item>
			)}
		</Menu>
	);
	
	
};

function mapDispatchToProps(dispatch){
	return bindActionCreators({
		getUpperNavigationBasedOnUserConfig: getUpperNavigationBasedOnUserConfig,
		toggleUpperNavigationLevelSelection: toggleUpperNavigationLevelSelection,
		toggleSelectedUpperNavigationTabOnLoad: toggleSelectedUpperNavigationTabOnLoad
	}, dispatch)
}

const mapStateToProps = ({lrn}) => {
	const {dynamicUpperMainNavigation} = lrn;
	return {dynamicUpperMainNavigation} 
};

export default connect(mapStateToProps, mapDispatchToProps)(MenuContentTop);
