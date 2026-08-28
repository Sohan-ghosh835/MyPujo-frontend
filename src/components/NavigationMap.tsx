import { useEffect } from "react";
import { Circle, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoPoint } from "@shared/navigationMath";

type UserLocation = GeoPoint & { accuracy: number };

const userIcon = L.divIcon({ className: "", html: '<span class="nav-user-dot" aria-hidden="true"></span>', iconSize: [26, 26], iconAnchor: [13, 13] });
const destinationIcon = L.divIcon({ className: "", html: '<span class="nav-pandal-pin" aria-hidden="true">🏮</span>', iconSize: [36, 42], iconAnchor: [18, 38] });

function FollowPosition({ position, enabled, recenterSignal }: { position: UserLocation | null; enabled: boolean; recenterSignal: number }) {
  const map = useMap();
  useEffect(() => { if (position && enabled) map.setView([position.lat, position.lng], Math.max(map.getZoom(), 16), { animate: true }); }, [map, position, enabled, recenterSignal]);
  return null;
}

function UserPan({ onPan }: { onPan: () => void }) { useMapEvents({ dragstart: onPan }); return null; }

export function NavigationMap({ route, userLocation, destination, destinationName, followLocation, onPan, recenterSignal }: { route: GeoPoint[]; userLocation: UserLocation | null; destination: GeoPoint; destinationName: string; followLocation: boolean; onPan: () => void; recenterSignal: number }) {
  const initial: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : [destination.lat, destination.lng];
  return <div className="navigation-map-shell" aria-label="In-app navigation map">
    <MapContainer center={initial} zoom={15} scrollWheelZoom className="navigation-leaflet-map" zoomControl={false} attributionControl>
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
      <UserPan onPan={onPan} />
      <FollowPosition position={userLocation} enabled={followLocation} recenterSignal={recenterSignal} />
      {route.length > 1 && <Polyline positions={route.map(point => [point.lat, point.lng])} pathOptions={{ color: "#f4b942", weight: 7, opacity: .92, lineCap: "round", lineJoin: "round" }} />}
      <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}><Tooltip direction="top" offset={[0, -34]}>{destinationName}</Tooltip></Marker>
      {userLocation && <><Circle center={[userLocation.lat, userLocation.lng]} radius={Math.max(5, userLocation.accuracy)} pathOptions={{ color: "#2b7cff", fillColor: "#2b7cff", fillOpacity: .14, weight: 1 }} /><Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}><Tooltip direction="top">Your live position</Tooltip></Marker></>}
    </MapContainer>
  </div>;
}
