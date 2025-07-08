import React, { useState, useEffect } from "react";
import { Menu, Popover } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { Grid } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { useLocation, NavLink } from "react-router-dom";
import IconAdapter from "components/util-components/IconAdapter";
import IntlMessage from "../util-components/IntlMessage";
import {
  getUpperNavigationBasedOnUserConfig,
  toggleUpperNavigationLevelSelection,
  toggleSelectedUpperNavigationTabOnLoad,
} from "../../redux/actions/Lrn";

const { useBreakpoint } = Grid;
const { SubMenu, Item } = Menu;

const setLocale = (isLocaleOn, localeKey) =>
  isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();

const MenuContentTop = (props) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);
  const screens = useBreakpoint();
  const isMobileView = !screens.lg;
  const {
    dynamicUpperMainNavigation,
    topNavColor,
    localization,
    toggleUpperNavigationLevelSelection,
    getUpperNavigationBasedOnUserConfig,
    user,
    token
  } = props;

  useEffect(() => {
    if (!isMobileView) {
      setMenuVisible(false); // Reset menu visibility when switching to desktop
    }
  }, [isMobileView]);

  useEffect(() => {
    getUpperNavigationBasedOnUserConfig((user?.contactId && token) ? true : false);
  }, [user?.contactId, token]);

  toggleSelectedUpperNavigationTabOnLoad(
    useLocation()?.pathname,
    dynamicUpperMainNavigation
  );

  const toggleMenu = () => setMenuVisible(!menuVisible);

  const handleMenuClick = () => {
    setMenuVisible(false);
  };

  const handleOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  const renderSubMenu = (menu, menuIndex) => (
    <SubMenu
      key={`menu-${menu?.key}-parent`}
      title={
        <span className="upper-submenu-title-top">
          {setLocale(localization, menu?.title)}
        </span>
      }
      icon={
        menu.icon ? (
          <span className="upper-submenu-icon-parent">
            <IconAdapter
              icon={menu?.icon}
              iconPosition={menu?.iconPosition}
            />
          </span>
        ) : (
          <span className="upper-submenu-icon-parent">
            <IconAdapter icon={menu?.iconAlt} />
          </span>
        )
      }
    >
      {menu?.topSubmenu?.map((topSubMenuFirstChild, subMenuIndex) =>
        topSubMenuFirstChild?.topSubmenu?.length > 0 ? (
          <SubMenu
            key={`subMenuFirst-${menuIndex}-${subMenuIndex}`}
            title={
              <span className="upper-submenu-title">
                {setLocale(localization, topSubMenuFirstChild?.title)}
              </span>
            }
          >
            {topSubMenuFirstChild?.topSubmenu.map(
              (subMenuSecond, subMenuSecondIndex) => (
                <Item
                  key={`subMenuSecond-${menuIndex}-${subMenuIndex}-${subMenuSecondIndex}`}
                >
                  <span>{setLocale(localization, subMenuSecond?.title)}</span>
                  {subMenuSecond?.path ? <NavLink to={subMenuSecond?.path} /> : null}
                </Item>
              )
            )}
          </SubMenu>
        ) : (
          <Item key={`subMenuFirst-item-${menuIndex}-${subMenuIndex}`}>
            <IconAdapter
              icon={topSubMenuFirstChild?.icon}
              iconPosition={topSubMenuFirstChild?.iconPosition}
            />
            <span>{setLocale(localization, topSubMenuFirstChild?.title)}</span>
            {topSubMenuFirstChild?.path ? (
              <NavLink to={topSubMenuFirstChild?.path} />
            ) : null}
          </Item>
        )
      )}
    </SubMenu>
  );

  const menu = (
    <Menu
      mode={isMobileView ? "vertical" : "horizontal"}
      style={{ backgroundColor: topNavColor }}
      onClick={handleMenuClick}
      triggerSubMenuAction={isMobileView ? "click" : "hover"}
      openKeys={openKeys}
      onOpenChange={handleOpenChange}
    >
      {dynamicUpperMainNavigation
        ?.filter((menu) => menu?.isToDisplayInNavigation)
        ?.map((menu, menuIndex) =>
          menu?.topSubmenu?.length > 0
            ? renderSubMenu(menu, menuIndex)
            : (
                <Item key={`menu-${menuIndex}`}>
                  <IconAdapter
                    icon={menu?.icon}
                    iconPosition={menu?.iconPosition}
                  />
                  <span>{setLocale(localization, menu?.title)}</span>
                  {menu?.path ? <NavLink to={menu?.path} /> : null}
                </Item>
              )
        )}
    </Menu>
  );

  return (
    <div style={{ position: "relative" }}>
      {isMobileView && (
        <Popover
          content={menu}
          trigger="click"
          visible={menuVisible}
          onVisibleChange={toggleMenu}
        >
          <button
            className="menu-toggle-button"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "24px",
            }}
          >
            <EllipsisOutlined style={{ fontSize: "40px", fontWeight: "bold" }} />
          </button>
        </Popover>
      )}
      {!isMobileView && menu}
    </div>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getUpperNavigationBasedOnUserConfig,
      toggleUpperNavigationLevelSelection,
      toggleSelectedUpperNavigationTabOnLoad,
    },
    dispatch
  );
}

const mapStateToProps = ({ lrn, grant, auth }) => {
  const { dynamicUpperMainNavigation } = lrn;
  const { user } = grant;
  const { token } = auth;
  return { dynamicUpperMainNavigation, user, token };
};

export default connect(mapStateToProps, mapDispatchToProps)(MenuContentTop);
