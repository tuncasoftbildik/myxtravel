import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Kariyer | X Travel",
  description: "X Travel kariyer firsatlari. Seyahat sektorunde yerinizi alin, ekibimize katilin.",
  alternates: { canonical: "https://xturizm.com/kariyer" },
};

export default function KariyerPage() {
  return (
    <>
      <Header variant="solid" />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Kariyer</h1>
          <p className="text-gray-500 mb-8">X Travel ailesine katilmak ister misiniz?</p>

          <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm">
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Acik Pozisyonlar</h2>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Su anda acik pozisyonumuz bulunmamaktadir. Yeni firsatlar icin bizi takip etmeye devam edin.
              </p>
              <p className="text-sm text-gray-400">
                Ozgecmisinizi <strong className="text-brand-red">kariyer@myxtravel.com.tr</strong> adresine gonderebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
