import React from 'react';
import { env } from 'configs/EnvironmentConfig';
import IntlMessage from "components/util-components/IntlMessage";

export const DonationCenter = ({ isCollapsed }) => {
	const locale = true;

	const setLocale = (isLocaleOn, localeKey) => {
		return isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();
	};

	const renderFullButton = () => (
		<a
			href={env.DONATION_CENTER_URL}
			target="_blank"
			rel="noopener noreferrer"
		>
			<img
				src="https://img.buymeacoffee.com/button-api/?text=Buy me a pizza&emoji=🍕&slug=titulino&button_colour=e78b47&font_colour=000000&font_family=Lato&outline_colour=000000&coffee_colour=FFDD00"
				alt="Buy me a pizza"
				style={{ height: '45px' }}
			/>
		</a>
	);

	const renderCompactButton = () => (
		<a
			href={env.DONATION_CENTER_URL}
			target="_blank"
			rel="noopener noreferrer"
			title="Buy me a pizza 🍕"
			style={{
				display: 'inline-block',
				padding: '8px',
				backgroundColor: '#e78b47',
				borderRadius: '50%',
				textAlign: 'center',
				margin: '8px'
			}}
		>
			<span role="img" aria-label="pizza" style={{ fontSize: '20px' }}>🍕</span>
		</a>
	);

	return (
		<div className={isCollapsed ? 'donation-btn-action-collapsed' : 'widget-action'}>
			{isCollapsed ? renderCompactButton() : renderFullButton()}
		</div>
	);
};

export default DonationCenter;
