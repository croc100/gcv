import RepoSearch from "@/components/RepoSearch";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          GitHub Contributor Viewer
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          GitHub 리포지토리의 기여자 현황을 한눈에 확인하세요
        </p>
      </div>
      <RepoSearch />
      <p className="text-sm text-gray-400">
        예시:{" "}
        <span className="font-mono">vercel/next.js</span>,{" "}
        <span className="font-mono">facebook/react</span>
      </p>
    </main>
  );
}
