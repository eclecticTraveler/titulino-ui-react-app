import React, { Component } from 'react';
import { SettingOutlined } from '@ant-design/icons';
import { Drawer, Menu } from 'antd';
import ThemeConfigurator from './ThemeConfigurator';
import { connect } from "react-redux";
import { DIR_RTL } from '../../constants/ThemeConstant';
import IntlMessage from "../util-components/IntlMessage";

export class NavPanel extends Component {
	state = { visible: false };

  showDrawer = () => {
    this.setState({
      visible: true,
    });
  };

  onClose = () => {
    this.setState({
      visible: false,
    });
	};
  
	
	render() {
    const setLocale = (isLocaleOn, localeKey) =>
	      isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();

		return (
      <>
        <Menu mode="horizontal">
          <Menu.Item onClick={this.showDrawer } className="menu-right-padding">
            <SettingOutlined className="nav-icon mr-0 menu-right-size" />
          </Menu.Item>
        </Menu>
        <Drawer
          title={setLocale(this.props.locale, 'settings.menu.main.title')}
          placement={this.props.direction === DIR_RTL ? 'left' : 'right'} 
          width={350}
          onClose={this.onClose}
          visible={this.state.visible}
        >
          <ThemeConfigurator/>
        </Drawer>
      </>
    );
	}
}

const mapStateToProps = ({ theme }) => {
  const { locale } =  theme;
  return { locale }
};

export default connect(mapStateToProps)(NavPanel);