import React, {Component} from 'react'
import { Card } from 'antd';
import Iframe from 'react-iframe';

class FiveMinLesson extends Component {
    componentDidMount() {
		console.log("PEOPLE");
		console.log(this.props);
	}

	componentDidUpdate() {

	}

	render(){ 
		return (
			<div>	
				<Card bordered={true} >
				<h2>5 minute lesson</h2>
					<Card>
						<h3>Subject Personal Pronouns</h3>	
						<Iframe url={`https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Ftitulinoingles%2Fvideos%2F263322375545435%2F&show_text=false`}
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

export default FiveMinLesson;
