import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import init from 'react_native_mqtt';
import { AsyncStorage } from '@react-native-async-storage/async-storage';

init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  reconnect: true,
  sync: {},
});

const App = () => {
  const [messages, setMessages] = useState([]);
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const mqttClient = new Paho.MQTT.Client(
      'broker.hivemq.com',
      8884,
      '208d1aef-fa4f-48ee-a507-07fb6d7ec77d'
    );

    mqttClient.onConnectionLost = (responseObject) => {
      if (responseObject.errorCode !== 0) {
        console.log('Connection Lost:', responseObject.errorMessage);
        setIsConnected(false);
      }
    };

    mqttClient.onMessageArrived = (message) => {
      console.log('Message Arrived:', message.payloadString);
      setMessages((prevMessages) => [...prevMessages, message.payloadString]);
    };

    setClient(mqttClient);

    return () => {
      if (mqttClient.isConnected()) {
        mqttClient.disconnect();
      }
    };
  }, []);

  const connectClient = () => {
    if (client && !client.isConnected()) {
      client.connect({
        onSuccess: () => {
          console.log('Connected');
          setIsConnected(true);
          client.subscribe('95a05c0f-57a9-424a-be9b-2adfe3880708');
        },
        onFailure: (err) => {
          console.log('Connection Failed:', err);
        },
        useSSL: true,
      });
    }
  };

  const disconnectClient = () => {
    if (client && client.isConnected()) {
      client.disconnect();
      console.log('Disconnected');
      setIsConnected(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <View style={{ flexDirection: 'row', marginTop: 60 }}>
        <Button
          title="Connect"
          onPress={connectClient}
          disabled={isConnected}
        />
        <Button
          title="Disconnect"
          onPress={disconnectClient}
          disabled={!isConnected}
          style={{ marginLeft: 10 }}
        />
      </View>

      {/* Display the connection status */}
      <Text style={{ marginTop: 20, fontWeight: 'bold', fontSize: 16 }}>
        Connection Status: {isConnected ? 'Connected' : 'Disconnected'}
      </Text>

      <Text style={{ marginTop: 20 }}>MQTT Messages:</Text>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Text>{item}</Text>}
      />
    </View>
  );
};

export default App;
