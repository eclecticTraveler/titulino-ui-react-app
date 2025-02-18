import { all, takeEvery, put, fork, call } from 'redux-saga/effects';
import {
	AUTH_TOKEN,
	SIGNIN,
	SIGNOUT,
	SIGNUP,
	SIGNIN_WITH_GOOGLE,
	SIGNIN_WITH_FACEBOOK
} from '../constants/Auth';
import {
	showAuthMessage,
	authenticated,
	signOutSuccess,
	signUpSuccess,
	signInWithGoogleAuthenticated,
	signInWithFacebookAuthenticated
} from "../actions/Auth";

import SupabaseService from 'services/SupabaseService';

// Sign in with email and password
export function* signInWithEmail() {
  yield takeEvery(SIGNIN, function* ({payload}) {
    const {email, password} = payload;
    try {
      const {user, error} = yield call(SupabaseService.signInEmailRequest, email, password);
      if (error) {
        yield put(showAuthMessage(error.message));
      } else {
        localStorage.setItem(AUTH_TOKEN, user.id);
        yield put(authenticated(user.id));
      }
    } catch (err) {
      yield put(showAuthMessage(err));
    }
  });
}

// Sign out
export function* signOut() {
  yield takeEvery(SIGNOUT, function* () {
    try {
      const { error } = yield call(SupabaseService.signOutRequest);
      if (!error) {
        localStorage.removeItem(AUTH_TOKEN);
        yield put(signOutSuccess());
      } else {
        yield put(showAuthMessage(error.message));
      }
    } catch (err) {
      yield put(showAuthMessage(err));
    }
  });
}

// Sign up with email and password
export function* signUpWithEmail() {
  yield takeEvery(SIGNUP, function* ({ payload }) {
    const { email, password } = payload;
    try {
      const { user, error } = yield call(SupabaseService.signUpEmailRequest, email, password);
      if (error) {
        yield put(showAuthMessage(error.message));
      } else {
        localStorage.setItem(AUTH_TOKEN, user.id);
        yield put(signUpSuccess(user.id));
      }
    } catch (error) {
      yield put(showAuthMessage(error));
    }
  });
}

// Sign in with Google
export function* signInWithGoogle() {
  yield takeEvery(SIGNIN_WITH_GOOGLE, function* () {
    try {
      const { user, error } = yield call(SupabaseService.signInGoogleRequest);
      if (error) {
        yield put(showAuthMessage(error.message));
      } else {
        localStorage.setItem(AUTH_TOKEN, user.id);
        yield put(signInWithGoogleAuthenticated(user.id));
      }
    } catch (error) {
      yield put(showAuthMessage(error));
    }
  });
}

// Sign in with Facebook
export function* signInWithFacebook() {
  yield takeEvery(SIGNIN_WITH_FACEBOOK, function* () {
    try {
      const { user, error } = yield call(SupabaseService.signInFacebookRequest);
      if (error) {
        yield put(showAuthMessage(error.message));
      } else {
        localStorage.setItem(AUTH_TOKEN, user.id);
        yield put(signInWithFacebookAuthenticated(user.id));
      }
    } catch (error) {
      yield put(showAuthMessage(error));
    }
  });
}

// Root saga to run all sagas
export default function* rootSaga() {
  yield all([
    fork(signInWithEmail),
    fork(signOut),
    fork(signUpWithEmail),
    fork(signInWithGoogle),
    fork(signInWithFacebook),
  ]);
}
