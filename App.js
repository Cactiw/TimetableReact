import {StatusBar} from 'expo-status-bar';
import React from 'react';
import {StyleSheet, Text, View, FlatList} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {Divider} from 'react-native-elements';


import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {useEffect, useState} from "react";
import {Colors} from "react-native-paper";

import AsyncStorage from '@react-native-async-storage/async-storage';
import DropShadow from "react-native-drop-shadow";

import {serverURL} from "./config"


function HomeScreen() {
    const [pairsData, setPairsData] = useState([]);

    useEffect(() => {
        loadPairsFromStorage().then(() => {
                console.log("Pairs loaded from device!", pairsData.length)
                fetchPairsData()
            }
        )
    }, []);


    function fetchPairsData() {
        console.log("Fetching pairs data!")
        fetch(serverURL + 'pairs/by_group/3').then(
            (response) => response.json()).then((json) => {
            console.log(json)
            setPairsData(json)
            savePairsToStorage(json).then()
        }).catch((error) => console.error(error))
    }

    async function loadPairsFromStorage() {
        const jsonValue = await AsyncStorage.getItem('pairsData')
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    }

    async function savePairsToStorage(data) {
        try {
            await AsyncStorage.setItem('pairsData', JSON.stringify(data))
        } catch (e) {
            console.error(e)
        }
    }

    function renderPairCell(pairItem) {
        let beginDate = new Date(pairItem.begin_time);
        let endDate = new Date(pairItem.end_time);
        return (
            <DropShadow
                style={{
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: 0,
                    },
                    shadowOpacity: 1,
                    shadowRadius: 3,
                }}
            >
                <View style={styles.pairCell}>
                    <View style={styles.pairLeftContainer}>
                        <Text>{beginDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</Text>
                        <Text>{endDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</Text>
                    </View>
                    <Divider style={styles.pairCellDivider}/>
                    <View style={styles.pairCenterContainer}>
                        <Text style={styles.pairName}>{pairItem.subject}</Text>
                        <Text>{pairItem.teacher.fullname}</Text>
                    </View>
                </View>
            </DropShadow>
        )
    }

    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>Open up App.js to start working on your app!</Text>
            <FlatList
                data={pairsData}
                keyExtractor={({id}, index) => id.toString()}
                renderItem={({item}) => (
                    renderPairCell(item)
                )}
            />
            {/*<StatusBar style="auto"/>*/}
        </View>
    )
}


function DetailScreen() {
    return (
        <View style={styles.container}>
            <Text>This is the details screen</Text>
            {/*<StatusBar style="auto"/>*/}
        </View>
    )
}


const Tab = createMaterialBottomTabNavigator();


function Pair() {

}


export default function App() {
    return (

        <NavigationContainer>
            <Tab.Navigator initialRouteName="Home" screenOptions={{headerShown: false}}>
                <Tab.Screen name="Home" component={HomeScreen}/>
                <Tab.Screen name="Details" component={DetailScreen}/>
            </Tab.Navigator>
            <StatusBar hidden/>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pairCell: {
        // justifyContent: 'center', //Centered vertically
        alignItems: 'center', // Centered horizontally
        // backgroundColor: Colors.red50,
        backgroundColor: Colors.white,
        alignSelf: 'stretch',
        textAlign: 'center',
        flexDirection: 'row',
        margin: 10,
        padding: 10,

        borderRadius: 10,
        borderWidth: 1,

        // https://ethercreative.github.io/react-native-shadow-generator/
    },
    pairLeftContainer: {
        margin: 10
    },
    pairCenterContainer: {},
    pairCellDivider: {
        margin: 10,
        marginLeft: 0,
        width: 1,
        height: '80%',
        backgroundColor: Colors.black
    },
    pairName: {
        fontWeight: 'bold',
        fontSize: 16,
    }
});
