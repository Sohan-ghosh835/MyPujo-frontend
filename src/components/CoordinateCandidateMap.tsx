import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { coordinateMapTarget } from "@shared/coordinateMapSelection";

const candidateIcon = L.divIcon({ className: "", html: '<span class="coordinate-candidate-pin" aria-hidden="true">⌖</span>', iconSize: [32, 32], iconAnchor: [16, 28] });

export function CoordinateCandidateMap({ latitude, longitude, label }: { latitude: number; longitude: number; label: string }) {
  const target = coordinateMapTarget({ latitude, longitude, label });
  return <div className="h-56 overflow-hidden rounded-2xl border border-[#dfc8a5]" aria-label={`Candidate map preview for ${label}`}><MapContainer center={target.center} zoom={target.zoom} className="h-full w-full" scrollWheelZoom><MapSelectionSync latitude={latitude} longitude={longitude} /><TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' /><Marker key={target.markerKey} position={target.center} icon={candidateIcon} /></MapContainer></div>;
}

function MapSelectionSync({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap();
  const target = coordinateMapTarget({ latitude, longitude, label: "selected-candidate" });
  useEffect(() => { map.setView(target.center, target.zoom, { animate: false }); }, [latitude, longitude, map]);
  return null;
}
