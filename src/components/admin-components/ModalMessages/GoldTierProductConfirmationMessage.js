import React from 'react';
import { Button } from 'antd';
import { useHistory } from 'react-router-dom';
import IntlMessage from "components/util-components/IntlMessage";
import whatsApp from 'assets/lotties/whatsApp.json';
import Lottie from 'lottie-react';

const GoldTierProductConfirmationMessage = ({handlePostButtonClick}) => {
  const history = useHistory();
  const locale = true;

  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  };

  const doAction = () => {
    handlePostButtonClick();
  };

  return (
    <div>
      <h4>
        {setLocale(locale, "shop.succesPurchase.headerMessageContent")}
      </h4>
      
      <br />
      <br />
      <br />
      <h4>
        {setLocale(locale, "shop.succesPurchase.headerMessageContentGold")}
      </h4>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <Lottie
            animationData={whatsApp}
            loop={true}
            autoplay={true}
            speed={2}
            style={{ width: '100px', height: '100px' }}
          />
        </div>
        <h5>{setLocale(locale, 'enrollment.form.whatsAppLinks')}</h5>
          <a
            href={"https://chat.whatsapp.com/KfpORsFggjK4ASRwBmUOh7"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={doAction} 
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
            {setLocale(locale, 'group.modal.enrollmentCompleted')}
          </a>
    </div>
  );
};

export default GoldTierProductConfirmationMessage;
