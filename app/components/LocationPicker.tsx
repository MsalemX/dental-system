"use client";

import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '400px'
};

const defaultCenter = {
    lat: 24.7136,
    lng: 46.6753
};

interface LocationPickerProps {
    latitude: number;
    longitude: number;
    onLocationChange: (lat: number, lng: number) => void;
}

export default function LocationPicker({ latitude, longitude, onLocationChange }: LocationPickerProps) {
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [center, setCenter] = useState({ lat: latitude, lng: longitude });

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dOWTgaN2-8X8' // Fallback for demo
    });

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const onMapClick = useCallback((event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            onLocationChange(lat, lng);
            setCenter({ lat, lng });
        }
    }, [onLocationChange]);

    const onMarkerDragEnd = useCallback((event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            onLocationChange(lat, lng);
        }
    }, [onLocationChange]);

    if (!isLoaded) {
        return (
            <div className="w-full h-96 bg-slate-100 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-slate-500 font-bold">جاري تحميل الخريطة...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="text-xs font-black text-slate-400 mb-2">انقر على الخريطة لتحديد موقع العيادة</div>
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={15}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    onClick={onMapClick}
                    options={{
                        zoomControl: true,
                        streetViewControl: false,
                        mapTypeControl: true,
                        fullscreenControl: true,
                    }}
                >
                    <Marker
                        position={{ lat: latitude, lng: longitude }}
                        draggable={true}
                        onDragEnd={onMarkerDragEnd}
                    />
                </GoogleMap>
                <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <div className="font-black text-slate-400">خط العرض</div>
                        <div className="font-bold text-slate-700">{latitude?.toFixed(6) || '0.000000'}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <div className="font-black text-slate-400">خط الطول</div>
                        <div className="font-bold text-slate-700">{longitude?.toFixed(6) || '0.000000'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}