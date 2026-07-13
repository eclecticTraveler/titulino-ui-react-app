import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Tooltip } from 'antd';
import { useIntl } from 'react-intl';
import { onFetchingFloatingActions } from 'redux/actions/Lrn';
import FloatingActionsLob from 'lob/FloatingActions';
import ContactFormModal from './ContactFormModal';
import { env } from 'configs/EnvironmentConfig';

const { resolveFacebookUrl, resolveExternalUrl, resolveVisibleActions } = FloatingActionsLob;

// T16 — Facebook icon SVG
const FacebookSvg = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
  </svg>
);

// WhatsApp icon SVG
const WhatsAppSvg = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// ACTION_ICONS: maps action.id → icon component for type:'link' and type:'resolver' actions.
// To add a new external-link action: add its id here + entry in floating-actions.json.
const ACTION_ICONS = {
  whatsapp: <WhatsAppSvg />,
};

// T16 — Facebook action button
const FacebookActionButton = ({ action, nativeLangCode, targetLangCode }) => {
  const { formatMessage } = useIntl();
  const url = resolveFacebookUrl(
    nativeLangCode,
    targetLangCode,
    action.facebookMappings || [],
    action.defaultUrl || ''
  );

  const handleClick = () => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Tooltip title={formatMessage({ id: 'floating.facebook.tooltip' })} placement="left">
      <button
        className="floating-action-btn floating-action-btn--facebook"
        onClick={handleClick}
        aria-label={action.label || 'Facebook'}
        type="button"
      >
        <FacebookSvg />
      </button>
    </Tooltip>
  );
};

// Mail / contact icon SVG
const MailSvg = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

// T17 — Contact form trigger button
const ContactActionButton = ({ action, onOpen }) => {
  const { formatMessage } = useIntl();
  return (
    <Tooltip title={formatMessage({ id: 'floating.contact.tooltip' })} placement="left">
      <button
        className="floating-action-btn floating-action-btn--contact"
        onClick={onOpen}
        aria-label={action.label || 'Contact'}
        type="button"
      >
        <MailSvg />
      </button>
    </Tooltip>
  );
};

// Generic external link button for type:'link' and type:'resolver' actions.
// Icon is looked up by action.id in ACTION_ICONS; falls back to action.imageUrl.
// To wire a new external-link action: add its id+icon to ACTION_ICONS above.
const ExternalLinkActionButton = ({ action, nativeLangCode, targetLangCode, tooltip }) => {
  const url = resolveExternalUrl(action, nativeLangCode, targetLangCode);
  const icon = ACTION_ICONS[action.id];
  if (!url) return null;
  return (
    <Tooltip title={tooltip} placement="left">
      <button
        className={`floating-action-btn floating-action-btn--${action.id}`}
        onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
        aria-label={tooltip || action.label || action.id}
        type="button"
      >
        {icon ?? (action.imageUrl
          ? <img src={action.imageUrl} alt={action.label || ''} />
          : <span style={{ fontSize: 18 }}>🔗</span>
        )}
      </button>
    </Tooltip>
  );
};

// T15 — FloatingActionMenu container
const FloatingActionMenu = ({
  floatingActionsConfig,
  isAuthenticated,
  nativeLangCode,
  targetLangCode,
  onFetchingFloatingActions,
}) => {
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const { formatMessage } = useIntl();

  useEffect(() => {
    if (env.IS_FLOATING_ACTIONS_ON) {
      onFetchingFloatingActions();
    }
  }, [onFetchingFloatingActions]);

  if (!env.IS_FLOATING_ACTIONS_ON) return null;
  if (!floatingActionsConfig?.actions?.length) return null;

  const visibleActions = resolveVisibleActions(floatingActionsConfig.actions, isAuthenticated);
  if (!visibleActions.length) return null;

  const renderButton = (action) => {
    if (action.type === 'facebook-resolver') {
      return (
        <FacebookActionButton
          key={action.id}
          action={{ ...action, facebookMappings: floatingActionsConfig.facebookMappings }}
          nativeLangCode={nativeLangCode}
          targetLangCode={targetLangCode}
        />
      );
    }
    if (action.type === 'contact-form') {
      return (
        <ContactActionButton
          key={action.id}
          action={action}
          onOpen={() => setContactModalVisible(true)}
        />
      );
    }
    if (action.type === 'link' || action.type === 'resolver') {
      return (
        <ExternalLinkActionButton
          key={action.id}
          action={action}
          nativeLangCode={nativeLangCode}
          targetLangCode={targetLangCode}
          tooltip={formatMessage({ id: `floating.${action.id}.tooltip` })}
        />
      );
    }
    return null;
  };

  return (
    <>
      <div className="floating-action-stack">
        {visibleActions.map(renderButton)}
      </div>
      <ContactFormModal
        visible={contactModalVisible}
        onClose={() => setContactModalVisible(false)}
      />
    </>
  );
};

const mapStateToProps = ({ auth, lrn, theme }) => ({
  floatingActionsConfig: lrn.floatingActionsConfig,
  isAuthenticated: Boolean(auth.token),
  nativeLangCode: lrn.baseLanguage?.localeCode || null,
  targetLangCode: theme.contentLanguage || null,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ onFetchingFloatingActions }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(FloatingActionMenu);
