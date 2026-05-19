import React from 'react';
import { Tooltip } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import IntlMessage from 'components/util-components/IntlMessage';
import { env } from 'configs/EnvironmentConfig';
import { getIsLanguageConfiguredFlag, onUserSelectingContentLanguage } from 'redux/actions/Lrn';

const locale = true;
const setLocale = (isLocaleOn, localeKey) => (
  isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString()
);

export const NavCourseSwitcher = ({
  getIsLanguageConfiguredFlag,
  onUserSelectingContentLanguage
}) => {
  if (!env.IS_LANGUAGE_PICKER_ENABLED) {
    return null;
  }

  const resetBaseCourseLanguage = () => {
    getIsLanguageConfiguredFlag('reset');
    onUserSelectingContentLanguage(null);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      resetBaseCourseLanguage();
    }
  };

  return (
    <Tooltip title={setLocale(locale, 'profile.switch.course')}>
      <div
        className="nav-icon-container nav-course-switcher"
        role="button"
        aria-label="Switch course"
        tabIndex={0}
        onClick={resetBaseCourseLanguage}
        onKeyDown={handleKeyDown}
      >
        <SwapOutlined className="nav-icon mx-auto" />
      </div>
    </Tooltip>
  );
};

export default connect(null, {
  getIsLanguageConfiguredFlag,
  onUserSelectingContentLanguage
})(NavCourseSwitcher);
