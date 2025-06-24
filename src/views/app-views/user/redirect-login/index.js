import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { 		
	showAuthMessage,
	showLoading,
	hideAuthMessage,
	authenticated } from "redux/actions/Auth";

import { onAuthenticatingWithSSO } from "redux/actions/Grant";
import { AUTH_PREFIX_PATH, APP_PREFIX_PATH } from "configs/AppConfig";
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
			onAuthenticatingWithSSO
		} = props
	  

		  useEffect(() => {
			const getSession = async () => {
			  const { data: { session } } = await supabase.auth.getSession();
			  if (session) {
				authenticated(session?.user);
				onAuthenticatingWithSSO(session?.email);
				// Push to modal asking for DOB by redux action.
				history.push("/session-retrieval");
				// history.push(AUTH_PREFIX_PATH);
				// history.push(APP_PREFIX_PATH);
				// history.push("/");
				//   showLoading()
			  }
			};
		  
			getSession();
		  
			const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
			  if (session) {  // Only update if session exists
				authenticated(session?.user);
				history.push("/session-retrieval");
				// history.push(APP_PREFIX_PATH);
				// history.push(AUTH_PREFIX_PATH);
				// history.push("/");
							//   showLoading()
			  }
			});
		  
			return () => authListener?.subscription?.unsubscribe();
		  }, [authenticated, history]);
  

	const converUrl = 'https://images.unsplash.com/photo-1603899122634-f086ca5f5ddd?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
	const titleOfEnrollment = 'login';
//   return <Redirect to={`${AUTH_PREFIX_PATH}/login`} />;
	return (
		<>
			<div className="container customerName">
		<Card
			bordered
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
		onAuthenticatingWithSSO
  }, dispatch);
}


const mapStateToProps = ({auth}) => {
	const {loading, message, showMessage, token, redirect} = auth;
	return {loading, message, showMessage, token, redirect}
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginAdapter);
