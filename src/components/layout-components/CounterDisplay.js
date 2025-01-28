import React, {Component} from 'react'
import { Card } from 'antd';
import IntlMessage from "components/util-components/IntlMessage";

class CounterDisplay extends Component {
    componentDidMount() {
		      
	}

	componentDidUpdate() {
	}

	render(){ 
		const locale = true;
		const setLocale = (isLocaleOn, localeKey) => {
			return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
		};
		const count = this.props.count || 0;
		const title = this.props.localizedTitle || "unavailable";
		return (
			<div>	
				<Card bordered={true} title={setLocale(locale, title)}>
					<div className='student-count-card'>
						{count}	
					</div>
				</Card>	
			</div>
		)
    }
}




export default CounterDisplay;

