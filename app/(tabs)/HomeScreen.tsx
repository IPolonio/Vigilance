import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Alert } from 'react-native';
import { setupDatabaseAsync, getIncidentsAsync, incident, deleteallincidentsAsync } from '@/source';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/.expo/types/App';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const [incidents, setIncidents] = useState<incident[]>([]);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  useEffect(() => {
    (async () => {
      await setupDatabaseAsync();
      loadIncidents();
    })();
  }, []);

  const loadIncidents = async () => {
    const data = await getIncidentsAsync();
    setIncidents(data);
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Confirmación',
      '¿Estás seguro de que deseas eliminar todos los registros?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', onPress: async () => {
          await deleteallincidentsAsync();
          setIncidents([]);
        }}
      ]
    );
  };

  return (
    <View>
      <FlatList
        data={incidents}
        keyExtractor={item => item.id?.toString() || ''}
        renderItem={({ item }) => (
          <Text onPress={() => navigation.navigate('IncidentDetail', { incident: item })}>
            {item.title}
          </Text>
        )}
      />
       <Button title="Agregar Incidente" onPress={() => navigation.navigate('IncidentDetail', { incident: undefined })} />
      <Button title="Eliminar Todos los Registros" onPress={handleDeleteAll} />
    </View>
  );
};

export default HomeScreen;
