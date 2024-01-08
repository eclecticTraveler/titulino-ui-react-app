import React, {Component} from 'react'
import SubscriptionToExperience from './SubscriptionToExperience';
import SubscriptionToReputation from './SubscriptionToReputation';
import SubscriptionToTraining from './SubscriptionToTraining';

class SubscriptionToService extends Component { 
    render(){
      if(this.props.serviceName === "experience")
      {
        return (
          <SubscriptionToExperience agentData={this.props.expertInfo}/>
        );
      } else if(this.props.serviceName === "training")
      {
        return (
          <SubscriptionToTraining agentData={this.props.expertInfo}/>
        );
      } else if(this.props.serviceName === "reputation")
      {
        return (
          <SubscriptionToReputation agentData={this.props.expertInfo}/>
        );
      }
    }
  }

  export default SubscriptionToService;