import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import {
    BarcodeScanningResult,
    CameraView,
    useCameraPermissions,
} from "expo-camera";
import { API_BASE_URL } from "../config/api";

export default function ScanPage() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const navigation = useNavigation<any>();

    const statusMessage = useMemo(() => {
        if (!permission) return "Requesting camera permission...";
        if (!permission.granted) return "Camera access is required to scan.";
        return "Point your camera at a QR code.";
    }, [permission]);

    const handleBarcodeScanned = async (result: BarcodeScanningResult) => {
        if (scanned) return;
        setScanned(true);

        console.log("QR Code data:", result.data);
        setStatus("Processing QR code...");

        let parsedUrl: URL | null = null;
        try {
            parsedUrl = new URL(result.data);
        } catch (error) {
            setStatus("Scanned data is not a valid URL.");
            return;
        }

        if (!parsedUrl.pathname.includes("/api/admin/update-fee-status")) {
            setStatus("QR code is not a fee update link.");
            return;
        }

        if (parsedUrl.hostname === "localhost" || parsedUrl.hostname === "127.0.0.1") {
            const apiBase = new URL(API_BASE_URL);
            parsedUrl.protocol = apiBase.protocol;
            parsedUrl.hostname = apiBase.hostname;
            parsedUrl.port = apiBase.port;
        }

        try {
            await axios.put(parsedUrl.toString());
            setStatus("Fee status updated. Returning...");
            navigation.goBack();
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Network error while updating fee status.";
            setStatus(`Update failed. ${message}`);
        }
    };

    if (!permission) {
        return (
            <View style={styles.centered}>
                <Text style={styles.message}>{statusMessage}</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.centered}>
                <Text style={styles.message}>{statusMessage}</Text>
                <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={requestPermission}
                >
                    <Text style={styles.permissionButtonText}>
                        Allow Camera
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={handleBarcodeScanned}
            />
            <View style={styles.overlay}>
                <Text style={styles.message}>{statusMessage}</Text>
                {status && <Text style={styles.status}>{status}</Text>}
                {scanned && (
                    <TouchableOpacity
                        style={styles.permissionButton}
                        onPress={() => {
                            setScanned(false);
                            setStatus(null);
                        }}
                    >
                        <Text style={styles.permissionButtonText}>
                            Tap to scan again
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
    },
    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#0f172a",
    },
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
        padding: 20,
        backgroundColor: "rgba(15, 23, 42, 0.35)",
    },
    message: {
        color: "#f8fafc",
        fontSize: 15,
        textAlign: "center",
        marginBottom: 12,
    },
    status: {
        color: "#e2e8f0",
        fontSize: 13,
        textAlign: "center",
        marginBottom: 12,
    },
    permissionButton: {
        alignSelf: "center",
        backgroundColor: "#2563eb",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    permissionButtonText: {
        color: "#ffffff",
        fontWeight: "600",
        fontSize: 13,
    },
});
