import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function BlogPage() {
  return (
    <>
      <Header variant="solid" />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Blog</h1>
          <p className="text-gray-500 mb-8">Seyahat ilham ve rehberleri</p>

          <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm">
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Cok Yakinda</h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Seyahat rehberleri, destinasyon onerileri ve tatil ipuclari ile dolu blog yazilarimiz cok yakinda burada olacak.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
