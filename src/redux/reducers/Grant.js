import {
	AUTH_TOKEN,
	AUTHENTICATED,
	SHOW_AUTH_MESSAGE,
	SHOW_LOADING,
	AUTH_TITULINO_INTERNAL_TOKEN
} from '../constants/Grant';

const initState = {
  loading: false,
  message: '',
  showMessage: false,
  userCourses: [],
  contactId: null,
  emailId: null,
  communicationName: null,
  expirationDate: null,
  hasEverBeenFacilitator: false,
  innerToken: localStorage.getItem(AUTH_TITULINO_INTERNAL_TOKEN)
}

const grant = (state = initState, action) => {
	switch (action.type) {
		case AUTHENTICATED:
			return {
				...state,
				loading: false,
				redirect: '/',
				innerToken: action.token
			}
		case SHOW_AUTH_MESSAGE: 
			return {
				...state,
				message: action.message,
				showMessage: true,
				loading: false
			}
		case SHOW_LOADING: {
			return {
				...state,
				loading: true
			}
		}
		default:
			return state;
	}
}

export default grant