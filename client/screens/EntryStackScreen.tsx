import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { RootStackScreen } from "./RootStack/RootStackScreen";
import firebase from "firebase";

/* Note: it is VERY important that you understand
    how this screen works!!! Read the logic on this screen
    carefully (also reference App.js, the entry point of
    our application). 
    
    Associated Reading:
      https://reactnavigation.org/docs/auth-flow/
      https://rnfirebase.io/auth/usage 
*/
export function EntryStackScreen() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<firebase.User | null>(null);
  const [signIn, setSignIn] = useState<Boolean>(false);

  useEffect(() => {
    const unsubscribe = firebase
      .auth()
      .onAuthStateChanged((currentUser: any) => {
        console.log("Auth State changed")
        console.log(currentUser?.uid)
        if (!currentUser) {
          setSignIn(true);
        }
        if (currentUser) {
          setUser(currentUser);
        }
        if (initializing) setInitializing(false);
      });
    //setSignIn(true)
    return unsubscribe;
  }, [setUser]);

  useEffect(() => {
    if (signIn) {
      firebase.auth().signInAnonymously()
        .then(() => {
          console.log("Anonymous user signed in")
        })
        .catch((error) => {
          var errorCode = error.code;
          var errorMessage = error.message;
        });
      setSignIn(false);
    }
  }, [signIn])

  if (initializing || !user) {
    return <Text style={{flex: 1, textAlign: "center"}}>One second please...</Text>;
  } else {
    return RootStackScreen();
  }
}
