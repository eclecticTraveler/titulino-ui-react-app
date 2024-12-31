import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'antd';
import ConfettiExplosion from 'react-confetti-explosion';
import IntlMessage from 'components/util-components/IntlMessage';  // Assuming this is your translation component

const EnrollmentModal = ({ wasSubmittingEnrolleeSucessful }) => {
  const [isSmallConfettiVisible, setIsSmallConfettiVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Trigger confetti when submission is successful
  useEffect(() => {
    if (wasSubmittingEnrolleeSucessful) {
      setIsSmallConfettiVisible(true);
      setIsModalVisible(true);  // Show modal when submission is successful
    }
  }, [wasSubmittingEnrolleeSucessful]);

  // Close the modal and stop confetti
  const handleClose = () => {
    setIsSmallConfettiVisible(false);
    setIsModalVisible(false);  // Close the modal
  };

  const locale = true;  // You can control this as per your need
  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  };

  return (
    <div>
      {isSmallConfettiVisible && <ConfettiExplosion />}

      <Modal
        visible={isModalVisible}  // Show modal when successful
        title={setLocale(locale, 'enrollment.form.enrollmentCompleted')}  // Translated title
        onCancel={handleClose}
        footer={[
          <Button key="close" onClick={handleClose}>
            {setLocale(locale, 'enrollment.form.close')}  // Translated close button text
          </Button>,
        ]}
      >
        <h1>{setLocale(locale, 'enrollment.form.enrollmentCompletedMessage')}</h1>  // Translated message
      </Modal>
    </div>
  );
};

export default EnrollmentModal;
