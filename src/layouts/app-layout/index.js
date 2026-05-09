import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
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
  Alert,
  Button,
} from "antd";
import IntlMessage from 'components/util-components/IntlMessage';

import {onCurrentRouteInfo} from '../../redux/actions/Lrn';
import { signOutSuccess } from '../../redux/actions/Auth';
import { onStoppingImpersonationProfile } from '../../redux/actions/Grant';
import { APP_PREFIX_PATH } from '../../configs/AppConfig';

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


export const AppLayout = ({
  navCollapsed,
  navType,
  location,
  direction,
  dynamicUpperMainNavigation,
  onCurrentRouteInfo,
  onStoppingImpersonationProfile,
  signOutSuccess,
  user
}) => {
  const navigate = useNavigate();
  // Here we figure out the proper general submenu based on the url location we are hitting
  let currentRouteInfo;
  dynamicUpperMainNavigation?.forEach(singleFullMenu => {    
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

  const handleStopImpersonation = async () => {
    await onStoppingImpersonationProfile();
    signOutSuccess();
    window.close();
    window.setTimeout(() => {
      navigate(`${APP_PREFIX_PATH}/login`, { replace: true });
    }, 150);
  };

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
      {user?.impersonation?.isImpersonating && (
        <Alert
          type="warning"
          showIcon
          banner
          title={(
            <span>
              <IntlMessage id="admin.tools.impersonation.banner" />
              {user?.communicationName ? `: ${user.communicationName}` : ''}
            </span>
          )}
          action={(
            <Button size="small" onClick={handleStopImpersonation}>
              <IntlMessage id="admin.tools.impersonation.stop" />
            </Button>
          )}
        />
      )}
			
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
    onCurrentRouteInfo: onCurrentRouteInfo,
    onStoppingImpersonationProfile,
    signOutSuccess
	}, dispatch)
}

const mapStateToProps = ({ theme, lrn, grant }) => { 
  const {dynamicUpperMainNavigation} = lrn
  const { user } = grant;
  const { navCollapsed, navType, locale } =  theme;
  return { navCollapsed, navType, locale, dynamicUpperMainNavigation, user }
};

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(AppLayout));
