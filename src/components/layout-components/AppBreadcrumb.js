import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from 'utils/routerCompat';
import { Breadcrumb } from 'antd';
import mainNavigationConfig from "../../configs/MainNavigationConfig";
import IntlMessage from '../../components/util-components/IntlMessage';

let breadcrumbData = { 
	'/lrn' : <IntlMessage id="LRN" />
};

mainNavigationConfig.forEach((elm, i) => {
	const assignBreadcrumb = (obj) => breadcrumbData[obj.path] = <IntlMessage id={obj.title} />;
	assignBreadcrumb(elm);
	if (elm.submenu) {
		elm.submenu.forEach( elm => {
			assignBreadcrumb(elm)
			if(elm.submenu) {
				elm.submenu.forEach( elm => {
					assignBreadcrumb(elm)
				})
			}
		})
	}
})

const BreadcrumbRoute = withRouter(props => {
	const { location } = props;
	const pathSnippets = location.pathname.split('/').filter(i => i);
	const breadcrumbItems = pathSnippets.map((_, index) => {
		const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
		return {
			key: url,
			title: <Link to={url}>{breadcrumbData[url]}</Link>,
		};
	});
  
	return (
		<Breadcrumb items={breadcrumbItems} />
	);
});

export class AppBreadcrumb extends Component {
	render() {
		return (
			<BreadcrumbRoute />
		)
	}
}

export default AppBreadcrumb
