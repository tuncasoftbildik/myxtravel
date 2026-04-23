import Link from "next/link";

type Props = {
  product: {
    slug: string;
    title: string;
    short_description: string;
    cover_photo: string;
    photos: string[];
    price: number;
    currency: string;
    price_note: string;
  };
};

export function AgencyProductCard({ product: p }: Props) {
  const cover = p.cover_photo || p.photos[0];
  return (
    <Link
      href={`/urun/${p.slug}`}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition block"
    >
      <div className="aspect-[4/3] bg-gray-100">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={p.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">Foto yok</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{p.title}</h3>
        {p.short_description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.short_description}</p>
        )}
        <p className="text-brand-red font-bold mt-3">
          {Number(p.price).toLocaleString("tr-TR")} {p.currency}{" "}
          <span className="text-xs text-gray-500 font-normal">{p.price_note}</span>
        </p>
      </div>
    </Link>
  );
}
