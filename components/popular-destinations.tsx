const destinations = [
  { name: "İstanbul", flights: "142 uçuş", price: "899", gradient: "from-violet-600 to-indigo-900", emoji: "🕌" },
  { name: "Antalya", flights: "98 uçuş", price: "749", gradient: "from-orange-500 to-rose-700", emoji: "🏖️" },
  { name: "Kapadokya", flights: "54 uçuş", price: "1.199", gradient: "from-amber-600 to-red-800", emoji: "🎈" },
  { name: "Bodrum", flights: "76 uçuş", price: "899", gradient: "from-sky-500 to-blue-800", emoji: "⛵" },
  { name: "İzmir", flights: "112 uçuş", price: "649", gradient: "from-emerald-500 to-teal-800", emoji: "🫒" },
  { name: "Trabzon", flights: "38 uçuş", price: "799", gradient: "from-green-600 to-emerald-900", emoji: "🌿" },
];

export function PopularDestinations() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {destinations.map((dest) => (
          <div
            key={dest.name}
            className={`group relative bg-gradient-to-br ${dest.gradient} rounded-2xl p-4 sm:p-5 aspect-[3/4] flex flex-col justify-between cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden`}
          >
            <span className="absolute top-3 right-3 text-4xl opacity-20 group-hover:opacity-30 transition-all">
              {dest.emoji}
            </span>

            <div>
              <h3 className="text-lg font-bold text-white">{dest.name}</h3>
              <p className="text-white/60 text-xs mt-0.5">{dest.flights}</p>
            </div>

            <div>
              <span className="text-white/50 text-[10px] sm:text-xs">Başlayan fiyatlarla</span>
              <div className="text-white text-xl font-bold">₺{dest.price}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
