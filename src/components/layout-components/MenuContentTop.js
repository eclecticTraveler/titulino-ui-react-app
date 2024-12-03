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
import { onMobileNavToggle } from "../../redux/actions/Theme";
const { SubMenu } = Menu;

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
	console.log("dynamicUpperMainNavigation", dynamicUpperMainNavigation)
	return (
		<Menu mode="horizontal" style={{ backgroundColor: topNavColor }}>
		  {dynamicUpperMainNavigation
			?.filter(menu => menu?.isToDisplayInNavigation)
			?.map((menu, menuIndex) =>
			  menu?.topSubmenu?.length > 0 ? (
				<SubMenu
				  key={`menu-${menuIndex}`} // Unique key
				  title={<span className="upper-submenu-title-top">{setLocale(localization, menu?.title)}</span>}
				  icon={
					menu.icon ? (
					  <span className="upper-submenu-icon-parent">
						<IconAdapter icon={menu?.icon} iconPosition={menu?.iconPosition} />
					  </span>
					) : (
					  <span className="upper-submenu-icon-parent">
						<IconAdapter icon={menu?.iconAlt} />
					  </span>
					)
				  }
				>
				  {menu?.topSubmenu?.map((topSubMenuFirstChild, subMenuIndex) =>
					topSubMenuFirstChild?.topSubmenu?.length > 0 ? (
					  <SubMenu
						key={`subMenuFirst-${menuIndex}-${subMenuIndex}`} // Unique key
						title={<span className="upper-submenu-title">{setLocale(localization, topSubMenuFirstChild?.title)}</span>}
						icon={
							topSubMenuFirstChild?.icon ? (
							  <span className="upper-submenu-icon-parent">
								<IconAdapter icon={topSubMenuFirstChild?.icon} iconPosition={topSubMenuFirstChild?.iconPosition} />
							  </span>
							) : (
							  <span className="upper-submenu-icon-parent">
								<IconAdapter icon={topSubMenuFirstChild?.iconAlt} />
							  </span>
							)
						  }
					  >
						{topSubMenuFirstChild?.topSubmenu.map((subMenuSecond, subMenuSecondIndex) => (
						  <Menu.Item key={`subMenuSecond-${menuIndex}-${subMenuIndex}-${subMenuSecondIndex}`} className={subMenuSecond?.current ? 'current' : null} >
							<span>{setLocale(localization, subMenuSecond?.title)}</span>
							{subMenuSecond?.path ? <NavLink to={subMenuSecond?.path} /> : null}
						  </Menu.Item>
						))}
					  </SubMenu>
					) : (
					  <Menu.Item
						key={`subMenuFirst-item-${menuIndex}-${subMenuIndex}`} // Unique key
						className={topSubMenuFirstChild?.current ? 'current' : null}
						onClick={() => toggleUpperNavigationLevelSelection(topSubMenuFirstChild)}
					  >
						<IconAdapter icon={topSubMenuFirstChild?.icon} iconPosition={topSubMenuFirstChild?.iconPosition} />
						<span>{setLocale(localization, topSubMenuFirstChild?.title)}</span>
						{topSubMenuFirstChild?.path ? <NavLink to={topSubMenuFirstChild?.path} /> : null}
					  </Menu.Item>
					)
				  )}
				</SubMenu>
			  ) : (
				// Only render if there are no submenus
				menu?.topSubmenu?.length === 0 && (
				  <Menu.Item
					key={`menu-${menuIndex}`} // Unique key
					className={menu.current ? 'current' : null}
					onClick={() => toggleUpperNavigationLevelSelection(menu)}
				  >
					<IconAdapter icon={menu?.icon} iconPosition={menu?.iconPosition} />
					<span>{setLocale(localization, menu?.title)}</span>
					{menu?.path ? <NavLink to={menu?.path} /> : null}
				  </Menu.Item>
				)
			  )
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
