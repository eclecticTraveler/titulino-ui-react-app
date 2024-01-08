import React from 'react'

export const Title = ({ title, color, prefix, isCollapsed}) => {
	let classToUse = "title ";
	classToUse = title?.length > 10 ? classToUse.concat("lengthyTitle") : classToUse.concat("shortTitle"); 

	if(!isCollapsed) {
		return (
			<h1 className={classToUse} style={{background:color}}>
				<strong>{prefix}</strong> {title}
			</h1>
		)
	} else {
		return (
			<h1 className={classToUse} style={{background:color}}>
				<strong>{prefix}</strong>
			</h1>
		)
	}
}

export default Title