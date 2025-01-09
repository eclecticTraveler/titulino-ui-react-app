import React, {Component} from 'react'
import { Card } from 'antd';
import Iframe from 'react-iframe';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import {onLoadingFiveMinLesson}  from 'redux/actions/Lrn';
import utils from 'utils';

class OverviewLesson extends Component {
    componentDidMount() {
		
		const pathInfo = utils.getCourseInfoFromUrl(utils.getPathInCurrentUrl());
		this.props.onLoadingFiveMinLesson(pathInfo?.levelNo, this.props.nativeLanguage?.localizationId, this.props.course, false);
        
	}

	componentDidUpdate() {
	}

	render(){ 
		return (
			<div>	
				<Card bordered={true} title="Course Overview">					
						<Iframe url={this.props.fiveMinuteLesson?.url}
							width="100%"
							height='325px'
							id="internalIFrame"
							/>                           
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
	const { wasUserConfigSet, selectedCourse, nativeLanguage, fiveMinuteLesson } = lrn;
    const { locale, direction, course } =  theme;
	return { locale, direction, course, wasUserConfigSet, selectedCourse, nativeLanguage, fiveMinuteLesson }
};

export default connect(mapStateToProps, mapDispatchToProps)(OverviewLesson);
