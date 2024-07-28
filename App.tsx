/* eslint-disable prettier/prettier */
import {
  Text,
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Geolocation from '@react-native-community/geolocation';
import BackgroundTimer from '@boterop/react-native-background-timer';


interface posicaoAtual {
  position: {
    mocked: boolean
    extras: number
    maxCn0: number
    meanCn0: number
    timestamp: number
    satellites: number
    coords: {
      speed: number
      heading: number
      accuracy: number
      altitude: number
      latitude: number
      longitude: number
    },
  }
}

function App(): React.JSX.Element {
  const [posicaoAtual, setPosicaoAtual] = useState<posicaoAtual>();

  const getLocation = () => {
    // Geolocation.getCurrentPosition(
    //   (position) => {
    //     console.log(`${new Date()}${' - Atual position'}`, position);
    //   },
    //   (error) => {
    //     console.error(error);
    //   },
    //   {
    //     timeout: 5000, // A cada milisegundos tenta pegar a localização
    //     maximumAge: 3000, // Tempo máximo que a localização é armazenada em cache
    //     enableHighAccuracy: true, // Usa o GPS para pegar a localização em caso de false usa o WIFI
    //   },
    // );

    try {
      const meuLocal = Geolocation.watchPosition(
        position => {
          console.log(`${new Date()}${' - Atual position'}`, position);
          setPosicaoAtual(position as any);
        },
        error => {
          console.error(error);
          Alert.alert('Erro', 'Não foi possível obter a localização');
        },
        {
          timeout: 5000, // A cada milisegundos tenta pegar a localização
          maximumAge: 3000, // Tempo máximo que a localização é armazenada em cache
          enableHighAccuracy: true, // Usa o GPS para pegar a localização em caso de false usa o WIFI
        },
      );
      console.log('meuLocal', meuLocal);

    } catch (error) {
      console.error(error);
    }
  };

  const requestAuthorization = () => {
    // Solicita permissão para acessar a localização
    Geolocation.requestAuthorization();
  };

  useEffect(() => {
    requestAuthorization();
    getLocation();
  }, []);


  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
});

export default App;
