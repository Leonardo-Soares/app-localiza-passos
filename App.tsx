import { useEffect, useRef } from 'react';
import { Linking, PermissionsAndroid, Platform, StyleSheet, View } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import VIForegroundService from '@voximplant/react-native-foreground-service';

function App(): React.JSX.Element {
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    getPermissoes();

    return () => {
      pararServicoBackground();
    }
  }, []);

  async function getPermissoes() {
    if (Platform.OS == 'android' && Platform.Version >= 29) {
      const statusPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION);
      if (statusPermission != 'granted' || !statusPermission) {
        Linking.openSettings();
      } else {
        console.log("Permissão concedida!");
      }
    } else {
      console.log("Permissão concedida!");
    }
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
        console.log("Atual location", position);
      },
      (error) => {
        console.log(error);
      },
      {
        accuracy: {
          android: 'high',
          ios: 'best',
        },
        enableHighAccuracy: true,
        distanceFilter: 5,
        interval: 5000,
        fastestInterval: 300,
        // forceRequestLocation: true,
        showLocationDialog: true,
        useSignificantChanges: true,
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
      title: 'Foreground Service',
      text: 'Foreground service is running',
    });
  }

  return (
    <View>

    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
});

export default App;