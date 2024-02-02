import { APP_PREFIX_PATH } from '../configs/AppConfig'

const dashBoardNavTree = [
	{
		key: 'dashboard',
		path: `${APP_PREFIX_PATH}/home`,
		title: 'dashboard',
		icon: '',
		iconAlt:'/img/sidebar/Side-Nav-Dashboard.png',
		breadcrumb: false,
		submenu: []
	},
	{
		key: 'dashboards-reports',
		path: `${APP_PREFIX_PATH}/reports`,
		title: 'reports',
		icon: '',
		iconAlt:'/img/sidebar/Side-Nav-Reports.png',
		breadcrumb: false,
		submenu: []
	},
	{
		key: 'dashboards-surveys',
		path: `${APP_PREFIX_PATH}/surveys`,
		title: 'surveys',
		icon: '',
		iconAlt: '/img/sidebar/Side-Nav-Surveys.png',
		breadcrumb: false,
		submenu: [
			{
				key: 'dashboards-dashboard-1',
				path: `${APP_PREFIX_PATH}/home`,
				title: 'dashboard',
				icon: '',
				iconAlt:'/img/sidebar/Side-Nav-Dashboard.png',
				breadcrumb: false,
				submenu: []
			}
		]
	},
	{
		key: 'dashboards-contacts',
		path: `${APP_PREFIX_PATH}/contacts`,
		title: 'contacts',
		icon: '',
		iconAlt: '/img/sidebar/Side-Nav-Contacts.png',
		breadcrumb: false,
		submenu: []
	},
	{
		key: 'extra-resources',
		path: `${APP_PREFIX_PATH}/resources`,
		title: 'resources',
		icon: '',
		iconAlt:'/img/sidebar/Side-Nav-Resources.png',
		breadcrumb: false,
		submenu: []
	},
	{
		key: 'extra-awards',
		path: `${APP_PREFIX_PATH}/awards`,
		title: 'awards',
		icon: '',
		iconAlt: '/img/sidebar/Side-Nav-Awards.png',
		breadcrumb: false,
		submenu: []
	}
]

const navigationConfig = [
  ...dashBoardNavTree
]

export default navigationConfig;
