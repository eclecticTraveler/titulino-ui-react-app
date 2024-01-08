import React, {Component} from 'react'

class SubscriptionToService extends Component {   
    render(){
        return (
        <div>
            {/* <!-- The Modal --> */}
          <div className="titulino-modal">
            {/* <!-- Modal content --> */}
            <div className="titulino-modal-content reputation-modal-content justifyLeft">

              {/* <!--Props the SVG and the title--> */}
              <div className="upperTitleExperience">
                 <img className="reputationSVG" src="/img/modalLogos/Management.svg" alt="training" />
              </div>


              {/* <!--Lock Icon--> */}
              <svg className="lock lockReputation" viewBox="0 0 448 512">
                  <path fill="currentColor" 
                  d="M224 420c-11 0-20-9-20-20v-64c0-11 9-20 20-20s20 9 20 20v64c0 11-9 20-20 20zm224-148v192c0 26.5-21.5 
                  48-48 48H48c-26.5 0-48-21.5-48-48V272c0-26.5 21.5-48 48-48h16v-64C64 71.6 136-.3 224.5 0 312.9.3 384 73.1
                  384 161.5V224h16c26.5 0 48 21.5 48 48zM96 224h256v-64c0-70.6-57.4-128-128-128S96 89.4 96 160v64zm320 
                  240V272c0-8.8-7.2-16-16-16H48c-8.8 0-16 7.2-16 16v192c0 8.8 7.2 16 16 16h352c8.8 0 16-7.2 16-16z">
                  </path>
              </svg>

              {/* <!--MainTitle--> */}
              <div>
                  <div className="mainTitle">
                      <strong>You don't have access to this tool yet.</strong>
                      <div>
                          <strong>Want to gain access?</strong>
                      </div>

                  </div>
              </div>

              {/* <!--inner colored container props Service, Account Manager Name--> */}
              <div className="innerColoredContainer reputationColoredContainer">
                  <div className="innerColoredContent">
                      <div>
                          <p className="innerColoredContentTitle contentTitle">See How It Works Alongside Your Training &amp; Experience Management</p>
                      </div>
                      <div className="innerColoredContentBody">
                          <p>Join one of our experts on a Zoom call so they can walk you through the ways that our Reputation Management can benefit your agency.</p>
                      </div>
                  </div>
                  <div className="innercolorContainerProfile">
                      <div className="expertPicture"></div>
                      <div className="expertName">{this.props.agentData?.expertName}</div>
                      <div className="expertTitle">{this.props.agentData?.expertTitle}</div>       
                      <div className="expertCalendarButton"><button onClick={()=>{window.open(this.props.agentData?.calendarLink)}}>Pick a Time to Talk</button></div>  
                  </div>
              </div>

              {/* <!--Rest of the information about the service--> */}
              <div className="mainInformation">
                  <div className="contentTitle reputationTitle">
                     Take control.
                  </div>
                  <div className="mainBodyContent">                      
                  </div>
                  <div className="mainBodyBulletPoints">
                      <div className="singleBulletPointWrapper">
                          <div className="checkMarkContainer">                
                              <svg className="checkMarkSVG" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 464c-118.664 0-216-96.055-216-216 0-118.663 96.055-216 216-216 118.664 0 216 96.055 216 216 0 118.663-96.055 216-216 216zm141.63-274.961L217.15 376.071c-4.705 4.667-12.303 4.637-16.97-.068l-85.878-86.572c-4.667-4.705-4.637-12.303.068-16.97l8.52-8.451c4.705-4.667 12.303-4.637 16.97.068l68.976 69.533 163.441-162.13c4.705-4.667 12.303-4.637 16.97.068l8.451 8.52c4.668 4.705 4.637 12.303-.068 16.97z"></path></svg>
                          </div>
                          <div className="bulletPointContent">
                              <span className="contentTitle">Request Reviews Through SMS &amp; Email</span> &#8212;
                              <span>send mass blast or decide exactly who to ask for reviews based on satisfaction scores from surveys</span>
                          </div>
                      </div>

                      <div className="singleBulletPointWrapper">
                          <div className="checkMarkContainer">                
                              <svg className="checkMarkSVG" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 464c-118.664 0-216-96.055-216-216 0-118.663 96.055-216 216-216 118.664 0 216 96.055 216 216 0 118.663-96.055 216-216 216zm141.63-274.961L217.15 376.071c-4.705 4.667-12.303 4.637-16.97-.068l-85.878-86.572c-4.667-4.705-4.637-12.303.068-16.97l8.52-8.451c4.705-4.667 12.303-4.637 16.97.068l68.976 69.533 163.441-162.13c4.705-4.667 12.303-4.637 16.97.068l8.451 8.52c4.668 4.705 4.637 12.303-.068 16.97z"></path></svg>
                          </div>
                          <div className="bulletPointContent">
                              <span className="contentTitle">Track Your Overall Rating Across All Review Sources</span> &#8212;
                              <span>as 88% of consure read review about local businesses it's important to know how  you're being talked about</span>
                          </div>
                      </div>

                      <div className="singleBulletPointWrapper">
                          <div className="checkMarkContainer">                
                              <svg className="checkMarkSVG" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 464c-118.664 0-216-96.055-216-216 0-118.663 96.055-216 216-216 118.664 0 216 96.055 216 216 0 118.663-96.055 216-216 216zm141.63-274.961L217.15 376.071c-4.705 4.667-12.303 4.637-16.97-.068l-85.878-86.572c-4.667-4.705-4.637-12.303.068-16.97l8.52-8.451c4.705-4.667 12.303-4.637 16.97.068l68.976 69.533 163.441-162.13c4.705-4.667 12.303-4.637 16.97.068l8.451 8.52c4.668 4.705 4.637 12.303-.068 16.97z"></path></svg>
                          </div>
                          <div className="bulletPointContent">
                              <span className="contentTitle">Keep An Eye On Your Competitors</span> &#8212;
                              <span>see how you stack up so you can stand out</span>
                          </div>
                      </div>

                      <div className="singleBulletPointWrapper">
                          <div className="checkMarkContainer">                
                              <svg className="checkMarkSVG" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 464c-118.664 0-216-96.055-216-216 0-118.663 96.055-216 216-216 118.664 0 216 96.055 216 216 0 118.663-96.055 216-216 216zm141.63-274.961L217.15 376.071c-4.705 4.667-12.303 4.637-16.97-.068l-85.878-86.572c-4.667-4.705-4.637-12.303.068-16.97l8.52-8.451c4.705-4.667 12.303-4.637 16.97.068l68.976 69.533 163.441-162.13c4.705-4.667 12.303-4.637 16.97.068l8.451 8.52c4.668 4.705 4.637 12.303-.068 16.97z"></path></svg>
                          </div>
                          <div className="bulletPointContent">
                              <span className="contentTitle">Monitor &amp; Respond</span> &#8212;
                              <span>it sends a positive message when you respond to reviews quickly&#8208;Reputation Management allows you to see and respond to all reviews from one place</span>
                          </div>
                      </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
    );
  }
}
  export default SubscriptionToService;