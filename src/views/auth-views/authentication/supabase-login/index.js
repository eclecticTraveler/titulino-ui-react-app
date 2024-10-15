import React from 'react'
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useHistory } from "react-router-dom";

const supabase = createClient(
	"https://dollxabphvcafglmixns.supabase.co",
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvbGx4YWJwaHZjYWZnbG1peG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc0OTM5MjUsImV4cCI6MjA0MzA2OTkyNX0.bXj0ZjusXoRNihiG5BcSjMOGXqy35WBwm0aqGmCohY4"
)


const SupabaseLogin = () => {
	let history = useHistory();
	supabase.auth.onAuthStateChange(async (event) => {
		if(event === "SIGNED_OUT"){
			// forward to succesful URL
			// history.push("/sucess");
			alert("OUT")
		}else{
			// forward to localhost
			// history.push("/");
			alert("IN")
		}
	})




	return (
		<div>
			<header>
				{/* <Auth
				supabaseClient={supabase}
				appearance={{theme: ThemeSupa }}
				theme="dark"
				providers={["facebook", "google"]}
				/> */}
				<div>Hello World</div>
			</header>
		</div>

	)
}

export default SupabaseLogin
