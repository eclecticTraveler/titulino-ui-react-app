import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types'
import { Avatar } from 'antd';
import { Link } from "react-router-dom";
import IntlMessage from "../../../components/util-components/IntlMessage";


const renderAvatar = props => {
	return <Avatar {...props} className={`ant-avatar-${props.type}`}>{props.text}</Avatar>;
}

const setLocale = (isLocaleOn, localeKey) =>
	isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();

export const AvatarMenu = props => {
	const { name, subTitle, type, src, icon, size, shape, gap, text, links } = props
	const [expanded, setExpanded] = useState(false);

	useEffect(() => {
		const checkIfClickedOutside = e => {
		  // If the menu is opened and the clicked target is not within the menu,
		  // then close the menu, this to close menu also by clicking off	  
		  if (expanded && e.target.localName !== "a") {
			  setExpanded(false);
		  }
		}
	
		document.addEventListener("mousedown", checkIfClickedOutside)
	
		return () => {
		  // Cleanup the event listener
		  document.removeEventListener("mousedown", checkIfClickedOutside)
		}
	  }, [expanded])

	return (
		<div className="avatar-menu d-flex align-items-center" onClick={() => setExpanded(!expanded)}>
			{renderAvatar({icon, src, type, size, shape, gap, text })}


			{expanded && (
				<div className="avatar__menu">
					<ul>
						{links.map((link, index) =>
							<li key={index}>
								<Link id={link.id} to={link.href}>{setLocale(true, link?.title)}</Link>
							</li>
						)}
					</ul>
				</div>
			)}
		</div>
	)
}

AvatarMenu.propTypes = {
	name: PropTypes.string,
	src: PropTypes.string,
	type: PropTypes.string,
	onNameClick: PropTypes.func
}

export default AvatarMenu;
