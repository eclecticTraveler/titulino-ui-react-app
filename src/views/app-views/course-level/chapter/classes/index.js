import React, { useEffect } from 'react';
import { Tabs } from 'antd';
import { connect } from 'react-redux';
import { ongettingVideoClassArrayUrls } from 'redux/actions/Lrn';
import InternalIFrame from 'components/layout-components/InternalIFrame';
import UnderConstruccion from 'components/layout-components/UnderConstruccion';
import utils from 'utils';
import { useLocation } from 'react-router-dom';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import { faLevelDown, faLevelUp } from '@fortawesome/free-solid-svg-icons';
import IntlMessage from "components/util-components/IntlMessage";
import IconAdapter from "components/util-components/IconAdapter";

const getGrammarCategory = (proficiencyOrderId) => {
  if (proficiencyOrderId === null || proficiencyOrderId === undefined) return 'basic';
  return proficiencyOrderId <= 1 ? 'basic' : 'advanced';
};

const VideoClasses = ({
  videoClassUrls,
  ongettingVideoClassArrayUrls,
  nativeLanguage,
  course,
  userProficiencyOrder
}) => {
  const location = useLocation();
 const { TabPane } = Tabs;
   const locale = true;
  const setLocale = (isLocaleOn, localeKey) => {
    return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
  };

  useEffect(() => {
    const pathInfo = utils.getCourseInfoFromUrl(location?.pathname);
    ongettingVideoClassArrayUrls(
      pathInfo?.levelNo,
      pathInfo?.chapterNo,
      nativeLanguage?.localizationId,
      course
    );
  }, [location?.pathname, ongettingVideoClassArrayUrls, nativeLanguage?.localizationId, course]);

  if (!videoClassUrls || videoClassUrls.length === 0) {
    return <UnderConstruccion />;
  }

    const videoClass = videoClassUrls;
    const rawCategory = getGrammarCategory(userProficiencyOrder);
    const activeCategory = (rawCategory === 'basic' || rawCategory === 'advanced') ? rawCategory : 'basic';

    // for V5 ANTD Tabs
    // const items = ['basic', 'advanced']?.map(category => ({
    // key: category,
    // label: category.charAt(0).toUpperCase() + category.slice(1),
    // children:<InternalIFrame iFrameUrl={videoClass[category]} />
    // }));

  return (
    <div id="iframed-double-page">
      {/* <Tabs defaultActiveKey={activeCategory} items={items} /> for V5 */}
        <Tabs type="card" defaultActiveKey={activeCategory}>
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

const mapStateToProps = ({ lrn, theme }) => {
  const { videoClassUrls, nativeLanguage, userProficiencyOrder } = lrn;
  const { course } = theme;
  return { videoClassUrls, nativeLanguage, userProficiencyOrder, course };
};

export default connect(mapStateToProps, { ongettingVideoClassArrayUrls })(VideoClasses);
