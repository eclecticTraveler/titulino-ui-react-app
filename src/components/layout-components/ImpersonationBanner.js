import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { Alert, Button } from 'antd';
import IntlMessage from 'components/util-components/IntlMessage';
import { signOutSuccess } from 'redux/actions/Auth';
import { onStoppingImpersonationProfile } from 'redux/actions/Grant';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import ImpersonationSession from 'lob/ImpersonationSession';

export const ImpersonationBanner = ({
  user,
  onStoppingImpersonationProfile,
  signOutSuccess
}) => {
  const navigate = useNavigate();
  const activeImpersonationProfile = ImpersonationSession.getActiveImpersonationProfile();
  const bannerUser = activeImpersonationProfile || user;
  const isImpersonating = (
    activeImpersonationProfile?.impersonation?.isImpersonating === true ||
    user?.impersonation?.isImpersonating === true
  );
  const [isDismissed, setIsDismissed] = useState(false);
  const impersonationIdentity = `${bannerUser?.contactInternalId || ''}:${bannerUser?.emailId || ''}`;
  const impersonatedDisplayName = (
    bannerUser?.communicationName ||
    bannerUser?.personalCommunicationName ||
    [bannerUser?.names, bannerUser?.lastNames].filter(Boolean).join(' ') ||
    bannerUser?.emailId
  );

  useEffect(() => {
    setIsDismissed(false);
  }, [impersonationIdentity]);

  const handleStopImpersonation = async () => {
    await onStoppingImpersonationProfile();
    signOutSuccess();
    window.close();
    window.setTimeout(() => {
      navigate(`${APP_PREFIX_PATH}/login`, { replace: true });
    }, 150);
  };

  if (!isImpersonating || isDismissed) {
    return null;
  }

  return (
    <div className="container customerName impersonation-banner-container">
      <Alert
        type="warning"
        showIcon
        closable
        onClose={() => setIsDismissed(true)}
        message={(
          <span>
            <IntlMessage id="admin.tools.impersonation.banner" />
            {impersonatedDisplayName ? `: ${impersonatedDisplayName}` : ''}
          </span>
        )}
        description={bannerUser?.emailId || null}
        action={(
          <Button size="small" onClick={handleStopImpersonation}>
            <IntlMessage id="admin.tools.impersonation.stop" />
          </Button>
        )}
      />
    </div>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    onStoppingImpersonationProfile,
    signOutSuccess
  }, dispatch);
}

const mapStateToProps = ({ grant }) => {
  const { user } = grant;
  return { user };
};

export default connect(mapStateToProps, mapDispatchToProps)(ImpersonationBanner);
