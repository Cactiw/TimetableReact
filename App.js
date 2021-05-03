import {StatusBar} from 'expo-status-bar';
import React, {memo, useCallback, useMemo} from 'react';
import {StyleSheet, Text, View, FlatList, Button, Image, Pressable} from 'react-native';
import {NavigationContainer, useRoute, useNavigation} from '@react-navigation/native';
import {Divider} from 'react-native-elements';
import SwipeRender from "react-native-swipe-render";


import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {enableScreens} from 'react-native-screens';
import {createNativeStackNavigator} from 'react-native-screens/native-stack';
import {useEffect, useState} from "react";
import {Colors, IconButton, Snackbar, TouchableRipple} from "react-native-paper";
import { useBackHandler } from '@react-native-community/hooks'

import AsyncStorage from '@react-native-async-storage/async-storage';
import DropShadow from "react-native-drop-shadow";

import {serverURL} from "./config"

import {globalStyles} from "./styles/global"
import {pairView} from "./components/pairView"
import {CheckLogin} from "./components/login"
import globals from "./globals";
import FlashMessage from "react-native-flash-message";
import EncryptedStorage from "react-native-encrypted-storage";
import PairScrollView from "./components/views/PairScrollView";

enableScreens()


Date.prototype.addDays = function (days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}


const HomeScreen = memo(function HomeScreen(props) {
    const navigation = props.navigation;

    const [pairsData, setPairsData] = useState({});
    const [weeksText, setWeeksText] = useState("И снова третье сентября");
    const [currentMonday, setCurrentMonday] = useState(getMonday(new Date()));
    const [snackBarVisible, setSnackBarVisible] = useState(false);
    const [snackBarText, setSnackBarText] = useState("");
    const [pairsRefreshing, setPairsRefreshing] = useState(false);

    useEffect(() => {
        // clearNavigationHistory()

        loadPairsFromStorage().then(() => {
            console.log("Pairs loaded from device!", pairsData.length)
            fetchPairsData()
            }
        )
        updateWeekText()
    }, []);

    useBackHandler(() => {
        if (!navigation.isFocused()) {
            return false;
        }
        return true;
    })


    function fetchPairsData(setRefresh) {
        if (setRefresh) {
            setPairsRefreshing(true)
        }
        console.log("Fetching pairs data!")
        fetch(serverURL + 'pairs/timetable', {
            headers: {
                'Authorization': 'Bearer ' + globals.authToken
            }
        }).then(
            (response) => {
                if (response.ok) {
                    return response.json()
                } else {
                    if (response.status === 401) {
                        return logout(navigation)
                    }
                    throw new Error();
                }
            }).then((json) => {
                if (!json) {
                    return
                }
                console.log(json)
                let pairsByDayData = {}
                for (let dayIndex in globals.daysOfWeek) {
                    pairsByDayData[dayIndex] = json.filter(pair => pair["day_of_week"].toString() === dayIndex.toString()).sort(
                        (p1, p2) => p1.begin_clear_time > p2.begin_clear_time
                    )
                }
            setPairsData(pairsByDayData)
            setSnackBarText("Расписание обновлено!")
            setSnackBarVisible(true)
            savePairsToStorage(pairsByDayData).then()
        }).catch((error) => {
            setSnackBarText("Ошибка при обновлении расписания")
            setSnackBarVisible(true)
            console.error(error)
        }).finally( () => {
                setPairsRefreshing(false)
            }
        )
    }

    function snackBarDismiss() {
        setSnackBarVisible(false);
    }

    async function loadPairsFromStorage() {
        let jsonValue = await AsyncStorage.getItem('pairsData')
        if (jsonValue != null) {
            setPairsData(JSON.parse(jsonValue))
        }
    }

    async function savePairsToStorage(data) {
        try {
            await AsyncStorage.setItem('pairsData', JSON.stringify(data))
        } catch (e) {
            console.error(e)
        }
    }

    function getMonday(d) {
        d = new Date(d);
        let day = d.getDay(),
            diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    }

    function updateWeekText() {
        console.log(currentMonday)
        let endWeek = currentMonday.addDays(6)
        setWeeksText(currentMonday.getDate() + " " + globals.MONTH_NAMES[currentMonday.getMonth()] + "  —  " +
            endWeek.getDate() + " " + globals.MONTH_NAMES[endWeek.getMonth()])
    }

    useEffect(() => updateWeekText(), [currentMonday])

    async function weekLeftArrowClicked() {
        await setCurrentMonday(currentMonday.addDays(-7))
    }

    async function weekRightArrowClicked() {
        await setCurrentMonday(currentMonday.addDays(7))
    }

    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <View style={[globalStyles.horizontalContainer, globalStyles.marginTop5]}>
                <IconButton icon={require("./assets/back_arrow.png")} onPress={weekLeftArrowClicked}/>
                <Text style={styles.weekInfoText}>{weeksText}</Text>
                <IconButton icon={require("./assets/forward_arrow.png")} onPress={weekRightArrowClicked}/>
            </View>
            <PairScrollView pairsData={pairsData} currentMonday={currentMonday} fetchPairsData={fetchPairsData}
            pairsRefreshing={pairsRefreshing}/>
            <Snackbar duration={5000} visible={snackBarVisible} style={styles.snackBarContainer}
                      wrapperStyle={styles.snackBarWrapper} theme={{colors: {surface : Colors.black}}}
                      onDismiss={snackBarDismiss}>{snackBarText}</Snackbar>
            <StatusBar style="auto"/>
        </View>
    )
})

async function logout(navigation) {
    globals.authToken = null;
    globals.userData = null;

    await EncryptedStorage.clear()
    navigation.navigate("Login")
}

function DetailScreen() {
    return (
        <View style={styles.container}>
            <Text>This is the details screen</Text>
            {/*<StatusBar style="auto"/>*/}
        </View>
    )
}


function AppWithTab() {
    return (
        <Tab.Navigator initialRouteName="Home" screenOptions={{headerShown: false}}>
            <Tab.Screen name="Home" component={HomeWithHeader}/>
            <Tab.Screen name="Details" component={DetailScreen}/>
        </Tab.Navigator>
    )
}


export function CheckLoginScreen() {
    return (
        <LoginStack.Navigator screenOptions={{headerShown: false}}>
            <LoginStack.Screen name={"Login"}>
                {props => <CheckLogin {...props}/>}
            </LoginStack.Screen>
            <LoginStack.Screen name={"AppWithTab"} component={AppWithTab}/>
        </LoginStack.Navigator>
    )
}


const Tab = createMaterialBottomTabNavigator();
const Stack = createNativeStackNavigator();
const LoginStack = createNativeStackNavigator();


function HomeHeader() {
    return (
        <View>
            <Text style={styles.header}>Расписание</Text>
        </View>
    )
}

function HomeSettings() {
    const navigation = useNavigation()

    return (
        <View>
            <IconButton icon={require("./assets/settings.png")} onPress={() => logout(navigation)}/>
        </View>
    )
}

function HomeWithHeader() {
    return (
        <Stack.Navigator mode={"modal"}>
            <Stack.Screen name="Home" options={{headerLeft: ()=> null, headerCenter: HomeHeader,
                headerRight: HomeSettings}}>
                {props => <HomeScreen {...props}/>}
            </Stack.Screen>
            <Stack.Screen name={"PairView"} component={pairView}/>
        </Stack.Navigator>
    )
}


export default function App() {
    return (
        <NavigationContainer>
            <CheckLoginScreen/>
            <StatusBar hidden/>
            <FlashMessage position={"top"}/>
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
    snackBarWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    snackBarContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.grey300,
        width: "75%"
    },
    header: {
        fontWeight: 'bold',
        fontSize: 18
    },
    weekInfoText: {
        fontSize: 16,
        minWidth: 225,
        textAlign: 'center'
    },

});
