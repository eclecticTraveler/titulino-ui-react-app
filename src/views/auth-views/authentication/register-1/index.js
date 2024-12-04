import React from 'react'
import RegisterForm from '../../components/RegisterForm';
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

const RegisterOne = props => {
	const localization = true;
	const theme = useSelector(state => state.theme.currentTheme)
	return (
		<div className="h-100" style={backgroundStyle}>
			<div className="container d-flex flex-column justify-content-center h-100">
				<Row justify="center">
					<Col xs={20} sm={20} md={20} lg={7}>
						<Card>
							<div className="my-2">
								<div className="text-center">

								<IconAdapter icon={"/img/titulino-logo-1.png"} iconType={ICON_LIBRARY_TYPE_CONFIG.hostedSvg}/>									
									<p className="text-muted">{setLocale(localization, "profile.login.createAccount")}:</p>
								</div>
								<Row justify="center">
									<Col xs={24} sm={24} md={20} lg={20}>
										<RegisterForm {...props}/>
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

export default RegisterOne
