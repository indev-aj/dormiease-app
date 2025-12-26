import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Alert,
} from 'react-native';
import { API_BASE_URL } from '../config/api';

interface Hostel {
    id: number;
    name: string;
    availableCapacity: number;
    totalCapacity: number;
    isFull: boolean;
    approvedUsers: number[];
    pendingUsers: number[];
    rejectedUsers: number[];
}

export default function HostelApplicationPage() {
    const [hostels, setHostels] = useState<Hostel[]>([]);
    const [userApprovedHostel, setUserApprovedHostel] = useState<Hostel | null>(null);

    const [userId, setUserId] = useState<number>(-1);

    // Fetch hostels on screen focus
    useFocusEffect(
        useCallback(() => {
            const loadHostels = async () => {
                try {
                    const userJson = await AsyncStorage.getItem('user');
                    const user = userJson ? JSON.parse(userJson) : null;
                    const userId = user?.id;
                    setUserId(userId);

                    const res = await fetch(`${API_BASE_URL}/api/hostels/all`);
                    const data = await res.json();

                    const hostelsMapped: Hostel[] = data.map((h: any) => {
                        // Compute available capacity
                        const available = h.totalCapacity - h.totalApprovedUsers;

                        // Determine user status by scanning rooms
                        let userStatus: "none" | "pending" | "approved" = "none";

                        for (const room of h.rooms) {
                            const found = room.userStatuses.find((u: any) => u.userId === userId);
                            if (found) {
                                userStatus = found.status as "pending" | "approved";
                                break;
                            }
                        }

                        return {
                            id: h.id,
                            name: h.name,
                            availableCapacity: available,
                            totalCapacity: h.totalCapacity,
                            isFull: available <= 0,
                            userStatus,
                            approvedUsers: h.approvedUsers ?? [],
                            pendingUsers: h.pendingUsers ?? [],
                            rejectedUsers: h.rejectedUsers ?? [],
                        };
                    });

                    setHostels(hostelsMapped);

                    const approved = hostelsMapped.find((h) => h.approvedUsers.includes(Number(userId)));
                    setUserApprovedHostel(approved || null);

                } catch (e) {
                    Alert.alert("Error", "Failed to load hostels.");
                }
            };

            loadHostels();
        }, [])
    );

    // Apply for hostel → backend assigns room automatically
    const handleApply = async (hostelId: number) => {
        try {
            const userJson = await AsyncStorage.getItem('user');
            const user = userJson ? JSON.parse(userJson) : null;

            const response = await axios.post(`${API_BASE_URL}/api/user/apply-hostel`, {
                userId: user.id,
                hostelId
            });

            if (response.data) {
                setHostels(prev =>
                    prev.map(h =>
                        h.id === hostelId
                            ? { ...h, userStatus: "pending" }
                            : h
                    )
                );
                Alert.alert("Success", "Hostel applied successfully!");
            }
        } catch (e) {
            Alert.alert("Error", "Failed to apply.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Available Hostels</Text>

            <FlatList
                data={hostels}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.hostelRow}>
                        <View>
                            <Text style={styles.hostelName}>{item.name}</Text>
                            <Text style={styles.capacity}>
                                {item.availableCapacity}/{item.totalCapacity} beds available
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                (item.approvedUsers.includes(userId) || item.pendingUsers.includes(userId) || item.isFull) && styles.disabled,
                            ]}
                            onPress={() => handleApply(item.id)}
                            disabled={item.approvedUsers.includes(userId) || item.pendingUsers.includes(userId) || item.isFull}
                        >
                            <Text style={styles.buttonText}>
                                {item.approvedUsers.includes(userId)
                                    ? "Approved"
                                    : item.pendingUsers.includes(userId)
                                        ? "Pending"
                                        : item.isFull
                                            ? "Full"
                                            : "Apply"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            />

            {userApprovedHostel && (
                <View style={styles.assignmentBox}>
                    <Text style={styles.assignmentTitle}>Your Hostel Assignment</Text>
                    <Text style={styles.assignmentItem}>
                        {userApprovedHostel.name}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#f9fafb" },
    title: { fontSize: 22, fontWeight: "600", marginBottom: 20 },
    hostelRow: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: "#e5e7eb",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    hostelName: { fontSize: 18, fontWeight: "500" },
    capacity: { fontSize: 12, color: "#6b7280" },
    button: {
        backgroundColor: "#2563eb",
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 6
    },
    disabled: { backgroundColor: "#9ca3af" },
    buttonText: { color: "#fff", fontWeight: "600" },
    assignmentBox: {
        marginTop: 30,
        padding: 12,
        backgroundColor: "#e8f1ff",
        borderRadius: 6,
    },
    assignmentTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 6,
    },
    assignmentItem: {
        fontSize: 16,
    },
});
