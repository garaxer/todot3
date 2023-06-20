const MessageBubble = ({
  side,
  message,
}: {
  message: string;
  side: "left" | "right";
}) => {
  return (
    <div className={side === "left" ? "chat chat-start" : "chat chat-end"}>
      <div
        className={`chat-bubble break-words ${
          side === "left" ? "chat-bubble-info" : "chat-bubble-accent"
        }`}
      >
        {message}
      </div>
    </div>
  );
};

export default MessageBubble;
