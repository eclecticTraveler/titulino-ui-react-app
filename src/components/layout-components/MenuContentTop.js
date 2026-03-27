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
    toggleUpperNavigationLevelSelection, // eslint-disable-line no-unused-vars
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
    getUpperNavigationBasedOnUserConfig(((user?.contactId && token) ? true : false), user?.emailId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.contactId, token, user?.emailId]);

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

  const buildSubMenuItems = (menu, menuIndex) => ({
    key: `menu-${menu?.key}-parent`,
    label: <span className="upper-submenu-title-top">{setLocale(localization, menu?.title)}</span>,
    icon: menu.icon ? (
      <span className="upper-submenu-icon-parent">
        <IconAdapter icon={menu?.icon} iconPosition={menu?.iconPosition} />
      </span>
    ) : (
      <span className="upper-submenu-icon-parent">
        <IconAdapter icon={menu?.iconAlt} />
      </span>
    ),
    children: menu?.topSubmenu?.map((topSubMenuFirstChild, subMenuIndex) =>
      topSubMenuFirstChild?.topSubmenu?.length > 0 ? {
        key: `subMenuFirst-${menuIndex}-${subMenuIndex}`,
        label: <span className="upper-submenu-title">{setLocale(localization, topSubMenuFirstChild?.title)}</span>,
        children: topSubMenuFirstChild?.topSubmenu.map(
          (subMenuSecond, subMenuSecondIndex) => ({
            key: `subMenuSecond-${menuIndex}-${subMenuIndex}-${subMenuSecondIndex}`,
            label: subMenuSecond?.path ? (
              <NavLink to={subMenuSecond?.path}>{setLocale(localization, subMenuSecond?.title)}</NavLink>
            ) : (
              setLocale(localization, subMenuSecond?.title)
            ),
          })
        ),
      } : {
        key: `subMenuFirst-item-${menuIndex}-${subMenuIndex}`,
        icon: <IconAdapter icon={topSubMenuFirstChild?.icon} iconPosition={topSubMenuFirstChild?.iconPosition} />,
        label: topSubMenuFirstChild?.path ? (
          <NavLink to={topSubMenuFirstChild?.path}>{setLocale(localization, topSubMenuFirstChild?.title)}</NavLink>
        ) : (
          setLocale(localization, topSubMenuFirstChild?.title)
        ),
      }
    ),
  });

  const menu = (
    <Menu
      mode={isMobileView ? "vertical" : "horizontal"}
      style={{ backgroundColor: topNavColor }}
      onClick={handleMenuClick}
      triggerSubMenuAction={isMobileView ? "click" : "hover"}
      openKeys={openKeys}
      onOpenChange={handleOpenChange}
      items={dynamicUpperMainNavigation
        ?.filter((menu) => menu?.isToDisplayInNavigation)
        ?.map((menu, menuIndex) =>
          menu?.topSubmenu?.length > 0
            ? buildSubMenuItems(menu, menuIndex)
            : {
                key: `menu-${menuIndex}`,
                icon: <IconAdapter icon={menu?.icon} iconPosition={menu?.iconPosition} />,
                label: menu?.path ? (
                  <NavLink to={menu?.path}>{setLocale(localization, menu?.title)}</NavLink>
                ) : (
                  setLocale(localization, menu?.title)
                ),
              }
        )}
    />
  );

  return (
    <div style={{ position: "relative" }}>
      {isMobileView && (
        <Popover
          content={menu}
          trigger="click"
          open={menuVisible}
          onOpenChange={toggleMenu}
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
