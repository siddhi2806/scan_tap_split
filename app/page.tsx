import Link from "next/link";

// Home Page
export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-2 text-center">Scan. Tap. Split.</h1>
      <p className="text-lg text-gray-600 mb-8 text-center">
        Snap the receipt, tap your items, see who owes what. No sign-ups, no
        math, no drama.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Link
          href="/scan"
          className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg shadow hover:bg-orange-600 transition-colors text-center font-medium"
        >
          📷 Scan Receipt
        </Link>
        <Link
          href="/manual-entry"
          className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg shadow hover:bg-gray-50 hover:border-orange-400 transition-colors text-center font-medium"
        >
          ✏️ Enter Manually
        </Link>
      </div>

      {/* Feature highlights */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl">
        <div className="text-center p-4">
          <div className="text-3xl mb-2">📱</div>
          <h3 className="font-semibold mb-1">Easy Scanning</h3>
          <p className="text-sm text-gray-600">
            Take a photo or upload your receipt image
          </p>
        </div>
        <div className="text-center p-4">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="font-semibold mb-1">Smart Assignment</h3>
          <p className="text-sm text-gray-600">
            Assign items to people individually or split evenly
          </p>
        </div>
        <div className="text-center p-4">
          <div className="text-3xl mb-2">💰</div>
          <h3 className="font-semibold mb-1">Fair Splitting</h3>
          <p className="text-sm text-gray-600">
            Automatic calculation including tips and taxes
          </p>
        </div>
      </div>
    </main>
  );
}
