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
import { useIntl } from 'react-intl';
import IntlMessage from '../../util-components/IntlMessage';
import { connect } from "react-redux";
import { COURSE_COLOR_CONFIG } from 'configs/CourseThemeConfig';
import { onSearchSelection } from 'redux/actions/Theme';
import IconAdapter from "components/util-components/IconAdapter";
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';

const SearchInputV2 = props => {
	const { active, close, isMobile, mode, dynamicUpperMainNavigation, locale, onSearchSelection } = props
	const intl = useIntl();
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


	const getCategoryIcon = (category, level, icon) => { // eslint-disable-line no-unused-vars
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
		const query = searchText?.trim().toLowerCase() || '';
		return optionList
		  ?.filter(item => {
			const keywords = item?.keywords || [];
			const combined = [item?.title, item?.path, ...keywords];
			return combined.some(text => 
				typeof text === 'string' && text.trim().toLowerCase().includes(query)
			);
		  })
		  ?.map((item, index) => {
			const keywords = item?.keywords || [];
			const category = keywords?.[0] || "uncategorized";
			const level = keywords?.[1] || "general";
	  
			const localizedTitle = setLocale(locale, item.title);
			// Build a searchable blob so the onSearch filter can match against keywords + title + path
			const searchText = [item?.title, item?.path, ...keywords]
			  .filter(t => typeof t === 'string')
			  .join(' ')
			  .toLowerCase();

			return {
			  value: item?.path,
			  key: `${item?.path}-${index}`,
			  searchText,
			  label: (
				<Link to={item?.path}>
				  <div className="search-list-item">
					<div className="icon">
					  {getItemIcon(category, level, item?.icon) || <BulbOutlined />}
					</div>
					<div>
					  <div className="font-weight-semibold">{localizedTitle}</div>
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
		if (!searchText) {
		  setOptions([]);
		  return;
		}
		const results = searchResult(searchText);
		// Filter: every word in the query must appear somewhere in the searchable text
		const words = searchText.toLowerCase().split(/[\s-]+/).filter(Boolean);
		const filtered = results?.filter(option =>
		  words.every(word => option.searchText?.includes(word))
		) || [];
		setOptions(filtered);
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
			classNames={{ popup: { root: "nav-search-dropdown" } }}
			popupMatchSelectWidth={false} // Disable the default width matching behavior
			styles={{ popup: { root: { maxHeight: 400 } } }}
			options={options}
			onSelect={onSelect}
			onSearch={onSearch}
			value={value}
			filterOption={false}
		>
			<Input className='search-input-override' placeholder={intl.formatMessage({ id: "nav.search.placeholder" })}  prefix={<SearchOutlined className="mr-0 search-icon-override" />} />
		</AutoComplete>
	)
}

const mapStateToProps = ({ theme, lrn}) => {
	const {dynamicUpperMainNavigation} = lrn;
	const { headerNavColor, locale } =  theme;
	return { headerNavColor, dynamicUpperMainNavigation, locale }
  };
  
  export default connect(mapStateToProps, {onSearchSelection})(SearchInputV2)