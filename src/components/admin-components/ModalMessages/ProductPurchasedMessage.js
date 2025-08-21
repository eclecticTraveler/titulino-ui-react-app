import React from 'react';
import { Button } from 'antd';
import { useHistory } from 'react-router-dom';
import IntlMessage from "components/util-components/IntlMessage";
import { getLocalizedConfig } from 'configs/CourseMainNavigationConfig/Submenus/ConfigureNavigationLocalization';

const ProductPurchasedMessage = ({handlePostButtonClick}) => {
  const history = useHistory();
  const locale = true;

  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  };

  const doAction = () => {
    handlePostButtonClick();
    history.push("/");
  };

  return (
    <div>
      <h4>
        {setLocale(locale, "shop.succesPurchase.headerMessageContent")}
      </h4>
      <br />
      <Button 
        onClick={doAction} 
        size="large" 
        style={{ backgroundColor: "#f0f0f0", color: "#000", borderColor: "#d9d9d9" }}
      >
        {setLocale(locale, "shop.succesPurchase.letsExplore")}
      </Button>
    </div>
  );
};

export default ProductPurchasedMessage;
