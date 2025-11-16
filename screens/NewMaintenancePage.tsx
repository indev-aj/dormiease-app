// NewComplaintPage.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function NewMaintenancePage({ navigation }: any) {
    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');

    const handleSubmit = async () => {
        try {
            const userJson = await AsyncStorage.getItem('user');
            const user = userJson ? JSON.parse(userJson) : null;

            const res = await axios.post('http://localhost:3000/api/user/submit-maintenance', { userId: user.id, title, details });

            if (res.data) {
                Alert.alert('Complaint submitted');
                navigation.goBack();
            } else {
                const data = await res.data;
                Alert.alert('Failed', data.message);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to submit complaint');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>New Maintenance Request</Text>

            <TextInput
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
            />
            <TextInput
                placeholder="Details"
                value={details}
                onChangeText={setDetails}
                style={[styles.input, { height: 100 }]}
                multiline
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
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
        bottom: 24,
        right: 24,
        backgroundColor: '#2563eb',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    fabText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '600',
    },
});