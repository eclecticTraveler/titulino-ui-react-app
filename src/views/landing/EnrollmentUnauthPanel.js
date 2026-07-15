import React, { useEffect, useRef, useState } from 'react';
import { Row, Col, Card, Spin, Button, Divider, Typography } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { supabase } from 'auth/SupabaseAuth';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import { getAvailableCourses } from 'services/TitulinoRestService';
import CourseStatusTile from './CourseStatusTile';

const { Text } = Typography;

const ENROLL_PATH = `${APP_PREFIX_PATH}/enroll`;
const REDIRECT_AFTER_LOGIN = '/';
const coverUrl = 'https://images.unsplash.com/photo-1699347914988-c61ec13c99c5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

const GoogleIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
  </svg>
);

const EnrollmentUnauthPanel = () => {
  const { formatMessage } = useIntl();
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState(null);
  const coursesRef = useRef(null);

  useEffect(() => {
    getAvailableCourses(null, 'EnrollmentUnauthPanel').then(setAllCourses);
  }, []);

  const redirectTo = `${window.location.origin}${APP_PREFIX_PATH}/login?redirect=${encodeURIComponent(REDIRECT_AFTER_LOGIN)}`;

  const handleProviderSignIn = (provider) => {
    supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
  };

  const scrollToCourses = () => {
    coursesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Card
        cover={
          <img
            alt="enrollment"
            src={coverUrl}
            style={{ height: 150, objectFit: 'cover' }}
          />
        }
        style={{ marginBottom: 24 }}
      >
        {/* Value proposition — full width, left-aligned */}
        <h2 style={{ marginBottom: 6 }}>
          {formatMessage({ id: 'landing.headline' })}
        </h2>
        <p style={{ color: '#72849a', marginBottom: 0 }}>
          {formatMessage({ id: 'landing.subheadline' })}
        </p>

        <Divider>
          {formatMessage({ id: 'landing.choose.how.to.start' })}
        </Divider>

        {/* Provider cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 12 }}>
          <Col xs={24} sm={12}>
            <Card
              hoverable
              onClick={() => handleProviderSignIn('google')}
              style={{ textAlign: 'center', cursor: 'pointer', backgroundColor: '#f5f5f5', border: 'none' }}
              styles={{ body: { padding: '20px 16px' } }}
            >
              <GoogleIcon />
              <div style={{ marginTop: 10, fontWeight: 600, fontSize: 14 }}>
                {formatMessage({ id: 'landing.continue.with.google' })}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card
              hoverable
              onClick={() => handleProviderSignIn('facebook')}
              style={{ textAlign: 'center', cursor: 'pointer', backgroundColor: '#f5f5f5', border: 'none' }}
              styles={{ body: { padding: '20px 16px' } }}
            >
              <FacebookIcon />
              <div style={{ marginTop: 10, fontWeight: 600, fontSize: 14 }}>
                {formatMessage({ id: 'landing.continue.with.facebook' })}
              </div>
            </Card>
          </Col>
        </Row>

        <Text type="secondary" style={{ display: 'block', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>
          {formatMessage({ id: 'landing.auto.create.account' })}
        </Text>

        <Divider>{formatMessage({ id: 'landing.divider.or' })}</Divider>

        {/* Email fallback */}
        <Row justify="center">
          <Col xs={24} sm={12}>
            <Button size="large" block onClick={() => navigate(ENROLL_PATH)}>
              {formatMessage({ id: 'landing.cta.get.started' })}
            </Button>
          </Col>
        </Row>

        {/* Scroll anchor */}
        <div
          onClick={scrollToCourses}
          style={{ textAlign: 'center', marginTop: 28, cursor: 'pointer', padding: '4px 0' }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: '#595959' }}>
            {formatMessage({ id: 'landing.courses.available.title' })}
          </span>
          <DownOutlined style={{ marginLeft: 8, fontSize: 13, color: '#595959' }} />
        </div>
      </Card>

      {/* Courses card — scroll target */}
      <div ref={coursesRef}>
        <Card>
          {!allCourses ? (
            <Spin size="large" style={{ display: 'block', margin: '40px auto' }} />
          ) : (
            <Row gutter={[16, 16]}>
              {allCourses.map((course) => (
                <Col key={course.CourseCodeId} xs={24} sm={12} lg={8}>
                  <CourseStatusTile
                    course={course}
                    isEnrolled={false}
                    enrollPath={ENROLL_PATH}
                  />
                </Col>
              ))}
            </Row>
          )}
        </Card>
      </div>
    </div>
  );
};

export default EnrollmentUnauthPanel;
