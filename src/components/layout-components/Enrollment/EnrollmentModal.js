import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'antd';
import IntlMessage from 'components/util-components/IntlMessage'; // Assuming this is your translation component
import Lottie from 'lottie-react';
import emailSent from 'assets/lotties/emailSent.json';
import whatsApp from 'assets/lotties/whatsApp.json';

const EnrollmentModal = ({ wasSubmittingEnrolleeSucessful, closeEnrollmentModal, courses = [] }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState(emailSent); // Track current animation
  const [currentMessage, setCurrentMessage] = useState('enrollment.form.enrollmentCompletedMessage'); // Track current message
  const [isLinkVisible, setLinkVisible] = useState(false);

  // Trigger modal and animation switching when submission is successful
  useEffect(() => {
    if (wasSubmittingEnrolleeSucessful) {
      setIsModalVisible(true);
      // Switch animation and message after 4 seconds
      setTimeout(() => {
        setCurrentAnimation(whatsApp);
        setCurrentMessage('enrollment.form.enrollmentWhatsApp');
        setLinkVisible(true);
      }, 2700);
    }
  }, [wasSubmittingEnrolleeSucessful]);

  // Close the modal and reset animation
  const handleClose = () => {
    setIsModalVisible(false);
    setCurrentAnimation(emailSent); // Reset to initial animation
    setCurrentMessage('enrollment.form.enrollmentCompletedMessage'); // Reset message
    setLinkVisible(false); // Hide links
    closeEnrollmentModal();
  };

  const locale = true; // You can control this as per your need
  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  };

  return (
    <div>
      <Modal
        visible={isModalVisible} // Show modal when successful
        title={setLocale(locale, 'enrollment.form.enrollmentCompleted')} // Translated title
        onCancel={handleClose}
        footer={[
          <Button key="close" onClick={handleClose}>
            {setLocale(locale, 'enrollment.form.close')}
          </Button>,
        ]}
        bodyStyle={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} // Center content
      >
        <Lottie
          animationData={currentAnimation} // Dynamically switch animation
          loop={true}
          autoplay={true}
          speed={2}
          style={{ width: '100px', height: '100px', marginBottom: '16px' }} // Add margin for spacing
        />
        <h2 style={{ textAlign: 'center' }}>
          {setLocale(locale, currentMessage)}
        </h2>
        {isLinkVisible && (
  <div style={{ marginTop: '16px', textAlign: 'center' }}>
    {courses?.length > 1 && <h3>{setLocale(locale, 'enrollment.form.whatsAppLinks')}</h3>}
    <ul style={{ padding: 0, listStyleType: 'none' }}>
      {courses.map((course, index) => (
        <li
          key={index}
          style={{
            marginBottom: '8px',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            padding: '12px',
            textAlign: 'center',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#f0f0f0',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'box-shadow 0.3s ease-in-out',
            ':hover': {
              boxShadow: '0 8px 12px rgba(0, 0, 0, 0.2)', // Shadow becomes larger on hover
            },
          }}
          
        >
          <a
            href={course.CourseDetails?.whatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block', // Make the link fill the li
              textDecoration: 'none', // Remove underline
              color: 'inherit', // Inherit color from li
            }}
          >
            {course.CourseDetails?.course || `Course ${index + 1}`}
          </a>
        </li>
      ))}
    </ul>
  </div>
)}

      </Modal>
    </div>
  );
};

export default EnrollmentModal;
