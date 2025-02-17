import React from "react";
import { Alert } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import IntlMessage from "components/util-components/IntlMessage";

const CoursesNotAvailableMessage = () => {
  const locale = true;

  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Titulino Languages</h2>

      <Alert
        message={setLocale(locale, "enrollment.coursesNotAvailable")}
        description={
          <>
            <p className="mb-2">
              {setLocale(locale, "enrollment.coursesNotAvailableMessage")}
            </p>
            <p className="mb-2">
            {setLocale(locale, "enrollment.coursesNotAvailableMessage2")} <a href="https://www.facebook.com/titulinoingles" target="_blank" rel="noopener noreferrer" className="text-blue-500 font-semibold"> {setLocale(locale, "enrollment.coursesNotAvailableMessage3")}</a>.
            </p>
          </>
        }
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        className="p-4"
      />
    </div>
  );
};

export default CoursesNotAvailableMessage;
