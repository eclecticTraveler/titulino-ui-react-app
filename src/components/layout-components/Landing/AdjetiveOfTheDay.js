import React, {Component} from 'react'
import { Row, Col, Card } from 'antd';
import Iframe from 'react-iframe';

class AdjetiveOfTheDay extends Component {
    componentDidMount() {

	}

	componentDidUpdate() {

	}

	render(){ 
		return (
			<div>			
				<Card bordered={true} >
				<h2>Adjetive of the Day</h2>
					<Card>
						<h3>Bewildered</h3>						
						<div>/bəˈwildərd/</div> 
						<br/>
						<b>Meaning:</b><div> perplexed and confused; very puzzled.</div>
						<br/>
						<b>Example:</b><div>"he saw the <b>bewildered</b> look on my face"</div>                          
					</Card>
				</Card>
			</div>
		)
    }
}

export default AdjetiveOfTheDay;
