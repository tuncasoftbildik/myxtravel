const features = [
  {
    title: "Anlık Fiyat Karşılaştırma",
    desc: "Yüzlerce havayolu ve otelden gerçek zamanlı fiyat karşılaştırması yapın.",
    icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
    color: "bg-red-50 text-brand-red",
  },
  {
    title: "256-bit SSL Güvenlik",
    desc: "Tüm ödeme işlemleriniz bankacılık seviyesinde şifreleme ile korunur.",
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "7/24 Canlı Destek",
    desc: "Seyahat öncesi ve sonrası uzman ekibimiz her zaman yanınızda.",
    icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Ücretsiz İptal",
    desc: "Çoğu rezervasyonda son 24 saate kadar ücretsiz iptal imkanı.",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "bg-amber-50 text-amber-600",
  },
];

export function Features() {
  return (
    <section className="bg-gray-50/80 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-brand-red uppercase tracking-widest">Avantajlar</span>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">Neden X Travel?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-3xl p-5 sm:p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={f.icon} />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900">{f.title}</h3>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
