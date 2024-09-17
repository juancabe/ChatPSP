import { useState, useEffect, useRef } from "react";
import "./Chat.css";

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
  username: string;
}

export default function Chat({ session_id, username }: ChatProps): JSX.Element {
  const [messageBoxValue, setMessageBoxValue] = useState<string>("");
  const [messages, setMessages] = useState<Array<Message>>([]);
  const intervalId = useRef<number | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current !== null)
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (session_id === 0) {
      return;
    }

    const tick = async () => {
      const url = "https://www.chatpsp.run.place/get_messages?timestamp=";
      let lastTimestamp;
      if (messages.length)
        lastTimestamp = messages[messages.length - 1].timestamp;
      else lastTimestamp = 0;
      try {
        const response = await fetch(url + lastTimestamp);
        const parsed: GetMessagesResponse = await response.json();
        const newMessages = parsed.messages;
        if (newMessages.length > 0)
          setMessages((prevMessages) => [...prevMessages, ...newMessages]);
      } catch (e) {
        console.log("Error while getting new messages.");
        console.error(e);
      }
    };

    // Set up the interval when the component mounts
    intervalId.current = setInterval(tick, 1000); // 1000 milliseconds (1 second)

    // Clear the interval when the component unmounts
    return () => {
      clearInterval(intervalId.current);
    };
  }, [messages, session_id]);

  return (
    <>
      {session_id !== 0 ? (
        <div className="main-container">
          <div className="fade" />
          <div className="messages-container">
            {messages.map((value) => {
              const own = username == value.username ? "own" : "";

              return (
                <div
                  className={`message-container ${own} visible`}
                  ref={messagesEndRef}
                >
                  <div className={`mov-container ${own}`}>
                    <div className={`user-container ${own}`}>
                      <span className={`user ${own}`}>{value.username}</span>
                    </div>
                  </div>
                  <div className={`mov-container ${own}`}>
                    <div className={`message-time-container ${own}`}>
                      <span className={`message ${own}`}>
                        {decodeURI(value.message)}
                      </span>
                      <span className={`time ${own}`}>
                        {new Date(value.timestamp * 1000)
                          .getHours()
                          .toString()
                          .padStart(2, "0") +
                          ":" +
                          new Date(value.timestamp * 1000)
                            .getMinutes()
                            .toString()
                            .padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <form
            className="message-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const url = `https://www.chatpsp.run.place/send_message?session_id=${session_id}`;
              try {
                console.log("Sending message");
                await fetch(url, {
                  body: encodeURI(messageBoxValue),
                  method: "POST",
                  headers: { "Content-Type": "text/plain" },
                });
                setMessageBoxValue("");
              } catch (e) {
                console.log(e);
              }
            }}
          >
            <input
              className="message-form-input"
              type="text"
              placeholder="Message"
              value={messageBoxValue}
              onChange={(e) => setMessageBoxValue(e.target.value)}
            ></input>
            <button className="message-form-button" type="submit">
              {" "}
              {">"}{" "}
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
