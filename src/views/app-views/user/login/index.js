import React, { useState, useEffect, useRef } from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { 		
	showAuthMessage,
	showLoading,
	hideAuthMessage,
	authenticated,
	signIn,
	onResolvingAuthenticationWhenRefreshing
} from "redux/actions/Auth";

import { onAuthenticatingWithSSO } from "redux/actions/Grant";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from 'auth/SupabaseAuth';
import { Card } from 'antd';
import { useHistory, useLocation } from "react-router-dom";
import Loading from 'components/shared-components/Loading';

// ✅ Extract hash tokens into query-style params
const parseHashParams = (hash) => {
	if (!hash) return {};
	return hash
		.substring(1) // remove '#'
		.split('&')
		.reduce((acc, part) => {
			const [key, value] = part.split('=');
			acc[key] = decodeURIComponent(value);
			return acc;
		}, {});
};


export const LoginAdapter = (props) => {
	const history = useHistory();	
	const location = useLocation();
	const hasRedirected = useRef(false); // ✅ prevents multiple redirects

	const currentPath = `${location.pathname}${location.search}`;
	const safeRedirectPath = currentPath.startsWith('/lrn/login') ? APP_PREFIX_PATH : currentPath;

	// ✅ Get the original intended destination
	const getRedirectPath = () => {
		const searchParams = new URLSearchParams(location.search);
		const fromQuery = searchParams.get('redirect') || searchParams.get('redirectTo');
		const fromState = location.state?.from;
		const fromStorage = localStorage.getItem('postLoginRedirect');
		console.log("searchParams", searchParams, "fromQuery", fromQuery, "fromState", fromState, "fromStorage", fromStorage)
	
		const rawRedirect = fromQuery || fromState || fromStorage || APP_PREFIX_PATH;
		const cleanRedirect = decodeURIComponent(rawRedirect);
		console.log("cleanRedirect", cleanRedirect);
		// Prevent redirecting back to login page
		return cleanRedirect.includes('/lrn/login') ? APP_PREFIX_PATH : cleanRedirect;
	};
	

	const { 
		showLoading,
		hideAuthMessage,
		showAuthMessage,
		authenticated,
		signIn,
		onAuthenticatingWithSSO,
		onResolvingAuthenticationWhenRefreshing,
		token,
		message,
		showMessage,
		loading,
		redirect
	} = props;

	const handleSuccessfulLogin = (session) => {  
		if (hasRedirected.current) {
			console.log("✅ Skipping redirect, already done.");
			return;
		}
	
		const accessToken = session?.data?.session?.access_token;
		const email = session?.user?.email;
	
		if (accessToken && email) {
			authenticated(accessToken);
			onAuthenticatingWithSSO(email);
			signIn(session?.user);
			onResolvingAuthenticationWhenRefreshing(true);
		}
	
		hasRedirected.current = true;
	
		const redirectPath = getRedirectPath();
		localStorage.removeItem('postLoginRedirect');
	
		console.log("🔁 Redirecting to", redirectPath);
		history.replace(redirectPath);
	};
	
	useEffect(() => {
		// console.log("🔐 LoginAdapter mounted");
	
		// ✅ Step 1: Check for Supabase redirect hash tokens
		const hashParams = parseHashParams(window.location.hash);
		const accessToken = hashParams.access_token;
	
		if (accessToken) {
			// console.log("🧪 Supabase token found in URL hash, verifying...");
	
			// ✅ Supabase stores it in memory automatically, we just need to use getSession to confirm
			supabase.auth.getSession().then(({ data }) => {
				if (data?.session) {
					// console.log("✅ Supabase session restored from hash");
					handleSuccessfulLogin(data.session);
	
					// ✅ Clean the URL (removes the #access_token)
					history.replace({
						pathname: location.pathname,
						search: location.search,
					});
				}
			});
		}
	
		// ✅ Step 2: Check if session already exists (e.g. from cookie)
		const checkInitialSession = async () => {
			await new Promise(res => setTimeout(res, 300));
			const { data } = await supabase.auth.getSession();
			if (data?.session) {
				// console.log("✅ Initial session found (no hash)");
				handleSuccessfulLogin(data.session);
			}
		};
	
		checkInitialSession();
	
		// ✅ Step 3: Listen to auth changes
		const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
			// console.log("🟡 Auth event:", event, session);
			if (session) handleSuccessfulLogin(session);
		});
	
		return () => listener.subscription.unsubscribe();
	}, []);
	

	const converUrl = 'https://images.unsplash.com/photo-1603899122634-f086ca5f5ddd?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
	const titleOfEnrollment = 'login';

	const loginStyle = {
		maxWidth: 600,
		margin: "0 auto",
		padding: "20px",
	};

	useEffect(() => {
		if (!token && safeRedirectPath) {
			console.log("---------safeRedirectPath", safeRedirectPath)
			localStorage.setItem('postLoginRedirect', safeRedirectPath);
		}
	}, [token, safeRedirectPath]);

	if (!token) {
		// 👇 Login page with correct redirectTo
		return (
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
										brand: "#e79547",
										brandAccent: "#d27c3f",
									},
								},
							},
						}}
						providers={['google', 'facebook']}
						redirectTo={`${window.location.origin}/lrn/login?redirect=${encodeURIComponent(safeRedirectPath)}`}

					/>
				</Card>
			</div>
		);
	} else {
		// Already logged in, show loading while redirecting
		return <Loading cover="content" />;
	}
};

function mapDispatchToProps(dispatch) {
	return bindActionCreators({
		showAuthMessage,
		showLoading,
		hideAuthMessage,
		authenticated,
		onAuthenticatingWithSSO,
		signIn,
		onResolvingAuthenticationWhenRefreshing
	}, dispatch);
}

const mapStateToProps = ({ auth }) => {
	const { loading, message, showMessage, token, redirect } = auth;
	return { loading, message, showMessage, token, redirect };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginAdapter);
