import React, { useState, useRef } from 'react';
import { 
	DashboardOutlined,
	AppstoreAddOutlined,
	BookOutlined,
	CustomerServiceOutlined,
	PlayCircleOutlined,
	EditOutlined,
	SearchOutlined,
	BulbOutlined,
	SoundOutlined
} from '@ant-design/icons';
import { Link } from "react-router-dom";
import { AutoComplete, Input } from 'antd';
import IntlMessage from '../../util-components/IntlMessage';
import { connect } from "react-redux";
import { COURSE_COLOR_CONFIG } from 'configs/CourseThemeConfig';
import { onSearchSelection } from 'redux/actions/Theme';
import IconAdapter from "components/util-components/IconAdapter";
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';

const SearchInputV2 = props => {
	const { active, close, isMobile, mode, dynamicUpperMainNavigation, locale, onSearchSelection } = props
	const [value, setValue] = useState('');
	const [options, setOptions] = useState([])
	const inputRef = useRef(null);

	function getOptionList (navigationTree, optionTree) {
		optionTree = optionTree ? optionTree : [];
		if(navigationTree){
			for ( const navItem of navigationTree ) {
				// console.log("navItem", navItem?.isRootMenuItem)
				if(navItem?.submenu?.length === 0) {
					optionTree?.push(navItem)
				}
				if(navItem?.submenu?.length > 0) {
					getOptionList(navItem?.submenu, optionTree);
				}
			}
			return optionTree;
		}
		return [];
	}
	
	const setLocale = (isLocaleOn, localeKey) =>
		isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();

	const optionList = getOptionList(dynamicUpperMainNavigation);
	
	
	const getLevelColor = (level) => {
		 
		switch (level) {
			case "1":
				return COURSE_COLOR_CONFIG.lowerBeginner;
			case "2":
				return COURSE_COLOR_CONFIG.midBeginner;
			case "3":
				return COURSE_COLOR_CONFIG.upperBeginner;
			default:
				return "text-primary";
		}
	}


	const getCategoryIcon = (category, level, icon) => {
		//  console.log("category", category);
		//  console.log("level", level)
		switch (category) {
			case 'play':
				return <DashboardOutlined style={{ color: getLevelColor(level) }}/>;
			case 'resources':
				return <AppstoreAddOutlined style={{ color: getLevelColor(level) }}/>;
			case 'test':
				return <BookOutlined style={{ color: getLevelColor(level) }}/>;
			case 'class':
				return <PlayCircleOutlined style={{ color: getLevelColor(level) }} />;
			case 'spell':
				return <EditOutlined style={{ color: getLevelColor(level) }}/>;
			case 'listening':
				return <CustomerServiceOutlined style={{ color: getLevelColor(level) }}/>
			case 'speaking':
				return <SoundOutlined style={{ color: getLevelColor(level) }} />;				
			default:
				console.log("item?.iconName", icon)
				return <IconAdapter icon={icon} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} />  
		}
	}

	const getItemIcon = (category, level, icon) => {
		return <IconAdapter icon={icon} iconType={ICON_LIBRARY_TYPE_CONFIG.fontAwesome} /> 
	}
	
	const searchResult = (searchText) => {
		console.log("searchText", searchText)
		return optionList
		  ?.filter(item => {
			const keywords = item?.keywords || [];
			const combined = [item?.title, item?.path, ...keywords];
			const result = combined?.some(text => 
				typeof text === 'string' && text.trim().toLowerCase().includes(searchText?.trim().toLowerCase())
			  );
			return result;
		  })
		  ?.map((item, index) => {
			const keywords = item?.keywords || [];
			// console.log("Keywords Array:", keywords);
	  
			const category = keywords?.[0] || "uncategorized";
			const level = keywords?.[1] || "general";
			const module = keywords?.[2] || "base";
	  
			console.log("Category:->>>", category, level, module);
			const localizedTitle = setLocale(locale, item.title);
			return {
			  value: item?.path,
			  key: `${item?.path}-${index}`,
			  label: (
				<Link to={item?.path}>
				  <div className="search-list-item">
					<div className="icon">
					  {getItemIcon(category, level, item?.icon) || <BulbOutlined />}
					</div>
					<div>
					  <div className="font-weight-semibold">{localizedTitle} { `Level:${level}`}</div>
					  <div className="font-size-s text-muted">{item.path}</div>
					</div>
				  </div>
				</Link>
			  ),
			};
		  });
	  };
	  
	  
	  
	  
	const onSelect = () => {
		onSearchSelection(false);
		setValue('');
		setOptions([]);
		if(close) {
			close();
		}
  	};

	  const onSearch = searchText => {
		setValue(searchText);
		const searching = !searchText
		  ? []
		  : searchResult(searchText)?.filter(option =>
			  searchText
				?.toLowerCase()
				?.split(/[\s-]+/) // Split the search text by spaces or hyphens
				?.every(word =>
				  option?.value?.toLowerCase()?.includes(word)
				)
			);
	  
		setOptions(searching);
	  };  
	
	const autofocus = () => {
		inputRef.current.focus();
	}

	if(active) {
		autofocus()
	}

	return (
		<AutoComplete
			ref={inputRef} 
			className={`nav-search-input ${isMobile ? 'is-mobile' : ''} ${!isMobile ? 'search-input-big' : ''} ${mode === 'light' ? 'light' : ''}`}
			dropdownClassName="nav-search-dropdown"
			dropdownMatchSelectWidth={false} // Disable the default width matching behavior
			dropdownStyle={{ maxHeight: 400 }} // Adjust the maximum height of the dropdown menu
			options={options} // Pass in more options to increase the number of displayed results
			onSelect={onSelect}
			onSearch={onSearch}
			value={value}
			filterOption={(inputValue, option) => 
				option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
			}
		>
			<Input className='search-input-override' placeholder="Search..."  prefix={<SearchOutlined className="mr-0 search-icon-override" />} />
		</AutoComplete>
	)
}

const mapStateToProps = ({ theme, lrn}) => {
	const {dynamicUpperMainNavigation} = lrn;
	const { headerNavColor, locale } =  theme;
	return { headerNavColor, dynamicUpperMainNavigation, locale }
  };
  
  export default connect(mapStateToProps, {onSearchSelection})(SearchInputV2)