import { type Topic } from "@prisma/client";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useReducer, useState } from "react";
import Header from "~/components/Header";
import { api } from "~/utils/api";

const Todo: NextPage = () => {
  return (
    <>
      <Head>
        <title>Kangaz</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Header title="Todo kanban - " />
        <Content />
      </main>
    </>
  );
};

export default Todo;

type LocalTopic = Omit<Topic, "createdAt" | "updatedAt" | "userId">;
type TodoAction =
  | { type: "ADD_TODO"; todo: Omit<LocalTopic, "id"> }
  | { type: "DELETE_TODO"; id: number }
  | { type: "MOVE_TODO"; section: string; id: string }
  | { type: "POPULATE_TODOS"; todos: LocalTopic[] };

const Content: React.FC = () => {
  const { data: sessionData } = useSession();

  const {
    data: topics,
    refetch: refreshTopics,
    isFetching,
  } = api.topic.getAll.useQuery(undefined, {
    enabled: sessionData?.user !== undefined,
  });
  const createTopic = api.topic.create.useMutation({
    onSuccess: () => {
      void refreshTopics();
    },
  });

  const AddTodo = ({ title, section }: { title: string; section: string }) => {
    void createTopic.mutate({
      title,
      section,
    });
  };

  const reducer = (state: LocalTopic[], action: TodoAction) => {
    switch (action.type) {
      case "MOVE_TODO":
        return state.map((todo) =>
          todo.id === action.id ? { ...todo, section: action.section } : todo
        );
      case "ADD_TODO":
        return (
          state && [
            ...state,
            { ...action.todo, id: Date.now().toString() + action.todo.title },
          ]
        );
      case "POPULATE_TODOS":
        return action.todos;
      default:
        return state;
    }
  };

  const [todos, dispatchTodo] = useReducer(reducer, []);
  // Handle all the inputs for all the columns
  const [inputInColumns, dispatchInputInColumns] = useReducer(
    (s: { [k: string]: string }, a: { [k: string]: string }) => ({
      ...s,
      ...a,
    }),
    {}
  );
  useEffect(() => {
    if (!topics) return;
    dispatchInputInColumns(
      topics.reduce((a, c) => ({ ...a, [c.section]: "" }), {})
    );
    dispatchTodo({
      type: "POPULATE_TODOS",
      todos: topics.map((t) => ({
        id: t.id,
        title: t.title,
        section: t.section,
      })),
    });
  }, [topics]);
  const [newColumn, setNewColumn] = useState("");


  if (!sessionData?.user) {
    return <h1>Please login</h1>
  }

  return (
    <div className="m-5 flex flex-row justify-between gap-5">
      {Object.entries(inputInColumns).map(([column, value]) => (
        <div
          className="card flex-grow border border-gray-200 bg-base-100 shadow-xl"
          id={column}
          key={column}
        >
          <div className="card-body flex  flex-col  p-5">
            <h4 className="card-title">{column}</h4>
            <div className="menu">
              {todos &&
                todos
                  .filter((todo) => todo.section === column)
                  .map((todo) => (
                    <>
                    <li className="mt-1 mb-1 hover:bg-red-400 p-2  rounded-box bg-base-200 w-full" key={todo.id}>
                      {todo.title}
                    </li>
                    </>
                  ))}
            </div>
            <input
              value={value}
              onChange={(e) =>
                dispatchInputInColumns({ [column]: e.target.value })
              }
              type={"text"}
              disabled={isFetching}
              className="input-primary input input-sm mt-2 w-full"
            />
            <button
              className="btn-primary btn mt-1"
              onClick={() => {
                AddTodo({ section: column, title: value });
                dispatchTodo({
                  type: "ADD_TODO",
                  todo: { section: column, title: value },
                });
                dispatchInputInColumns({ [column]: "" });
              }}
              disabled={isFetching}
            >
              Add todo
            </button>
          </div>
        </div>
      ))}
      <div className="newColumn">
        <input
          value={newColumn}
          onChange={(e) => setNewColumn(e.target.value)}
          type={"text"}
          disabled={isFetching}
          className="input-secondary input input-lg w-full font-bold"
        />
        <button
          className="btn-primary btn mt-1"
          onClick={() => dispatchInputInColumns({ [newColumn]: "" })}
          disabled={isFetching}
        >
          Add column
        </button>
      </div>
    </div>
  );
};
