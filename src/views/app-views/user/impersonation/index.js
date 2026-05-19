import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Result, Button } from 'antd';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import Loading from 'components/shared-components/Loading';
import ImpersonationSession from 'lob/ImpersonationSession';
import { authenticated } from 'redux/actions/Auth';
import { onActivatingImpersonationProfile } from 'redux/actions/Grant';
import { AUTH_PREFIX_PATH } from 'configs/AppConfig';

const ImpersonationLaunch = ({
  authenticated,
  onActivatingImpersonationProfile
}) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [errorKey, setErrorKey] = useState(null);
  const [debugSnapshot, setDebugSnapshot] = useState(null);
  const [failureReason, setFailureReason] = useState(null);

  useEffect(() => {
    const launchId = new URLSearchParams(window.location.search).get('launchId');
    const snapshot = ImpersonationSession.getImpersonationLaunchDebugSnapshot(launchId);
    setDebugSnapshot(snapshot);
    const launchRecord = launchId ? ImpersonationSession.getImpersonationLaunch(launchId) : null;
    const activeProfile = ImpersonationSession.getActiveImpersonationProfile();
    const userProfile = launchRecord?.userProfile || activeProfile;

    if (!userProfile?.emailId || !userProfile?.innerToken) {
      const reason = !launchId
        ? 'missing-launch-id'
        : !snapshot?.hasRawLaunchRecord && !snapshot?.hasActiveImpersonationProfile
          ? 'launch-record-not-found-in-local-storage'
          : snapshot?.launchRecordExpired
            ? 'launch-record-expired'
            : !userProfile?.emailId
              ? 'missing-userProfile.emailId'
              : 'missing-userProfile.token';

      setFailureReason(reason);
      setErrorKey('admin.tools.impersonation.launchInvalid');
      return;
    }

    const activate = async () => {
      const action = await onActivatingImpersonationProfile(userProfile);
      const activatedUser = action?.user;

      if (!activatedUser?.emailId) {
        setFailureReason('profile-activation-returned-empty-user');
        setDebugSnapshot(ImpersonationSession.getImpersonationLaunchDebugSnapshot(launchId));
        setErrorKey('admin.tools.impersonation.launchInvalid');
        return;
      }

      authenticated({
        email: activatedUser.emailId,
        impersonation: true
      });
      if (launchId) {
        ImpersonationSession.clearImpersonationLaunch(launchId);
      }
      navigate(AUTH_PREFIX_PATH, { replace: true });
    };

    activate();
  }, [authenticated, navigate, onActivatingImpersonationProfile]);

  if (errorKey) {
    return (
      <Result
        status="warning"
        title={intl.formatMessage({ id: errorKey })}
        subTitle={(
          process.env.NODE_ENV !== 'production' ? (
            <pre style={{ textAlign: 'left', whiteSpace: 'pre-wrap', maxWidth: 760, margin: '12px auto 0' }}>
              {JSON.stringify({
                reason: failureReason,
                debugSnapshot
              }, null, 2)}
            </pre>
          ) : null
        )}
        extra={(
          <Button type="primary" onClick={() => navigate('/lrn', { replace: true })}>
            {intl.formatMessage({ id: 'admin.tools.impersonation.backToTitulino' })}
          </Button>
        )}
      />
    );
  }

  return <Loading cover="content" />;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    authenticated,
    onActivatingImpersonationProfile
  }, dispatch);
}

export default connect(null, mapDispatchToProps)(ImpersonationLaunch);
