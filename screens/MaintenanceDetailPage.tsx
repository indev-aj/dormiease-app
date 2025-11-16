// ComplaintDetailsPage.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function MaintenanceDetailsPage({ route, navigation }: any) {
    const { complaint } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Title</Text>
            <Text style={styles.text}>{complaint.title}</Text>

            <Text style={styles.label}>Details</Text>
            <Text style={styles.text}>{complaint.details}</Text>

            <Text style={styles.label}>Reply</Text>
            <Text style={styles.text}>{complaint.reply || 'No reply yet.'}</Text>

            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
            >
                <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f9fafb',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 20,
    },
    text: {
        fontSize: 15,
        color: '#374151',
        marginTop: 4,
    },
    backButton: {
        marginTop: 40,
        backgroundColor: '#2563eb',
        padding: 14,
        borderRadius: 6,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
});