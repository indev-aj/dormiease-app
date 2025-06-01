// RoomApplicationPage.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
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
                const userJson = await AsyncStorage.getItem('user');
                const user = userJson ? JSON.parse(userJson) : null;
                const res = await fetch('http://localhost:3000/api/room/all');
                const data = await res.json();
                const userId = user.id; // Replace this with your actual user ID from auth context/storage
                console.log(user.id)

                const enriched = data.map((room: any) => ({
                    ...room,
                    applied: room.userIds.includes(userId),
                }));
                setRooms(enriched);
            } catch (err) {
                Alert.alert('Error', 'Failed to load rooms');
            }
        };

        fetchRooms();
    }, []);

    const handleApply = async (roomId: number) => {
        try {
            const userJson = await AsyncStorage.getItem('user');
            const user = userJson ? JSON.parse(userJson) : null;
            const res = await axios.post('http://localhost:3000/api/user/apply-room', { userId: user.id, roomId });

            if (res.data) {
                setRooms(prev =>
                    prev.map(room =>
                        room.id === roomId ? { ...room, applied: true } : room
                    )
                );
            } else {
                const data = await res.data;
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