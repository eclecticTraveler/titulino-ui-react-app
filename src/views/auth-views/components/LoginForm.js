import React, { useEffect } from 'react';
import { connect } from "react-redux";
import { Button, Form, Input, Divider, Alert } from "antd";
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { GoogleSVG, FacebookSVG } from 'assets/svg/icon';
import CustomIcon from 'components/util-components/CustomIcon'
import {  
	showLoading, 
	showAuthMessage, 
	hideAuthMessage,
	authenticated
} from 'redux/actions/Auth';
import JwtAuthService from 'services/JwtAuthService'
import { useHistory } from "react-router-dom";
import { motion } from "framer-motion";
import IntlMessage from "components/util-components/IntlMessage";

const setLocale = (isLocaleOn, localeKey) =>
	isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();

export const LoginForm = (props) => {
	let history = useHistory();
	const localization = true;

	const { 
		otherSignIn = true, 
		showForgetPassword = false, 
		hideAuthMessage,
		onForgetPasswordClick,
		showLoading,
		extra,
		loading,
		showMessage,
		message,
		authenticated,
		showAuthMessage,
		token,
		redirect,
		allowRedirect
	} = props

	const onLogin = values => {
		showLoading()
		const fakeToken = 'fakeToken'
		// JwtAuthService.login(values).then(resp => {
		// 	authenticated(fakeToken)
		// }).then(e => {
		// 	showAuthMessage(e)
		// })
		authenticated(fakeToken); // CHANGE LATER
	};

	const onGoogleLogin = () => {
		showLoading()
		onLogin()
	}

	const onFacebookLogin = () => {
		showLoading()
		onLogin()
	}

	useEffect(() => {
	
		if (token && allowRedirect) {
			history.push(redirect);
		}
	
		let timeoutId;
		
		if (showMessage) {
			timeoutId = setTimeout(() => {
				hideAuthMessage();
			}, 3000);
		}
	
		// Cleanup on unmount
		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	}, [token, redirect, showMessage]);
	
	
	const renderOtherSignIn = (
		
		<div>
			<Divider>
				<span className="text-muted font-size-base font-weight-normal">
					<span className=''>
						<a href=""> {setLocale(localization, "profile.login.recommended")} </a>
					</span>
					{setLocale(localization, "profile.login.connectwith")} 
				</span>
			</Divider>

			<div className="d-flex justify-content-center">
				<Button 
					onClick={() => onGoogleLogin()} 
					className="mr-4 social-media-button" 
					icon={<CustomIcon svg={GoogleSVG}/>}
					disabled={loading} 
				>
					Google
				</Button>
				<Button 
					onClick={() => onFacebookLogin()} 
					className="social-media-button" 
					icon={<CustomIcon svg={FacebookSVG}/>}
					disabled={loading} 
				>
					Facebook
				</Button>
			</div>
			<Divider>
				<span className="text-muted font-size-base font-weight-normal">{setLocale(localization, "profile.login.traditional")}</span>
			</Divider>
		</div>
	)

	return (
		<>
			<motion.div 
				initial={{ opacity: 0, marginBottom: 0 }} 
				animate={{ 
					opacity: showMessage ? 1 : 0,
					marginBottom: showMessage ? 20 : 0 
				}}> 
				<Alert type="error" showIcon message={message}></Alert>
			</motion.div>
			<Form 
				layout="vertical" 
				name="login-form"
				onFinish={onLogin}
			>
				{
					otherSignIn ? renderOtherSignIn : null
				}
				{ extra }

				<Form.Item 
					name="email" 
					label={setLocale(localization, "profile.login.email")} 
					rules={[
						{ 
							required: true,
							message: setLocale(localization, "profile.login.inputEmail"),
						},
						{ 
							type: 'email',
							message: setLocale(localization, "profile.login.validEmail")
						}
					]}>
					<Input prefix={<MailOutlined className="text-primary" />}/>
				</Form.Item>
				<Form.Item 
					name={setLocale(localization, "profile.login.password")} 
					label={
						<div className={`${showForgetPassword? 'd-flex justify-content-between w-100 align-items-center' : ''}`}>
							<span>{setLocale(localization, "profile.login.password")}</span>
							{
								showForgetPassword && 
								<span 
									onClick={() => onForgetPasswordClick} 
									className="cursor-pointer font-size-sm font-weight-normal text-muted"
								>
									{setLocale(localization, "profile.login.forgetPassword")}
								</span>
							} 
						</div>
					} 
					rules={[
						{ 
							required: true,
							message:setLocale(localization, "profile.login.inputPassword"),
						}
					]}
				>
					<Input.Password prefix={<LockOutlined className="text-primary" />}/>
				</Form.Item>
				<Form.Item>
					<Button type="primary" htmlType="submit" block loading={loading}>
						{setLocale(localization, "profile.login.signIn")}
					</Button>
				</Form.Item>

			</Form>
		</>
	)
}

LoginForm.propTypes = {
	otherSignIn: PropTypes.bool,
	showForgetPassword: PropTypes.bool,
	extra: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.element
	]),
};

const mapStateToProps = ({auth}) => {
	const {loading, message, showMessage, token, redirect} = auth;
  	return {loading, message, showMessage, token, redirect}
}

const mapDispatchToProps = {
	showAuthMessage,
	showLoading,
	hideAuthMessage,
	authenticated
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm)
