import React, {Component} from 'react'

class SubscriptionToService extends Component { 
    render(){
      if(this.props.serviceName === "experience")
      {
        return (
          // <SubscriptionToExperience agentData={this.props.expertInfo}/>
          <></>
        );
      } else if(this.props.serviceName === "training")
      {
        return (
          <></>
        );
      } else if(this.props.serviceName === "reputation")
      {
        return (
          <></>
        );
      }
    }
  }

  export default SubscriptionToService;