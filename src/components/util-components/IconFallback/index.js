import React, { Component } from 'react'

export class IconFallback extends Component {
	render() {
		const { path, className, iconPosition  } = this.props;
		if(iconPosition === "upperNav"){
			return (
				<img className="upper-nav-icon" src={path} alt={path}/>
			)
		}
		return (
			<img className="side-nav-icon" src={path} alt={path}/>
		)
	}
}

export default IconFallback
