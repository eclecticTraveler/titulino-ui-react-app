import React, {Component} from 'react'
import {connect} from 'react-redux';
import {getUserNativeLanguage}  from 'redux/actions/Lrn';
import { bindActionCreators } from 'redux';
import { env } from 'configs/EnvironmentConfig';
import Loading from 'components/shared-components/Loading';
import InternalIFrame from 'components/layout-components/InternalIFrame';
import UnderConstruccion from 'components/layout-components/UnderConstruccion';
import KnowMeV1 from 'components/layout-components/KnowMeV1';
import EmailYearSearchForm from 'components/layout-components/EmailYearSearchForm';
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

  if(this.props.token){
      if(this.props.user?.emailId && !this.props.user?.yearOfBirth){
          return (
              <div id="unathenticated-landing-page-margin">
                  <EmailYearSearchForm/>
              </div>
          )
      }else{
        return (
           <div id="unathenticated-landing-page-margin">
            <KnowMeV1 levelTheme={levelTheme} chapterNo={chapterNo} />
          </div>
        );
      } 
    }else{
      return (
        <div>
         Error: You must be logged in to access this content.
        </div>
      );
    }
  }

}


function mapDispatchToProps(dispatch){
  return bindActionCreators({
        getUserNativeLanguage: getUserNativeLanguage,
  }, dispatch)
}

const mapStateToProps = ({lrn, theme, grant, auth}) => {
  const { nativeLanguage, videoClass } = lrn;
  const { locale, direction, course } =  theme;
  const { user } = grant;
  const { token } = auth; 
  return { locale, direction, course, nativeLanguage, videoClass, token, user }
};

export default connect(mapStateToProps, mapDispatchToProps)(KnowMe);