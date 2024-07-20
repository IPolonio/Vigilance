import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { insertIncidentAsync } from '@/source';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@/.expo/types/App';

// Definir el tipo Incident
interface Incident {
  title: string;
  date: string;
  description: string;
  photoUrl: string | null;
  audioUrl: string | null;
}

type Props = StackScreenProps<RootStackParamList, 'IncidentDetail'>;

const IncidentDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  // Asegurarse de que route.params esté definido y tipado como Incident
  const { incident } = route.params as { incident?: Incident };

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [title, setTitle] = useState(incident?.title || '');
  const [date, setDate] = useState(incident?.date || '');
  const [description, setDescription] = useState(incident?.description || '');
  const [photoUri, setPhotoUri] = useState(incident?.photoUrl || null);
  const [audioUri, setAudioUri] = useState(incident?.audioUrl || null);

  useEffect(() => {
    if (incident) {
      setTitle(incident.title || '');
      setDate(incident.date || '');
      setDescription(incident.description || '');
      setPhotoUri(incident.photoUrl || null);
      setAudioUri(incident.audioUrl || null);
    }
  }, [incident]);

  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const startRecording = async () => {
    if (permissionResponse && permissionResponse.status !== 'granted') {
      console.log('Requesting permission..');
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permiso denegado', 'Se requiere permiso para acceder al micrófono');
        return;
      }
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) {
      Alert.alert('Error', 'No hay grabación en curso');
      return;
    }

    try {
      console.log('Stopping recording..');
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      setRecording(null);
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      console.log('Recording stopped and stored at', uri);
    } catch (error) {
      console.error('Error al detener la grabación', error);
    }
  };

  const recordAudio = async () => {
    if (recording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const saveIncident = async () => {
    if (!title || !date || !description || !photoUri || !audioUri) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    try {
      const insertId = await insertIncidentAsync(title, date, description, photoUri, audioUri);
      Alert.alert('Incidente guardado', `ID: ${insertId}`);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el incidente');
      console.error(error);
    }
  };

  return (
    <View>
      <TextInput placeholder="Título" value={title} onChangeText={setTitle} />
      <TextInput placeholder="Fecha" value={date} onChangeText={setDate} />
      <TextInput placeholder="Descripción" value={description} onChangeText={setDescription} />
      <Button title="Tomar Foto" onPress={pickImage} />
      {photoUri && <Image source={{ uri: photoUri }} style={{ width: 200, height: 200 }} />}
      <Button
        title={recording ? "Detener Grabación" : "Grabar Audio"}
        onPress={recordAudio}
      />
      <Button title="Guardar Incidente" onPress={saveIncident} />
    </View>
  );
};

export default IncidentDetailScreen;
