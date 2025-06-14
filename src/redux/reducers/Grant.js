import {
	ON_AUTHENTICATING_WITH_INTERNAL_RESOURCES,
	ON_AUTHENTICATING_WITH_SSO,
	AUTH_TITULINO_INTERNAL_TOKEN,
	ON_RETRIEVING_PROFILE_BY_EMAIL_ID_AND_YEAR_OF_BIRTH
} from '../constants/Grant';

const initState = {
  generalLoading: false,
  message: '',
  showMessage: false,
  userCourses: null,
  contactId: null,
  emailId: null,	
  dobOrYob: null,
  communicationName: null,
  expirationDate: null,
  hasEverBeenFacilitator: false,
  innerToken: localStorage.getItem(AUTH_TITULINO_INTERNAL_TOKEN)
}

const grant = (state = initState, action) => {
	switch (action.type) {
		case ON_AUTHENTICATING_WITH_INTERNAL_RESOURCES: 
			return {
				...state,
				generalLoading: false,
				innerToken: action.innerToken
			}
		case ON_AUTHENTICATING_WITH_SSO: {
			return {
				...state,
				generalLoading: false,
				emailId: action.emailId
			}
		}
		case ON_RETRIEVING_PROFILE_BY_EMAIL_ID_AND_YEAR_OF_BIRTH: {
			state.generalLoading = action.userProfile.generalLoading;
			state.message = action.userProfile.message;
			state.userCourses = action.userProfile.userCourses;
			state.contactId = action.userProfile.contactId;
			state.communicationName = action.userProfile.communicationName;
			state.expirationDate = action.userProfile.expirationDate;
			state.hasEverBeenFacilitator = action.userProfile.hasEverBeenFacilitator;
			state.showMessage = action.userProfile.showMessage;
			return {
				...state,
				generalLoading: false,
				userProfile: action.userProfile,
			}
		}
		default:
			return state;
	}
}

export default grant