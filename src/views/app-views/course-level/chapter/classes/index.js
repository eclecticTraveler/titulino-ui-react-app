import React, { useEffect } from 'react';
import { Tabs } from 'antd';
import { connect } from 'react-redux';
import { ongettingVideoClassArrayUrls } from 'redux/actions/Lrn';
import InternalIFrame from 'components/layout-components/InternalIFrame';
import UnderConstruccion from 'components/layout-components/UnderConstruccion';
import utils from 'utils';
import { useLocation } from 'react-router-dom';

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

  const activeCategory = getGrammarCategory(userProficiencyOrder);
  const videoClass = videoClassUrls[0]; // assuming 1 result per request

  const items = ['basic', 'advanced'].map(category => ({
    key: category,
    label: category.charAt(0).toUpperCase() + category.slice(1),
    children: <InternalIFrame iFrameUrl={videoClass[category]} />
  }));

  return (
    <div id="unathenticated-page">
      <Tabs defaultActiveKey={activeCategory} items={items} />
    </div>
  );
};

const mapStateToProps = ({ lrn, theme }) => {
  const { videoClassUrls, nativeLanguage, userProficiencyOrder } = lrn;
  const { course } = theme;
  return { videoClassUrls, nativeLanguage, userProficiencyOrder, course };
};

export default connect(mapStateToProps, { ongettingVideoClassArrayUrls })(VideoClasses);
