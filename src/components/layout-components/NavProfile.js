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
import { APP_PREFIX_PATH } from '../../configs/AppConfig';
import { Link } from "react-router-dom";
import IntlMessage from "../../components/util-components/IntlMessage";
import ProfileNavPanelConfig from './ProfileNavPanelConfig';
import ThemeConfigurator from './ThemeConfigurator';
import { DIR_RTL } from 'constants/ThemeConstant';
import NavSearchWrapper from './NavSearchWrapper';
import ProfileNavLanguagePanelConfig from './ProfileNavLanguagePanelConfig';
import { env } from "configs/EnvironmentConfig";
import { setUserNativeLanguage } from 'redux/actions/Lrn';

const locale = true;
const setLocale = (isLocaleOn, localeKey) =>{		
  return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
}

const configureMenuItems = () => {

  const menuLinks = [
    // {
    //   title: setLocale(locale,"sidenav.login"),
    //   icon: LoginOutlined ,
    //   path: "login"
    // },
    // {
    // title: setLocale(locale,"profile.edit.profile"),
    // icon: EditOutlined ,
    // path: "edit-profile"
    // },
    // {
    //   title: setLocale(locale, "profile.help.center"),
    //   icon: QuestionCircleOutlined,
    //   path: ""
    // },
    // {
    //   title: setLocale(locale, "profile.switch.course"),
    //   icon: SwapOutlined,
    //   path: "switch-course"
    // }
    
  ];

  if(env.IS_SSO_ON){ 
    menuLinks.push({
      title: setLocale(locale,"sidenav.login"),
      icon: LoginOutlined ,
      path: "login"
  })
}

  if(env.IS_ADMIN_DASHBOARD_FEAT_ON){
    menuLinks.push(
      {
        title: setLocale(locale,"profile.adminInsights"),
        icon: RadarChartOutlined ,
        path: "insight"
      }
    )
  }

  if(env.IS_ENROLLMENT_FEAT_ON){
    menuLinks.push(
      {
        title: setLocale(locale,"profile.enroll"),
        icon: UsergroupAddOutlined ,
        path: "enroll"
      }
    )
  }

  const authorized = false;
  if(authorized){
    menuLinks.push({
      title: setLocale(locale, ""),
      icon: EditOutlined ,
      path: ""
      },      
      {
        title: setLocale(locale, ""),
      icon: SettingOutlined,
      path: ""
      },
      {
        title: setLocale(locale, ""),
      icon: ShopOutlined ,
      path: ""
    });
  }
  
  // menuLinks.push({
  //   title: setLocale(locale, "profile.sign.out"),
  //   icon: LogoutOutlined,
  //   path: "logout"
  // });

  return menuLinks;
}

export const NavProfile = (props) => {  
  const { course, direction, mode, isMobile, setUserNativeLanguage, token, signOut } = props;
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

  const menuItems = configureMenuItems();
  const profileImg = "/img/avatars/tempProfile-2.png";
  const avatarImg = token?.user?.user_metadata?.avatar_url ?? profileImg;
  const profileMenu = (
      <div className="nav-profile nav-dropdown">
        <div className="nav-profile-header">
          <div className="d-flex">
            <Avatar size={50} src={avatarImg} />
            <div className="pl-3">
              {token && token?.user?.user_metadata?.full_name && <h4 className="mb-0">{token?.user?.user_metadata?.full_name}</h4>}
              {token && token?.user?.email && <span className="text-muted">{token?.user?.email}</span>}
            </div>
          </div>
        </div>
        <div className="nav-profile-body">
          <Menu>
            {menuItems.map((el, i) => {
              return (
                <Menu.Item key={i}>
                    <Link id={el.id} to={`${APP_PREFIX_PATH}/${el.path}`}>
                       <Icon className="mr-3 profile-accomdation" type={el.icon} />
                       <span className="font-weight-normal">{el.title}</span>
                    </Link>
                </Menu.Item>
              );
            })}
            <Menu.Item key={menuItems?.length + 2}  onClick={resetBaseCourseLanguage}>
              <span>
                <SwapOutlined className="mr-3 profile-accomdation" />
                <span className="font-weight-normal">  {setLocale(locale, "profile.switch.course")}</span>
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
            <Menu.Item key={menuItems?.length + 3}  onClick={showDrawer}>
              <span>
                <SettingOutlined className="mr-3 profile-accomdation" />
                <span className="font-weight-normal">  {setLocale(locale, "settings.menu.main.title")}</span>
              </span>
            </Menu.Item>
            { token && 
              <Menu.Item key={menuItems?.length + 4} onClick={() => handleSigningOut()}>
                <span>
                  <LogoutOutlined className="mr-3 profile-accomdation"/>
                  <span className="font-weight-normal">{setLocale(locale, "profile.sign.out")}</span>
                </span>
              </Menu.Item>            
            }            
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

      {!isMobile && <NavSearchWrapper isMobile={false} mode={mode}/>}
    </>
  );
}

const mapStateToProps = ({ theme, auth }) => {
	const { course } =  theme;
  const { token } = auth;
	return { course, token }
};

export default connect(mapStateToProps, {signOut, setUserNativeLanguage, })(NavProfile)