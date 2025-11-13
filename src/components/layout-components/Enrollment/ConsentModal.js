import React, { useState } from "react";
import { Modal, Button } from "antd";

const ConsentModal = ({ label, title = "Detalles del consentimiento" }) => {
  const [isVisible, setIsVisible] = useState(false);

  const showModal = (e) => {
    e.preventDefault();
    setIsVisible(true);
  };
  const handleClose = () => setIsVisible(false);

  return (
    <>
      <a href="#" onClick={showModal}>
        Terminos
      </a>
      <Modal
        title={title}
        visible={isVisible}
        onCancel={handleClose}
        footer={[
          <Button key="close" type="primary" onClick={handleClose}>
            Cerrar
          </Button>,
        ]}
      >
        <p style={{ whiteSpace: "pre-line", fontSize: "15px" }}>{label}</p>
      </Modal>
    </>
  );
};

export default ConsentModal;
