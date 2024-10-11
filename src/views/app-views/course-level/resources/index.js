import React, {Component} from 'react'
import {connect} from 'react-redux';
import {getWasUserConfigSetFlag, getUserSelectedCourse, getUserNativeLanguage, getBookChapterUrl}  from 'redux/actions/Lrn';
import { bindActionCreators } from 'redux';
import { env } from 'configs/EnvironmentConfig';
import Loading from 'components/shared-components/Loading';
import InternalIFrame from 'components/layout-components/InternalIFrame';
import UnderConstruccion from 'components/layout-components/UnderConstruccion';
import utils from 'utils';

class ExternalFormSection extends Component {

    loadUrl = () => {
        const pathInfo = utils.getCourseInfoFromUrl(this.props.location?.pathname); 
        this.props.getBookChapterUrl(pathInfo?.levelNo, pathInfo?.chapterNo, this.props.nativeLanguage?.localizationId, this.props.course );
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
        return (
            <div>
                <InternalIFrame iFrameUrl={`https://docs.google.com/forms/d/e/1FAIpQLSdBZq_Debn07RWOG1gTF2NVzKrv6iVkO8L7p6-q4twzZ91lTg/viewform`}/>                    
            </div>
        ) 
        // if(!this.props.bookChapterUrl) {
        //     return (
        //         <div>
        //             <div>
        //                 <Loading cover="content"/>
        //             </div>
        //             <UnderConstruccion/>                
        //         </div>
        //     )
        // }else{
        //     return (
        //         <div>
        //             <InternalIFrame iFrameUrl={`https://docs.google.com/forms/d/e/1FAIpQLSdBZq_Debn07RWOG1gTF2NVzKrv6iVkO8L7p6-q4twzZ91lTg/viewform`}/>                    
        //         </div>
        //     )
        // }    
    }
}


function mapDispatchToProps(dispatch){
	return bindActionCreators({
        getWasUserConfigSetFlag: getWasUserConfigSetFlag, 
        getUserSelectedCourse: getUserSelectedCourse,
        getUserNativeLanguage: getUserNativeLanguage,
        getBookChapterUrl: getBookChapterUrl
	}, dispatch)
}

const mapStateToProps = ({lrn, theme}) => {
	const { wasUserConfigSet, selectedCourse, nativeLanguage, bookChapterUrl } = lrn;
    const { locale, direction, course } =  theme;
	return { locale, direction, course, wasUserConfigSet, selectedCourse, nativeLanguage, bookChapterUrl }
};

export default connect(mapStateToProps, mapDispatchToProps)(ExternalFormSection);