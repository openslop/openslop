import UserProfile from "./UserProfile";

interface EditorUser {
  email: string;
  avatarUrl?: string;
}

export default function Editor({ user }: { user: EditorUser }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-white">
      <div className="absolute top-6 left-6">
        <UserProfile email={user.email} avatarUrl={user.avatarUrl} />
      </div>
      <h1 className="text-3xl font-light font-display">Editor</h1>
      <p className="text-white/60 text-sm">{user.email}</p>
      <p className="text-white/40 text-xs">You&apos;re logged in!</p>
    </div>
  );
}
