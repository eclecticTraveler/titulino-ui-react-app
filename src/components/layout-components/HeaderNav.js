import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Layout } from "antd";
import LogoAlt from './LogoAlt';
import NavSearch  from './NavSearch';
import TopLinks  from './TopLinks';
import NavProfile from './NavProfile';
import NavNotification from './NavNotification';
import NavSearchWrapper from './NavSearchWrapper';
import NavPanel from './NavPanel';
import MenuContentTop  from './MenuContentTop';
import NavLanguage from './NavLanguage';
import IconAdapter from "components/util-components/IconAdapter";
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import Toggle from 'react-toggle';
import "react-toggle/style.css";
import { env } from "../../configs/EnvironmentConfig";
import { toggleCollapsedNav, onMobileNavToggle } from '../../redux/actions/Theme';
import { NAV_TYPE_TOP, SIDE_NAV_COLLAPSED_WIDTH, SIDE_NAV_WIDTH } from '../../constants/ThemeConstant';
import utils from '../../utils'
// import { useKeycloak } from "@react-keycloak/web";
import { Button } from "antd";
import IntlMessage from "../../components/util-components/IntlMessage";
import { MenuFoldOutlined, MenuUnfoldOutlined, SearchOutlined } from '@ant-design/icons';
import SearchInput from './NavSearch/SearchInput.js'


const { Header } = Layout;

export const HeaderNav = props => {
	const { navCollapsed, mobileNav, navType, headerNavColor, toggleCollapsedNav, onMobileNavToggle, isMobile, currentTheme, 
		    direction, pathLocation } = props;
	const [searchActive, setSearchActive] = useState(false)
	const [searchVisible, setSearchVisible] = useState(false)
	const setLocale = (isLocaleOn, localeKey) =>{		
		return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
	  }
	const locale = true;

	const isToogleToBeDisplayedToUser =  false;
	const defaultToogleFlagValue =  false;

	const onSearchActive = () => {
		setSearchActive(true)
	  }

	const onSearchClose = () => {
		setSearchActive(false)
	}

	const onToggle = () => {
	  if(!isMobile) {
	    toggleCollapsedNav(!navCollapsed)
	  } else {
	    onMobileNavToggle(!mobileNav)
	  }
	}

	const onExperienceToogle = (event) => {			
	}

	const isNavTop = navType === NAV_TYPE_TOP ? true : false
	const mode = ()=> {
		if(!headerNavColor) {
			return utils.getColorContrast(currentTheme === 'dark' ? '#00000' : '#ffffff' )
		}
		return utils.getColorContrast(headerNavColor)
	}
	const navMode = mode()
	const getNavWidth = () => {
		if(isNavTop || isMobile) {
			return '0px'
		}
		if(navCollapsed) {
			return `${SIDE_NAV_COLLAPSED_WIDTH}px`
		} else {
			return `${SIDE_NAV_WIDTH}px`
		}
	}

	useEffect(() => {
		if(!isMobile) {
			onSearchClose()
		}
	}, []);
			
	return (		
		<Header className="app-header app-header--primary">
			<div className="app-header-wrapper">
				<LogoAlt />

				<MenuContentTop localization={true} />				
				
				<div className="nav-right menu-right-padding">
					{/* TODO: TITULINO PROFILE NAVIGATION */}
					{/* titulino fix the nav notification Menu Item issue to ellipsis */}
					{/* <NavNotification /> */}
					<NavProfile direction={direction} isMobile={isMobile} mode={mode}/>
         		 </div>
			</div>			
			
			{
			(isToogleToBeDisplayedToUser) &&
			<label>
				<div id="toggle-wrapper">	
				<span id="toggle-title" className='label-text'>New Experience</span>													
					<Toggle
						defaultChecked={defaultToogleFlagValue}
						onChange={(event) => onExperienceToogle(event)}
						className='new-experience-toggle'
						icons={{
							checked: "On",
							unchecked: "Off",
						  }}
						/>					
				</div>				
			</label>
			}

			{/* Mobile view*/}
			{ isMobile && 
				<div className={`app-header-wrapper-alt ${searchVisible ? "active" : ""}`}>
				<button className="btn-burger" onClick={() => {onToggle()}}>
					<span></span>
					
					<span></span>
					
					<span></span>
				</button>

				<button className="btn-search" onClick={() => setSearchVisible(!searchVisible)}>					
					<IconAdapter icon={"/img/others/ico-search.png"} iconType={ICON_LIBRARY_TYPE_CONFIG.hostedSvg} />
				</button>

				<NavSearch active={searchActive} close={onSearchClose}/>
			</div>
			}

		</Header>
	)
}

const mapStateToProps = ({ theme }) => {	
	const { navCollapsed, navType, headerNavColor, mobileNav, currentTheme, direction } =  theme;
	return { navCollapsed, navType, headerNavColor, mobileNav, currentTheme, direction}
};

export default connect(mapStateToProps, {toggleCollapsedNav, onMobileNavToggle})(HeaderNav);