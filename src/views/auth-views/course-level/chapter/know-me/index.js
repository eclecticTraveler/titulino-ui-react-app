import React, {Component} from 'react'
import {connect} from 'react-redux';
import {getUserNativeLanguage}  from 'redux/actions/Lrn';
import { bindActionCreators } from 'redux';
import { env } from 'configs/EnvironmentConfig';
import Loading from 'components/shared-components/Loading';
import InternalIFrame from 'components/layout-components/InternalIFrame';
import UnderConstruccion from 'components/layout-components/UnderConstruccion';
import KnowMeV1 from 'components/layout-components/KnowMeV1';
import TestForm from 'components/layout-components/TestForm';
import utils from 'utils';

class KnowMe extends Component {

    loadUrl = () => {
        // const pathInfo = utils.getCourseInfoFromUrl(this.props.location?.pathname); 
        // this.props.getKnowMeQuestions(pathInfo?.levelNo, pathInfo?.chapterNo, this.props.nativeLanguage?.localizationId, this.props.course );
    }
    
    componentDidMount() {                
        // this.loadUrl();
    }

    componentDidUpdate(prevProps) {       
        if (prevProps?.location?.pathname !== this.props.location?.pathname) {
            // this.loadUrl();
        }
      }

  render() {  
    const pathInfo = utils.getCourseInfoFromUrl(this.props.location?.pathname); 
    const levelTheme = pathInfo?.levelNo;
    const chapterNo = pathInfo?.chapterNo;

    return (
      <div>
        <KnowMeV1 levelTheme={levelTheme} chapterNo={chapterNo} />
        {/* <TestForm/> */}
      </div>
    );
  }

}


function mapDispatchToProps(dispatch){
  return bindActionCreators({
        getUserNativeLanguage: getUserNativeLanguage,
  }, dispatch)
}

const mapStateToProps = ({lrn, theme, grant}) => {
  const { nativeLanguage, videoClass } = lrn;
  const { locale, direction, course } =  theme;
  const { user } = grant;
  return { locale, direction, course, nativeLanguage, videoClass }
};

export default connect(mapStateToProps, mapDispatchToProps)(KnowMe);