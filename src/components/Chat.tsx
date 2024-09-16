import { useState, useEffect, useRef } from "react";

interface Message {
  username: string;
  message: string;
  timestamp: number;
}

interface GetMessagesResponse {
  result: "success";
  messages: Array<Message>;
  general_id: number;
}

interface ChatProps {
  session_id: number;
}

export default function Chat({ session_id }: ChatProps): JSX.Element {
  const [messageBoxValue, setMessageBoxValue] = useState<string>("");
  const [messages, setMessages] = useState<Array<Message>>([]);
  const intervalId = useRef<number | undefined>(undefined);

  useEffect(() => {
    const tick = async () => {
      const url = "https://www.chatpsp.run.place/get_messages?timestamp=";
      let lastTimestamp;
      if (messages.length) lastTimestamp = messages[-1].timestamp;
      else lastTimestamp = 0;
      try {
        const response = await fetch(url + lastTimestamp);
        const parsed: GetMessagesResponse = await response.json();
        const newMessages = parsed.messages;
        setMessages((prevMessages) => [...prevMessages, ...newMessages]);
      } catch (e) {
        console.log("Error while getting new messages");
        console.error(e);
      }
    };

    // Set up the interval when the component mounts
    intervalId.current = setInterval(null, 1000); // 100 milliseconds (0.1 second)

    // Clear the interval when the component unmounts
    return () => {
      clearInterval(intervalId.current);
    };
  }, []);

  return (
    <>
      {session_id !== 0 ? (
        <>
          <div className="messages-container">
            {messages.map((value) => {
              return value.message;
            })}
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const url = `https://www.chatpsp.run.place/send_message?session_id=${session_id}&message=${messageBoxValue}`;
              try {
                await fetch(url);
              } catch (e) {
                console.log(e);
              }
            }}
          >
            <input
              type="text"
              placeholder="Message"
              value={messageBoxValue}
              onChange={(e) => setMessageBoxValue(e.target.value)}
            ></input>
            <button type="submit"> {">"} </button>
          </form>
        </>
      ) : null}
    </>
  );
}
