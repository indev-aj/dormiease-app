// RoomApplicationPage.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';

interface Room {
    id: number;
    name: string;
    applied: boolean;
}

export default function RoomApplicationPage() {
    const [rooms, setRooms] = useState<Room[]>([]);

    useEffect(() => {
        // Simulate fetch call to /api/rooms
        const fetchRooms = async () => {
            try {
                const res = await fetch('http://localhost:3000/api/room/all');
                const data = await res.json();
                const enriched = data.map((room: any) => ({ ...room, applied: false }));
                setRooms(enriched);
            } catch (err) {
                Alert.alert('Error', 'Failed to load rooms');
            }
        };

        fetchRooms();
    }, []);

    const handleApply = async (roomId: number) => {
        try {
            const res = await fetch('http://localhost:3000/api/user-rooms/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId, userId: 1 }) // replace with actual userId from auth
            });

            if (res.ok) {
                setRooms(prev =>
                    prev.map(room =>
                        room.id === roomId ? { ...room, applied: true } : room
                    )
                );
            } else {
                const data = await res.json();
                Alert.alert('Apply Failed', data.message);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to apply.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Available Rooms</Text>
            <FlatList
                data={rooms}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <Text style={styles.roomName}>{item.name}</Text>
                        <TouchableOpacity
                            style={[styles.button, item.applied && styles.disabled]}
                            onPress={() => handleApply(item.id)}
                            disabled={item.applied}
                        >
                            <Text style={styles.buttonText}>{item.applied ? 'Applied' : 'Apply'}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f9fafb',
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#e5e7eb',
    },
    roomName: {
        fontSize: 16,
    },
    button: {
        backgroundColor: '#2563eb',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    disabled: {
        backgroundColor: '#9ca3af',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '500',
    },
});