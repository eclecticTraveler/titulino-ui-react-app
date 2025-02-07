import React, { useState, useRef } from 'react';
import { 
	DashboardOutlined,
	AppstoreAddOutlined,
	BookOutlined,
	CustomerServiceOutlined,
	PlayCircleOutlined,
	EditOutlined,
	SearchOutlined
} from '@ant-design/icons';
import { Link } from "react-router-dom";
import { AutoComplete, Input } from 'antd';
import IntlMessage from '../../util-components/IntlMessage';
import { connect } from "react-redux";
import { COURSE_COLOR_CONFIG } from 'configs/CourseThemeConfig';
import { onSearchSelection } from 'redux/actions/Theme';

const SearchInput = props => {
	const { active, close, isMobile, mode, dynamicUpperMainNavigation, locale, onSearchSelection } = props
	const [value, setValue] = useState('');
	const [options, setOptions] = useState([])
	const inputRef = useRef(null);

	function getOptionList (navigationTree, optionTree) {
		optionTree = optionTree ? optionTree : [];
		if(navigationTree){
			for ( const navItem of navigationTree ) {
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

	const optionList = getOptionList(dynamicUpperMainNavigation)
	
	
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


	const getCategoryIcon = (category, level) => {
		 
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
			default:
				return null;
		}
	}
	
	const searchResult = () => optionList.map((item) => {
		console.log("SEARCH", item);
		const category = item.key.split('-')[1];
		const level = item.key.split('-')[2];
		const module = item.key.split('-')[3];
		const localeChapter = setLocale(locale, "local.chapter");
		const localeLevel = setLocale(locale, "local.level");
		const moduleCategory = setLocale(locale, `module.${category}`);

		return {
			value: item.path,
			label: (
				<Link to={item.path}>
					<div className="search-list-item">
						<div className="icon">
							{getCategoryIcon(category, level)}
						</div>
						<div>
							<div className="font-weight-semibold">{localeLevel}-{level} | {localeChapter}-{module}</div>
							<div className="font-size-s text-muted">{moduleCategory}</div>
						</div>
					</div>
				</Link>
			),
		};
	});

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
		: searchResult()?.filter(option =>
			searchText
			  .toLowerCase()
			  .split(/[\s-]+/) // Split the search text by spaces or hyphens
			  .every(word =>
				option.value.toLowerCase().includes(word)
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
  
  export default connect(mapStateToProps, {onSearchSelection})(SearchInput)