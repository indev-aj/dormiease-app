// LoginPage.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { API_BASE_URL } from '../config/api';

export default function LoginPage({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/user/signin`, {email, password});

            const data = await res.data;
            
            if (res.status == 201 || res.status == 200) {
                await AsyncStorage.setItem('user', JSON.stringify(data.user));

                Alert.alert('Login successful');
                navigation.replace('Main');
            } else {
                Alert.alert('Login failed', data.message);
            }

        } catch (err) {
            console.error('login error: ', err);
            Alert.alert('Error', 'Unable to login.');
        }
    };

    useEffect(() => {
        const getUser = async () => {
            const userJson = await AsyncStorage.getItem('user');
            const user = userJson ? JSON.parse(userJson) : null;

            if (user) {
                navigation.replace('Main');
            }
        }

        getUser();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>User Login</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.replace('Signup')}>
                <Text style={styles.link}>Don't have an account? Sign up</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
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
    link: {
        marginTop: 12,
        color: '#2563eb',
        textAlign: 'center',
    },
});
