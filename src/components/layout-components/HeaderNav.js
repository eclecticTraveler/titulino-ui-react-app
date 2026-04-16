import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Layout } from "antd";
import LogoAlt from './LogoAlt';
import NavSearch  from './NavSearch';
import NavProfile from './NavProfile';
import MenuContentTop  from './MenuContentTop';
import IconAdapter from "components/util-components/IconAdapter";
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import Toggle from 'react-toggle';
import "react-toggle/style.css";
import { toggleCollapsedNav, onMobileNavToggle } from '../../redux/actions/Theme';
import { NAV_TYPE_TOP, SIDE_NAV_COLLAPSED_WIDTH, SIDE_NAV_WIDTH } from '../../constants/ThemeConstant';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';


const { Header } = Layout;

export const HeaderNav = props => {
	const { navCollapsed, mobileNav, navType, toggleCollapsedNav, onMobileNavToggle, isMobile, 
		    direction } = props;
	const [searchActive, setSearchActive] = useState(false)

	const isToogleToBeDisplayedToUser =  false;
	const defaultToogleFlagValue =  false;

	const onSearchClose = () => {
		setSearchActive(false)
	}

	const onSearchToggle = () => {
		setSearchActive(prev => !prev)
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
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
			
	return (		
		<Header className="app-header app-header--primary">
			<div className="app-header-wrapper">
				<LogoAlt />

				<MenuContentTop localization={true} />				
				
				<div className="nav-right menu-right-padding">
					{!isMobile && !searchActive && (
						<span 
							className="nav-icon desktop-search-toggle" 
							onClick={onSearchToggle} 
							style={{ cursor: 'pointer', marginRight: 16, fontSize: 18, display: 'inline-flex', alignItems: 'center' }}
						>
							<SearchOutlined />
						</span>
					)}
					<NavProfile direction={direction} isMobile={isMobile} mode={mode}/>
         		 </div>

			</div>

			{/* Desktop search overlay — always mounted, animated via CSS class */}
			{!isMobile && (
				<NavSearch active={searchActive} close={onSearchClose}/>
			)}			
			
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
				<div className={`app-header-wrapper-alt ${searchActive ? "active" : ""}`}>
				<button className="btn-burger" onClick={() => {onToggle()}}>
					<span></span>
					
					<span></span>
					
					<span></span>
				</button>

				{!searchActive && (
					<button className="btn-search" onClick={onSearchToggle}>
						<IconAdapter icon={"/img/others/ico-search.png"} iconType={ICON_LIBRARY_TYPE_CONFIG.hostedSvg} />
					</button>
				)}

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