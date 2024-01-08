import React, {Component} from 'react'

class SubscriptionToService extends Component {
    render(){
        return (
        <div>
            {/* <!-- The Modal --> */}
          <div className="titulino-modal">
            {/* <!-- Modal content --> */}
            <div className="titulino-modal-content experience-modal-content justifyLeft">

              {/* <!--Props the SVG and the title--> */}
              <div className="upperTitleExperience">
                 <img className="experienceSVG" src="/img/modalLogos/ExperienceManagement.svg" alt="Experience Management" />
              </div>

              {/* <!--Lock Icon--> */}
              <svg className="lock lockExperience" viewBox="0 0 448 512">
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
              <div className="innerColoredContainer experienceColoredContainer">
                  <div className="innerColoredContent">
                      <div>
                          <p className="innerColoredContentTitle contentTitle">See How It Works Alongside Your Training</p>
                      </div>
                      <div className="innerColoredContentBody">
                          <p>Join one of our experts on a Zoom call so they can walk you through the ways that our Experience Management and surveys can benefit your agency.</p>
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
                  <div className="contentTitle">
                      You can't be everywhere &#8211; but with our surveys, you don't have to be.
                  </div>
                  <div className="mainBodyContent">
                      Know exactly what's going on in your business. Take action to improve the experience you provide to caregivers and clients with Experience Management.
                  </div>
                  <div className="mainBodyBulletPoints">
                      <div className="singleBulletPointWrapper">
                          <div className="checkMarkContainer">                
                              <svg className="checkMarkSVG" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 464c-118.664 0-216-96.055-216-216 0-118.663 96.055-216 216-216 118.664 0 216 96.055 216 216 0 118.663-96.055 216-216 216zm141.63-274.961L217.15 376.071c-4.705 4.667-12.303 4.637-16.97-.068l-85.878-86.572c-4.667-4.705-4.637-12.303.068-16.97l8.52-8.451c4.705-4.667 12.303-4.637 16.97.068l68.976 69.533 163.441-162.13c4.705-4.667 12.303-4.637 16.97.068l8.451 8.52c4.668 4.705 4.637 12.303-.068 16.97z"></path></svg>
                          </div>
                          <div className="bulletPointContent">
                              <span className="contentTitle">Client &amp; Caregiver Surveys</span> &#8212;
                              <span>actionable insight to better shape your caregiver training </span>
                          </div>
                      </div>

                      <div className="singleBulletPointWrapper">
                          <div className="checkMarkContainer">                
                              <svg className="checkMarkSVG" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 464c-118.664 0-216-96.055-216-216 0-118.663 96.055-216 216-216 118.664 0 216 96.055 216 216 0 118.663-96.055 216-216 216zm141.63-274.961L217.15 376.071c-4.705 4.667-12.303 4.637-16.97-.068l-85.878-86.572c-4.667-4.705-4.637-12.303.068-16.97l8.52-8.451c4.705-4.667 12.303-4.637 16.97.068l68.976 69.533 163.441-162.13c4.705-4.667 12.303-4.637 16.97.068l8.451 8.52c4.668 4.705 4.637 12.303-.068 16.97z"></path></svg>
                          </div>
                          <div className="bulletPointContent">
                              <span className="contentTitle">Regional Benchmarking</span> &#8212;
                              <span>compare your scores againts regional and national competition to get further data to improve your training</span>
                          </div>
                      </div>

                      <div className="singleBulletPointWrapper">
                          <div className="checkMarkContainer">                
                              <svg className="checkMarkSVG" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 464c-118.664 0-216-96.055-216-216 0-118.663 96.055-216 216-216 118.664 0 216 96.055 216 216 0 118.663-96.055 216-216 216zm141.63-274.961L217.15 376.071c-4.705 4.667-12.303 4.637-16.97-.068l-85.878-86.572c-4.667-4.705-4.637-12.303.068-16.97l8.52-8.451c4.705-4.667 12.303-4.637 16.97.068l68.976 69.533 163.441-162.13c4.705-4.667 12.303-4.637 16.97.068l8.451 8.52c4.668 4.705 4.637 12.303-.068 16.97z"></path></svg>
                          </div>
                          <div className="bulletPointContent">
                              <span className="contentTitle">Long-Term Trend Analysis</span> &#8212;
                              <span>see how your scores trend over time</span>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="experienceHalfwayMessage contentTitle footerInformation">
                  Use Experience Management to learn exactly which topics you need to be training on
              </div>

              {/* <!--footer info about the service--> */}
              <div className="footerInformation">
                  <div className="innerFooterTitle">
                      "It's not an exaggeration to say that my agency's ability to keep annual caregiver turnover under 30% is a direct result of using Home Care Pulse's surveys."
                  </div>
                  <div className="footerContainerProfile">
                      <div className="customerPicture"></div>
                      <div className="customerName contentTitle">Laura deBruin-Shaw</div>
                      <div className="customerTitle">Executive Director of Norwood Seniors Network in Chicago</div>                   
                  </div>
              </div>
            </div>
          </div>
        </div>
    );
  }
}

  export default SubscriptionToService;