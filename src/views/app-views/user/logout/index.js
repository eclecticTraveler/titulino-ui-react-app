import React, {Component} from 'react'
import UserService from '../../../../services/UserService';


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
				<div>Logout</div>                                                                 
			</div>    
		)
	}

}

export default Logout;
