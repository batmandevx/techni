import dynamic from 'next/dynamic';

// @ts-ignore
const MapTrackingClient = dynamic(() => import('./MapTrackingClient'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full rounded-2xl bg-slate-800/50 animate-pulse border border-slate-700/50 flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      <span className="text-sm font-medium text-slate-400">Loading Satellite Map...</span>
    </div>
  )
});

export default function MapTracking(props: any) {
  return <MapTrackingClient {...props} />;
}
