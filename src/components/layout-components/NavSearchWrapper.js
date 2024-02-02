import React, { useState } from "react";
import { SearchOutlined  } from '@ant-design/icons';
import { Menu } from "antd";
import { connect } from "react-redux";
import { onLocaleChange } from 'redux/actions/Theme'
import SearchInput from './NavSearch/SearchInput.js'


export const NavSearchWrapper = ({ isMobile, mode }) => {
	const [searchVisible, setSearchVisible] = useState(false);

	const oldVersion = (
		<ul className="ant-menu ant-menu-root ant-menu-horizontal menu-right-padding">          
		{
			(!isMobile && !searchVisible) ?
			<li className="ant-menu-item" onClick={() => setSearchVisible(!searchVisible)}>
				<SearchOutlined className="nav-icon mr-0 menu-right-size"/>
			</li>
			:		
			<SearchInput mode={mode} isMobile={false} />
		
		}
		</ul>
	);

	const newestVersion = (
		<div>        
		{
			(!isMobile && !searchVisible) ?
			<Menu mode="horizontal" className="menu-right-padding">
			<Menu.Item className="menu-right-padding">
				<a href="#/" onClick={e => e.preventDefault()}>
					<SearchOutlined className="nav-icon mr-0 menu-right-size"/>
				</a>
			</Menu.Item>
			</Menu>
			:		
			<SearchInput mode={mode} isMobile={false} />
		
		}
		</div>
	)
	return (
		<div>{oldVersion}</div>
	)
}

const mapStateToProps = ({ theme }) => {
  const { locale } =  theme;
  return { locale }
};

export default connect(mapStateToProps, {onLocaleChange})(NavSearchWrapper);
