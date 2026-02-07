export default function Template3Home({ site, user }: any) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-100">
      <h1 className="text-4xl font-bold text-green-700 mb-4">
        Template 3 (Dummy)
      </h1>

      <p className="text-lg text-gray-700">
        Site: <strong>{site}</strong>
      </p>

      <p className="text-gray-600 mt-2">
        User ID: {user?.id}
      </p>

      <div className="mt-8 p-6 bg-white shadow-xl rounded-xl">
        <p className="font-medium">
          This is a placeholder for Template 3 homepage.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Build your custom UI here whenever ready.
        </p>
      </div>
    </div>
  );
}
