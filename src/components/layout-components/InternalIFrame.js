import React, {Component} from 'react'
import Iframe from 'react-iframe';

class InternalIFrame extends Component { 
    render(){
      return (
        <div>
        <Iframe url={this.props.iFrameUrl}
          width="100%"
          height="930px"
          id="internalIFrame"
          display="initial"
          position="relative"
          className="iframe-positioning"
        />
      </div>
      )
    }
  }

  export default InternalIFrame;