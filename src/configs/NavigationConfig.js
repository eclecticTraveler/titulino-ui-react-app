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
		key: 'reports',
		path: `${APP_PREFIX_PATH}/reports`,
		title: 'reports',
		icon: '',
		iconAlt:'/img/sidebar/Side-Nav-Reports.png',
		breadcrumb: false,
		submenu: []
	},
	{
		key: 'surveys',
		path: `${APP_PREFIX_PATH}/surveys`,
		title: 'surveys',
		icon: '',
		iconAlt: '/img/sidebar/Side-Nav-Surveys.png',
		breadcrumb: false,
		submenu: [
			{
				key: 'dashboard',
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
		key: 'contacts',
		path: `${APP_PREFIX_PATH}/contacts`,
		title: 'contacts',
		icon: '',
		iconAlt: '/img/sidebar/Side-Nav-Contacts.png',
		breadcrumb: false,
		submenu: []
	},
	{
		key: 'resources',
		path: `${APP_PREFIX_PATH}/resources`,
		title: 'resources',
		icon: '',
		iconAlt:'/img/sidebar/Side-Nav-Resources.png',
		breadcrumb: false,
		submenu: []
	},
	{
		key: 'awards',
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
