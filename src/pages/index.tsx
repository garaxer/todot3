import { type Topic } from "@prisma/client";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import Header from "~/components/Header";
import { NoteCard } from "~/components/NoteCard";
import { NoteEditor } from "~/components/noteEditor";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Header />
        <Content />
      </main>
    </>
  );
};

export default Home;

const Content: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const { data: sessionData } = useSession();
  const {
    data: topics,
    refetch: refreshTopics,
    isFetching,
  } = api.topic.getAll.useQuery(undefined, {
    enabled: sessionData?.user !== undefined,
  });

  useEffect(() => {
    if (!topics || !topics.length || selectedTopic) return;
    setSelectedTopic(selectedTopic ?? topics[0] ?? null);
  }, [topics, selectedTopic]);

  const createTopic = api.topic.create.useMutation({
    onSuccess: () => {
      void refreshTopics();
    },
  });
  const deleteTopic = api.topic.delete.useMutation({
    onSuccess: () => {
      void refreshTopics();
    },
  });

  const { data: notes, refetch: refetchNotes } = api.note.getAll.useQuery(
    {
      topicId: selectedTopic?.id ?? "",
    },
    {
      enabled: sessionData?.user !== undefined && selectedTopic !== null,
    }
  );

  const createNote = api.note.create.useMutation({
    onSuccess: () => {
      void refetchNotes();
    },
  });

  const deleteNote = api.note.delete.useMutation({
    onSuccess: () => {
      void refetchNotes();
    },
  });

  return (
    <div className="mx-5  mt-5 grid grid-cols-4 gap-2">
      <div className="px-2">
        <div className="menu rounded-box w-56 bg-base-100 p-2">
          {topics?.map((topic) => (
            <li key={topic.id} className="mt-1 flex flex-row justify-between">
              <a
                className={`${
                  topic.id === selectedTopic?.id ? "active" : ""
                } align-center content-center`}
                href="#"
                onClick={(evt) => {
                  evt.preventDefault();
                  setSelectedTopic(topic);
                }}
              >
                {topic.title}
              </a>
              <button
                className="icon align-centre  btn-circle btn  content-center"
                onClick={() => void deleteTopic.mutate({ id: topic.id })}
                disabled={isFetching}
              >
                X
              </button>
            </li>
          ))}
        </div>
        <div className="divider"></div>
        <input
          type="text"
          placeholder="New Topic"
          className="input-bordered input input-sm w-full"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              createTopic.mutate({
                title: e.currentTarget.value,
              });
              e.currentTarget.value = "";
            }
          }}
        />
      </div>
      <div className="col-span-3">
        <div>
          {notes?.map((note) => (
            <div key={note.id} className="mt-5">
              <NoteCard
                note={note}
                onDelete={() => void deleteNote.mutate({ id: note.id })}
              />
            </div>
          ))}
        </div>

        <NoteEditor
          onSave={({ title, content }) => {
            void createNote.mutate({
              title,
              content,
              topicId: selectedTopic?.id ?? "",
            });
          }}
        />
      </div>
    </div>
  );
};
