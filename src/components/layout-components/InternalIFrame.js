import React, { Component } from 'react';
import Iframe from 'react-iframe';

class InternalIFrame extends Component {
  render() {
    const {
      iFrameUrl,
      className = 'iframe-positioning', // default if not passed
      ...rest
    } = this.props;

    return (
      <div>
        <Iframe
          url={iFrameUrl}
          width="100%"
          height="930px"
          id="internalIFrame"
          display="initial"
          position="relative"
          className={className}
          {...rest}
        />
      </div>
    );
  }
}

export default InternalIFrame;
