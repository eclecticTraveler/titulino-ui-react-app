import React, {Component} from 'react'
import { Card } from 'antd';
import IntlMessage from "components/util-components/IntlMessage";

class DoubleCounterDisplay extends Component {
    componentDidMount() {
		      
	}

	componentDidUpdate() {
	}

	render(){ 
		const locale = true;
		const setLocale = (isLocaleOn, localeKey) => {
			return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
		};
		const countOne = this.props.firstCount || 0;
		const countTwo = this.props.secondCount || 0;
		const title = this.props.localizedTitle || "unavailable";
		return (
			<div>	
				<Card bordered={true} title={setLocale(locale, title)}>
					<div className='double-count-card'>
						<span className='double-count-card-first'>{countOne} </span> | 
						<span className='double-count-card-second'> {countTwo}</span>
					</div>
				</Card>	
			</div>
		)
    }
}




export default DoubleCounterDisplay;

