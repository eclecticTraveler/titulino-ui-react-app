import React from "react";
import { Layout } from 'antd';
import { connect } from 'react-redux';
import { SIDE_NAV_WIDTH, SIDE_NAV_DARK, NAV_TYPE_SIDE } from '../../constants/ThemeConstant';
import { Scrollbars } from 'react-custom-scrollbars';
import MenuContent from './MenuContent'
import Title from '../../components/layout-components/Title';
import WidgetAction from '../../components/shared-components/WidgetAction';

const { Sider } = Layout;

export const SideNav = ({navColor, navTitle, navCollapsed, sideNavTheme, routeInfo, hideGroupTitle, localization = true, currentRoute }) => {
	const props = { sideNavTheme, routeInfo , hideGroupTitle, localization, currentRoute}
	let hexColor = navColor ? navColor : "#3ca292";
	console.log("POSS", sideNavTheme)
	return (
		<Sider 
			className={`side-nav side-nav--alt ${sideNavTheme === SIDE_NAV_DARK? 'side-nav-dark' : ''}`} 
			width={SIDE_NAV_WIDTH} 
			collapsed={navCollapsed}
		>

			<Scrollbars autoHide>
				<Title title={currentRoute?.sideTitle} color={currentRoute?.color ?? hexColor} prefix={currentRoute?.course} isCollapsed={navCollapsed}/>
				
				<MenuContent 
					type={NAV_TYPE_SIDE} 
					{...props}
				/>

				<WidgetAction isCollapsed={navCollapsed}/>
			</Scrollbars>
		</Sider>
	)
}

const mapStateToProps = ({ theme, lrn }) => {
	const {currentRoute} = lrn;
	const { navCollapsed, sideNavTheme } =  theme;
	return { navCollapsed, sideNavTheme, currentRoute }
};

export default connect(mapStateToProps)(SideNav);
