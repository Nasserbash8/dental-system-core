'use client'

import Image from 'next/image'

type DentalCardProps = {
  category: string
  title: string
  imageUrl: string
}

const DentalCard: React.FC<DentalCardProps> = ({ category, title, imageUrl }) => {
  return (
    <div className="relative group rounded-3xl overflow-hidden shadow-lg w-full h-[350px] sm:h-[450px] transition-transform duration-300 hover:-translate-y-2">
      
      {/* Optimized Image */}
      <Image
        src={imageUrl}
        alt={`${title} - ${category}`}
        fill
        priority // Added for LCP improvement if cards appear above the fold
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-scale duration-500 group-hover:scale-110"
      />

      {/* Hover Overlay - Constant slight visibility on mobile for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Category (Top Right) */}
      <div className="absolute top-4 right-4 text-white z-10 text-end">
        <span className="text-[10px] sm:text-xs font-bold uppercase bg-gray-900 px-3 py-1 rounded-full backdrop-blur-sm">
          {category}
        </span>
      </div>

      {/* Title (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-10 text-white drop-shadow-lg">
        <h2 className="text-xl sm:text-2xl font-bold leading-tight">{title}</h2>
        {/* Decorative underline appearing on hover */}
        <div className="w-0 group-hover:w-full h-1 bg-gray-900 transition-all duration-300 rounded-full mt-1"></div>
      </div>
    </div>
  )
}

export default DentalCard