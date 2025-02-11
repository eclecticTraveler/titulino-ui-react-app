import React, {Component} from 'react'
import { Row, Col } from 'antd';
import SlimEbookRenderer from './SlimEbookRenderer';
import OverviewLesson from './OverviewLesson';
import PhasalVerbOfTheDay from '../PhasalVerbOfTheDay';
import AdjetiveOfTheDay from '../AdjetiveOfTheDay';
import EnrolleeByRegionWidget from './EnrolleeByRegionWidget';
import EnrolledOdometer from './EnrolledOdometer';

class CourseLandingDashboard extends Component {
    componentDidMount() {

	}

	componentDidUpdate() {
	}

	render(){ 
		return (
            <div>
                <Row gutter={16}>	    
					<Col xs={24} sm={24} md={24} lg={8}>			
						<SlimEbookRenderer courseTitle={this.props.course} ebookUrl={this.props.url}/>
					</Col>

					<Col xs={24} sm={24} md={24} lg={16}>
					<Row gutter={16}>
						<Col xs={24} sm={24} md={24} lg={14}>
							<OverviewLesson />
						</Col>
						<Col xs={24} sm={24} md={24} lg={10}>
							<EnrolledOdometer count={this.props.totalStudentsCount}/>
						</Col>
						</Row>

						<EnrolleeByRegionWidget enrolleeRegionData={this.props.enrolleeRegion} />
					</Col>
				</Row>
            </div>
		)
    }
}

export default CourseLandingDashboard;
