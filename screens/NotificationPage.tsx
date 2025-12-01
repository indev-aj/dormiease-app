import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    RefreshControl
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE = "http://localhost:3000/api/user";

export default function NotificationPage({ navigation }: any) {
    const [user, setUser] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // ------------------------------
    // Load current user from storage
    // ------------------------------
    const loadUser = async () => {
        const json = await AsyncStorage.getItem("user");
        if (!json) return navigation.replace("Login");
        setUser(JSON.parse(json));
    };

    // ------------------------------
    // Fetch notifications
    // ------------------------------
    const fetchNotifications = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const res = await axios.get(`${API_BASE}/notifications/${user.id}`);
            setNotifications(res.data);
        } catch (err) {
            console.error(err);
        }

        setLoading(false);
    };

    // ------------------------------
    // Mark notification as read
    // ------------------------------
    const markAsRead = async (notif: any) => {
        if (notif.is_read) return; // already read

        try {
            await axios.post(
                `${API_BASE}/update-notification/${notif.id}` // userNotificationId
            );

            // Update UI without refetching everything
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notif.id ? { ...n, is_read: true } : n
                )
            );
        } catch (err) {
            console.error("Failed to update notification", err);
        }
    };

    // ------------------------------
    // Load when mounted
    // ------------------------------
    useEffect(() => {
        loadUser();
    }, []);

    useEffect(() => {
        if (user) fetchNotifications();
    }, [user]);

    // ------------------------------
    // Render each notification
    // ------------------------------
    const renderItem = ({ item }: any) => {
        const isUnread = !item.is_read;

        return (
            <TouchableOpacity
                style={[
                    styles.notificationCard,
                    isUnread && styles.unreadCard
                ]}
                onPress={() => markAsRead(item)}
            >
                <View style={styles.row}>
                    <Text
                        style={[
                            styles.title,
                            isUnread && styles.unreadTitle
                        ]}
                    >
                        {item.notification.title}
                    </Text>

                    {isUnread && <View style={styles.unreadDot} />}
                </View>

                <Text style={styles.message}>{item.notification.message}</Text>
            </TouchableOpacity>
        );
    };

    // ------------------------------
    // Screen Layout
    // ------------------------------
    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={fetchNotifications}
                    />
                }
                ListEmptyComponent={
                    <Text style={{ textAlign: "center", marginTop: 30 }}>
                        No notifications yet.
                    </Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    notificationCard: {
        padding: 16,
        backgroundColor: "#f3f4f6",
        borderRadius: 8,
        marginBottom: 12
    },
    unreadCard: {
        backgroundColor: "#eef2ff" // slightly purple/blue tint
    },
    title: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 4
    },
    unreadTitle: {
        fontWeight: "700"
    },
    message: {
        color: "#555"
    },
    unreadDot: {
        width: 10,
        height: 10,
        backgroundColor: "#2563eb",
        borderRadius: 50,
        marginLeft: 6
    },
    row: {
        flexDirection: "row",
        alignItems: "center"
    }
});