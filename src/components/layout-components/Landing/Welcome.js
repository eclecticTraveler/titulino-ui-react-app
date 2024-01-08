import React, {Component} from 'react'
import {Card } from 'antd';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import {getWasUserConfigSetFlag, getUserSelectedCourse, getUserNativeLanguage}  from '../../../redux/actions/Lrn';


class Welcome extends Component {
    componentDidMount() {

	}

	componentDidUpdate() {

	}

	startRandomClass() {
		alert(this.props.coursePath);
	}

	render(){ 
		// Need to adjust the levels and the pictures for each level as well as a function that randomly pushes to some lesson
		let title = `Welcome to ${this.props.courseTitle}`;
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
							alt="student"
							src="https://images.unsplash.com/photo-1567662810010-05f4f9896cb2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
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
        getWasUserConfigSetFlag: getWasUserConfigSetFlag, 
        getUserSelectedCourse: getUserSelectedCourse,
        getUserNativeLanguage: getUserNativeLanguage
	}, dispatch)
}

const mapStateToProps = ({lrn, theme}) => {
	const { wasUserConfigSet, selectedCourse, nativeLanguage } = lrn;
    const { locale, direction, course } =  theme;
	return { locale, direction, course, wasUserConfigSet, selectedCourse, nativeLanguage }
};

export default connect(mapStateToProps, mapDispatchToProps)(Welcome);