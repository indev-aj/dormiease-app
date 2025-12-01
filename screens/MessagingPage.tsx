import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = "http://localhost:3000/api";

export default function MessagingPage({ navigation }: any) {
    const [user, setUser] = useState<any>(null);
    const [adminList, setAdminList] = useState<any[]>([]);
    const [conversationId, setConversationId] = useState<number | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [messageText, setMessageText] = useState("");
    const [selectedAdmin, setSelectedAdmin] = useState<any>(null);

    // -----------------------------------------
    // Load logged in user
    // -----------------------------------------
    const loadUser = async () => {
        const json = await AsyncStorage.getItem("user");
        if (!json) return navigation.replace("Login");
        setUser(JSON.parse(json));
    };

    // -----------------------------------------
    // Fetch admin list from API
    // -----------------------------------------
    const fetchAdmins = async () => {
        const res = await axios.get(`${API_BASE}/admin/all-admins`);
        setAdminList(res.data); // expects: [{id, name}, ...]
    };

    // -----------------------------------------
    // Start or get conversation
    // -----------------------------------------
    const openConversation = async (admin: any) => {
        setSelectedAdmin(admin);

        const res = await axios.post(`${API_BASE}/messaging/conversation/start`, {
            admin_id: admin.id,
            user_id: user.id
        });

        setConversationId(res.data.id);
        loadMessages(res.data.id);
    };

    // -----------------------------------------
    // Load messages
    // -----------------------------------------
    const loadMessages = async (convId: number) => {
        const res = await axios.get(`${API_BASE}/messaging/messages/${convId}`);
        setMessages(res.data); // show newest at bottom
    };

    // -----------------------------------------
    // Send message
    // -----------------------------------------
    const sendMessage = async () => {
        if (!messageText.trim() || !conversationId) return;

        await axios.post(`${API_BASE}/messaging/message/send`, {
            conversation_id: conversationId,
            content: messageText,
            sender_user_id: user.id
        });

        setMessageText("");
        loadMessages(conversationId);
    };

    // -----------------------------------------
    // Load on mount
    // -----------------------------------------
    useEffect(() => {
        loadUser();
        fetchAdmins();
    }, []);

    useEffect(() => {
        if (!conversationId) return;

        // Poll every 1 second
        const interval = setInterval(() => {
            loadMessages(conversationId);
        }, 300);

        // Cleanup on unmount or conversationId change
        return () => clearInterval(interval);
    }, [conversationId]);
    // -----------------------------------------
    // Render each admin in the list
    // -----------------------------------------
    const renderAdminItem = ({ item }: any) => (
        <TouchableOpacity
            style={styles.adminCard}
            onPress={() => openConversation(item)}
        >
            <Text style={styles.adminName}>{item.name}</Text>
        </TouchableOpacity>
    );

    // -----------------------------------------
    // Render chat bubble
    // -----------------------------------------
    const renderMessage = ({ item }: any) => {
        const isMine = item.sender_user_id === user.id;

        return (
            <View
                style={[
                    styles.bubble,
                    isMine ? styles.bubbleMine : styles.bubbleOther
                ]}
            >
                <Text>{item.content}</Text>
            </View>
        );
    };

    // ---------------------------------------------------
    // UI
    // ---------------------------------------------------
    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            {/* ------------------------- */}
            {/* Step 1: Admin List        */}
            {/* ------------------------- */}
            {!selectedAdmin && (
                <View style={{ flex: 1, padding: 16 }}>
                    <Text style={styles.sectionTitle}>Select an Admin</Text>

                    <FlatList
                        data={adminList}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderAdminItem}
                        ListEmptyComponent={
                            <Text style={{ marginTop: 20, textAlign: "center" }}>
                                No admins found.
                            </Text>
                        }
                    />
                </View>
            )}

            {/* ------------------------- */}
            {/* Step 2: Chat Messages     */}
            {/* ------------------------- */}
            {selectedAdmin && (
                <View style={{ flex: 1 }}>
                    {/* Back button */}
                    <TouchableOpacity
                        onPress={() => {
                            setSelectedAdmin(null);
                            setConversationId(null);
                            setMessages([]);
                        }}
                        style={styles.backBtn}
                    >
                        <Text style={styles.backText}>← Back</Text>
                    </TouchableOpacity>

                    {/* Messages */}
                    <FlatList
                        data={messages}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderMessage}
                        contentContainerStyle={{ padding: 16 }}
                    />

                    {/* Input */}
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                    >
                        <View style={styles.inputBar}>
                            <TextInput
                                value={messageText}
                                onChangeText={setMessageText}
                                placeholder="Type a message…"
                                style={styles.input}
                            />

                            <TouchableOpacity
                                style={styles.sendBtn}
                                onPress={sendMessage}
                            >
                                <Text style={styles.sendText}>Send</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 12
    },
    adminCard: {
        padding: 16,
        backgroundColor: "#f3f4f6",
        borderRadius: 8,
        marginBottom: 10
    },
    adminName: {
        fontSize: 16,
        fontWeight: "500"
    },
    backBtn: {
        padding: 10
    },
    backText: {
        color: "#2563eb",
        fontWeight: "600"
    },
    bubble: {
        padding: 10,
        marginVertical: 6,
        borderRadius: 10,
        maxWidth: "75%"
    },
    bubbleMine: {
        backgroundColor: "#dbeafe",
        alignSelf: "flex-end"
    },
    bubbleOther: {
        backgroundColor: "#e5e7eb",
        alignSelf: "flex-start"
    },
    inputBar: {
        flexDirection: "row",
        padding: 12,
        borderTopWidth: 1,
        borderColor: "#ddd"
    },
    input: {
        flex: 1,
        backgroundColor: "#f3f4f6",
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 50
    },
    sendBtn: {
        backgroundColor: "#2563eb",
        marginLeft: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        justifyContent: "center"
    },
    sendText: {
        color: "#fff",
        fontWeight: "700"
    }
});