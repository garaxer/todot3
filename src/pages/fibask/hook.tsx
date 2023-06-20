import { type NextPage } from "next";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import MessageBubble from "~/components/MessageBubble";
import useFibonacci from "~/hooks/useFibonacci";

const Home: NextPage = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    { user: string; message: string; id: number }[]
  >([]);

  const addOutput = (output: string) =>
    setMessages((messages) => [
      ...messages,
      {
        user: "system",
        message: output,
        id: Date.now(),
      },
    ]);

  const quit = () => setMessages([]);
  const addStateToFibGame = useFibonacci({ addOutput, quit });

  const onAdd = () => {
    if (!message && !messages.slice(-1)[0]?.message.includes("any key")) return;
    setMessages((messages) => [
      ...messages,
      { user: "user", message, id: Date.now() },
    ]);
    addStateToFibGame(message);
    setMessage("");
  };

  const messagesEndRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      <Head>
        <title>Fibonacci Game</title>
        <meta name="description" content="Fibonacci code test" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1
            role="heading"
            className="text-5xl font-extrabold tracking-tight text-white  sm:text-[5rem]"
          >
            Fibonacci Guesser
          </h1>
          <div
            className="card mx-auto w-full max-w-3xl overflow-auto bg-primary p-5 text-3xl text-white bg-blend-hard-light shadow-xl"
            style={{ maxHeight: 400 }}
          >
            {messages.map(({ message, user, id }) => (
              <MessageBubble
                key={`${message}${id}`}
                side={user === "system" ? "left" : "right"}
                message={message}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex content-between items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onSubmit={onAdd}
              className="mr-5 w-full rounded-lg border-2 border-gray-300 p-5"
              placeholder="Guess"
              onKeyDown={(e) => e.key === "Enter" && onAdd()}
            />
            <button className="btn-primary btn text-white" onClick={onAdd}>
              Send
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
