import React from "react";
import { Drawer } from "antd";
import { connect } from "react-redux";
import { NAV_TYPE_SIDE } from "../../constants/ThemeConstant";
import { Scrollbars } from "react-custom-scrollbars-2";
import MenuContent from "./MenuContent";
import { onMobileNavToggle } from "../../redux/actions/Theme";
import LogoAlt from "./LogoAlt";
import Flex from "../../components/shared-components/Flex";
import { ArrowLeftOutlined } from "@ant-design/icons";
import WidgetAction from 'components/shared-components/WidgetAction';

export const MobileNav = ({
	sideNavTheme,
	mobileNav,
	onMobileNavToggle,
	routeInfo,
	hideGroupTitle,
	localization = true,
	dynamicUpperMainNavigation
}) => {
	const props = { sideNavTheme, routeInfo, hideGroupTitle, localization, dynamicUpperMainNavigation };

	const onClose = () => {
		onMobileNavToggle(false);
	};
	
	return (
		<Drawer
		placement="left"
		closable={false}
		onClose={onClose}
		visible={mobileNav}
		bodyStyle={{ padding: 5 }}
	>
		<Flex flexDirection="column" className="h-100">
			<div className="mobile-logo">
				<Flex justifyContent="between" alignItems="center">
					<LogoAlt/>

					<div className="nav-close" onClick={() => onClose()}>
						<ArrowLeftOutlined />
					</div>
				</Flex>
			</div>

			<div className="mobile-nav-menu">
				<Scrollbars autoHide>
					<MenuContent type={NAV_TYPE_SIDE} {...props} />
				</Scrollbars>
			</div>
			<div className="mobile-donate">
				<WidgetAction />			
			</div>
		</Flex>
	</Drawer>
	);
};

const mapStateToProps = ({ theme, lrn}) => {
	const {dynamicUpperMainNavigation} = lrn;
	const { navCollapsed, sideNavTheme, mobileNav } = theme;
	return { navCollapsed, sideNavTheme, mobileNav, dynamicUpperMainNavigation };
};

export default connect(mapStateToProps, { onMobileNavToggle })(MobileNav);
