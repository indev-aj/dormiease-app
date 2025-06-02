// RoomApplicationPage.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';

interface Room {
    id: number;
    name: string;
    applied: boolean;
}

export default function RoomApplicationPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [userRoom, setUserRoom] = useState<Room[]>([]);

    useFocusEffect(
        useCallback(() => {
            const fetchRooms = async () => {
                try {
                    const userJson = await AsyncStorage.getItem('user');
                    const user = userJson ? JSON.parse(userJson) : null;
                    const res = await fetch('http://localhost:3000/api/room/all');
                    const data = await res.json();
                    const userId = user.id; // Replace this with your actual user ID from auth context/storage

                    const enriched = data.map((room: any) => {
                        const userStatus = room.userStatuses.find((u: any) => u.userId === userId);
                        return {
                            ...room,
                            applied: !!userStatus,
                            approved: userStatus?.status === 'approved',
                        };
                    });

                    const approvedRooms = data.filter((room: any) =>
                        room.userStatuses.some((ur: any) => ur.userId === userId && ur.status === 'approved')
                    );

                    setRooms(enriched);
                    setUserRoom(approvedRooms);
                } catch (err) {
                    Alert.alert('Error', 'Failed to load rooms');
                }
            };

            fetchRooms();
        }, []) // Empty deps: re-run every time the screen is focused
    );

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
            {userRoom && (
                <View style={{ marginTop: 30, padding: 10, backgroundColor: '#ecf0f3', borderRadius: 6 }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 6 }}>Your Room(s)</Text>
                    {userRoom.map((ur) => (
                        <Text key={ur.id} style={{ fontSize: 16 }}>{ur.name}</Text>
                    ))}
                </View>
            )}
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