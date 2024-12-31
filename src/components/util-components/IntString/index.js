import React from "react";
import { FormattedMessage } from "react-intl";

const getLocaleText = (localeKey, defaultMessage = "") => {
  return (
    <FormattedMessage
      id={localeKey}
      defaultMessage={defaultMessage}
      children={(text) => text} // Ensures the resolved string is returned
    />
  );
};

export default getLocaleText;
