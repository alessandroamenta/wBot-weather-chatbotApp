import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { auth, db } from "./firebase";
import "./SignIn.css";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function SignIn({ setLoggedIn }) {
  const navigate = useNavigate();
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    // when the component mounts, check if there's an auth token in localStorage
    const storedAuthToken = localStorage.getItem("authToken");
    if (storedAuthToken) {
      // set the authToken state variable to the stored token
      setAuthToken(storedAuthToken);
      setLoggedIn(true);
    }
  
    // set up an event listener to update the authToken state variable when the token is changed in another tab
    window.addEventListener("storage", handleStorageEvent);
  
    // clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, []);
  
  const handleStorageEvent = (event) => {
    if (event.key === "authToken") {
      setAuthToken(event.newValue);
      setLoggedIn(true);
    }
  };

  // add this function to save the authToken in localStorage and update the state variable
  const saveAuthToken = (token) => {
    localStorage.setItem("authToken", token);
    setAuthToken(token);
  }

  const register = async () => {
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        registerEmail,
        registerPassword
      );
      const { user } = userCredential;

      // Create user record in Firebase Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
      });

      console.log(user);
    } catch (error) {
      console.log(error.message);
    }
  };

  const login = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );
      const { user } = userCredential;
      saveAuthToken(await user.getIdToken());
      setLoggedIn(true);
      navigate("/favorites"); // pass uid to favorites component
    } catch (error) {
      console.log(error.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("authToken");
    setAuthToken(null);
    setLoggedIn(false); // set the loggedIn state to false after logout
  };

  const googleProvider = new GoogleAuthProvider();

  const signInWithGoogle = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const { user } = userCredential;

      // check if user exists in database
      const userRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        // create new user record in database
        await setDoc(userRef, {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        });
      }

      console.log(user);
      saveAuthToken(await user.getIdToken());
      setLoggedIn(true); // set the loggedIn state to true after successful login with Google
      navigate("/favorites"); // pass uid to favorites component
    } catch (error) {
      console.log(error.message);
    }
  };


  return (
    <div className="SignIn">
      <div>
        <h3> Register User </h3>
        <input
          placeholder="Email..."
          onChange={(event) => {
            setRegisterEmail(event.target.value);
          }}
        />
        <input
          placeholder="Password..."
          onChange={(event) => {
            setRegisterPassword(event.target.value);
          }}
        />

        <button onClick={register}> Create User</button>
      </div>

      <div>
        <h3> Login </h3>
        <input
          placeholder="Email..."
          onChange={(event) => {
            setLoginEmail(event.target.value);
          }}
        />
        <input
          placeholder="Password..."
          onChange={(event) => {
            setLoginPassword(event.target.value);
          }}
        />

        <button onClick={login}> Login</button>
      </div>

      <div>
        <h3> Login with Google </h3>
        <button onClick={signInWithGoogle}> Sign in with Google</button>
      </div>

      <button onClick={logout}> Sign Out </button>
    </div>
  );
}

export default SignIn;
