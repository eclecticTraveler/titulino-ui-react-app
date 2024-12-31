import React, { useState } from "react";
import { Modal, Button } from "antd";
import IntlMessage from "components/util-components/IntlMessage";

const TermsModal = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => setIsModalVisible(true);
  const handleClose = () => setIsModalVisible(false);
  
  const locale = true;
  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  };

  return (
    <>
      <a href="#" onClick={(e) => { e.preventDefault(); showModal(); }}>
        {setLocale(locale, "enrollment.form.termsAndConditions")}
      </a>
      <Modal
        title={setLocale(locale, "enrollment.form.termsAndConditionsTitle")}
        visible={isModalVisible}
        onCancel={handleClose}
        footer={[
          <Button key="close" onClick={handleClose}>
            {setLocale(locale, "enrollment.form.close")}
          </Button>,
        ]}
      >
        <p>{setLocale(locale, "enrollment.form.termsAndConditionsContent") || "To display"}</p>
       
      </Modal>
    </>
  );
};

export default TermsModal;
