import React, {Component} from 'react'
import {Card } from 'antd';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import {getWasUserConfigSetFlag, getUserSelectedCourse, getUserNativeLanguage, onLoadingLandingPage}  from '../../../redux/actions/Lrn';


class Welcome extends Component {
    componentDidMount() {
        this.props.onLoadingLandingPage(false);
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
        getWasUserConfigSetFlag: getWasUserConfigSetFlag,
        getUserSelectedCourse: getUserSelectedCourse,
        getUserNativeLanguage: getUserNativeLanguage,
        onLoadingLandingPage: onLoadingLandingPage
    }, dispatch)
}

const mapStateToProps = ({lrn, theme}) => {
    const { wasUserConfigSet, selectedCourse, nativeLanguage, landingObjectPictureOfTheDay } = lrn;
    const { locale, direction, course } =  theme;
    return { locale, direction, course, wasUserConfigSet, selectedCourse, nativeLanguage, landingObjectPictureOfTheDay }
};

export default connect(mapStateToProps, mapDispatchToProps)(Welcome);