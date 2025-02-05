import React from 'react';
import { Button } from 'antd';
import { useHistory } from 'react-router-dom';
import IntlMessage from "components/util-components/IntlMessage";
import { getLocalizedConfig } from 'configs/CourseMainNavigationConfig/Submenus/ConfigureNavigationLocalization';

const EnrollInvitationMessage = ({handlePostButtonClick}) => {
  const history = useHistory();
  const locale = true;

  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  };

  const doAction = () => {
    handlePostButtonClick();
    history.push("/lrn/enroll");
  };

  return (
    <div>
      <h4>
        {setLocale(locale, "userprogress.enrollment.invitationMessageContent")}
      </h4>
      <br />
      <Button 
        onClick={doAction} 
        size="large" 
        style={{ backgroundColor: "#f0f0f0", color: "#000", borderColor: "#d9d9d9" }}
      >
        {setLocale(locale, "userprogress.enrollment.yesLetsEnroll")}
      </Button>
    </div>
  );
};

export default EnrollInvitationMessage;
