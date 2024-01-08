import React from "react";
import { Menu, Dropdown, Avatar } from "antd";
import { connect } from 'react-redux'
import { 
  EditOutlined, 
  SettingOutlined, 
  ShopOutlined, 
  QuestionCircleOutlined, 
  LogoutOutlined,
  CloudUploadOutlined,
  SwapOutlined
} from '@ant-design/icons';
import Icon from '../../components/util-components/Icon';
import { signOut } from 'redux/actions/Auth';
import { APP_PREFIX_PATH } from '../../configs/AppConfig';
import { Link } from "react-router-dom";
import IntlMessage from "../../components/util-components/IntlMessage";
import { useKeycloak } from "@react-keycloak/web";

const locale = true;
const setLocale = (isLocaleOn, localeKey) =>{		
  return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
}

const configureMenuItems = () => {
  const menuLinks = [
    {
    title: setLocale(locale,"profile.edit.profile"),
    icon: EditOutlined ,
    path: "profile/edit-profile"
    },
    {
      title: setLocale(locale, "profile.help.center"),
      icon: QuestionCircleOutlined,
      path: ""
    },
    {
      title: setLocale(locale, "profile.switch.course"),
      icon: SwapOutlined,
      path: "switch-course"
    }
  ];


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

export const NavProfile = (props, {signOut}) => {
  const { course } = props;
  const { keycloak } = useKeycloak();
  const menuItems = configureMenuItems();
  const profileImg = "/img/avatars/tempProfile-2.png";
  const profileMenu = (
      <div className="nav-profile nav-dropdown">
        <div className="nav-profile-header">
          <div className="d-flex">
            <Avatar size={50} src={profileImg} />
            <div className="pl-3">
              <h4 className="mb-0">{keycloak.tokenParsed?.name}</h4>
              <span className="text-muted">{keycloak.tokenParsed?.preferred_username}</span>
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
            <Menu.Item key={menuItems?.length + 1} onClick={() => keycloak.logout()}>
              <span>
                <LogoutOutlined className="mr-3 profile-accomdation"/>
                <span className="font-weight-normal">{setLocale(locale, "profile.sign.out")}</span>
              </span>
            </Menu.Item>
          </Menu>
        </div>
      </div>
  );
  return (
    <Dropdown placement="bottomRight" overlay={profileMenu} trigger={["click"]}>
      <div className="avatar-menu d-flex align-items-center" mode="horizontal">
        <Avatar size={40} src={profileImg} />
      </div>
    </Dropdown>
  );
}

const mapStateToProps = ({ theme }) => {
	const { course } =  theme;
	return { course }
};

export default connect(mapStateToProps, {signOut})(NavProfile)
