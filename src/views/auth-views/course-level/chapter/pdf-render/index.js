import React, {Component} from 'react'
import {connect} from 'react-redux';
import {getUserNativeLanguage, getPdfPathUrl}  from 'redux/actions/Lrn';
import { bindActionCreators } from 'redux';
import { env } from '../../../../../configs/EnvironmentConfig';
import Loading from '../../../../../components/shared-components/Loading';
import InternalIFrame from '../../../../../components/layout-components/InternalIFrame';
import UnderConstruccion from '../../../../../components/layout-components/UnderConstruccion';
import utils from 'utils';

class PdfRender extends Component {

    loadLocalPathUrl = () => {
        const pathInfo = utils.getCourseInfoFromUrl(this.props.location?.pathname); 
        this.props.getPdfPathUrl(pathInfo?.levelNo, pathInfo?.chapterNo, this.props.nativeLanguage?.localizationId, this.props.course);
    }
    
    componentDidMount() {                
        this.loadLocalPathUrl();
    }

    componentDidUpdate(prevProps) {       
        if (prevProps?.location?.pathname !== this.props.location?.pathname) {
            this.loadLocalPathUrl();
        }
      }

    render() {  
        if(!this.props.pdfPathUrl) {
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
                    <InternalIFrame iFrameUrl={`${this.props.pdfPathUrl}`}/>                    
                </div>
            )
        }    
    }
}


function mapDispatchToProps(dispatch){
	return bindActionCreators({
        getUserNativeLanguage: getUserNativeLanguage,
        getPdfPathUrl: getPdfPathUrl
	}, dispatch)
}

const mapStateToProps = ({lrn, theme}) => {
	const {  nativeLanguage, pdfPathUrl } = lrn;
    const { locale, direction, course } =  theme;
	return { locale, direction, course, nativeLanguage, pdfPathUrl }
};

export default connect(mapStateToProps, mapDispatchToProps)(PdfRender);