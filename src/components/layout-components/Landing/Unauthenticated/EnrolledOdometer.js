import React, {Component} from 'react'
import { Card } from 'antd';

class EnrolledOdometer extends Component {
    componentDidMount() {
		      
	}

	componentDidUpdate() {
	}

	render(){ 
		const count = this.props.count || 0;
		return (
			<div>	
				<Card bordered={true} title="Total Students in the Course">
					<div className='student-count-card'>
						{count}	
					</div>
				</Card>	
			</div>
		)
    }
}




export default EnrolledOdometer;

