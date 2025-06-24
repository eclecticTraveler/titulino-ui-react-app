import {
	ON_AUTHENTICATING_WITH_INTERNAL_RESOURCES,
	ON_AUTHENTICATING_WITH_SSO,
	AUTH_TITULINO_INTERNAL_TOKEN,
	ON_RETRIEVING_PROFILE_BY_EMAIL_ID_AND_YEAR_OF_BIRTH
} from '../constants/Grant';

const initState = {
	// refactor so that we do user?.
  generalLoading: false,
  message: '',
  showMessage: false,
  userCourses: null,
  contactId: null,
  emailId: null,	
  dateOfBirth: null,
  communicationName: null,
  expirationDate: null,
  hasEverBeenFacilitator: false,
  innerToken: localStorage.getItem(AUTH_TITULINO_INTERNAL_TOKEN),
  user: null
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
			return {
				...state,
				generalLoading: false,
				user: action.user
			}
		}
		default:
			return state;
	}
}

export default grant