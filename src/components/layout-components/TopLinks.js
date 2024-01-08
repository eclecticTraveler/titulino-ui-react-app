import React from 'react'
import IntlMessage from "../../components/util-components/IntlMessage";

const setLocale = (isLocaleOn, localeKey) =>
	isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();

export const TopLinks = () => {
	return (
		<div className="top-links">
			<ul>
				<li>
					<button>
						<img src="/img/others/ico-chat.png" alt="" /> <span>{setLocale(true, 'messages')}</span>
					</button>
				</li>

				<li>
					<button>
						<img src="/img/others/ico-bell.png" alt="" />

						<em></em>
					</button>
				</li>
			</ul>
		</div>
	)
}

export default TopLinks