// ComplaintListPage.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { FAB } from 'react-native-paper';
import { API_BASE_URL } from '../config/api';

interface Complaint {
    id: number;
    title: string;
    details: string;
    status: 'open' | 'resolved';
}

export default function ComplaintListPage({ navigation }: any) {
    const [complaints, setComplaints] = useState<Complaint[]>([]);

    useFocusEffect(
        useCallback(() => {
            const fetchComplaints = async () => {
                try {
                    const userJson = await AsyncStorage.getItem('user');
                    const user = userJson ? JSON.parse(userJson) : null;

                    const url = `${API_BASE_URL}/api/complaint/${user.id}`;
                    const res = await axios.get(url);
                    const data = await res.data;

                    setComplaints(data);
                } catch (err) {
                    console.error('Failed to fetch complaints');
                }
            };

            fetchComplaints();
        }, []) // Empty deps: re-run every time the screen is focused
    );

    const handleClickFAB = () => {
        navigation.navigate('AddNewComplaint');
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Complaints</Text>
            <FlatList
                data={complaints}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('ComplaintDetails', { complaint: item })}
                    >
                        <View style={[styles.item, item.status === 'resolved' && styles.resolvedItem]}>
                            <Text style={styles.itemTitle}>{item.title}</Text>
                            <Text style={styles.itemDetails}>{item.details}</Text>
                            <Text style={styles.itemStatus}>{item.status}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
             <FAB icon={"plus"} style={styles.fab} onPress={handleClickFAB}/>
        </View>
    );
}

// shared styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f9fafb',
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 16,
    },
    item: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    resolvedItem: {
        opacity: 0.7,
    },
    itemTitle: {
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 4,
    },
    itemDetails: {
        color: '#4b5563',
    },
    itemStatus: {
        marginTop: 6,
        fontStyle: 'italic',
        color: '#6b7280',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 12,
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#2563eb',
        padding: 14,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 30,
        bottom: 30,
    },
});
