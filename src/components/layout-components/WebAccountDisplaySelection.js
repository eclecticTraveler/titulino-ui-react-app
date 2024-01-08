import IconFallback from "../../components/util-components/IconFallback";
import React, { Component } from 'react'

export class WebAccountDisplaySelection extends Component {
	render(){  
		const{webAccounts} = this.props;
		const listOfAccounts = webAccounts.map((account, i) => 
			<div key={i} className="single-web-account" onClick={() => alert(account.CompanyId)}>
				<div className="single-acc-arrow">
					<IconFallback path={"../img/sidebar/Account-Chevron-Right.svg"} />
				</div>
				<div>
					<h3>{account.CompanyName}</h3>
				</div>
			</div>			
		)

        return(	
			<div>
				{listOfAccounts}
			</div>
		)
    }

}

export default WebAccountDisplaySelection
