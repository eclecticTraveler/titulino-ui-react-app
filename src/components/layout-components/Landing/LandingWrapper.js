import React, {Component} from 'react'
import { Row, Col } from 'antd';
import Welcome from './Welcome';
import FiveMinLesson from './FiveMinLesson';
import PhraseOfTheDay from './PhraseOfTheDay';
import PhasalVerbOfTheDay from './PhasalVerbOfTheDay';
import AdjetiveOfTheDay from './AdjetiveOfTheDay';

class LandingWrapper extends Component {
    componentDidMount() {

	}

	componentDidUpdate() {

	}

	render(){ 
		return (
            <div>
                <Row gutter={16}>	    
					<Col lg={8}>			
						<Welcome courseTitle={this.props.course} coursePath={this.props.coursePath}/>
					</Col>

					<Col lg={8}>
 						<PhraseOfTheDay />
                        <FiveMinLesson />
					</Col>

                    <Col lg={8}>
                        <PhasalVerbOfTheDay/>
						<AdjetiveOfTheDay/>
					</Col>
				</Row>
            </div>
		)
    }
}

export default LandingWrapper;
