import { useState } from "react";
import "./App.css";
import Chat from "./components/Chat";

enum SesState {
  LogIn = "Log In",
  LogOut = "Log Out",
  LogginIn = "Logging In",
  Registering = "Registering",
}

interface LoginResponse {
  result: string;
  session_id?: number;
  general_id?: number;
}

interface RegisterResponse {
  result: string;
}

async function hashSHA256(message: string) {
  const msgBuffer = new TextEncoder().encode(message); // Encode the string as bytes
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer); // Hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // Convert bytes to hex string
  return hashHex;
}

function App() {
  const [sesState, setSesState] = useState<SesState>(SesState.LogIn);

  const [logInUsername, setLogInUsername] = useState<string>("");
  const [logInPassword, setLogInPassword] = useState<string>("");
  const [logInSessionId, setLogInSessionId] = useState<number>(0);
  const [logInInfo, setLogInInfo] = useState<string>("Don't have an account?");
  const [registerInfo, setRegisterInfo] = useState<string>("Already a user?");

  return (
    <div className="app-container">
      <div className="upper-view">
        <div className="session-button-container">
          <button className="session-button hidden">Log In</button>
        </div>
        <h1 className="title-h1">ChatPSP</h1>
        <div className="session-button-container">
          <button
            className={
              "session-button" + (sesState !== SesState.LogIn ? " hidden" : "")
            }
            onClick={() => {
              setSesState(
                sesState === SesState.LogIn ? SesState.LogginIn : SesState.LogIn
              );
            }}
          >
            Log In
          </button>
          <div
            className={
              "form-container" +
              (sesState === SesState.LogginIn ? "" : " hidden")
            }
          >
            <form
              className="my-form"
              onSubmit={async (e) => {
                e.preventDefault();
                console.log("Username: ", logInUsername);
                console.log("Password: ", logInPassword);
                try {
                  const logInPasswordHashed: string = await hashSHA256(
                    logInPassword
                  );
                  const response = await fetch(
                    `https://www.chatpsp.run.place/login?username=${logInUsername}&password=${logInPasswordHashed}`
                  );
                  console.log("Response: ", response);
                  const data: LoginResponse = await response.json();
                  if (
                    data.result === "success" ||
                    data.result === "already_logged_in"
                  ) {
                    console.log("Session ID: ", data.session_id);
                    console.log("General ID: ", data.general_id);
                    setSesState(SesState.LogOut);
                    setLogInSessionId(data.session_id || 0);
                    setLogInInfo("Logged in");
                    setTimeout(() => {
                      setLogInInfo("Don't have an account?");
                    }, 3000);
                  } else if (data.result === "u_not_found") {
                    console.log("User not found");
                    setLogInInfo("User not found");
                    setTimeout(() => {
                      setLogInInfo("Don't have an account?");
                    }, 3000);
                  } else {
                    console.log("Error: ", data.result);
                    setLogInInfo("Failed to log in");
                    setTimeout(() => {
                      setLogInInfo("Don't have an account?");
                    }, 3000);
                  }
                } catch (e) {
                  console.log("Failed to log in");
                  console.error(e);
                  setLogInInfo("Failed to log in");
                  setTimeout(() => {
                    setLogInInfo("Don't have an account?");
                  }, 3000);
                }
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
              <div className="info-submit-container">
                <button type="submit" className="login-button">
                  Log In
                </button>
                <p>
                  <a
                    className="login-info"
                    onClick={() => {
                      setSesState(SesState.Registering);
                    }}
                  >
                    {logInInfo}
                  </a>
                </p>
              </div>
            </form>
          </div>
          <div
            className={
              "form-container" +
              (sesState === SesState.Registering ? "" : " hidden")
            }
          >
            <form
              className="my-form"
              onSubmit={async (e) => {
                e.preventDefault();
                console.log("Username: ", logInUsername);
                console.log("Password: ", logInPassword);
                try {
                  const logInPasswordHashed: string = await hashSHA256(
                    logInPassword
                  );
                  const response = await fetch(
                    `https://www.chatpsp.run.place/register?username=${logInUsername}&password=${logInPasswordHashed}`
                  );
                  console.log("Response: ", response);
                  const data: RegisterResponse = await response.json();
                  if (data.result === "User registered") {
                    setSesState(SesState.LogginIn);
                    setRegisterInfo("User registered");
                    setTimeout(() => {
                      setRegisterInfo("Already have an account?");
                    }, 3000);
                  } else if (data.result === "Username already exists") {
                    console.log("User already exists");
                    setRegisterInfo("User already exists");
                    setTimeout(() => {
                      setRegisterInfo("Already have an account?");
                    }, 3000);
                  } else {
                    console.log("Error: ", data.result);
                    setRegisterInfo("Failed to register");
                    setTimeout(() => {
                      setRegisterInfo("Already have an account?");
                    }, 3000);
                  }
                } catch (e) {
                  console.log("Failed to log in");
                  console.error(e);
                  setRegisterInfo("Failed to register");
                  setTimeout(() => {
                    setRegisterInfo("Already have an account?");
                  }, 3000);
                }
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
              <div className="info-submit-container">
                <button type="submit" className="login-button">
                  Register
                </button>
                <p>
                  <a
                    className="login-info"
                    onClick={() => {
                      setSesState(SesState.LogginIn);
                    }}
                  >
                    {registerInfo}
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="chat-container">
        <Chat session_id={logInSessionId} username={logInUsername}></Chat>
      </div>
    </div>
  );
}

export default App;
