import React from 'react'
import AppBreadcrumb from '../../components/layout-components/AppBreadcrumb';

export const PageHeader = ({ title, display }) => {
	// TODO: Un comment when business decides to place breadcrumbs back again
	return (
		display ? (
			<div className="app-page-header app-page-header--alt">
				{/* <AppBreadcrumb id={title ? title : "Experience"} /> */}
			</div>
		)
		: null
	)
}

export default PageHeader