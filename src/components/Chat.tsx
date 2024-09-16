interface ChatProps {
  session_id: number;
  username: string;
}

export default function Chat({ session_id, username }: ChatProps) {
  return <>{session_id + username}</>;
}
