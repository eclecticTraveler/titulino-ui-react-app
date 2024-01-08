import axios from 'axios';
import { env } from '../configs/EnvironmentConfig'
import dummyAddressData from '../assets/data/shipping-data.json';

const userAccountInfoEndPoint= `${env.DECISIONS_API_ENDPOINT_URL}/Primary/restapi/Flow/33c34e05-e8c7-11eb-91cf-326dddd3e106`;
const adminIdEndpoint = `${env.DECISIONS_API_ENDPOINT_URL}/Primary/restapi/Flow/77b20400-6376-11ec-91f8-326dddd3e106`;

const requestBody = {
  "userid": env.GUESS_ENDPOINT_USER_ID,
  "password": env.GUESS_PWD,
  "outputtype": "RawJson",
};

let _companyAddresses = [];
let _singleCompanyAddress = {};


export const formCompanyAddressTypesByIdForTabIndexing = async(rawAddresses) => {
  // Grab for safetly first value
  const addresses = rawAddresses[0].companyAddresses;
  let addressTabList = [];
  
  if(addresses?.length > 0){
    addresses.forEach(function(address){
      if(address?.AddressTypeId){
        addressTabList.push({
          key: address?.AddressTypeId.toLowerCase(),
          tab: address?.AddressTypeId,
        });
      }
    });
  }

  // Default Values
  addressTabList.push({
      key: 'billing',
      tab: 'Billing',
    })

    return addressTabList;
}

export const getCompanyAddressesByCompanyId = async(token, companyId, whoCalledMe) => {
  if (token && companyId > 0) {
    // requestBody["JWT"] = token;
    // requestBody["CompanyId"] = companyId;

    // let myHeaders = new Headers();
    // myHeaders.append("Content-Type", "text/plain");
    
    // const requestOptions = {
    //   method: 'POST',
    //   headers: myHeaders,
    //   body: JSON.stringify(requestBody),
    //   redirect: 'follow'
    // };
    
    try{

      // const results = await fetch(userAccountInfoEndPoint, requestOptions).catch((error) => {
      //   console.log(`Error Retrieving accountInfo: from ${whoCalledMe}`);
      //   console.error(error)
      // });    
      // const apiResult = await results.json();
      // const parsedResult = apiResult["CompanyAddresses"];
        
      // return parsedResult.length > 0 ? parsedResult : _companyAddresses;
      return dummyAddressData;
      

    }catch(err){
      return _companyAddresses;
    }
  }

  return _companyAddresses;
}

export const updateCompanyAddressById = async(token, companyAddress, whoCalledMe) => {
  if (token) {
    requestBody["JWT"] = token;
    requestBody["CompanyAddress"] = companyAddress;

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
      const parsedResult = apiResult["UpdatedAddress"];
        
      return parsedResult.length > 0 ? parsedResult : _singleCompanyAddress;

    }catch(err){
      return _singleCompanyAddress;
    }
  }

  return _singleCompanyAddress;
}


const VantageService = {
  getCompanyAddressesByCompanyId,
  updateCompanyAddressById,
  formCompanyAddressTypesByIdForTabIndexing
};

export default VantageService;
