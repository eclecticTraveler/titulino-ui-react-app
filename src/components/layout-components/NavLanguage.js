import React from "react";
import { CheckOutlined, GlobalOutlined, DownOutlined  } from '@ant-design/icons';
import { Menu, Dropdown } from "antd";
import lang from "assets/data/language.data.json";
import { connect } from "react-redux";
import { onLocaleChange } from 'redux/actions/Theme';
import Flag from "react-world-flags";

function getLanguageDetail (locale) {
	const data = lang.filter(elm => (elm.langId === locale))
	return data[0]
}

const SelectedLanguage = ({ locale }) => {
	const language = getLanguageDetail(locale)
	const {langName, icon} = language
	return (
		<div className="d-flex align-items-center">
			{/* <img style={{maxWidth: '20px'}}  src={`/img/flags/${icon}.png`} alt={langName}/> */}
			<div className="course-flag course-selection-flag">
				<Flag code={icon} />
			</div>
			<span className="font-weight-semibold ml-2">{langName} <DownOutlined className="font-size-xs"/></span>
		</div>
	)
}

export const NavLanguage = ({ locale, configDisplay, onLocaleChange }) => {
	const languageItems = lang.map((elm, i) => ({
		key: i,
		className: locale === elm.langId ? 'ant-dropdown-menu-item-active' : '',
		onClick: () => onLocaleChange(elm.langId),
		label: (
			<span className="d-flex justify-content-between align-items-center">
				<div>
					<div className="course-flag course-selection-flag">
						<Flag code={elm?.icon} />
					</div>
					<span className="font-weight-normal ml-2">{elm.langName}</span>
				</div>
				{locale === elm.langId ? <CheckOutlined className="text-success" /> : null}
			</span>
		),
	}));

	const languageOption = <Menu items={languageItems} />;

	return (
		<Dropdown placement="bottomRight" popupRender={() => languageOption} trigger={["click"]}>
			{
				configDisplay ?
				(
					<a href="#/" className="text-gray" onClick={e => e.preventDefault()}>
						<SelectedLanguage locale={locale}/>
					</a>
				)
				:
				(
					<Menu mode="horizontal" className="menu-right-padding" items={[
						{
							key: '1',
							className: 'menu-right-padding',
							label: (
								<a href="#/" onClick={e => e.preventDefault()}>
									<GlobalOutlined className="nav-icon mr-0 menu-right-size" />
								</a>
							),
						}
					]} />
				)
			}
		</Dropdown>
	)
}

const mapStateToProps = ({ theme }) => {
  const { locale } =  theme;
  return { locale }
};

export default connect(mapStateToProps, {onLocaleChange})(NavLanguage);
