import React, {Component} from 'react'
import {Card } from 'antd';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import {onLoadingLandingPicture}  from 'redux/actions/Lrn';


class Welcome extends Component {
    componentDidMount() {
		this.props.onLoadingLandingPicture(false);
	}

	componentDidUpdate() {

	}

	startRandomClass() {
		alert(this.props.coursePath);
	}

	render(){ 
		// Need to adjust the levels and the pictures for each level as well as a function that randomly pushes to some lesson
		const sanitizedCourseTitle = this.props.courseTitle?.replace(/-/g, ' ');
		let title = `Welcome to ${sanitizedCourseTitle}`;
		return (
			<div>			
				<Card bordered={true} 
					actions={[																				
						<span onClick={() => this.startRandomClass()}>CLICK HERE TO START A RANDOM CLASS</span>,
						]}>	
					<h1>{title}</h1>
					<Card bordered={false}
						cover={
							<img
							alt={this.props.landingObjectPictureOfTheDay?.description}
							src={this.props.landingObjectPictureOfTheDay?.url}
							/>
						}>
					</Card>
				</Card>
			</div>
		)
    }
}


function mapDispatchToProps(dispatch){
	return bindActionCreators({
		onLoadingLandingPicture: onLoadingLandingPicture
	}, dispatch)
}

const mapStateToProps = ({lrn, theme}) => {
	const { nativeLanguage, landingObjectPictureOfTheDay } = lrn;
    const { locale, direction, course } =  theme;
	return { locale, direction, course, nativeLanguage, landingObjectPictureOfTheDay }
};

export default connect(mapStateToProps, mapDispatchToProps)(Welcome);