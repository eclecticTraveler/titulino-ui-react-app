import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Spin, Card } from 'antd';
import { useIntl } from 'react-intl';
import { getAvailableCourses } from 'services/TitulinoRestService';
import CourseStatusTile from './CourseStatusTile';

const coverUrl = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1422&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

const LandingAuthenticatedHub = ({ user }) => {
  const { formatMessage } = useIntl();
  const [allCourses, setAllCourses] = useState(null);

  useEffect(() => {
    getAvailableCourses(null, 'LandingAuthenticatedHub').then(setAllCourses);
  }, []);

  const enrolledIds = user?.userCourses ? new Set(Object.keys(user.userCourses)) : new Set();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Card
        cover={
          <img
            alt="courses"
            src={coverUrl}
            style={{ height: 150, objectFit: 'cover' }}
          />
        }
        style={{ marginBottom: 24 }}
      >
        <h2 style={{ marginBottom: 4 }}>
          {formatMessage({ id: 'landing.greeting' }, { name: user?.communicationName || '' })}
        </h2>
        <p style={{ color: '#72849a', margin: 0 }}>
          {formatMessage({ id: 'landing.courses.title' })}
        </p>
      </Card>

      <Card>
        {!allCourses ? (
          <Spin size="large" style={{ display: 'block', margin: '40px auto' }} />
        ) : (
          <Row gutter={[16, 16]}>
            {allCourses.map((course) => (
              <Col key={course.CourseCodeId} xs={24} sm={12} lg={8}>
                <CourseStatusTile
                  course={course}
                  isEnrolled={enrolledIds.has(course.CourseCodeId)}
                />
              </Col>
            ))}
          </Row>
        )}
      </Card>
    </div>
  );
};

const mapStateToProps = ({ grant }) => ({ user: grant.user });
export default connect(mapStateToProps)(LandingAuthenticatedHub);
