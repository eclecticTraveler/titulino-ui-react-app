import React, { useState } from 'react';
import { Menu, Avatar, Dropdown } from "antd";
import { connect } from 'react-redux'
import { 
  SettingOutlined, 
  LogoutOutlined,
  SwapOutlined,
  LoginOutlined,
  GlobalOutlined,
  UsergroupAddOutlined,
  RadarChartOutlined,
  ToolOutlined
} from '@ant-design/icons';
import Icon from '../../components/util-components/Icon';
import { signOut } from 'redux/actions/Auth';
import { APP_PREFIX_PATH, AUTH_PREFIX_PATH } from 'configs/AppConfig';
import IntlMessage from "../../components/util-components/IntlMessage";
import ProfileNavPanelConfig from './ProfileNavPanelConfig';
import ProfileNavLanguagePanelConfig from './ProfileNavLanguagePanelConfig';

import { Link } from 'react-router-dom';
import { env } from "configs/EnvironmentConfig";
import { getIsLanguageConfiguredFlag, onUserSelectingContentLanguage } from 'redux/actions/Lrn';
import Flag from 'react-world-flags';

const locale = true;
const setLocale = (isLocaleOn, localeKey) =>{		
  return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
}

const configureMenuItems = (user, token) => {
// console.log("user", user);
  const menuLinks = [];

  if(token){
    if(user?.isGlobalAccessUser){
      menuLinks.push(
        {
          title: setLocale(locale,"profile.globalAdminTools"),
          icon: ToolOutlined ,
          path: "global-admin",
          isAuth: true
        });
    }

    if(user?.hasEverBeenFacilitator){
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
  const {
    direction,
    mode,
    isMobile,
    getIsLanguageConfiguredFlag,
    onUserSelectingContentLanguage,
    token,
    signOut,
    user,
    baseLanguage,
    selectedContentLanguage
  } = props;
  const [visible, setVisible] = useState(false); // Use useState for managing drawer visibility
 
  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const resetBaseCourseLanguage = () => {
    // TODO THIS NEEDS TO BE CLEANED UP AND DONE BETTER WHEN NEW COURSES ARE AVAILABLE
    // BUT LETS WORRY WHEN IT COMES TO MORE COURSES, THIS IS DEBT
    getIsLanguageConfiguredFlag("reset");
    onUserSelectingContentLanguage(null);
  }

  const handleSigningOut = () => {
    signOut();
  }
  
  const menuItems = configureMenuItems(user, token);
  const authenticatedProfileImg = "/img/avatars/tempProfile-2.png";
  const unauthenticatedprofileImgDefault = "/img/avatars/tempProfile.jpg";
  const avatarImg = token ? (token?.user_metadata?.avatar_url ?? token?.user_metadata?.picture ?? authenticatedProfileImg) :  unauthenticatedprofileImgDefault;
  const baseLanguageFlagCode = baseLanguage?.flagCodeName;
  const learningLanguageFlagCode = selectedContentLanguage?.contentLanguageFlagCode;
  const shouldRenderLanguageFlags = baseLanguageFlagCode && learningLanguageFlagCode;
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
            {((token && user?.contactId)) && (
              <h5 className="mb-0">
                Student ID: {(user?.contactId) }
              </h5>
            )}
            {shouldRenderLanguageFlags && (
              <div className="nav-profile-language-context">
                <span className="nav-profile-language-label">
                  {setLocale(locale, "profile.current.learning.languages")}
                </span>
                <div
                  aria-label={`${baseLanguage?.baseLanguageName} to ${selectedContentLanguage?.contentLanguageName}`}
                  className="nav-profile-language-pair"
                  title={`${baseLanguage?.baseLanguageName} to ${selectedContentLanguage?.contentLanguageName}`}
                >
                  <div className="nav-profile-language-flag">
                    <Flag code={baseLanguageFlagCode} />
                  </div>
                  <span className="nav-profile-language-arrow">{'➜'}</span>
                  <div className="nav-profile-language-flag">
                    <Flag code={learningLanguageFlagCode} />
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
        <div className="nav-profile-body">
        <Menu items={[
          ...menuItems.map((el, i) => ({
            key: i,
            label: (
              <Link id={el.id} to={`${el?.isAuth ? AUTH_PREFIX_PATH : APP_PREFIX_PATH}/${el.path}`}>
                <Icon className="mr-3 profile-accomdation" type={el.icon} />
                <span className="font-weight-normal">{el.title}</span>
              </Link>
            ),
          })),

          ...(env.IS_LANGUAGE_PICKER_ENABLED ? [{
            key: menuItems?.length + 2,
            onClick: resetBaseCourseLanguage,
            label: (
              <span>
                <SwapOutlined className="mr-3 profile-accomdation" />
                <span className="font-weight-normal"> {setLocale(locale, "profile.switch.course")}</span>
              </span>
            ),
          }] : []),

          {
            key: 'language',
            label: (
              <span>
                <GlobalOutlined className="mr-3 profile-accommodation profile-submenu-accomodation" />
                <span className="font-weight-normal">{setLocale(locale, "settings.menu.sub.title.2.language")}</span>
              </span>
            ),
            children: [
              {
                key: 'language-panel',
                label: <ProfileNavLanguagePanelConfig />,
              }
            ],
          },

          ...(token ? [{
            key: menuItems?.length + 3,
            onClick: showDrawer,
            label: (
              <span>
                <SettingOutlined className="mr-3 profile-accomdation" />
                <span className="font-weight-normal"> {setLocale(locale, "settings.menu.main.title")}</span>
              </span>
            ),
          }] : []),

          ...(env.IS_SSO_ON && !token ? [
            { type: 'divider' },
            {
              key: 'login',
              className: 'menu-highlight',
              label: (
                <Link to={`${APP_PREFIX_PATH}/login`}>
                  <LoginOutlined className="mr-3 profile-accomdation" />
                  <span className="font-weight-bold">{setLocale(locale, "sidenav.login")}</span>
                </Link>
              ),
            }
          ] : env.IS_SSO_ON && token ? [
            { type: 'divider' },
            {
              key: 'logout',
              className: 'menu-highlight',
              onClick: handleSigningOut,
              label: (
                <span>
                  <LogoutOutlined className="mr-3 profile-accomdation" />
                  <span className="font-weight-bold">{setLocale(locale, "profile.sign.out")}</span>
                </span>
              ),
            }
          ] : []),
        ]} />
        </div>
      </div>
  );
  return (
    <>
      <Dropdown placement="bottomRight" popupRender={() => profileMenu} trigger={["click"]}>
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
      


    </>
  );
}

const mapStateToProps = ({ theme, auth, grant, lrn }) => {
	const { contentLanguage } =  theme;
  const { token } = auth;
  const { user } = grant;
  const { baseLanguage, selectedContentLanguage } = lrn;
	return { contentLanguage, token, user, baseLanguage, selectedContentLanguage }
};

export default connect(mapStateToProps, {signOut, getIsLanguageConfiguredFlag, onUserSelectingContentLanguage})(NavProfile)
