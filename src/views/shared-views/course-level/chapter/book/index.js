import React, {Component} from 'react'
import {connect} from 'react-redux';
import { getBookChapterUrl, getUserBaseLanguage, getUserEBookChapterUrl}  from 'redux/actions/Lrn';
import { bindActionCreators } from 'redux';
import Loading from 'components/shared-components/Loading';
import InternalIFrame from 'components/layout-components/InternalIFrame';
import UnderConstruccion from 'components/layout-components/UnderConstruccion';
import utils from 'utils';

class BookSection extends Component {

    loadUrl = () => {
        const pathInfo = utils.getCourseInfoFromUrl(this.props.location?.pathname);
        if(this.props.user?.emailId){
            this.props.getUserEBookChapterUrl(pathInfo?.levelNo, pathInfo?.chapterNo, this.props.baseLanguage?.localeCode, this.props.contentLanguage, this.props.user?.emailId );
        }else{
            this.props.getBookChapterUrl(pathInfo?.levelNo, pathInfo?.chapterNo, this.props.baseLanguage?.localeCode, this.props.contentLanguage );
        }    
    }
    
    componentDidMount() {                
        this.loadUrl();
    }

    componentDidUpdate(prevProps) {       
        if (prevProps?.location?.pathname !== this.props.location?.pathname) {
            this.loadUrl();
        }
      }

    render() {  
        if(!this.props.bookChapterUrl) {
            return (
                <div>
                    <div>
                        <Loading cover="content"/>
                    </div>
                    <UnderConstruccion/>                
                </div>
            )
        }else{
            return (
                <div>
                    <InternalIFrame iFrameUrl={`${this.props.bookChapterUrl}`}/>                    
                </div>
            )
        }    
    }
}


function mapDispatchToProps(dispatch){
	return bindActionCreators({
        getUserBaseLanguage: getUserBaseLanguage,
        getUserEBookChapterUrl: getUserEBookChapterUrl,
        getBookChapterUrl: getBookChapterUrl
	}, dispatch)
}

const mapStateToProps = ({lrn, theme, grant}) => {
	const { baseLanguage, bookChapterUrl } = lrn;
    const { locale, direction, contentLanguage } =  theme;
    const { user } = grant;
	return { locale, direction, contentLanguage, baseLanguage, bookChapterUrl, user }
};

export default connect(mapStateToProps, mapDispatchToProps)(BookSection);