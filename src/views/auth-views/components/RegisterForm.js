import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Form, Input, Alert } from "antd";
import { showAuthMessage, showLoading, hideAuthMessage, authenticated } from 'redux/actions/Auth';
import { useHistory } from "react-router-dom";
import { motion } from "framer-motion"
import JwtAuthService from 'services/JwtAuthService';
import IntlMessage from "components/util-components/IntlMessage";

const setLocale = (isLocaleOn, localeKey) =>
	isLocaleOn ? <IntlMessage id={localeKey} /> : localeKey.toString();

const localization = true;

const rules = {
	email: [
		{ 
			required: true,
			message: setLocale(localization, "profile.login.inputEmail")
		},
		{ 
			type: 'email',
			message: setLocale(localization, "profile.login.validEmail")
		}
	],
	password: [
		{ 
			required: true,
			message: 'Please input your password'
		}
	],
	confirm: [
		{ 
			required: true,
			message: 'Please confirm your password!'
		},
		({ getFieldValue }) => ({
			validator(rule, value) {
				if (!value || getFieldValue('password') === value) {
					return Promise.resolve();
				}
				return Promise.reject('Passwords do not match!');
			},
		})
	]
}

export const RegisterForm = (props) => {

	const { showLoading, token, loading, redirect, message, showMessage, hideAuthMessage, authenticated, allowRedirect } = props
	const [form] = Form.useForm();
	let history = useHistory();

	const onSignUp = () => {
    	form.validateFields().then(values => {
			showLoading()
			const fakeToken = 'fakeToken'
			console.log("FORM", values)
			// JwtAuthService.signUp(values).then(resp => {
			// 	authenticated(fakeToken)
			// }).then(e => {
			// 	showAuthMessage(e)
			// })
			authenticated(fakeToken)
		}).catch(info => {
			console.log('Validate Failed:', info);
		});
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
			<Form form={form} layout="vertical" name="register-form" onFinish={onSignUp}>
				<Form.Item 
					name="email" 
					label={setLocale(localization, "profile.login.email")} 
					rules={rules.email}
					hasFeedback
				>
					<Input prefix={<MailOutlined className="text-primary" />}/>
				</Form.Item>
				<Form.Item 
					name="password" 
					label={setLocale(localization, "profile.login.password")}
					rules={rules.password}
					hasFeedback
				>
					<Input.Password prefix={<LockOutlined className="text-primary" />}/>
				</Form.Item>
				<Form.Item 
					name="confirm" 
					label={setLocale(localization, "profile.login.confirmPassword")}
					rules={rules.confirm}
					hasFeedback
				>
					<Input.Password prefix={<LockOutlined className="text-primary" />}/>
				</Form.Item>
				<Form.Item>
					<Button type="primary" htmlType="submit" block loading={loading}>
						{setLocale(localization, "profile.login.signup")}
					</Button>
				</Form.Item>
			</Form>
		</>
	)
}

const mapStateToProps = ({auth}) => {
	const { loading, message, showMessage, token, redirect } = auth;
  return { loading, message, showMessage, token, redirect }
}

const mapDispatchToProps = {
	showAuthMessage,
	hideAuthMessage,
	showLoading,
	authenticated
}

export default connect(mapStateToProps, mapDispatchToProps)(RegisterForm)
