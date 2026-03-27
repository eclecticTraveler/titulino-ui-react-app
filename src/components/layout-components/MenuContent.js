import React from "react";
import { Link } from "react-router-dom";
import { Menu, Grid } from "antd";
import IntlMessage from "../util-components/IntlMessage";
import IconAdapter from "components/util-components/IconAdapter";
import { connect } from "react-redux";
import { SIDE_NAV_LIGHT, NAV_TYPE_SIDE } from "../../constants/ThemeConstant";
import utils from '../../utils'
import { onMobileNavToggle } from "../../redux/actions/Theme";
import { onCurrentRouteInfo } from '../../redux/actions/Lrn';

const { useBreakpoint } = Grid;

const setLocale = (isLocaleOn, localeKey) =>
	isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();

const setDefaultOpen = (key) => {
	let keyList = [];
	let keyString = "";
	if (key) {
		const arr = key.split("-");
		for (let index = 0; index < arr.length; index++) {
			const elm = arr[index];
			index === 0 ? (keyString = elm) : (keyString = `${keyString}-${elm}`);
			keyList.push(keyString);
		}
	}
	return keyList;
};

	
const SideNavContent = (props) => {
	const { sideNavTheme, routeInfo, hideGroupTitle, localization, onMobileNavToggle, currentRoute, navCollapsed } = props;
	const isMobile = !utils.getBreakPoint(useBreakpoint()).includes('md')
	// Replacing temp variable with proper dynamic value, I could not think of a better way to do this.
	const closeMobileNav = () => {
		if (isMobile) {
			onMobileNavToggle(false)
		}
	}

	return (		
		<Menu
			theme={sideNavTheme === SIDE_NAV_LIGHT ? "light" : "dark"}
			mode="inline"
			style={{ height: "100%", borderRight: 0 }}
			defaultSelectedKeys={[routeInfo?.key]}
			defaultOpenKeys={setDefaultOpen(routeInfo?.key)}
			className={hideGroupTitle ? "hide-group-title" : ""}
			items={currentRoute?.submenu.map((menu) =>
				menu?.submenu.length > 0 ? {
					key: menu.key,
					icon: <IconAdapter icon={menu.icon} iconType={menu.iconType} />,
					label: (!navCollapsed) ? setLocale(localization, menu.title) : null,
					children: menu.submenu.map((subMenuFirst) =>
						subMenuFirst?.submenu.length > 0 ? {
							key: subMenuFirst.key,
							icon: <IconAdapter icon={subMenuFirst.icon} iconType={subMenuFirst.iconType} />,
							label: setLocale(localization, subMenuFirst?.title),
							children: subMenuFirst.submenu?.map((subMenuSecond) => ({
								key: subMenuSecond?.key,
								icon: <IconAdapter icon={subMenuSecond.icon} iconType={subMenuSecond.iconType} />,
								label: <Link onClick={() => closeMobileNav()} to={subMenuSecond.path}>{setLocale(localization, subMenuSecond?.title)}</Link>,
							})),
						} : {
							key: subMenuFirst.key,
							className: "number223",
							icon: <IconAdapter icon={subMenuFirst.icon} iconType={subMenuFirst.iconType} />,
							label: <Link onClick={() => closeMobileNav()} to={subMenuFirst.path}>{setLocale(localization, subMenuFirst.title)}</Link>,
						}
					),
				} : {
					key: menu.key,
					icon: <IconAdapter icon={menu.icon} iconType={menu.iconType} />,
					label: menu.path ? (
						<Link onClick={() => closeMobileNav()} to={menu.path}>
							{(!navCollapsed) ? setLocale(localization, menu?.title) : null}
						</Link>
					) : (
						(!navCollapsed) ? setLocale(localization, menu?.title) : null
					),
				}
			)}
		/>
	);
};


const TopNavContent = (props) => {
	const { localization, currentRoute } = props;
	
	return (
		<Menu mode="horizontal" items={currentRoute?.submenu?.map((menu) =>
			menu.submenu.length > 0 ? {
				key: menu.key,
				popupClassName: "top-nav-menu",
				icon: <IconAdapter icon={menu.icon} iconType={menu.iconType} iconPosition={'upperNav'}/>,
				label: <span className="side-nav--alt">{setLocale(localization, menu.title)}</span>,
				children: menu.submenu.map((subMenuFirst) =>
					subMenuFirst.submenu.length > 0 ? {
						key: subMenuFirst.key,
						icon: <IconAdapter icon={subMenuFirst.icon} iconType={subMenuFirst.iconType} iconPosition={'upperNav'}/>,
						label: setLocale(localization, subMenuFirst.title),
						children: subMenuFirst.submenu.map((subMenuSecond) => ({
							key: subMenuSecond.key,
							label: <Link to={subMenuSecond.path}>{setLocale(localization, subMenuSecond.title)}</Link>,
						})),
					} : {
						key: subMenuFirst.key,
						icon: <IconAdapter icon={subMenuFirst.icon} iconType={subMenuFirst.iconType} iconPosition={'upperNav'}/>,
						label: <Link to={subMenuFirst.path}>{setLocale(localization, subMenuFirst.title)}</Link>,
					}
				),
			} : {
				key: menu.key,
				icon: <IconAdapter icon={menu.icon} iconType={menu.iconType} iconPosition={'upperNav'}/>,
				label: menu.path ? (
					<Link to={menu.path}>{setLocale(localization, menu?.title)}</Link>
				) : (
					<span>{setLocale(localization, menu?.title)}<IconAdapter icon={menu?.icon} iconPosition={'upperNav'}/></span>
				),
			}
		)} />
	);
};

const MenuContent = (props) => {
	
	return props.type === NAV_TYPE_SIDE ? (
		<SideNavContent {...props} />
	) : (
		<TopNavContent {...props} />
	);
};

const mapStateToProps = ({ theme, lrn }) => {
	const {currentRoute} = lrn;
	const { sideNavTheme, topNavColor, navCollapsed } = theme;
	return { sideNavTheme, topNavColor, currentRoute, navCollapsed };
};

export default connect(mapStateToProps, { onMobileNavToggle, onCurrentRouteInfo })(MenuContent);
