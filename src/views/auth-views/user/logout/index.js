import React, {Component, useEffect} from 'react'
import UserService from '../../../../services/UserService';
import { DEFAULT_PREFIX_VIEW, APP_PREFIX_PATH } from "../../../../configs/AppConfig";
import { Redirect } from "react-router-dom";
import { env } from '../../../../configs/EnvironmentConfig';
import InternalIFrame from '../../../../components/layout-components/InternalIFrame';


function executeLogout(){
	// TODO: Get the push to be working more accordingly than using the server to handle it
	UserService.doLogout();	
	this.props.history.push('/');
}

class Logout extends Component {
	
	componentDidMount() {
		executeLogout();
	}

	render(){		
		return (
			<div>                        
				<div><InternalIFrame iFrameUrl={`${env.VANTAGE_URI}/login/login/logout`}/></div>                                                                 
			</div>    
		)
	}

}

export default Logout;
