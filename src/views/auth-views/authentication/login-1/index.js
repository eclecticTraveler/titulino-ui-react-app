import React from 'react'
import LoginForm from '../../components/LoginForm'
import { Card, Row, Col } from "antd";
import { useSelector } from 'react-redux';
import IntlMessage from "components/util-components/IntlMessage";
import IconAdapter from 'components/util-components/IconAdapter';
import { ICON_LIBRARY_TYPE_CONFIG } from 'configs/IconConfig';

const backgroundStyle = {
	backgroundImage: 'url(/img/others/img-17.jpg)',
	backgroundRepeat: 'no-repeat',
	backgroundSize: 'cover'
}

const setLocale = (isLocaleOn, localeKey) =>
	isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();

const LoginOne = props => {
	const localization = true;
	const theme = useSelector(state => state.theme.currentTheme)
	return (
		<div className="h-100" style={backgroundStyle}>
			<div className="container d-flex flex-column justify-content-center h-100">
				<Row justify="center">
					<Col xs={20} sm={20} md={20} lg={7}>
						<Card>
							<div className="my-4">
								<div className="text-center">
									<img className="img-fluid" src={`/img/${theme === 'light' ? 'titulino-logo-1.png': 'logo-white.png'}`} alt="" />
									<IconAdapter icon={"/img/titulino-logo-1.png"} iconType={ICON_LIBRARY_TYPE_CONFIG.hostedSvg}/>
									<p>{setLocale(localization, "profile.login.accountyet")} <a href="/lrn/signup">{setLocale(localization, "profile.login.signup")}</a></p>
								</div>
								<Row justify="center">
									<Col xs={24} sm={24} md={20} lg={20}>
										<LoginForm {...props} />
									</Col>
								</Row>
							</div>
						</Card>
					</Col>
				</Row>
			</div>
		</div>
	)
}

export default LoginOne
