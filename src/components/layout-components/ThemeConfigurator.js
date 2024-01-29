import React from 'react'
import { connect } from 'react-redux'
import { Radio, Switch, Button, message } from 'antd';
import IntlMessage from "../util-components/IntlMessage";
import { 
	toggleCollapsedNav, 
	onNavTypeChange,
	onNavStyleChange,
	onTopNavColorChange,
	onHeaderNavColorChange,
	onSwitchTheme,
	onDirectionChange
} from 'redux/actions/Theme';
import NavLanguage from './NavLanguage';
import { 
	SIDE_NAV_LIGHT,
	NAV_TYPE_SIDE,
	NAV_TYPE_TOP,
	SIDE_NAV_DARK,
	DIR_RTL,
	DIR_LTR
} from '../../constants/ThemeConstant';
import { useThemeSwitcher } from "react-css-theme-switcher";
import utils from 'utils/index';

const colorOptions = [
	'#3e82f7',
	'#24a772',
	'#de4436',
	'#924aca',
	'#193550'
]

const ListOption = ({name, selector, disabled, vertical}) => (
	<div className={`my-4 ${vertical? '' : 'd-flex align-items-center justify-content-between'}`}>
		<div className={`${disabled ? 'opacity-0-3' : ''} ${vertical? 'mb-3' : ''}`}>{name}</div>
		<div>{selector}</div>
	</div>
)

const setLocale = (isLocaleOn, localeKey) =>
	isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();

export const ThemeConfigurator = ({ 
	navType, 
	sideNavTheme, 
	navCollapsed,
	topNavColor,
	headerNavColor,
	locale,
	currentTheme,
	toggleCollapsedNav, 
	onNavTypeChange, 
	onNavStyleChange,
	onTopNavColorChange,
	onHeaderNavColorChange,
	onSwitchTheme,
	direction,
	onDirectionChange
}) => {
	const isNavTop = navType === NAV_TYPE_TOP? true : false
	const isCollapse = navCollapsed 

	const { switcher, themes } = useThemeSwitcher();

	const toggleTheme = (isChecked) => {
		onHeaderNavColorChange('')
		const changedTheme = isChecked ? 'dark' : 'light'
		onSwitchTheme(changedTheme)
    switcher({ theme: themes[changedTheme] });
  };

	const ontopNavColorClick = (value) => {
		onHeaderNavColorChange('')
		const { rgb } = value
		const rgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`
		const hex = utils.rgbaToHex(rgba)
		onTopNavColorChange(hex)
	}
	const onHeaderNavColorClick = (value) => {
		const { rgb } = value
		const rgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`
		const hex = utils.rgbaToHex(rgba)
		onHeaderNavColorChange(hex)
	}

	const onNavTypeClick = (value) => {
		onHeaderNavColorChange('')
		if(value === NAV_TYPE_TOP) {
			onTopNavColorChange(colorOptions[0])
			toggleCollapsedNav(false)
		}
		onNavTypeChange(value)
	}

	return (
		<>
			<div className="mb-5">
			<h4 className="mb-3 font-weight-bold">{setLocale(locale, 'settings.menu.sub.title.1')}</h4>
				<ListOption 
					name={setLocale(locale, 'settings.menu.sub.title.1.navtype')}
					selector={
						<Radio.Group 
							size="small" 
							onChange={e => onNavTypeClick(e.target.value)} 
							value={navType}
						>
							<Radio.Button value={NAV_TYPE_SIDE}>{setLocale(locale, 'settings.menu.sub.title.1.navtype.side')}</Radio.Button>
							<Radio.Button value={NAV_TYPE_TOP}>{setLocale(locale, 'settings.menu.sub.title.1.navtype.top')}</Radio.Button>
						</Radio.Group>
					}
				/>

				<ListOption 
					name={setLocale(locale, 'settings.menu.sub.title.1.navcollapse')}
					selector={
						<Switch 
							disabled={isNavTop} 
							checked={isCollapse} 
							onChange={() => toggleCollapsedNav(!navCollapsed)} 
						/>
					}
					disabled={isNavTop}
				/>
				<ListOption 
					name={setLocale(locale, 'settings.menu.sub.title.1.darktheme')}
					selector={
						<Switch checked={currentTheme === 'dark'} onChange={toggleTheme} />
					}
				/>
			</div>
			<div className="mb-5">
				<h4 className="mb-3 font-weight-bold">{setLocale(locale, 'settings.menu.sub.title.2')}</h4>
				<ListOption 
					name={setLocale(locale, 'settings.menu.sub.title.2.language')}
					selector={
						<NavLanguage configDisplay/>
					}
				/>
			</div>

		</>
	)
}

const mapStateToProps = ({ theme }) => {
  const { navType, sideNavTheme, navCollapsed, topNavColor, headerNavColor, locale, currentTheme, direction } =  theme;
  return { navType, sideNavTheme, navCollapsed, topNavColor, headerNavColor, locale, currentTheme, direction }
};

const mapDispatchToProps = {
	toggleCollapsedNav,
	onNavTypeChange,
	onNavStyleChange,
	onTopNavColorChange,
	onHeaderNavColorChange,
	onSwitchTheme,
	onDirectionChange
}

export default connect(mapStateToProps, mapDispatchToProps)(ThemeConfigurator)
