import React, {Component} from 'react'
import {Card } from 'antd';
import InternalIFrame from 'components/layout-components/InternalIFrame';

class SlimEbookRenderer extends Component {

    componentDidMount() {                

    }

    componentDidUpdate(prevProps) {       

	}

	render(){ 
		const sanitizedCourseTitle = this.props.courseTitle?.replace(/-/g, ' ');
		let title = `Welcome to ${sanitizedCourseTitle}`;
		let subTitle = `eBook`
		return (
			<div>			
				<Card bordered={true} title={subTitle}>	
					<h1>{title}</h1>
					<Card bordered={false}
						cover={
							<InternalIFrame iFrameUrl={this.props.ebookUrl}/>  
						}>
					</Card>
				</Card>
			</div>
		)
    }
}

export default SlimEbookRenderer;