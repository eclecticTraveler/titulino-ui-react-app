import React, {Component} from 'react'
import { Card } from 'antd';
import Iframe from 'react-iframe';
import utils from 'utils';
import IntlMessage from "components/util-components/IntlMessage";

class OverviewLesson extends Component {
    componentDidMount() {		
        
	}

	componentDidUpdate() {
	}

	render(){
		const locale = true;
		const setLocale = (isLocaleOn, localeKey) => {
			return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
		};
		const temporalURL = `https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fbusiness.facebook.com%2Ftitulinoingles%2Fvideos%2F8908980605885374%2F&show_text=false&width=560&t=0`;
		return (
			<div>	
				<Card bordered={true} title={setLocale(locale, "unauthenticated.dashboard.courseOverview")}>
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
