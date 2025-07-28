import React, { useState } from 'react';
import { Menu, Dropdown, Avatar, Drawer } from "antd";
import { connect } from 'react-redux'
import { 
  EditOutlined, 
  SettingOutlined, 
  ShopOutlined, 
  QuestionCircleOutlined, 
  LogoutOutlined,
  CloudUploadOutlined,
  SwapOutlined,
  LoginOutlined,
  GlobalOutlined,
  UsergroupAddOutlined,
  RadarChartOutlined
} from '@ant-design/icons';
import Icon from '../../components/util-components/Icon';
import { signOut } from 'redux/actions/Auth';
import { APP_PREFIX_PATH, AUTH_PREFIX_PATH } from 'configs/AppConfig';
import { Link } from "react-router-dom";
import IntlMessage from "../../components/util-components/IntlMessage";
import ProfileNavPanelConfig from './ProfileNavPanelConfig';
import { DIR_RTL } from 'constants/ThemeConstant';
import NavSearchWrapper from './NavSearchWrapper';
import ProfileNavLanguagePanelConfig from './ProfileNavLanguagePanelConfig';
import { env } from "configs/EnvironmentConfig";
import { setUserNativeLanguage } from 'redux/actions/Lrn';

const locale = true;
const setLocale = (isLocaleOn, localeKey) =>{		
  return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
}

const configureMenuItems = (user, token) => {

  const menuLinks = [];

  if(user?.hasEverBeenFacilitator && token){
    menuLinks.push(
      {
        title: setLocale(locale,"profile.adminInsights"),
        icon: RadarChartOutlined ,
        path: "insight",
        isAuth: true
      }
            
      // },
      // {
      // title: setLocale(locale, ""),
      // icon: EditOutlined ,
      // path: ""
      // },      
      // {
      //   title: setLocale(locale, ""),
      // icon: SettingOutlined,
      // path: ""
      // },
      // {
      //   title: setLocale(locale, "profile.switch.course"),
      //   icon: SwapOutlined,
      //   path: "switch-course"
      // },
      // {
      // title: setLocale(locale,"profile.edit.profile"),
      // icon: EditOutlined ,
      // path: "edit-profile"
      // },
  );

  }
  
    if(env.IS_ENROLLMENT_FEAT_ON){
    menuLinks.push(
      {
        title: setLocale(locale,"profile.enroll"),
        icon: UsergroupAddOutlined ,
        path: "enroll",
        isAuth: false
      }
    )
  }

  return menuLinks;
}

export const NavProfile = (props) => {  
  const { course, direction, mode, isMobile, setUserNativeLanguage, token, signOut, user } = props;
  const [visible, setVisible] = useState(false); // Use useState for managing drawer visibility
 
  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const resetBaseCourseLanguage = () => {
    setUserNativeLanguage(null);
  }

  const handleSigningOut = () => {
    signOut();
  }

  const menuItems = configureMenuItems(user, token);
  const authenticatedProfileImg = "/img/avatars/tempProfile-2.png";
  const unauthenticatedprofileImgDefault = "/img/avatars/tempProfile.jpg";
  const avatarImg = token ? (token?.user_metadata?.avatar_url ?? token?.user_metadata?.picture ?? authenticatedProfileImg) :  unauthenticatedprofileImgDefault;
  const profileMenu = (
      <div className="nav-profile nav-dropdown">
        <div className="nav-profile-header">
          <div className="d-flex">
            <Avatar size={50} src={avatarImg} />
            <div className="pl-3">
            {((token && user?.communicationName) || token?.user_metadata?.full_name || token?.email) && (
              <h4 className="mb-0">
                {(token && user?.communicationName) || token?.user_metadata?.full_name || token?.email}
              </h4>
            )}
            {((token && user?.emailId) || token?.email) && (
               <span className="text-muted">
                {(token && user?.emailId) ||  token?.email}
              </span>
            )}
            </div>
          </div>
        </div>
        <div className="nav-profile-body">
        <Menu>
          {menuItems.map((el, i) => (
            <Menu.Item key={i}>
              <Link id={el.id} to={`${el?.isAuth ? AUTH_PREFIX_PATH : APP_PREFIX_PATH}/${el.path}`}>
                <Icon className="mr-3 profile-accomdation" type={el.icon} />
                <span className="font-weight-normal">{el.title}</span>
              </Link>
            </Menu.Item>
          ))}

          <Menu.Item key={menuItems?.length + 2} onClick={resetBaseCourseLanguage}>
            <span>
              <SwapOutlined className="mr-3 profile-accomdation" />
              <span className="font-weight-normal"> {setLocale(locale, "profile.switch.course")}</span>
            </span>
          </Menu.Item>

          <Menu.SubMenu
            key="language"
            title={
              <span>
                <GlobalOutlined className="mr-3 profile-accommodation profile-submenu-accomodation" />
                <span className="font-weight-normal">{setLocale(locale, "settings.menu.sub.title.2.language")}</span>
              </span>
            }
          >
            <ProfileNavLanguagePanelConfig />
          </Menu.SubMenu>
          { token && (
          <Menu.Item key={menuItems?.length + 3} onClick={showDrawer}>
            <span>
              <SettingOutlined className="mr-3 profile-accomdation" />
              <span className="font-weight-normal"> {setLocale(locale, "settings.menu.main.title")}</span>
            </span>
          </Menu.Item>
          )}

          {/* Conditional rendering for Login and Logout */}
          {env.IS_SSO_ON && !token ? (
          <>
            <Menu.Divider />
            <Menu.Item key="login" className="menu-highlight">
              <Link to={`${APP_PREFIX_PATH}/login`}>
                <LoginOutlined className="mr-3 profile-accomdation" />
                <span className="font-weight-bold">{setLocale(locale, "sidenav.login")}</span>
              </Link>
            </Menu.Item>
          </>
        ) : env.IS_SSO_ON && token ? (
          <>
            <Menu.Divider />
            <Menu.Item key="logout" className="menu-highlight" onClick={handleSigningOut}>
              <LogoutOutlined className="mr-3 profile-accomdation" />
              <span className="font-weight-bold">{setLocale(locale, "profile.sign.out")}</span>
            </Menu.Item>
          </>
        ) : null}
        </Menu>
        </div>
      </div>
  );
  return (
    <>
      <Dropdown placement="bottomRight" overlay={profileMenu} trigger={["click"]}>
        <div className="avatar-menu d-flex align-items-center" mode="horizontal">
          <Avatar size={40} src={avatarImg} />
        </div>
      </Dropdown>

      <ProfileNavPanelConfig
        visible={visible}
        onClose={onClose}
        title='settings.menu.main.title' // Adjust the title key as needed
        direction={direction}
      />
      
      {token && (
        <>
          {!isMobile && <NavSearchWrapper isMobile={false} mode={mode}/>}
        </>
      )}

    </>
  );
}

const mapStateToProps = ({ theme, auth, grant }) => {
	const { course } =  theme;
  const { token } = auth;
  const { user } = grant;
	return { course, token, user }
};

export default connect(mapStateToProps, {signOut, setUserNativeLanguage, })(NavProfile)