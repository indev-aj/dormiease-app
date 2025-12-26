import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useCallback, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Alert,
} from "react-native";
import { Camera } from "expo-camera";
import { useFocusEffect } from "@react-navigation/native";
import { API_BASE_URL } from "../config/api";

const APPLICATIONS_API = `${API_BASE_URL}/api/hostels/all-applications`;

interface Application {
    applicationId: number;
    userId: number;
    hostelId: number;
    hostelName: string;
    roomId: number | null;
    roomName: string | null;
    roomPrice: number;
    status: "pending" | "approved" | "rejected";
    feePaid: boolean;
    feePaidAt: string | null;
    moveInDate: string;
    moveOutDate: string;
}

export default function HomePage({ navigation }: any) {
    const [user, setUser] = useState<any>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(false);

    const loadUser = async () => {
        const json = await AsyncStorage.getItem("user");
        if (!json) {
            navigation.replace("Login");
            return null;
        }
        const parsed = JSON.parse(json);
        setUser(parsed);
        return parsed;
    };

    const fetchApplications = async (userId: number) => {
        setLoading(true);
        try {
            const res = await axios.get(APPLICATIONS_API);
            const filtered = res.data.filter(
                (app: Application) => app.userId === userId
            );
            setApplications(filtered);
        } catch (err) {
            console.error("Failed to fetch applications", err);
        }
        setLoading(false);
    };

    const refreshData = useCallback(async () => {
        const currentUser = await loadUser();
        if (currentUser?.id) {
            fetchApplications(currentUser.id);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            refreshData();
        }, [refreshData])
    );

    const sortedApplications = useMemo(() => {
        return [...applications].sort(
            (a, b) => b.applicationId - a.applicationId
        );
    }, [applications]);

    const latestApproved = sortedApplications.find(
        (app) => app.status === "approved"
    );
    const latestApplication = sortedApplications[0];

    const studentId = user?.studentId ?? user?.student_id ?? "--";
    const appliedHostel = latestApplication?.hostelName || "--";
    const assignedHostel = latestApproved?.hostelName || "--";
    const assignedRoom = latestApproved?.roomName || "--";
    const paymentAmount =
        latestApproved?.roomPrice != null ? `${latestApproved.roomPrice}` : "--";
    const paymentStatus = latestApproved
        ? latestApproved.feePaid
            ? "Paid"
            : "Unpaid"
        : "Not assigned";
    const formatDate = (value?: string) => {
        if (!value) return "--";
        const dateOnly = value.split("T")[0];
        return dateOnly || "--";
    };
    const moveInDate = formatDate(latestApproved?.moveInDate);
    const moveOutDate = formatDate(latestApproved?.moveOutDate);
    const handleScanPress = useCallback(async () => {
        const permission = await Camera.requestCameraPermissionsAsync();
        if (permission.status !== "granted") {
            Alert.alert(
                "Camera permission required",
                "Please allow camera access to scan the QR code."
            );
            return;
        }
        navigation.navigate("Scan");
    }, [navigation]);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl
                    refreshing={loading}
                    onRefresh={() => {
                        if (user?.id) fetchApplications(user.id);
                    }}
                />
            }
        >
            <Text style={styles.title}>Home</Text>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Student Profile</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Name</Text>
                    <Text style={styles.value}>{user?.name || "--"}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Student ID</Text>
                    <Text style={styles.value}>{studentId}</Text>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Hostel Application</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Applied Hostel</Text>
                    <Text style={styles.value}>{appliedHostel}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Assigned Hostel</Text>
                    <Text style={styles.value}>{assignedHostel}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Room</Text>
                    <Text style={styles.value}>{assignedRoom}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Move In</Text>
                    <Text style={styles.value}>{moveInDate}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Move Out</Text>
                    <Text style={styles.value}>{moveOutDate}</Text>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Room Payment</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Amount</Text>
                    <Text style={styles.value}>
                        RM {paymentAmount != null ? `${paymentAmount}` : "--"}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Status</Text>
                    <View style={styles.statusRow}>
                        <Text
                            style={[
                                styles.value,
                                paymentStatus === "Paid"
                                    ? styles.paid
                                    : paymentStatus === "Unpaid"
                                        ? styles.unpaid
                                        : styles.muted,
                            ]}
                        >
                            {paymentStatus}
                        </Text>
                        {paymentStatus == "Unpaid" &&
                            <TouchableOpacity
                                style={styles.scanButton}
                                onPress={handleScanPress}
                            >
                                <Text style={styles.scanButtonText}>Scan QR</Text>
                            </TouchableOpacity>
                        }
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    content: {
        padding: 20,
        paddingBottom: 28,
    },
    title: {
        fontSize: 22,
        fontWeight: "600",
        marginBottom: 16,
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    scanButton: {
        backgroundColor: "#2563eb",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        marginLeft: 10,
    },
    scanButtonText: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "600",
    },
    label: {
        color: "#6b7280",
        fontSize: 13,
        fontWeight: "500",
    },
    value: {
        color: "#111827",
        fontSize: 14,
        fontWeight: "600",
    },
    paid: {
        color: "#059669",
    },
    unpaid: {
        color: "#dc2626",
    },
    muted: {
        color: "#6b7280",
    },
});
