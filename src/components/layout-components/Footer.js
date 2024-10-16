import React from 'react'
import { APP_FULLNAME } from '../../configs/AppConfig';

export default function Footer() {
	return (
		<footer className="footer">
			<span>Copyright  &copy;  {`${new Date().getFullYear()}`} <span className="font-weight-semibold">{`${APP_FULLNAME}`}</span> All rights reserved.</span>
		</footer>
	)
}

