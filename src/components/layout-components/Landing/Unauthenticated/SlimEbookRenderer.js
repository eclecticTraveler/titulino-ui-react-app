import React, {Component} from 'react'
import {Card } from 'antd';
import InternalIFrame from 'components/layout-components/InternalIFrame';
import IntlMessage from "components/util-components/IntlMessage";

class SlimEbookRenderer extends Component {

    componentDidMount() {                

    }

    componentDidUpdate(prevProps) {       

	}

	render(){ 
		const locale = true;
		const setLocale = (isLocaleOn, localeKey) => {
		  return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
		};
		const sanitizedCourseTitle = this.props.courseTitle?.replace(/-/g, ' ');
		let subTitle = `eBook`
		return (
			<div>			
				<Card bordered={true} title={subTitle}>	
					<h1>{setLocale(locale, "unauthenticated.dashboard.welcome")} {sanitizedCourseTitle}</h1>
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