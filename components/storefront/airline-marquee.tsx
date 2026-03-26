'use client'

import Image from 'next/image'

const airlines = [
  { name: 'X Travel', src: '/logo.png' },
  { name: 'Turkish Airlines', src: '/airlines/thy.png' },
  { name: 'Pegasus', src: '/airlines/pegasus.png' },
  { name: 'Emirates', src: '/airlines/emirates.png' },
  { name: 'American Airlines', src: '/airlines/american.png' },
  { name: 'Delta Air Lines', src: '/airlines/delta.png' },
  { name: 'SunExpress', src: '/airlines/sunexpress.png' },
  { name: 'Aegean Airlines', src: '/airlines/aegean.png' },
  { name: 'United Airlines', src: '/airlines/united.png' },
  { name: 'Ryanair', src: '/airlines/ryanair.png' },
  { name: 'AJet', src: '/airlines/ajet.png' },
  { name: 'Corendon', src: '/airlines/corendon.png' },
  { name: 'China Southern', src: '/airlines/chinasouthern.png' },
  { name: 'Lufthansa', src: '/airlines/lufthansa.png' },
  { name: 'Onur Air', src: '/airlines/onurair.png' },
  { name: 'AtlasGlobal', src: '/airlines/atlasglobal.png' },
]

export function AirlineMarquee() {
  return (
    <div className="bg-white py-6 overflow-hidden">
      <div className="relative">
        <div className="flex items-center gap-12 sm:gap-20 animate-marquee">
          {[...airlines, ...airlines, ...airlines].map((airline, i) => (
            <Image
              key={`${airline.name}-${i}`}
              alt={airline.name}
              src={airline.src}
              width={150}
              height={40}
              className="h-6 sm:h-8 w-auto shrink-0 opacity-40 hover:opacity-70 transition-opacity duration-300 object-contain"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
