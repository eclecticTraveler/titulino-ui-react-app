import React, {Component} from 'react'
import {connect} from 'react-redux';
import { getUserNativeLanguage, getBookChapterUrl}  from 'redux/actions/Lrn';
import { bindActionCreators } from 'redux';
import { env } from '../../../../../configs/EnvironmentConfig';
import Loading from '../../../../../components/shared-components/Loading';
import InternalIFrame from '../../../../../components/layout-components/InternalIFrame';
import UnderConstruccion from '../../../../../components/layout-components/UnderConstruccion';
import utils from 'utils';

class BookSection extends Component {

    loadUrl = () => {
        const pathInfo = utils.getCourseInfoFromUrl(this.props.location?.pathname); 
        this.props.getBookChapterUrl(pathInfo?.levelNo, pathInfo?.chapterNo, this.props.nativeLanguage?.localizationId, this.props.course );
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
        getUserNativeLanguage: getUserNativeLanguage,
        getBookChapterUrl: getBookChapterUrl
	}, dispatch)
}

const mapStateToProps = ({lrn, theme}) => {
	const { nativeLanguage, bookChapterUrl } = lrn;
    const { locale, direction, course } =  theme;
	return { locale, direction, course, nativeLanguage, bookChapterUrl }
};

export default connect(mapStateToProps, mapDispatchToProps)(BookSection);