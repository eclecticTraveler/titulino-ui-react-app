import React, {Component} from 'react'
import { Card } from 'antd';
import Iframe from 'react-iframe';
import utils from 'utils';

class OverviewLesson extends Component {
    componentDidMount() {		
        
	}

	componentDidUpdate() {
	}

	render(){
		const temporalURL = `https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fbusiness.facebook.com%2Ftitulinoingles%2Fvideos%2F8908980605885374%2F&show_text=false&width=560&t=0`;
		return (
			<div>	
				<Card bordered={true} title="Course Overview">					
						<Iframe url={temporalURL}
							width="100%"
							height='325px'
							id="internalIFrame"
							/>                           
				</Card>	
			</div>
		)
    }
}


export default OverviewLesson;
