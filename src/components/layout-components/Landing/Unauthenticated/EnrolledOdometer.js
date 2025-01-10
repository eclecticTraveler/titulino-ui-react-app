import React, {Component} from 'react'
import { Card } from 'antd';
import IntlMessage from "components/util-components/IntlMessage";

class EnrolledOdometer extends Component {
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
		return (
			<div>	
				<Card bordered={true} title={setLocale(locale, "unauthenticated.dashboard.totalStudents")}>
					<div className='student-count-card'>
						{count}	
					</div>
				</Card>	
			</div>
		)
    }
}




export default EnrolledOdometer;

