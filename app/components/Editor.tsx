import UserProfile from "./UserProfile";
import PromptInput from "./PromptInput";

interface EditorUser {
  email: string;
  avatarUrl?: string;
  name?: string;
}

export default function Editor({ user }: { user: EditorUser }) {
  return (
    <div className="flex min-h-screen flex-col items-center text-white pt-[30vh]">
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-[51]">
        <UserProfile
          email={user.email}
          avatarUrl={user.avatarUrl}
          name={user.name}
        />
      </div>
      <PromptInput />
    </div>
  );
}
