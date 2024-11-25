import React, {useState, useEffect} from 'react';
import {
  
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {login, fetchGroceryList} from './src/services/apiservices'; // Import your API utility functions

const App = (): React.JSX.Element => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [groceryList, setGroceryList] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check for stored token on app load
    const checkToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        fetchList(storedToken);
      }
    };
    checkToken();
  }, []);
 //update2
 //
  const handleLogin = async () => {
    try {
      setError('');
      const userToken = await login(username, password);
      setToken(userToken);
      await AsyncStorage.setItem('token', userToken); // Store the token
      fetchList(userToken);
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  const fetchList = async (userToken: string) => {
    try {
      const list = await fetchGroceryList(userToken);
      setGroceryList(list);
    } catch (err) {
      setError('Failed to fetch grocery list');
    }
  };

  const handleLogout = async () => {
    setToken('');
    setGroceryList([]);
    await AsyncStorage.removeItem('token');
  };

  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Your Grocery List</Text>
      <FlatList
        data={groceryList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <View style={styles.listItem}>
            <Text style={styles.listText}>{item}</Text>
          </View>
        )}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  listItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  listText: {
    fontSize: 16,
  },
});

export default App;
