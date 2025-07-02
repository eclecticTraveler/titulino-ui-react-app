import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { 		
	showAuthMessage,
	showLoading,
	hideAuthMessage,
	authenticated,
	signIn
} from "redux/actions/Auth";

import { onAuthenticatingWithSSO } from "redux/actions/Grant";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from 'auth/SupabaseAuth';
import { Card } from 'antd';
import { useHistory } from "react-router-dom";
import JwtAuthService from 'services/JwtAuthService'

export const LoginAdapter = (props) => {
		let history = useHistory();	
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
			allowRedirect,
			onAuthenticatingWithSSO,
			signIn
		} = props
	  

		const handleSuccessfulLogin = (session) => {
			const user = session.user;
			const email = user.email;
			const token = session.data.session?.access_token;
		  
			if (!email) return;
		  
			// Dispatch redux actions
			authenticated(token);
			onAuthenticatingWithSSO(email);
			signIn(user);
			if (token) {
				const payload = JSON.parse(atob(token.split('.')[1]));
				const expiresAt = payload.exp * 1000; // Convert to ms
				const isExpired = Date.now() > expiresAt;
				console.log("Token expired?", isExpired);
			}

		  
			// Redirect after login
			history.push(APP_PREFIX_PATH);
		  };

		  
		  useEffect(() => {
			console.log("LoginAdapter mounted");
		  
			const checkInitialSession = async () => {
			  await new Promise(res => setTimeout(res, 500)); // optional wait
			  const { data } = await supabase.auth.getSession();
			  if (data?.session) {
				console.log("Initial session");
				handleSuccessfulLogin(data.session);
			  }
			};
		  
			checkInitialSession();
		  
			const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
			  console.log("Auth event:", event, session);
			  if (session) handleSuccessfulLogin(session);
			});
		  
			return () => listener.subscription.unsubscribe();
		  }, []);
		  
		  

	const converUrl = 'https://images.unsplash.com/photo-1603899122634-f086ca5f5ddd?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
	const titleOfEnrollment = 'login';
	console.log("window.location.origin", window.location.origin);
	const loginStyle = {
		maxWidth: 600,
		margin: "0 auto",
		padding: "20px",
	  }
	return (
		<>
			<div className="container customerName">
		<Card
			bordered
			style={loginStyle}
			cover={
			<img
				alt={titleOfEnrollment}
				src={converUrl}
				style={{ height: 100, objectFit: 'cover' }}
			/>
			}
		>
			<Auth
			className="supabase-auth-ui"
			supabaseClient={supabase}
			appearance={{
				theme: ThemeSupa,
				variables: {
				default: {
					colors: {
					brand: "#e79547", // Primary button color
					brandAccent: "#d27c3f", // Hover color
					},
				},
				},
			}}
			providers={['google', 'facebook']}
			redirectTo={window.location.origin + APP_PREFIX_PATH + '/login'} // or your custom redirect route
			/>
		</Card>
		</div>
		</>
		)
	};


function mapDispatchToProps(dispatch) {
  return bindActionCreators({
		showAuthMessage,
		showLoading,
		hideAuthMessage,
		authenticated,
		onAuthenticatingWithSSO,
		signIn
  }, dispatch);
}


const mapStateToProps = ({auth}) => {
	const {loading, message, showMessage, token, redirect} = auth;
	return {loading, message, showMessage, token, redirect}
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginAdapter);
