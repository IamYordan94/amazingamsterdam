'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Checkpoint, Route } from '@/lib/database';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then((mod) => mod.Polyline), { ssr: false });

interface MapComponentProps {
  route?: Route;
  checkpoints?: Checkpoint[];
  onCheckpointClick?: (checkpoint: Checkpoint) => void;
  onMapClick?: (lat: number, lng: number) => void;
  showRoute?: boolean;
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
}

export function MapComponent({
  route,
  checkpoints = [],
  onCheckpointClick,
  onMapClick,
  showRoute = true,
  center,
  zoom = 13,
  height = '400px',
  className = '',
}: MapComponentProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]); // Default to SF

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (center) {
      setMapCenter(center);
    } else if (checkpoints.length > 0) {
      // Calculate center from checkpoints
      const avgLat = checkpoints.reduce((sum, cp) => sum + cp.latitude, 0) / checkpoints.length;
      const avgLng = checkpoints.reduce((sum, cp) => sum + cp.longitude, 0) / checkpoints.length;
      setMapCenter([avgLat, avgLng]);
    } else if (route && route.checkpoints.length > 0) {
      // Calculate center from route checkpoints
      const avgLat = route.checkpoints.reduce((sum, cp) => sum + cp.latitude, 0) / route.checkpoints.length;
      const avgLng = route.checkpoints.reduce((sum, cp) => sum + cp.longitude, 0) / route.checkpoints.length;
      setMapCenter([avgLat, avgLng]);
    }
  }, [center, checkpoints, route]);

  if (!isClient) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  const displayCheckpoints = checkpoints.length > 0 ? checkpoints : (route?.checkpoints || []);
  const routePath = showRoute && displayCheckpoints.length > 1 
    ? displayCheckpoints.map(cp => [cp.latitude, cp.longitude] as [number, number])
    : [];

  return (
    <div className={className} style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Route path */}
        {routePath.length > 1 && (
          <Polyline
            positions={routePath}
            color="#3b82f6"
            weight={3}
            opacity={0.7}
          />
        )}
        
        {/* Checkpoints */}
        {displayCheckpoints.map((checkpoint, index) => (
          <Marker
            key={checkpoint.id}
            position={[checkpoint.latitude, checkpoint.longitude]}
            eventHandlers={{
              click: () => onCheckpointClick?.(checkpoint),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-lg mb-2">
                  {index + 1}. {checkpoint.name}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  {checkpoint.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary-600 font-medium">
                    {checkpoint.points} points
                  </span>
                  <span className="text-gray-500">
                    {checkpoint.challenge.type.replace('_', ' ')}
                  </span>
                </div>
                {onCheckpointClick && (
                  <button
                    onClick={() => onCheckpointClick(checkpoint)}
                    className="mt-2 w-full btn btn-primary text-sm"
                  >
                    View Details
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
