import React from "react";
import { Col, Card } from "antd";

const ReusableColCard = ({ children, selected, onClick, course, totalCardsToBeRender }) => (
  <Col xs={12} sm={12} lg={totalCardsToBeRender?.length === 1 ? { span: 12, offset: 6 } : 12} // Conditional offset for single card
  >
    <Card
      hoverable
      bordered
      className={`course-card ${selected ? 'selected' : ''}`}
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center' }}
      cover={ <img
        src={course?.CourseDetails?.courseProfileImage || process.env.PUBLIC_URL + '/img/avatars/tempProfile.jpg'}
        alt={`${course?.CourseDetails?.course} profile`}
        style={{ width: 200, height: 200, borderRadius: '5%', marginRight: 16, marginLeft: 16 }}
      />}
    >
      {children}
    </Card>
  </Col>
);

export default ReusableColCard;
