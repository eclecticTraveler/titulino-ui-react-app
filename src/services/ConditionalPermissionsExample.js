const agencies = [
];

const sales = {
    "expertName": "ss",
    "expertTitle": "Account Manager",
    "calendarLink": "linkUrl"
  };
  
const support = {
    "expertName": "Customer Support",
    "expertTitle": "Let us help you",
    "calendarLink": "linkURL"
  };

export const getSpecificAgentBasedOnCriteria = (selectedAgencyId, selectedService) => {
    const index = agencies.findIndex(agency => agency.agencyId === selectedAgencyId);
    if(index >= 0){
        const specialAgency = agencies[index];
        const flags = specialAgency["flags"];
        const agentInfoObject = flags[selectedService] === 1 ? sales : support; 
       return agentInfoObject;
    }

    return sales;
}

const ExpertSupportServiceForAgency = {
    getSpecificAgentBasedOnCriteria
  };
  
  export default ExpertSupportServiceForAgency;
  