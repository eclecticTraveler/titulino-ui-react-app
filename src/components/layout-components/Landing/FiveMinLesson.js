import React, {Component} from 'react'
import { Card } from 'antd';
import Iframe from 'react-iframe';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import {onLoadingFiveMinLesson}  from 'redux/actions/Lrn';
import utils from 'utils';

class FiveMinLesson extends Component {
    componentDidMount() {
		
		const pathInfo = utils.getCourseInfoFromUrl(utils.getPathInCurrentUrl());
		this.props.onLoadingFiveMinLesson(pathInfo?.levelNo, this.props.baseLanguage?.localeCode, this.props.contentLanguage, false);
        
	}

	componentDidUpdate() {
	}

	render(){ 
		return (
			<div>	
				<Card variant="outlined" >
				<h2>{`5 minute lesson: ${this.props.fiveMinuteLesson?.lessonTitle}`}</h2>
					<Card>						
						<Iframe url={this.props.fiveMinuteLesson?.url}
							width="100%"
							height="225px"
							id="internalIFrame"
							/>                           
					</Card>
				</Card>	
			</div>
		)
    }
}

function mapDispatchToProps(dispatch){
	return bindActionCreators({
		onLoadingFiveMinLesson: onLoadingFiveMinLesson
	}, dispatch)
}

const mapStateToProps = ({lrn, theme}) => {
	const { baseLanguage, fiveMinuteLesson } = lrn;
    const { locale, direction, contentLanguage } =  theme;
	return { locale, direction, contentLanguage, baseLanguage, fiveMinuteLesson }
};

export default connect(mapStateToProps, mapDispatchToProps)(FiveMinLesson);
