import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
	// Configuración de canal para Android
	if (Platform.OS === 'android') {
			await Notifications.setNotificationChannelAsync('default', {
			name: 'default',
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: '#FF231F7C',
			});
	}

	const { status: existingStatus } = await Notifications.getPermissionsAsync();
	let finalStatus = existingStatus;

	if (existingStatus !== 'granted') {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
	}

	if (finalStatus !== 'granted') {
			alert('Failed to get push token for push notification!');
			return;
	}

	const projectId = Constants.expoConfig.extra.eas.projectId || '1c927184-81c7-4520-b34f-5c4ac8168f00';

	try {
			const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
			return token;
	} catch (error) {
			console.error('Error obteniendo el token:', error);
			alert('Error al obtener el token de notificación.');
			return null;
	}
}

export { registerForPushNotificationsAsync };