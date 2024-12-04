import React from 'react';
import { Drawer } from 'antd';
import ThemeConfigurator from './ThemeConfigurator';
import { connect } from 'react-redux';
import { DIR_RTL } from '../../constants/ThemeConstant';
import IntlMessage from '../util-components/IntlMessage';

const ProfileNavPanelConfig = ({ visible, onClose, title, direction, locale }) => {
  // Function to set the locale for the title
  const setLocale = (isLocaleOn, localeKey) =>
    isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();

  return (
    <Drawer
      title={setLocale(locale, title)}
      placement={direction === DIR_RTL ? 'left' : 'right'}
      width={350}
      onClose={onClose}
      visible={visible}
    >
      <ThemeConfigurator />
    </Drawer>
  );
};

const mapStateToProps = ({ theme }) => {
  const { locale } = theme;
  return { locale };
};

export default connect(mapStateToProps)(ProfileNavPanelConfig);
