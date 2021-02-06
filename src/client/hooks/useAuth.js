// https://usehooks.com/useAuth/
// Hook
import React, { useState, useEffect, useContext, createContext } from "react";

const authContext = createContext();

// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useAuth().
export function ProvideAuth({ children }) {
	const auth = useProvideAuth();
	return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = () => {
	return useContext(authContext);
};

const authStateChange = (callback) => {
	console.log('authStateChange')
	callback()
};

// Provider hook that creates auth object and handles state
function useProvideAuth() {
	const [user, setUser] = useState(null);

	// Wrap any Firebase methods we want to use making sure ...
	// ... to save the user to state.
	const signin = (email, password) => {
		const user = { name: "Ivan" };
		setUser(user);
		return user;
		// return firebase
		// 	.auth()
		// 	.signInWithEmailAndPassword(email, password)
		// 	.then((response) => {
		// 		setUser(response.user);
		// 		return response.user;
		// 	});
	};

	const signup = (email, password) => {
		const user = { name: "Ivan", email, password };
		setUser(user);
		return user;
		// return firebase
		// 	.auth()
		// 	.createUserWithEmailAndPassword(email, password)
		// 	.then((response) => {
		// 		setUser(response.user);
		// 		return response.user;
		// 	});
	};

	const signout = () => {
		setUser(false);
		// return firebase
		// 	.auth()
		// 	.signOut()
		// 	.then(() => {
		// 		setUser(false);
		// 	});
	};

	const sendPasswordResetEmail = (email) => {
		return true;
		// return firebase
		// 	.auth()
		// 	.sendPasswordResetEmail(email)
		// 	.then(() => {
		// 		return true;
		// 	});
	};

	const confirmPasswordReset = (code, password) => {
		return true;
		// return firebase
		// 	.auth()
		// 	.confirmPasswordReset(code, password)
		// 	.then(() => {
		// 		return true;
		// 	});
	};

	// Subscribe to user on mount
	// Because this sets state in the callback it will cause any ...
	// ... component that utilizes this hook to re-render with the ...
	// ... latest auth object.
	useEffect(() => {
		console.log('useEffect auth')
		// const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
		const unsubscribe = authStateChange((user) => {
			if (user) {
				setUser(user);
			} else {
				setUser(false);
			}
		});

		// Cleanup subscription on unmount
		return () => unsubscribe();
	}, []);

	// Return the user object and auth methods
	return {
		user,
		signin,
		signup,
		signout,
		sendPasswordResetEmail,
		confirmPasswordReset
	};
}