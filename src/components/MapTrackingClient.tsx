'use client';

import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Zap } from 'lucide-react';

const PORT_COORDS: Record<string, [number, number]> = {
  'CNSHA': [31.2304, 121.4737],
  'AEDXB': [24.9857, 55.0273],
  'NLRTM': [51.9225, 4.47917],
  'SGSIN': [1.3521, 103.8198],
};

const customIcon = (color: string) => L.divIcon({
  className: 'custom-icon',
  html: `<div style="width: 14px; height: 14px; background: ${color}; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color}"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

// Generate some random heatmap points around a center
const generateHeatmap = (center: [number, number], radius: number, count: number) => {
  return Array.from({ length: count }).map(() => [
    center[0] + (Math.random() - 0.5) * radius,
    center[1] + (Math.random() - 0.5) * radius
  ] as [number, number]);
};

export default function MapTrackingClient({ containers }: { containers: any[] }) {
  const [mapType, setMapType] = useState<'dark' | 'satellite'>('dark');
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Derive routes from active containers
  const routes = useMemo(() => {
    return containers.map(c => {
      const origin = PORT_COORDS[c.originPort.code];
      const dest = PORT_COORDS[c.destinationPort.code];
      if (!origin || !dest) return null;
      
      // Calculate a simple midpoint progress based on status
      let progress = 0;
      if (c.status === 'ARRIVED' || c.status === 'DELIVERED') progress = 1;
      else if (c.status === 'IN_TRANSIT') progress = 0.5;
      else if (c.status === 'DEPARTED') progress = 0.2;

      const currentPos: [number, number] = [
        origin[0] + (dest[0] - origin[0]) * progress,
        origin[1] + (dest[1] - origin[1]) * progress
      ];

      return { ...c, origin, dest, currentPos, progress };
    }).filter(Boolean);
  }, [containers]);

  // Generate fake heatmap data around major hubs
  const heatmapData = useMemo(() => {
    return [
      ...generateHeatmap(PORT_COORDS['CNSHA'], 5, 20),
      ...generateHeatmap(PORT_COORDS['AEDXB'], 3, 15),
      ...generateHeatmap(PORT_COORDS['SGSIN'], 2, 10),
      ...generateHeatmap(PORT_COORDS['NLRTM'], 4, 18),
    ];
  }, []);

  return (
    <div className="relative w-full h-[500px] rounded-2xl overflow-hidden border border-gray-200/50 dark:border-slate-700/50 shadow-sm z-10">
      
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        <button 
          onClick={() => setMapType(prev => prev === 'dark' ? 'satellite' : 'dark')}
          className="flex items-center gap-2 px-3 py-2 bg-slate-900/80 backdrop-blur-md text-white text-xs font-medium rounded-lg border border-white/10 hover:bg-slate-800 transition-colors shadow-lg"
        >
          <Layers className="w-3.5 h-3.5" />
          {mapType === 'dark' ? 'Satellite View' : 'Dark Map'}
        </button>
        <button 
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`flex items-center gap-2 px-3 py-2 backdrop-blur-md text-xs font-medium rounded-lg border transition-colors shadow-lg ${showHeatmap ? 'bg-indigo-500/90 border-indigo-500 text-white' : 'bg-slate-900/80 border-white/10 text-white hover:bg-slate-800'}`}
        >
          <Zap className="w-3.5 h-3.5" />
          Heatmap
        </button>
      </div>

      <MapContainer 
        center={[20, 70]} 
        zoom={3} 
        style={{ width: '100%', height: '100%', background: mapType === 'dark' ? '#0f172a' : '#1e1e1e' }}
      >
        {mapType === 'dark' ? (
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
        ) : (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; Esri'
          />
        )}

        {/* Heatmap overlay (simulated via overlapping soft circle markers) */}
        {showHeatmap && heatmapData.map((pos, idx) => (
          <CircleMarker 
            key={idx} 
            center={pos} 
            radius={15} 
            pathOptions={{ color: 'transparent', fillColor: '#ef4444', fillOpacity: 0.15 }} 
          />
        ))}

        {routes.map((route: any) => (
          <div key={route.id}>
            {/* Origin -> Dest Line */}
            <Polyline 
              positions={[route.origin, route.dest]} 
              pathOptions={{ color: '#4f46e5', weight: 2, dashArray: '5, 10', opacity: 0.4 }} 
            />
            {/* Travelled Line */}
            {route.progress > 0 && (
              <Polyline 
                positions={[route.origin, route.currentPos]} 
                pathOptions={{ color: '#ec4899', weight: 3, opacity: 0.8 }} 
              />
            )}
            
            {/* Current Ship Position */}
            <Marker position={route.currentPos} icon={customIcon(route.progress === 1 ? '#10b981' : '#f59e0b')}>
              <Popup className="rounded-xl overflow-hidden border-0">
                <div className="p-1">
                  <div className="font-bold text-gray-900">{route.containerNumber}</div>
                  <div className="text-xs text-gray-500 mb-2">{route.shippingLine} • {route.vesselName}</div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded">{route.status}</span>
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Origin & Dest Markers */}
            <CircleMarker center={route.origin} radius={4} pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.5 }}>
              <Popup>{route.originPort.name}</Popup>
            </CircleMarker>
            <CircleMarker center={route.dest} radius={4} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.5 }}>
              <Popup>{route.destinationPort.name}</Popup>
            </CircleMarker>
          </div>
        ))}
      </MapContainer>
    </div>
  );
}
