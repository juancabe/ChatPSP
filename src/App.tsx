import { useState } from "react";
import "./App.css";

enum SesState {
  LogIn = "Log In",
  LogOut = "Log Out",
  LogginIn = "Logging In",
}

interface LoginResponse {
  result: string;
  session_id?: number;
  general_id?: number;
}

function App() {
  const [sesState, setSesState] = useState<SesState>(SesState.LogIn);

  const [logInUsername, setLogInUsername] = useState<string>("");
  const [logInPassword, setLogInPassword] = useState<string>("");
  const [logInSessionId, setLogInSessionId] = useState<number>(0);

  return (
    <div className="app-container">
      <div className="upper-view">
        <div className="session-button-container">
          <button className="session-button hidden">{sesState}</button>
        </div>
        <h1>ChatPSP</h1>
        <div className="session-button-container">
          <button
            className={
              "session-button" +
              (sesState === SesState.LogginIn ? " hidden" : "")
            }
            onClick={() => {
              setSesState(
                sesState === SesState.LogIn ? SesState.LogginIn : SesState.LogIn
              );
            }}
          >
            {sesState}
          </button>
          <div
            className={
              "login-form-container" +
              (sesState === SesState.LogginIn ? "" : " hidden")
            }
          >
            <form
              className="login-form"
              onSubmit={(e) => {
                e.preventDefault();
                console.log("Username: ", logInUsername);
                console.log("Password: ", logInPassword);

                fetch(
                  `http://34.75.5.54/login?username=${logInUsername}&password=${logInPassword}`
                ).then(async (response) => {
                  const data: LoginResponse = await response.json();
                  if (data.result === "success") {
                    console.log("Session ID: ", data.session_id);
                    console.log("General ID: ", data.general_id);
                    setSesState(SesState.LogOut);
                    setLogInSessionId(data.session_id || 0);
                  } else {
                    console.log("Error: ", data.result);
                  }
                });
              }}
            >
              <input
                type="text"
                placeholder="Username"
                className="login-input"
                value={logInUsername}
                onChange={(e) => setLogInUsername(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="login-input"
                value={logInPassword}
                onChange={(e) => setLogInPassword(e.target.value)}
              />
              <button type="submit" className="login-button">
                Log In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
