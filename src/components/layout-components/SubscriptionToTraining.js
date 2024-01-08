// import React, {Component} from 'react'
// import BelieveYouHaveAccess from './BelieveYouHaveAccess';
// import TrainingLogInMapper from './TrainingLogInMapper';
// import { bindActionCreators } from 'redux';
// import {connect} from 'react-redux';

// class SubscriptionToTraining extends Component {
//     render(){
//         return (
//         <div>
//             {/* <!-- The Modal --> */}
//           <div className="titulino-modal">
//             {/* <!-- Modal content --> */}
//             <div className="titulino-modal-content training-modal-content justifyLeft">

//               {/* <!--Props the SVG and the title--> */}
//               <div className="upperTitleExperience">
//                  <img className="trainingSVG" src="/img/modalLogos/Training.svg" alt="Training" />
//               </div>

//               {/* <!--Lock Icon--> */}
//               <svg className="lock lockTraining" viewBox="0 0 448 512">
//                   <path fill="currentColor" 
//                   d="M224 420c-11 0-20-9-20-20v-64c0-11 9-20 20-20s20 9 20 20v64c0 11-9 20-20 20zm224-148v192c0 26.5-21.5 
//                   48-48 48H48c-26.5 0-48-21.5-48-48V272c0-26.5 21.5-48 48-48h16v-64C64 71.6 136-.3 224.5 0 312.9.3 384 73.1
//                   384 161.5V224h16c26.5 0 48 21.5 48 48zM96 224h256v-64c0-70.6-57.4-128-128-128S96 89.4 96 160v64zm320 
//                   240V272c0-8.8-7.2-16-16-16H48c-8.8 0-16 7.2-16 16v192c0 8.8 7.2 16 16 16h352c8.8 0 16-7.2 16-16z">
//                   </path>
//               </svg>

//               {/* <!--MainTitle--> */}
//               <div>
//                   <div className="mainTitle">
//                       <strong>You don't have access to this tool yet.</strong>
//                       <div>
//                           <strong>Want to gain access?</strong>
//                       </div>

//                   </div>
//               </div>

//                 <BelieveYouHaveAccess/>
//                 {this.props.isTodisplayTrainingLoging && <TrainingLogInMapper/>}

//             {(!this.props.isTodisplayTrainingLoging) && 
//                 <div id="training-verbose-body">
//                     {/* <!--inner colored container props Service, Account Manager Name--> */}
//                     <div className="innerColoredContainer trainingColoredContainer">
//                         <div className="innerColoredContent">
//                             <div>
//                                 <p className="innerColoredContentTitle contentTitle">See How It Works Alongside Your Surveys</p>
//                             </div>
//                             <div className="innerColoredContentBody">
//                                 <p>Join one of our experts on a Zoom call so they can walk you through the ways that our training can benefit your agency</p>
//                             </div>
//                         </div>
//                         <div className="innercolorContainerProfile">
//                             <div className="expertPicture"></div>
//                             <div className="expertName">{this.props.agentData?.expertName}</div>
//                             <div className="expertTitle">{this.props.agentData?.expertTitle}</div>       
//                             <div className="expertCalendarButton"><button onClick={()=>{window.open(this.props.agentData?.calendarLink)}}>Pick a Time to Talk</button></div>    
//                         </div>
//                     </div>

//                     {/* <!--Rest of the information about the service--> */}
//                     <div className="mainInformation">
//                         <div className="contentTitle">
//                             Training to turn good care teams into great care teams.
//                         </div>
//                         <div className="mainBodyContent">
//                             While surveys identify your problem areas, trainning empowers you to improve tem-ultimately driving increased revenue and better care.
//                         </div>
//                         <div className="mainBodyBulletPoints">
//                             <div className="singleBulletPointWrapper">
//                                 <div className="checkMarkContainer">                
//                                     <svg className="checkMarkSVG" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 464c-118.664 0-216-96.055-216-216 0-118.663 96.055-216 216-216 118.664 0 216 96.055 216 216 0 118.663-96.055 216-216 216zm141.63-274.961L217.15 376.071c-4.705 4.667-12.303 4.637-16.97-.068l-85.878-86.572c-4.667-4.705-4.637-12.303.068-16.97l8.52-8.451c4.705-4.667 12.303-4.637 16.97.068l68.976 69.533 163.441-162.13c4.705-4.667 12.303-4.637 16.97.068l8.451 8.52c4.668 4.705 4.637 12.303-.068 16.97z"></path></svg>
//                                 </div>
//                                 <div className="bulletPointContent">
//                                     <span className="contentTitle">500+ RN Developed Courses</span> &#8212;
//                                     <span>use your survey results to tailor the right raining plan for your team</span>
//                                 </div>
//                             </div>

//                             <div className="singleBulletPointWrapper">
//                                 <div className="checkMarkContainer">                
//                                     <svg className="checkMarkSVG" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 464c-118.664 0-216-96.055-216-216 0-118.663 96.055-216 216-216 118.664 0 216 96.055 216 216 0 118.663-96.055 216-216 216zm141.63-274.961L217.15 376.071c-4.705 4.667-12.303 4.637-16.97-.068l-85.878-86.572c-4.667-4.705-4.637-12.303.068-16.97l8.52-8.451c4.705-4.667 12.303-4.637 16.97.068l68.976 69.533 163.441-162.13c4.705-4.667 12.303-4.637 16.97.068l8.451 8.52c4.668 4.705 4.637 12.303-.068 16.97z"></path></svg>
//                                 </div>
//                                 <div className="bulletPointContent">
//                                     <span className="contentTitle">State-Compliant</span> &#8212;
//                                     <span>get help building a program tailored to your state's complete requirements</span>
//                                 </div>
//                             </div>

//                             <div className="singleBulletPointWrapper">
//                                 <div className="checkMarkContainer">                
//                                     <svg className="checkMarkSVG" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 464c-118.664 0-216-96.055-216-216 0-118.663 96.055-216 216-216 118.664 0 216 96.055 216 216 0 118.663-96.055 216-216 216zm141.63-274.961L217.15 376.071c-4.705 4.667-12.303 4.637-16.97-.068l-85.878-86.572c-4.667-4.705-4.637-12.303.068-16.97l8.52-8.451c4.705-4.667 12.303-4.637 16.97.068l68.976 69.533 163.441-162.13c4.705-4.667 12.303-4.637 16.97.068l8.451 8.52c4.668 4.705 4.637 12.303-.068 16.97z"></path></svg>
//                                 </div>
//                                 <div className="bulletPointContent">
//                                     <span className="contentTitle">Blended Learning</span> &#8212;
//                                     <span>options to combine traditional and online learning&#8212;preferred by caregivers and proven by research to be more effective </span>
//                                 </div>
//                             </div>

//                             <div className="singleBulletPointWrapper">
//                                 <div className="checkMarkContainer">                
//                                     <svg className="checkMarkSVG" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 464c-118.664 0-216-96.055-216-216 0-118.663 96.055-216 216-216 118.664 0 216 96.055 216 216 0 118.663-96.055 216-216 216zm141.63-274.961L217.15 376.071c-4.705 4.667-12.303 4.637-16.97-.068l-85.878-86.572c-4.667-4.705-4.637-12.303.068-16.97l8.52-8.451c4.705-4.667 12.303-4.637 16.97.068l68.976 69.533 163.441-162.13c4.705-4.667 12.303-4.637 16.97.068l8.451 8.52c4.668 4.705 4.637 12.303-.068 16.97z"></path></svg>
//                                 </div>
//                                 <div className="bulletPointContent">
//                                     <span className="contentTitle">Mobile Access &amp; Downloadable Courses</span> &#8212;
//                                     <span>location or computer access is no longer an issue with our mobile caregiver app</span>
//                                 </div>
//                             </div>

//                             <div className="singleBulletPointWrapper">
//                                 <div className="checkMarkContainer">                
//                                     <svg className="checkMarkSVG" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 464c-118.664 0-216-96.055-216-216 0-118.663 96.055-216 216-216 118.664 0 216 96.055 216 216 0 118.663-96.055 216-216 216zm141.63-274.961L217.15 376.071c-4.705 4.667-12.303 4.637-16.97-.068l-85.878-86.572c-4.667-4.705-4.637-12.303.068-16.97l8.52-8.451c4.705-4.667 12.303-4.637 16.97.068l68.976 69.533 163.441-162.13c4.705-4.667 12.303-4.637 16.97.068l8.451 8.52c4.668 4.705 4.637 12.303-.068 16.97z"></path></svg>
//                                 </div>
//                                 <div className="bulletPointContent">
//                                     <span className="contentTitle">Specialized Care</span> &#8212;
//                                     <span>training gives your caregivers a career ladder and allows you to create more profitable speciality programs</span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             }         
//               {/* <!--footer info about the service--> */}
//               <div className="footerInformation">
//                   <div className="innerFooterTitle">
//                       "The best training I've seen&#8212;and I've been a nurse for 20 years."
//                   </div>
//                   <div className="footerContainerProfile">
//                       <div className="customerPicture"></div>
//                       <div className="customerName contentTitle">Laura deBruin-Shaw</div>
//                       <div className="customerTitle">Executive Director of Norwood Seniors Network in Chicago</div>                   
//                   </div>
//               </div>
//             </div>
//           </div>
//         </div>
//     );
//   }
// }

//   function mapDispatchToProps(dispatch){
// 	return bindActionCreators({
// 		isTodisplayLoging: isTodisplayLoging
// 	}, dispatch)
// }

// const mapStateToProps = ({lrn}) => {
// 	const {isTodisplayLoging} = lrn ;
// 	return {isTodisplayLoging} 
// };

// export default connect(mapStateToProps, mapDispatchToProps)(SubscriptionToTraining);


class SubscriptionToTraining extends Component {
	render(){		
		return (
			<div>                        
				<div>Stub</div>                                                                 
			</div>    
		)
	}

}

export default SubscriptionToTraining;