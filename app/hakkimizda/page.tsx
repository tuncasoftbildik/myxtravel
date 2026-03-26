import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function HakkimizdaPage() {
  return (
    <>
      <Header variant="solid" />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Hakkimizda</h1>

          <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm space-y-6 text-gray-600 leading-relaxed">
            <p>
              <strong className="text-gray-900">X Travel</strong>, seyahat tutkunlarına en uygun fiyatlarla
              ucak bileti, otel rezervasyonu, transfer ve tur hizmetleri sunan yeni nesil bir seyahat platformudur.
            </p>

            <p>
              Turkiye&apos;nin onde gelen seyahat altyapi saglayicilariyla entegre calisarak,
              yuzlerce havayolu, binlerce otel ve onlarca tur operatorunun tekliflerini tek bir platformda bir araya getiriyoruz.
            </p>

            <div className="grid sm:grid-cols-3 gap-6 py-6">
              {[
                { value: "500+", label: "Havayolu Ortagi" },
                { value: "10.000+", label: "Otel Secenegi" },
                { value: "50+", label: "Ulke" },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-black text-brand-red">{stat.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <h2 className="text-xl font-bold text-gray-900 pt-4">Misyonumuz</h2>
            <p>
              Seyahati herkes icin erisilebilir ve keyifli kilmak. Teknoloji ve musterimemnuniyetini
              on planda tutarak, en iyi fiyat garantisiyle unutulmaz seyahat deneyimleri sunuyoruz.
            </p>

            <h2 className="text-xl font-bold text-gray-900 pt-4">Vizyonumuz</h2>
            <p>
              Turkiye&apos;nin en guvenilir ve yenilikci online seyahat platformu olmak.
              Seyahat sektorunde dijital donusumun onculerinden biri olarak,
              musterilerimize en iyi hizmeti sunmaya devam ediyoruz.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
