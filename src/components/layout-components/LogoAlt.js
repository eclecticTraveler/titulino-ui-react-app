import React from 'react'
import {toggleCollapsedNav, onMobileNavToggle} from 'redux/actions/Theme';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import { Grid } from "antd";
import utils from 'utils'

export const LogoAlt = (props, { title }) => {
	const { mobileNav, onMobileNavToggle, toggleCollapsedNav, navCollapsed } = props;
	const { useBreakpoint } = Grid;
	const isMobile = !utils.getBreakPoint(useBreakpoint()).includes('lg')
	const onToggle = () => {
		if(!isMobile) {
		  toggleCollapsedNav(!navCollapsed)
		} else {
		  onMobileNavToggle(!mobileNav)
		}
	  }


	return (
		<div className="logo-alt-parent-container" onClick={() => {onToggle()}}>
			<img className="logo-alt"  src="/img/titulino-logo-1.png" alt=""  />
		</div>
	)
}

function mapDispatchToProps(dispatch){
	return bindActionCreators({
		toggleCollapsedNav: toggleCollapsedNav,
		onMobileNavToggle: onMobileNavToggle
	}, dispatch)
}

const mapStateToProps = ({ theme }) => {
	const { navCollapsed, mobileNav } =  theme;
	return { navCollapsed, mobileNav }
  };

export default connect(mapStateToProps, mapDispatchToProps)(LogoAlt);