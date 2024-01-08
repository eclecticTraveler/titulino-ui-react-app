import { APP_PREFIX_PATH } from './AppConfig'
import {GoogleSVG } from '../assets/svg/icon'
const dashBoardNavTree = [
	{
		key: 'menu-1',
		path: `${APP_PREFIX_PATH}/menu-1`,
		title: 'menu-1',
		sideTitle: 'menu-1',
		icon: GoogleSVG,
		iconAlt:'/img/mainnav/menu-2.svg',
		color: '#3CA292',
		current: true,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isSubmenuCorpType: false,
		submenu: []
	},
	{
		key: 'menu-2',
		path: `${APP_PREFIX_PATH}/menu-2`,
		title: 'menu-2',
		sideTitle: 'menu-2',
		icon: GoogleSVG,
		iconAlt:'/img/mainnav/menu-2.svg',
		color: '#C4745F',
		current: false,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isSubmenuCorpType: false,
		submenu: []
	},
	{
		key: 'menu-2',
		path: `${APP_PREFIX_PATH}/menu-2`,
		title: 'menu-2',
		sideTitle: 'menu-2',
		icon: GoogleSVG,
		iconAlt:'/img/mainnav/menu-2.svg',
		color: '#C89736',
		current: false,
		isRootMenuItem: true,
		iconPosition: "upperNav",
		isServiceAvailableForUser: false,
		isSubmenuCorpType: false,
		submenu: []
	}
]

const mainNavigationConfig = [
  ...dashBoardNavTree
]

export default mainNavigationConfig;
