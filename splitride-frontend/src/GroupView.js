import React, { useState, useEffect, useCallback } from 'react';

function GroupView({ groupId }) {
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [totalFare, setTotalFare] = useState('');
    const [finalizing, setFinalizing] = useState(false);
    const [finalizeError, setFinalizeError] = useState('');
    const [summary, setSummary] = useState('');

    const fetchGroupDetails = useCallback(async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/rides/${groupId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setGroup(data.group);

                const uniqueMembers = Object.values(
                    data.members.reduce((acc, m) => {
                        acc[m.user.id] = m;
                        return acc;
                    }, {})
                );
                setMembers(uniqueMembers);
            } else {
                setError('Could not load group details.');
            }
        } catch (err) {
            setError('Could not connect to server.');
        }
    }, [groupId]);

    useEffect(() => {
        if (!groupId) return;
        setLoading(true);
        setError('');
        fetchGroupDetails().finally(() => setLoading(false));

        // Poll every 5 seconds so other riders see updates (e.g. finalize)
        // automatically, without needing to manually refresh the page.
        const intervalId = setInterval(() => {
            fetchGroupDetails();
        }, 5000);

        return () => clearInterval(intervalId);
    }, [groupId, fetchGroupDetails]);

    const handleFinalize = async () => {
        if (!totalFare || Number(totalFare) <= 0) {
            setFinalizeError('Enter a valid fare amount.');
            return;
        }

        setFinalizing(true);
        setFinalizeError('');
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/rides/${groupId}/finalize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ totalFare }),
            });

            if (response.ok) {
                const summaryText = await response.text();
                setSummary(summaryText);
                await fetchGroupDetails();
            } else {
                setFinalizeError('Could not finalize the ride.');
            }
        } catch (err) {
            setFinalizeError('Could not connect to server.');
        } finally {
            setFinalizing(false);
        }
    };

    const handleCancel = async () => {
        const confirmed = window.confirm('Are you sure you want to cancel this ride?');
        if (!confirmed) return;

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/rides/${groupId}/cancel`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                await fetchGroupDetails();
            } else {
                setFinalizeError('Could not cancel the ride.');
            }
        } catch (err) {
            setFinalizeError('Could not connect to server.');
        }
    };

    if (loading) return <p style={{ textAlign: 'center' }}>Loading group...</p>;
    if (error) return <p style={{ textAlign: 'center', color: '#c0392b' }}>{error}</p>;
    if (!group) return null;

    return (
        <div style={{
            maxWidth: '480px', margin: '20px auto', padding: '20px',
            fontFamily: 'Arial, sans-serif',
        }}>
            <div style={{
                backgroundColor: 'white', borderRadius: '12px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '20px',
            }}>
        <span style={{
            backgroundColor: group.status === 'FORMING' ? '#fff3e0' : '#e8f5e9',
            color: group.status === 'FORMING' ? '#e65100' : '#2e7d32',
            fontSize: '11px', fontWeight: '700', padding: '3px 8px',
            borderRadius: '4px', textTransform: 'uppercase',
        }}>
          {group.status}
        </span>

                <h2 style={{ fontSize: '18px', margin: '10px 0 4px' }}>
                    {group.origin} → {group.destination}
                </h2>
                <p style={{ fontSize: '13px', color: '#666', margin: '0 0 16px' }}>
                    Ride #{group.id}
                </p>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '14px' }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 10px' }}>
                        {members.length} {members.length === 1 ? 'rider' : 'riders'}
                    </p>
                    {members.map((member) => (
                        <div
                            key={member.id}
                            style={{
                                display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', padding: '8px 0',
                                borderBottom: '1px solid #f5f5f5',
                            }}
                        >
                            <div>
                                <p style={{ fontSize: '14px', margin: 0 }}>{member.user.name}</p>
                                <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>{member.dropPoint}</p>
                                {member.user.phone && (
                                    <p style={{ fontSize: '12px', color: '#666', margin: '2px 0 0' }}>
                                        📞 {member.user.phone}
                                    </p>
                                )}
                            </div>
                            <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>
                                {member.fareShare ? `₹${member.fareShare}` : 'Pending'}
                            </p>
                        </div>
                    ))}
                </div>

                {group.totalFare && (
                    <div style={{
                        marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #eee',
                        display: 'flex', justifyContent: 'space-between',
                    }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>Total fare</p>
                        <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>₹{group.totalFare}</p>
                    </div>
                )}

                {group.status === 'FORMING' && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
                        <p style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 8px' }}>
                            Finalize this ride
                        </p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="number"
                                placeholder="Total fare (₹)"
                                value={totalFare}
                                onChange={(e) => setTotalFare(e.target.value)}
                                style={{
                                    flex: 1, padding: '10px 12px', borderRadius: '8px',
                                    border: '1px solid #ddd', fontSize: '14px',
                                }}
                            />
                            <button
                                onClick={handleFinalize}
                                disabled={finalizing}
                                style={{
                                    padding: '10px 16px', borderRadius: '8px', border: 'none',
                                    backgroundColor: '#000', color: '#fff', fontSize: '14px',
                                    fontWeight: '600', cursor: finalizing ? 'not-allowed' : 'pointer',
                                    opacity: finalizing ? 0.6 : 1,
                                }}
                            >
                                {finalizing ? 'Finalizing...' : 'Finalize'}
                            </button>
                        </div>
                        <button
                            onClick={handleCancel}
                            style={{
                                width: '100%', marginTop: '8px', padding: '10px 16px',
                                borderRadius: '8px', border: '1px solid #e0e0e0',
                                backgroundColor: '#fff', color: '#c0392b', fontSize: '13px',
                                fontWeight: '600', cursor: 'pointer',
                            }}
                        >
                            Cancel Ride
                        </button>
                        {finalizeError && (
                            <p style={{ fontSize: '12px', color: '#c0392b', margin: '8px 0 0' }}>
                                {finalizeError}
                            </p>
                        )}
                    </div>
                )}

                {summary && (
                    <div style={{
                        marginTop: '16px', padding: '14px', borderRadius: '10px',
                        backgroundColor: '#f7f7f8', border: '1px solid #eee',
                    }}>
                        <p style={{ fontSize: '11px', fontWeight: '700', color: '#666',
                            textTransform: 'uppercase', margin: '0 0 6px' }}>
                            Trip Summary
                        </p>
                        <p style={{ fontSize: '13px', lineHeight: '1.5', margin: 0, color: '#333' }}>
                            {summary}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GroupView;