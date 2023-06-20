import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

type HeaderProps = {
  title?: string;
};

const Header = ({ title = "Notes for" }: HeaderProps) => {
  const { data: sessionData } = useSession();
  return (
    <div className="navbar bg-primary text-primary-content">
      <div className="flex-1 pl-5 text-3xl font-bold">
        {sessionData?.user?.name ? `${title} ${sessionData?.user?.name}` : ""}
      </div>
      <div className="gap-2">
        <Link href={"/"}>Note </Link>
        <Link href={"todo"}>Todo </Link>
        <Link href={"fibask"}>Fibask poc </Link>
        <Link href={"fibask/hook"}> Fibask front end </Link>
      </div>
      <div className="flex-none gap-2">
        <div className="dropdown-end dropdown">
          {sessionData?.user ? (
            <label
              tabIndex={0}
              className="btn-ghost btn-circle avatar btn"
              onClick={() => void signOut()}
            >
              <div className="w-10 rounded-full">
                <img
                  src={sessionData?.user?.image ?? ""}
                  alt={sessionData?.user?.name ?? ""}
                />
              </div>
            </label>
          ) : (
            <label
              tabIndex={0}
              className="btn-ghost btn-circle avatar btn"
              onClick={() => void signIn()}
            >
              <div className="w-10 rounded-full">
                <img
                  src={sessionData?.user?.image ?? ""}
                  alt={sessionData?.user?.name ?? ""}
                />
              </div>
            </label>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
