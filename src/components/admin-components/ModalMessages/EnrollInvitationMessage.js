import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'antd';
import { useHistory } from 'utils/routerCompat';
import IntlMessage from "components/util-components/IntlMessage";

const EnrollInvitationMessage = ({handlePostButtonClick, token, user}) => {
  const history = useHistory();
  const locale = true;

  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  };

  const doAction = () => {
    handlePostButtonClick();
    history.push(token && user?.contactId ? "/lrn-auth/enroll" : "/lrn/enroll");
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

const mapStateToProps = ({ auth, grant }) => {
  const { token } = auth;
  const { user } = grant;
  return { token, user };
};

export default connect(mapStateToProps)(EnrollInvitationMessage);
