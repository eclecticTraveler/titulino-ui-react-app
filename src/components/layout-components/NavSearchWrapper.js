import React, { useState } from "react";
import { SearchOutlined,CloseCircleOutlined  } from '@ant-design/icons';
import { Menu } from "antd";
import { connect } from "react-redux";
import { onLocaleChange } from 'redux/actions/Theme'
import SearchInput from './NavSearch/SearchInput.js'


export const NavSearchWrapper = ({ isMobile, mode }) => {
	const [searchVisible, setSearchVisible] = useState(false);

	const experimentalVersion = (
		<ul className="ant-menu ant-menu-root ant-menu-horizontal menu-right-padding">          
		{
			(!isMobile && !searchVisible) ?
			<li className="ant-menu-item" onClick={() => setSearchVisible(!searchVisible)}>				
				<SearchOutlined className="nav-icon mr-0 menu-right-size"/>
			</li>
			:	
			<li className="ant-menu-item" onClick={() => setSearchVisible(!searchVisible)}>		
				<CloseCircleOutlined className="nav-icon mr-0 menu-right-size"/>
				<SearchInput mode={mode} isMobile={false} />
			</li>
		
		}
		</ul>
	);

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
			<Menu mode="horizontal" className="untoggled-search">
			<Menu.Item className="menu-right-padding">
				<div>
					<SearchOutlined className="nav-icon mr-0 menu-right-size" onClick={() => setSearchVisible(!searchVisible)}/>
				</div>
			</Menu.Item>
			</Menu>
			:
			<Menu mode="horizontal" className="toggled-search">
			<Menu.Item className="menu-right-padding">
				<div>
					<SearchInput mode={mode} isMobile={false} />
					<CloseCircleOutlined className="nav-icon mr-0 menu-right-size close-search" onClick={() => setSearchVisible(!searchVisible)}/>
				</div>
			</Menu.Item>
			</Menu>	

		
		}
		</div>
	)
	return (
		<div>{newestVersion}</div>
	)
}

const mapStateToProps = ({ theme }) => {
  const { locale } =  theme;
  return { locale }
};

export default connect(mapStateToProps, {onLocaleChange})(NavSearchWrapper);
