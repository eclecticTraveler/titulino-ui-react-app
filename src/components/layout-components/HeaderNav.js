import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Layout, Tooltip } from "antd";
import LogoAlt from './LogoAlt';
import NavSearch  from './NavSearch';
import NavProfile from './NavProfile';
import NavCourseSwitcher from './NavCourseSwitcher';
import MenuContentTop  from './MenuContentTop';
import IconAdapter from "components/util-components/IconAdapter";
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';
import Toggle from 'react-toggle';
import "react-toggle/style.css";
import { toggleCollapsedNav, onMobileNavToggle } from '../../redux/actions/Theme';
import { SearchOutlined, HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { env } from 'configs/EnvironmentConfig';


const { Header } = Layout;

export const HeaderNav = props => {
	const { navCollapsed, mobileNav, toggleCollapsedNav, onMobileNavToggle, isMobile,
		    direction } = props;
	const { formatMessage } = useIntl();
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
					{!isMobile && !searchActive && env.IS_ENROLLMENT_LANDING_ON && (
						<Tooltip title={formatMessage({ id: 'nav.home.tooltip' })} placement="bottom">
						<Link to="/lrn/landing" className="nav-icon-container" style={{ color: 'inherit' }}>
							<HomeOutlined className="nav-icon" />
						</Link>
						</Tooltip>
					)}
					{!isMobile && !searchActive && (
						<Tooltip title={formatMessage({ id: 'nav.search.tooltip' })} placement="bottom">
						<span className="nav-icon-container desktop-search-toggle" onClick={onSearchToggle}>
							<SearchOutlined className="nav-icon" />
						</span>
						</Tooltip>
					)}
					<NavCourseSwitcher />
					<NavProfile direction={direction} />
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
