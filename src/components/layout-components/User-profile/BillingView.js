import React, {Component} from 'react'
import { Row, Col, Card } from 'antd';
import Iframe from 'react-iframe';

class BillingView extends Component {
    componentDidMount() {

	}

	componentDidUpdate() {

	}

	render(){ 
		return (
			<div>			
				<div>
				<Row gutter={16}>
					<Col xs={24} sm={24} md={17}>
					<Card bordered={false}>						
						<Iframe url={`https://www.youtube.com/embed/tgbNymZ7vqY`}
							width="100%"
							height="600px"
							id="internalIFrame"
							/>
					</Card>
					</Col>						
				</Row>
			</div>
			</div>
		)
    }
}

export default BillingView;
