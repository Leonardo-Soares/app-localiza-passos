import DeviceInfo from 'react-native-device-info';
import { useEffect, useRef, useState } from 'react';
import Geolocation from 'react-native-geolocation-service';
import VIForegroundService from '@voximplant/react-native-foreground-service';
import { Alert, Image, Linking, PermissionsAndroid, Platform, StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native';

interface Position {
  coords: {
    speed: number
    heading: number
    altitude: number
    latitude: number
    accuracy: number
    longitude: number
    altitudeAccuracy: number
  },
  mocked: boolean
  provider: string
  timestamp: number
}

function App(): React.JSX.Element {
  const watchId = useRef<number | null>(null);
  const [dadosLocal, setDadosLocal] = useState<any | null>(null);
  const [nomeDispositivo, setNomeDispositivo] = useState<any | null>(null);
  const [textoPermission, setTextoPermission] = useState<string>('Carregando...');
  const [statusPermission, setStatusPermission] = useState<boolean | null>(null);

  useEffect(() => {
    getPermissoes();

    return () => {
      pararServicoBackground();
    }
  }, []);

  function onPermissionDenied() {
    setTextoPermission('Permissão negada!');
    setStatusPermission(false);
  }

  async function getPermissoes() {
    if (Platform.OS == 'android' && Platform.Version >= 29) {
      const statusPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION);
      if (statusPermission != 'granted' || !statusPermission) {
        Alert.alert('Permissão de localização', 'É necessário conceder permissão ao todo tempo para localização, para o funcionamento correto do aplicativo.', [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => onPermissionDenied(),
          },
          {
            text: 'Configurações',
            onPress: () => Linking.openSettings(),
          },
        ]);
      }
    }
    setTextoPermission("Permissão concedida!");
    setStatusPermission(true);

    await iniciarServicoBackground();

    minhaPosicao();

  }

  const pararServicoBackground = async () => {

    if (Platform.OS == 'android') {
      VIForegroundService.getInstance().stopService().catch((e: any) => console.error(e));
    }

    if (watchId.current != null) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }

  const minhaPosicao = () => {
    watchId.current = Geolocation.watchPosition(
      (position) => {
        // console.log('Posição: ', position);
        setDadosLocal(position);
      },
      (error) => {
        console.log(error);
      },
      {
        accuracy: {
          android: 'high',
          ios: 'best',
        },
        interval: 5000,
        distanceFilter: 5,
        fastestInterval: 300,
        enableHighAccuracy: true,
        showLocationDialog: true,
        useSignificantChanges: true,
        // forceRequestLocation: true,
        showsBackgroundLocationIndicator: true,
      },
    );
  }

  const iniciarServicoBackground = async () => {

    if (parseInt(Platform.Version as string) >= 33) {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    }

    if (parseInt(Platform.Version as string) >= 26) {
      await VIForegroundService.getInstance().createNotificationChannel({
        id: 'channelId',
        name: 'Hello World Channel',
        description: 'Channel Description',
        enableVibration: false,
      });
    }

    return VIForegroundService.getInstance().startService({
      id: 420,
      icon: 'ic_launcher',
      channelId: 'channelId',
      title: 'Sinope',
      text: 'Serviço de localização ativo',
    });
  }

  async function postLocation() {
    try {
      const response = await fetch('https://back-do-app-de-localizacao-em-segundo.onrender.com/registro-passo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: nomeDispositivo ?? "Sem nome",
          latitude: dadosLocal?.coords.latitude.toString(),
          longitude: dadosLocal?.coords.longitude.toString(),
          date: new Date().toDateString(),
        }),
      });
      console.log('Resposta do servidor: ', response.status);

    } catch (error: any) {
      console.error('Error ao enviar localização: ', error);

    }
  }

  useEffect(() => {
    // console.log('Localização: ', dadosLocal);
    postLocation();
    DeviceInfo.getDeviceName().then(name => {
      setNomeDispositivo(name);
    });
  }, [dadosLocal]);

  return (
    <View style={styles.sectionContainer}>
      <Image
        resizeMode='contain'
        style={{ height: 200 }}
        source={require('./assets/img/location.png')}
      />
      <Text style={{ fontSize: 32, color: '#ffd803', fontWeight: 'bold' }}>App Rastreio Sinope</Text>
      <Text style={{ fontSize: 18, textAlign: 'center', color: '#fff', marginTop: 8 }}>Status da permissão:{'\n'}{textoPermission}</Text>
      <Text style={{ fontSize: 16, textAlign: 'center', color: '#fff', marginTop: 8 }}>Obs: para funcionamento você deverá está em movimento</Text>

      <View style={{ backgroundColor: '#ffd803', width: '100%', height: 1, marginVertical: 16 }}></View>

      {dadosLocal?.coords.speed && dadosLocal.coords.speed <= 0 &&
        <Text style={{ fontSize: 18, textAlign: 'center', color: '#ffd803', marginTop: 8 }}>Você está parado, mova-se para obter a localização !!!</Text>
      }

      {!statusPermission &&
        <TouchableOpacity style={{ backgroundColor: '#ffd803', paddingVertical: 14, marginTop: 12, borderRadius: 8, width: '100%', alignItems: 'center', justifyContent: 'center' }} onPress={() => Linking.openSettings()}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#000' }}>Clique aqui para conceder permissão</Text>
        </TouchableOpacity>
      }

      {dadosLocal && dadosLocal.coords.speed > 0 &&
        <View style={{
          borderColor: '#ffd803', borderStyle: 'solid', borderWidth: 3,
          backgroundColor: '#fff', width: '100%', marginTop: 16, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8
        }}>

          <Text style={{ fontSize: 16 }}>
            Hora: {new Date().getHours()}:{new Date().getMinutes()}:{new Date().getSeconds()}
          </Text>
          <Text style={{ fontSize: 16 }}>
            Latitude: {dadosLocal.coords.latitude}
          </Text>
          <Text style={{ fontSize: 16 }}>
            Longitude: {dadosLocal.coords.longitude}
          </Text>
          <Text style={{ fontSize: 16 }}>
            Velocidade: {dadosLocal.coords.speed.toFixed(2)}
          </Text>

        </View>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: '#000',
    justifyContent: 'center',
  },
});

export default App;