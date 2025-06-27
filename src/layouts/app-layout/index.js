import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import SideNav from '../../components/layout-components/SideNav';
import TopNav from '../../components/layout-components/TopNav';
import Loading from '../../components/shared-components/Loading';
import MobileNav from '../../components/layout-components/MobileNav'
import HeaderNav from '../../components/layout-components/HeaderNav';
import PageHeader from '../../components/layout-components/PageHeader';
import Footer from 'components/layout-components/Footer';
import AppViews from '../../views/app-views';
import {
  Layout,
  Grid,
} from "antd";

import {onCurrentRouteInfo} from '../../redux/actions/Lrn';
import mainNavigationConfig from "../../configs/MainNavigationConfig";

import { 
  SIDE_NAV_WIDTH, 
  SIDE_NAV_COLLAPSED_WIDTH,
  NAV_TYPE_SIDE,
  NAV_TYPE_TOP,
  DIR_RTL,
  DIR_LTR
} from '../../constants/ThemeConstant';
import utils from '../../utils';
import { useThemeSwitcher } from "react-css-theme-switcher";

const { Content } = Layout;
const { useBreakpoint } = Grid;


export const AppLayout = ({ navCollapsed, navType, location, direction, dynamicUpperMainNavigation, onCurrentRouteInfo }) => {
  // Here we figure out the proper general submenu based on the url location we are hitting
  let currentRouteInfo;
  dynamicUpperMainNavigation?.forEach(singleFullMenu => {
    // if(singleFullMenu?.path === location?.pathname){
    if(location?.pathname.includes(singleFullMenu?.path)){
      currentRouteInfo = singleFullMenu;
      onCurrentRouteInfo(currentRouteInfo);
    }
  });

  const screens = utils.getBreakPoint(useBreakpoint());
  const isMobile = !screens.includes('md')
  const isNavSide = navType === NAV_TYPE_SIDE
  const isNavTop = navType === NAV_TYPE_TOP
  const getLayoutGutter = () => {
    if(isNavTop || isMobile) {
      return 0
    }
    return navCollapsed ? SIDE_NAV_COLLAPSED_WIDTH : SIDE_NAV_WIDTH
  }

  const { status } = useThemeSwitcher();

  if (status === 'loading') {
    return <Loading cover="page" />;
  }

  const getLayoutDirectionGutter = () => {
    if(direction === DIR_LTR) {
      return {paddingLeft: getLayoutGutter()}
    }  
    if(direction === DIR_RTL) {
      return {paddingRight: getLayoutGutter()}
    }
    return {paddingLeft: getLayoutGutter()}
  }

  return (           
		<Layout>
			<HeaderNav isMobile={isMobile} />
			
			{(isNavTop && !isMobile) ? <TopNav routeInfo={currentRouteInfo}/> : null}
			
			<Layout className="app-container">		
        {(isNavSide && !isMobile) ? <SideNav navColor={currentRouteInfo?.color} routeInfo={currentRouteInfo}/> : null }
				<Layout className="app-layout" style={getLayoutDirectionGutter()}>
					<div className={`app-content ${isNavTop ? 'layout-top-nav' : ''}`}>
						<PageHeader display={true} title={currentRouteInfo?.title} />				
						<Content>
							<AppViews />
						</Content>
					</div>
          <Footer />
				</Layout>
			</Layout>
			{isMobile && <MobileNav routeInfo={currentRouteInfo} />}
		</Layout>
  )
}

function mapDispatchToProps(dispatch){
	return bindActionCreators({
    onCurrentRouteInfo: onCurrentRouteInfo
	}, dispatch)
}

const mapStateToProps = ({ theme, lrn }) => { 
  const {dynamicUpperMainNavigation} = lrn
  const { navCollapsed, navType, locale } =  theme;
  return { navCollapsed, navType, locale, dynamicUpperMainNavigation }
};

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(AppLayout));