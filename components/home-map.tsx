"use client";

import { useMemo } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
  useMap
} from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import type { GeoPoint } from "@/lib/geo";

type MapSchool = {
  slug: string;
  name: string;
  lat: number | null;
  lng: number | null;
  distanceKm: number | null;
};

function FitToMarkers({ bounds }: { bounds: LatLngBoundsExpression | null }) {
  const map = useMap();
  if (bounds) {
    map.fitBounds(bounds, { padding: [24, 24] });
  }
  return null;
}

export function HomeMap({
  schools,
  homePoint
}: {
  schools: MapSchool[];
  homePoint: GeoPoint | null;
}) {
  const markerSchools = schools.filter(
    (school) => school.lat !== null && school.lng !== null
  );

  const bounds = useMemo<LatLngBoundsExpression | null>(() => {
    const pts = markerSchools.map((school) => [school.lat!, school.lng!] as [number, number]);
    if (homePoint) pts.push([homePoint.lat, homePoint.lng]);
    if (pts.length === 0) return null;
    return pts;
  }, [homePoint, markerSchools]);

  const center: [number, number] = homePoint
    ? [homePoint.lat, homePoint.lng]
    : markerSchools.length > 0
    ? [markerSchools[0].lat!, markerSchools[0].lng!]
    : [1.3521, 103.8198];

  return (
    <div className="mapCanvasWrap">
      <MapContainer center={center} zoom={12} className="mapCanvas" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.onemap.gov.sg/">OneMap</a>'
          url="https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png"
        />
        <FitToMarkers bounds={bounds} />
        {homePoint ? (
          <CircleMarker
            center={[homePoint.lat, homePoint.lng]}
            pathOptions={{ color: "#f59e0b", fillColor: "#f59e0b", fillOpacity: 0.6 }}
            radius={8}
          >
            <Popup>Home address</Popup>
          </CircleMarker>
        ) : null}
        {markerSchools.map((school) => (
          <CircleMarker
            key={school.slug}
            center={[school.lat!, school.lng!]}
            pathOptions={{ color: "#4f8cff", fillColor: "#4f8cff", fillOpacity: 0.5 }}
            radius={6}
          >
            <Tooltip direction="top">{school.name}</Tooltip>
            <Popup>
              <strong>{school.name}</strong>
              <br />
              Distance:{" "}
              {school.distanceKm === null ? "—" : `${school.distanceKm.toFixed(1)} km`}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
