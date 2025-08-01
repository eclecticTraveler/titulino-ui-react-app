import React from 'react';
import { env } from 'configs/EnvironmentConfig';
import IntlMessage from "components/util-components/IntlMessage";
import { AUTH_PREFIX_PATH } from 'configs/AppConfig';
import { Button } from 'antd';

export const ShoppingCenter = ({ isCollapsed }) => {
	const locale = true;

	const setLocale = (isLocaleOn, localeKey) => {
		return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
	};

	const renderFullButton = () => (
		<div className="widget-action">
			<Button
			type="link"
			size={"large"}
			href={`${AUTH_PREFIX_PATH}/shopping`}
			rel="noopener noreferrer"			
		>
		{setLocale(locale, "shopping.center")}		
		</Button>
		</div>
	);

	const renderCompactButton = () => (
		<a
			href={`${AUTH_PREFIX_PATH}/shopping`}
			rel="noopener noreferrer"
			title="Shop 🛒"
			style={{
				display: 'inline-block',
				padding: '8px',
				backgroundColor: '#140f2d',
				borderRadius: '50%',
				textAlign: 'center',
				margin: '8px'
			}}
		>
			<span role="img" aria-label="Shopping Cart" style={{ fontSize: '20px' }}>🛒</span>
		</a>
	);

	return (
		<div className={isCollapsed ? 'donation-btn-action-collapsed' : 'widget-action'}>
			{isCollapsed ? renderCompactButton() : renderFullButton()}
		</div>
	);
};

export default ShoppingCenter;
