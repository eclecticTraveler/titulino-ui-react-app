import React from "react";
import { Layout } from 'antd';
import { connect } from 'react-redux';
import { SIDE_NAV_WIDTH, SIDE_NAV_DARK, NAV_TYPE_SIDE } from '../../constants/ThemeConstant';
import { Scrollbars } from 'react-custom-scrollbars-2';
import MenuContent from './MenuContent'
import Title from '../../components/layout-components/Title';
import WidgetAction from '../../components/shared-components/WidgetAction';
import DonationCenter from "components/shared-components/DonationCenter";
import { env } from "configs/EnvironmentConfig";
import ShoppingCenter from "components/shared-components/Shopping";

const { Sider } = Layout;

export const SideNav = ({navColor, navTitle, navCollapsed, sideNavTheme, routeInfo, hideGroupTitle, localization = true, currentRoute, token, user }) => {
	const props = { sideNavTheme, routeInfo , hideGroupTitle, localization, currentRoute, token, user}
	let hexColor = navColor ? navColor : "#3ca292";

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
				{(token && user?.contactId && env.IS_SHOPPING_UX_ON) ?
				<ShoppingCenter isCollapsed={navCollapsed}/> :
				<DonationCenter isCollapsed={navCollapsed}/>
				}
			</Scrollbars>
		</Sider>
	)
}

const mapStateToProps = ({ theme, lrn, auth, grant }) => {
	const {currentRoute} = lrn;
	const { token } = auth;
	const { user } = grant;
	const { navCollapsed, sideNavTheme } =  theme;
	return { navCollapsed, sideNavTheme, currentRoute, token, user }
};

export default connect(mapStateToProps)(SideNav);
