const logInUsername = "test";
const logInPassword = "test";

const response = await fetch(
  `https://www.chatpsp.run.place/login?username=${logInUsername}&password=${logInPassword}`
);
const data = await response.json();
if (data.result === "success") {
  console.log("Session ID: ", data.session_id);
  console.log("General ID: ", data.general_id);
  setSesState(SesState.LogOut);
  setLogInSessionId(data.session_id || 0);
} else {
  console.log("Error: ", data.result);
}
