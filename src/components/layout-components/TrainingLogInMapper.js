// import React, {Component} from 'react';
// import { bindActionCreators } from 'redux';
// import {connect} from 'react-redux';
// import Loading from '../../components/shared-components/Loading';

// class TrainingLogInMapper extends Component {
//     componetDidMount(){
//         console.log("componetDidMount");
//     }

//     componentDidUpdate(){    
//         if(this.props.areCredentialsMappedSuccesfully){
//             window.location.reload();            
//         }
//     }

//     handleTrainingSubmit = (event) => {    
//         event.preventDefault();
//         this.props.submitTrainingCredentials(event.target.elements.usernameToMap.value, event.target.elements.passwordToMap.value);

//     }
//     render(){
//         return (
//         <div>      
//             <div className="logInInnerColoredContainer">
//                 <div className="logInInnerColoredContent">
//                 <div>
//                     <h3 className="contentTitle">Enter your InTheKnow training credentials
//                     </h3>
//                 </div>
//                 <div className="logInInnerColoredContentBody">          
//                     <form onSubmit={this.handleTrainingSubmit} class="training-login-form" className="log-in" autocomplete="off">                     
//                     <p>Please enter your username and password to access your account.
//                     </p>
//                     <div className="floating-label">
//                         <input placeholder="Username / Email" type="text" name="usernameToMap" id="username" autocomplete="off" required></input>
//                         <label for="username">Username / Email:
//                         </label>
//                         <div className="icon">                  
//                         <svg enable-background="new 0 0 100 100" version="1.1" viewBox="0 0 100 100">
//                             <g transform="translate(0 -952.36)">
//                             <path d="m17.5 977c-1.3 0-2.4 1.1-2.4 2.4v45.9c0 1.3 1.1 2.4 2.4 2.4h64.9c1.3 0 2.4-1.1 2.4-2.4v-45.9c0-1.3-1.1-2.4-2.4-2.4h-64.9zm2.4 4.8h60.2v1.2l-30.1 22-30.1-22v-1.2zm0 7l28.7 21c0.8 0.6 2 0.6 2.8 0l28.7-21v34.1h-60.2v-34.1z"/>
//                             </g>
//                             <rect className="st0" width="100" height="100"/>
//                         </svg>              
//                         </div>
//                     </div>
//                     <div className="floating-label">
//                         <input placeholder="Password" type="password" name="passwordToMap" id="password" autocomplete="off" required></input>
//                         <label for="password">Password:
//                         </label>
//                         <div className="icon">                  
//                         <svg enable-background="new 0 0 24 24" version="1.1" viewBox="0 0 24 24">
//                             <rect className="st0" width="24" height="24"/>
//                             <path className="st1" d="M19,21H5V9h14V21z M6,20h12V10H6V20z"/>
//                             <path className="st1" d="M16.5,10h-1V7c0-1.9-1.6-3.5-3.5-3.5S8.5,5.1,8.5,7v3h-1V7c0-2.5,2-4.5,4.5-4.5s4.5,2,4.5,4.5V10z"/>
//                             <path className="st1" d="m12 16.5c-0.8 0-1.5-0.7-1.5-1.5s0.7-1.5 1.5-1.5 1.5 0.7 1.5 1.5-0.7 1.5-1.5 1.5zm0-2c-0.3 0-0.5 0.2-0.5 0.5s0.2 0.5 0.5 0.5 0.5-0.2 0.5-0.5-0.2-0.5-0.5-0.5z"/>
//                         </svg>
//                         </div>
//                     </div>
//                     <button className="elearn-submit-btn" type="submit" onClick="return false;">Log in
//                     </button>
//                     </form>
//                     {/* <Loading cover="content"/>  */}
//                     {(this.props.haveCredentialsbeenSubmited && !this.props.areCredentialsMappedSuccesfully) && <p class="elearn-feedback">* {this.props.responseServerMessage}</p>}
//                 </div>
//                 </div>
//             </div>
//         </div>
//     );
//   }
// }

//   function mapDispatchToProps(dispatch){
// 	return bindActionCreators({
// 		submitTrainingCredentials: submitTrainingCredentials
// 	}, dispatch)
// }

// const mapStateToProps = ({lrn}) => {
// 	const {areCredentialsMappedSuccesfully, haveCredentialsbeenSubmited, responseServerMessage} = lrn;    
// 	return {areCredentialsMappedSuccesfully, haveCredentialsbeenSubmited, responseServerMessage} 
// };

// export default connect(mapStateToProps, mapDispatchToProps)(TrainingLogInMapper);


class TrainingLogInMapper extends Component {
	render(){		
		return (
			<div>                        
				<div>Stub</div>                                                                 
			</div>    
		)
	}

}

export default TrainingLogInMapper;
