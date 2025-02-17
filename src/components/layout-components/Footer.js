import React from 'react';
import { APP_FULLNAME } from '../../configs/AppConfig';
import { Link } from 'react-router-dom';

export default function Footer() {
	return (
		<footer className="footer">
			<span>
				Copyright &copy; {new Date().getFullYear()}
				<span className="font-weight-semibold">{APP_FULLNAME}</span>. All rights reserved.
				{' - '}
				<Link to="/lrn/terms-conditions" className="footer-link">
					Terms & Conditions
				</Link>
			</span>
		</footer>
	);
}
