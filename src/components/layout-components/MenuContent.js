import React from "react";
import { Link } from "react-router-dom";
import { Menu, Grid } from "antd";
import IntlMessage from "../util-components/IntlMessage";
import Icon from "../util-components/Icon";
import IconFallback from "../util-components/IconFallback";
import mainNavigationConfig from "../../configs/MainNavigationConfig";
import { connect } from "react-redux";
import { SIDE_NAV_LIGHT, NAV_TYPE_SIDE } from "../../constants/ThemeConstant";
import utils from '../../utils'
import { onMobileNavToggle } from "../../redux/actions/Theme";
import { onCurrentRouteInfo } from '../../redux/actions/Lrn';

const { SubMenu } = Menu;
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
	const isMobile = !utils.getBreakPoint(useBreakpoint()).includes('lg')
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
		>
			{currentRoute?.submenu.map((menu) =>
				menu?.submenu.length > 0 ? 
				(					
					<SubMenu
						key={menu.key}
						title={setLocale(localization, menu.title)}
						icon={
							menu.icon ? (
								<Icon type={menu?.icon} />
							) :<span><IconFallback path={menu?.iconAlt} /></span> 
						}
					>
						{menu.submenu.map((subMenuFirst) =>
							subMenuFirst?.submenu.length > 0 ? (							
								<SubMenu
									key={subMenuFirst.key}
									title={setLocale(localization, subMenuFirst?.title)}
									
								>
									{
										subMenuFirst.submenu?.map((subMenuSecond) => (
											<Menu.Item key={subMenuSecond?.key} >
												<span>
													{setLocale(localization, subMenuSecond?.title)}
												</span>
												<Link onClick={() => closeMobileNav()} to={subMenuSecond.path} />
											</Menu.Item>
										))
									}
								</SubMenu>
							) : (
								<Menu.Item key={subMenuFirst.key} >
									{subMenuFirst.icon ? <Icon type={subMenuFirst.icon} /> : <IconFallback path={subMenuFirst.iconAlt} />}
									<span>{setLocale(localization, subMenuFirst.title)}</span>
									<Link onClick={() => closeMobileNav()} to={subMenuFirst.path} />
								</Menu.Item>
							)
						)
						}
					</SubMenu>
				) : (
					<Menu.Item key={menu.key}>
						{menu.icon ? <Icon type={menu?.icon} /> : null}
						{menu.iconAlt ? <IconFallback path={menu?.iconAlt}/> : null}
						{(!navCollapsed) ? <span>{setLocale(localization, menu?.title)}</span> : null}
						{menu.path ? <Link onClick={() => closeMobileNav()} to={menu.path} /> : null}
					</Menu.Item>
				)
			)}
		</Menu>
	);
};

// This is if the submenu should be place on top
const TopNavContent = (props) => {
	const { topNavColor, localization, currentRoute } = props;
	
	return (
		<Menu mode="horizontal" >
			{currentRoute?.submenu?.map((menu) =>
				menu.submenu.length > 0 ? (
					<SubMenu
						key={menu.key}
						popupClassName="top-nav-menu"
						title={
							<span>
								{menu.icon ? <Icon type={menu?.icon} /> : <span><IconFallback path={menu?.iconAlt}  iconPosition={'upperNav'}/></span>}
								<span>{setLocale(localization, menu.title)}</span>
							</span>
						}
					>
						{menu.submenu.map((subMenuFirst) =>
							subMenuFirst.submenu.length > 0 ? (
								<SubMenu
									key={subMenuFirst.key}
									icon={
										subMenuFirst.icon ? (
											<Icon type={subMenuFirst?.icon} />
										) : <span><IconFallback path={menu?.iconAlt} iconPosition={'upperNav'} /></span>
									}
									title={setLocale(localization, subMenuFirst.title)}
								>
									{subMenuFirst.submenu.map((subMenuSecond) => (
										<Menu.Item key={subMenuSecond.key}>
											<span>
												{setLocale(localization, subMenuSecond.title)}
											</span>
											<Link to={subMenuSecond.path} />
										</Menu.Item>
									))}
								</SubMenu>
							) : (
								<Menu.Item key={subMenuFirst.key}>
									{subMenuFirst.icon ? (
										<Icon type={subMenuFirst?.icon} />
									) : <span><IconFallback path={subMenuFirst?.iconAlt} iconPosition={'upperNav'}/></span>}
									<span>{setLocale(localization, subMenuFirst.title)}</span>
									<Link to={subMenuFirst.path} />
								</Menu.Item>
							)
						)}
					</SubMenu>
				) : (
					<Menu.Item key={menu.key}>
						{menu.icon ? <Icon type={menu?.icon} /> : <span><IconFallback path={menu?.iconAlt} iconPosition={'upperNav'} /></span>}
						<span>{setLocale(localization, menu?.title)}</span>
						{menu.path ? <Link to={menu.path} /> : <span><IconFallback path={menu?.iconAlt} iconPosition={'upperNav'}/></span>}
					</Menu.Item>
				)
			)}
		</Menu>
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
