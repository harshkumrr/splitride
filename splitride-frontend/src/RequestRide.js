import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function RecenterMap({ lat, lng }) {
    const map = useMap();
    React.useEffect(() => {
        if (lat && lng) map.setView([lat, lng], 14);
    }, [lat, lng, map]);
    return null;
}

function RequestRide({ onRideRequested }) {
    const [origin, setOrigin] = useState('Detecting your location...');
    const [originLat, setOriginLat] = useState(null);
    const [originLng, setOriginLng] = useState(null);

    const [destQuery, setDestQuery] = useState('');
    const [destSuggestions, setDestSuggestions] = useState([]);
    const [destination, setDestination] = useState('');
    const [destLat, setDestLat] = useState(null);
    const [destLng, setDestLng] = useState(null);

    const [result, setResult] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setOriginLat(position.coords.latitude);
                    setOriginLng(position.coords.longitude);
                    setOrigin('Your location (drag pin to fix)');
                },
                () => setOrigin('Location unavailable — drag the pin manually')
            );
        }
    }, []);

    const handleOriginDrag = (e) => {
        const { lat, lng } = e.target.getLatLng();
        setOriginLat(lat);
        setOriginLng(lng);
        setOrigin('Pickup location (adjusted)');
    };

    const searchDestination = async (query) => {
        setDestQuery(query);
        setDestination('');
        setDestLat(null);
        setDestLng(null);
        if (query.length < 3) {
            setDestSuggestions([]);
            return;
        }
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
                { headers: { 'Accept-Language': 'en' } }
            );
            const data = await response.json();
            setDestSuggestions(data);
        } catch (error) {
            setDestSuggestions([]);
        }
    };

    const selectDestination = (place) => {
        const shortName = place.display_name.split(',')[0];
        setDestination(shortName);
        setDestLat(parseFloat(place.lat));
        setDestLng(parseFloat(place.lon));
        setDestQuery(shortName);
        setDestSuggestions([]);
    };

    const handleSubmit = async () => {
        setMessage('');
        setResult(null);

        const token = localStorage.getItem('token');
        if (!token) return setMessage('You must be logged in to request a ride.');
        if (originLat === null) return setMessage('Waiting for your location...');
        if (destLat === null) return setMessage('Please select a destination from the list.');

        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/rides/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ origin, originLat, originLng, destination, destLat, destLng }),
            });
            const data = await response.json();
            if (response.ok) {
                setResult(data);
                setMessage('');
                if (onRideRequested) onRideRequested(data.id);
            } else {
                setMessage('Something went wrong. Please try again.');
            }
        } catch (error) {
            setMessage('Could not connect to server');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleString('en-IN', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
        });
    };

    const center = originLat ? [originLat, originLng] : [28.6139, 77.2090];

    return (
        <div style={{ maxWidth: '480px', margin: '20px auto', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ position: 'relative' }}>
                <MapContainer center={center} zoom={13} style={{ height: '420px', width: '100%', borderRadius: '12px' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                    {originLat && (
                        <Marker
                            position={[originLat, originLng]}
                            draggable={true}
                            eventHandlers={{ dragend: handleOriginDrag }}
                        />
                    )}
                    {destLat && <Marker position={[destLat, destLng]} />}
                    {destLat && <RecenterMap lat={destLat} lng={destLng} />}
                </MapContainer>

                <div style={{
                    position: 'absolute', top: '12px', left: '12px', right: '12px',
                    backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    padding: '12px', zIndex: 1000,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#111', flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', color: '#333' }}>{origin}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', position: 'relative' }}>
                        <div style={{ width: '10px', height: '10px', backgroundColor: '#111', flexShrink: 0 }} />
                        <input
                            type="text"
                            placeholder="Where to?"
                            value={destQuery}
                            onChange={(e) => searchDestination(e.target.value)}
                            style={{ border: 'none', outline: 'none', fontSize: '14px', width: '100%', color: '#333' }}
                        />
                        {destSuggestions.length > 0 && (
                            <div style={{
                                position: 'absolute', top: '38px', left: '-46px', right: '0',
                                backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                                maxHeight: '200px', overflowY: 'auto',
                            }}>
                                {destSuggestions.map((place, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => selectDestination(place)}
                                        style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '13px', borderBottom: idx < destSuggestions.length - 1 ? '1px solid #f0f0f0' : 'none' }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7f7f7')}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                                    >
                                        {place.display_name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <p style={{ fontSize: '12px', color: '#888', margin: '8px 4px' }}>
                Tip: drag the black pin on the map if your pickup location looks wrong.
            </p>

            <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                    width: '100%', padding: '14px',
                    backgroundColor: '#111', color: 'white', border: 'none',
                    borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer',
                }}
            >
                {loading ? 'Requesting...' : 'Request Ride'}
            </button>

            {message && <p style={{ color: '#c0392b', fontSize: '13px', marginTop: '10px' }}>{message}</p>}

            {result && (
                <div style={{
                    marginTop: '16px', padding: '18px', backgroundColor: 'white',
                    borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{
                backgroundColor: '#e8f5e9', color: '#2e7d32', fontSize: '11px', fontWeight: '700',
                padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase',
            }}>
              {result.status === 'FORMING' ? 'Finding riders' : result.status}
            </span>
                    </div>
                    <p style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 4px' }}>
                        {result.origin} → {result.destination}
                    </p>
                    <p style={{ fontSize: '13px', color: '#666', margin: '0 0 12px' }}>
                        Departing around {formatTime(result.departureTime)}
                    </p>
                    <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>
                        Ride #{result.id} · We'll match you with others going the same way
                    </p>
                </div>
            )}
        </div>
    );
}

export default RequestRide;