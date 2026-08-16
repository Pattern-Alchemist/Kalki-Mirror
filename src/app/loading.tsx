import { SiddhiCardSkeleton } from '@/components/ui/Skeleton';

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'b9oo5abp';
const LOADING_IMG = `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto:good,w_640,c_limit/e_brightness:0.3/kalki-mirror/ui/yantra-loading`;

export default function Loading() {
  return (
    <div className="min-h-screen bg-deep-black relative overflow-hidden">
      {/* Yantra loading background — subtle, darkened */}
      <div className="absolute inset-0 z-0 opacity-20 blur-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOADING_IMG}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-contain object-center yantra-loading-pulse"
          draggable={false}
        />
      </div>
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 py-20 md:py-28">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SiddhiCardSkeleton />
          <SiddhiCardSkeleton />
          <SiddhiCardSkeleton />
        </div>
      </div>
    </div>
  );
}