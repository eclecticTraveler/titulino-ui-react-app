import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useNavigate } from 'react-router-dom';
import { Alert, Button } from 'antd';
import { CloseOutlined, ExclamationCircleFilled } from '@ant-design/icons';
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
  const [hasAutoCollapsed, setHasAutoCollapsed] = useState(false);
  const impersonationIdentity = `${bannerUser?.contactInternalId || ''}:${bannerUser?.emailId || ''}`;
  const impersonatedDisplayName = (
    bannerUser?.communicationName ||
    bannerUser?.personalCommunicationName ||
    [bannerUser?.names, bannerUser?.lastNames].filter(Boolean).join(' ') ||
    bannerUser?.emailId
  );

  useEffect(() => {
    setIsDismissed(false);
    setHasAutoCollapsed(false);
  }, [impersonationIdentity]);

  useEffect(() => {
    if (!isImpersonating || isDismissed || hasAutoCollapsed) {
      return undefined;
    }

    const collapseTimer = window.setTimeout(() => {
      setHasAutoCollapsed(true);
      setIsDismissed(true);
    }, 2000);

    return () => window.clearTimeout(collapseTimer);
  }, [hasAutoCollapsed, isDismissed, isImpersonating]);

  const handleDismissBanner = () => {
    setHasAutoCollapsed(true);
    setIsDismissed(true);
  };

  const handleStopImpersonation = async () => {
    await onStoppingImpersonationProfile();
    signOutSuccess();
    window.close();
    window.setTimeout(() => {
      navigate(`${APP_PREFIX_PATH}/login`, { replace: true });
    }, 150);
  };

  if (!isImpersonating) {
    return null;
  }

  if (isDismissed) {
    return (
      <button
        aria-label="Impersonating"
        className="impersonation-collapsed-tab"
        onClick={() => setIsDismissed(false)}
        title="Impersonating"
        type="button"
      >
        <ExclamationCircleFilled />
        <span>
          <IntlMessage id="admin.tools.impersonation.tab" />
        </span>
      </button>
    );
  }

  return (
    <div className="container customerName impersonation-banner-container">
      <Alert
        type="warning"
        showIcon
        closable={{
          closeIcon: <CloseOutlined />,
          onClose: handleDismissBanner
        }}
        title={(
          <span>
            <IntlMessage id="admin.tools.impersonation.banner" />
            {impersonatedDisplayName ? `: ${impersonatedDisplayName}` : ''}
          </span>
        )}
        description={(
          <div className="impersonation-banner-details">
            {bannerUser?.emailId && (
              <span className="impersonation-banner-email">
                {bannerUser.emailId}
              </span>
            )}
            <Button size="small" onClick={handleStopImpersonation}>
              <IntlMessage id="admin.tools.impersonation.stop" />
            </Button>
          </div>
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
