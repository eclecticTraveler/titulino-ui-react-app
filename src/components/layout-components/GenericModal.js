import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'antd';
import IntlMessage from 'components/util-components/IntlMessage'; // Assuming this is your translation component
import Lottie from 'lottie-react';



const GenericModal = ({ closeGenericModal, visibleModal, title, animation, messageToDisplay, secondTitle, closeButtonTitle, transitionTimming }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState(animation); // Track current animation
  const [currentMessage, setCurrentMessage] = useState(title); // Track current message
  const [isLinkVisible, setLinkVisible] = useState(false);
  const [isClosedBtnDisabled, setIsClosedBtnDisabled] = useState(true);

  useEffect(() => {
    let timeoutId;
  
    if (visibleModal) {
      setIsModalVisible(true);
      timeoutId = setTimeout(() => {
        setCurrentAnimation(animation);
        setCurrentMessage(title);
        setLinkVisible(true);
        setIsClosedBtnDisabled(false);
      }, transitionTimming);
    }
  
    return () => {
      clearTimeout(timeoutId); // Clean up timeout to prevent memory leaks
    };
  }, [visibleModal, animation, title, transitionTimming]);
  
  

  // Close the modal and reset animation
  const handleClose = () => {
    setIsModalVisible(false);
    setCurrentAnimation(animation); // Reset to initial animation
    setCurrentMessage(''); // Reset message
    setLinkVisible(false); // Hide links
    closeGenericModal();
  };

  const locale = true; // You can control this as per your need
  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  };

  const closingButtonTitle = closeButtonTitle ?? 'enrollment.form.close';
  return (
    <div>
      <Modal
        visible={isModalVisible} // Show modal when successful
        title={setLocale(locale, title)} // Translated title
        closable={false} // Removes the X button
        footer={[
          <Button key="close" onClick={handleClose} disabled={isClosedBtnDisabled}>
            {setLocale(locale, closingButtonTitle)}
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
          {setLocale(locale, secondTitle)}
        </h2>
        {isLinkVisible && (
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
           {messageToDisplay}
          </div>
          )}
      </Modal>
    </div>
  );
};

export default GenericModal;
