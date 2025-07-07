import React, { useEffect } from 'react';
import { Tabs } from 'antd';
import { connect } from 'react-redux';
import { ongettingUserVideoClassArrayUrls } from 'redux/actions/Lrn';
import InternalIFrame from 'components/layout-components/InternalIFrame';
import UnderConstruccion from 'components/layout-components/UnderConstruccion';
import utils from 'utils';
import { useLocation } from 'react-router-dom';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import { faLevelDown, faLevelUp } from '@fortawesome/free-solid-svg-icons';
import IntlMessage from "components/util-components/IntlMessage";
import IconAdapter from "components/util-components/IconAdapter";

const VideoClasses = ({
  videoClassUrls,
  ongettingUserVideoClassArrayUrls,
  nativeLanguage,
  course,
  userProficiencyOrder,
  user
}) => {
  const location = useLocation();
 const { TabPane } = Tabs;
   const locale = true;
  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  };

  useEffect(() => {
    const pathInfo = utils.getCourseInfoFromUrl(location?.pathname);
    if(user?.emailId){
      ongettingUserVideoClassArrayUrls(
        pathInfo?.levelNo,
        pathInfo?.chapterNo,
        nativeLanguage?.localizationId,
        course,
        user?.emailId
      );
    }
    // ongettingVideoClassArrayUrls(
    //   pathInfo?.levelNo,
    //   pathInfo?.chapterNo,
    //   nativeLanguage?.localizationId,
    //   course
    // );
  }, [location?.pathname, nativeLanguage?.localizationId, course, user?.email]);

  if (!videoClassUrls || videoClassUrls.length === 0) {
    return <UnderConstruccion />;
  }

    const videoClass = videoClassUrls;
    console.log("userProficiencyOrder", userProficiencyOrder);

    // for V5 ANTD Tabs
    // const items = ['basic', 'advanced']?.map(category => ({
    // key: category,
    // label: category.charAt(0).toUpperCase() + category.slice(1),
    // children:<InternalIFrame iFrameUrl={videoClass[category]} />
    // }));

  return (
    <div id="iframed-double-page">
      {/* <Tabs defaultActiveKey={activeCategory} items={items} /> for V5 */}
        <Tabs type="card" defaultActiveKey={userProficiencyOrder}>
        {['basic', 'advanced'].map(category => (
            <TabPane
            tab={
                <span>
                <IconAdapter icon={category === "basic" ? faLevelDown : faLevelUp} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />        
                {setLocale(locale, `classes.grammar.${category}`)}
                </span>
            } 
            key={category}
            >
            <span>
                <InternalIFrame iFrameUrl={videoClass[category]} className="iframed-video-classes" />
            </span>
            </TabPane>
        ))}
        </Tabs>
    </div>
  );
};

const mapStateToProps = ({ lrn, theme, grant }) => {
  const { videoClassUrls, nativeLanguage, userProficiencyOrder } = lrn;
  const { course } = theme;
  const { user } = grant;
  return { videoClassUrls, nativeLanguage, userProficiencyOrder, course, user };
};

export default connect(mapStateToProps, { ongettingUserVideoClassArrayUrls })(VideoClasses);
