import mqtt from 'mqtt';
import { TOPICS } from '../constants/topics.js';
import { 
    mqttConnected, 
    mqttStatusText, 
    esp32Status, 
    batteryLevel 
} from '../stores/mqttStore.js';
// Menggunakan dynamic env untuk akses yang lebih fleksibel
import { env } from '$env/dynamic/public';

let client = null;

export const initMqtt = () => {
    if (client) return;

    mqttStatusText.set('Connecting...');

    // Mengambil nilai dari env dengan cara ini
    const brokerUrl = env.PUBLIC_MQTT_BROKER_URL;
    const username = env.PUBLIC_MQTT_USERNAME;
    const password = env.PUBLIC_MQTT_PASSWORD;

    const options = {
        username: username,
        password: password,
        reconnectPeriod: 3000,
        clean: true,
        protocol: 'wss' 
    };

    client = mqtt.connect(brokerUrl, options);

    client.on('connect', () => {
        mqttConnected.set(true);
        mqttStatusText.set('Connected');
        client.subscribe([TOPICS.BATTERY, TOPICS.STATUS]);
    });

    client.on('reconnect', () => {
        mqttStatusText.set('Reconnecting...');
    });

    client.on('offline', () => {
        mqttConnected.set(false);
        mqttStatusText.set('Disconnected');
        esp32Status.set('Offline');
    });

    client.on('error', (err) => {
        console.error('MQTT Connection Error: ', err);
        client.end();
    });

    client.on('message', (topic, message) => {
        const payload = message.toString();
        
        switch (topic) {
            case TOPICS.BATTERY:
                batteryLevel.set(parseInt(payload, 10));
                break;
            case TOPICS.STATUS:
                esp32Status.set(payload);
                break;
        }
    });
};

export const publishMessage = (topic, payload) => {
    if (client && client.connected) {
        client.publish(topic, payload.toString(), { qos: 1 });
    } else {
        console.warn('MQTT offline. Gagal mengirim:', payload);
    }
};