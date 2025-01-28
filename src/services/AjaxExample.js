import axios from 'axios';
import { env } from '../configs/EnvironmentConfig'

const userAccountInfoEndPoint= `${env}/Primary/restapi/Flow/33c346dddd3e106`;
const adminIdEndpoint = `${env}/Primary/restapi/Flow/77b20400-6d3e106`;

const requestBody = {
  "userid": env.GUESS_ENDPOINT_USER_ID,
  "password": env.GUESS_PWD,
  "outputtype": "RawJson",
};

let _userAccount = [];

export const setAgency = async(whoCalledMe) => {
  try{
    // Implement if needed
  }catch(err){
    console.log("ERROR");
    console.log(err);
  }
}

export const getAdminIdFromUsername = async(token, username, whoCalledMe) => {       
  let debbugingUsername = "";
  if (token && username) {
    if(username === "a@.com"){   
      debbugingUsername = "";
    }
    requestBody["JWT"] = token;
    requestBody["Username"] = debbugingUsername ? debbugingUsername : username;

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "text/plain");
    
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(requestBody),
      redirect: 'follow'
    };
    
    try{

      const results = await fetch(adminIdEndpoint, requestOptions).catch((error) => {
        console.log(`Error Retrieving accountInfo in getAdminIdFromUsername: from ${whoCalledMe}`);
        console.error(error)
      });    
      const apiResult = await results.json();
      const parsedResult = apiResult["AdminId"]; 
      return parsedResult > 0 ? parsedResult : 0;

    }catch(err){
      return 0;
    }
  }

  return 0;
}


export const getUserAccountsInfo = async(token, username, whoCalledMe) => {
  let debbugingUsername = "";
  if (token && username) {
    if(username === "aalbertoarellano@.com"){
      debbugingUsername = "e@.com";
    }
    requestBody["JWT"] = token;
    requestBody["Username"] = debbugingUsername ? debbugingUsername : username;

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "text/plain");
    
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(requestBody),
      redirect: 'follow'
    };
    
    try{

      const results = await fetch(userAccountInfoEndPoint, requestOptions).catch((error) => {
        console.log(`Error Retrieving accountInfo: from ${whoCalledMe}`);
        console.error(error)
      });    
      const apiResult = await results.json();
      const parsedResult = apiResult["accounts"];
      
      console.log("userAccountInfoEndPoint");
      console.log(userAccountInfoEndPoint);
      console.log("username");
      console.log(username);
      console.log("API R");
      console.log(apiResult);
      console.log("API Pars");
      console.log(parsedResult);
  
      return parsedResult.length > 0 ? parsedResult : _userAccount;

    }catch(err){
      return _userAccount;
    }
  }

  return _userAccount;
}


const AjaxExample = {
  getUserAccountsInfo,
  setAgency,
  getAdminIdFromUsername
};

export default AjaxExample;
