import React from 'react';
import { Button, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useIntl } from 'react-intl';
import { supabase } from 'auth/SupabaseAuth';
import { APP_PREFIX_PATH, AUTH_PREFIX_PATH } from 'configs/AppConfig';

const ENROLL_PATH = `${AUTH_PREFIX_PATH}/enroll`;
const REDIRECT_AFTER_LOGIN = '/';

const leftStyle = {
  background: '#1b2531',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '48px 40px',
};

const rightStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '48px 40px',
  background: '#fff',
};

const LandingUnauthenticated = () => {
  const { formatMessage } = useIntl();
  const navigate = useNavigate();

  const redirectTo = `${window.location.origin}${APP_PREFIX_PATH}/login?redirect=${encodeURIComponent(REDIRECT_AFTER_LOGIN)}`;

  return (
    <Row style={{ minHeight: '100vh' }}>
      <Col xs={24} md={14} style={leftStyle}>
        <img
          src="/img/logo-white.png"
          alt="Titulino"
          style={{ height: 48, marginBottom: 32, objectFit: 'contain', alignSelf: 'flex-start' }}
        />
        <h1 style={{ color: '#fff', fontSize: 32, lineHeight: 1.3, marginBottom: 16 }}>
          {formatMessage({ id: 'landing.headline' })}
        </h1>
        <p style={{ color: '#b4bed2', fontSize: 16, marginBottom: 40, maxWidth: 480 }}>
          {formatMessage({ id: 'landing.subheadline' })}
        </p>
        <Button
          type="primary"
          size="large"
          style={{ width: 200 }}
          onClick={() => navigate(ENROLL_PATH)}
        >
          {formatMessage({ id: 'landing.cta.enroll' })}
        </Button>
      </Col>

      <Col xs={24} md={10} style={rightStyle}>
        <h3 style={{ marginBottom: 24, fontSize: 18, color: '#1b2531' }}>
          {formatMessage({ id: 'landing.signin.title' })}
        </h3>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#e79547',
                  brandAccent: '#d27c3f',
                },
              },
            },
          }}
          providers={['google', 'facebook']}
          redirectTo={redirectTo}
        />
      </Col>
    </Row>
  );
};

export default LandingUnauthenticated;
