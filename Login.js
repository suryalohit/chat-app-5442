import React from "react";
import { Button } from "@material-ui/core";
import "./Login.css";
import { auth, provider } from "./firebase";
import { useStateValue } from "./StateProvider";
import { actionTypes } from "./reducer";
import axios from "./axios";

function Login() {
  const [{user,room}, dispatch] = useStateValue();

  const signIn =async () => {
    await  auth
      .signInWithPopup(provider)
      .then((result) => {
       
        dispatch({
          type: actionTypes.SET_USER,
          user: result.user,
        });
       
        axios.post("/messages/togetallroomnamesofuser",
        {
          "name":result.user.displayName,
        "room":"kasaka",
        "message":"hhhhhh",
        "timestamp":"iiiiii"
         
        }).then((response) => {
          console.log("ayteok1");
          console.log(response.data.mes);
          console.log("ayteok2");
        
        }).catch((error) => alert(error.message));
      }).catch((error) => alert(error.message));

     
  };

  return (
    <div className="login">
      <div className="login__container">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/597px-WhatsApp.svg.png"
          alt=""
        />
        <div className="login__text">
          <h1>Sign in to WhatsApp</h1>
        </div>

        <Button onClick={signIn}>Sign In With Google</Button>
      </div>
    </div>
  );
}

export default Login;
