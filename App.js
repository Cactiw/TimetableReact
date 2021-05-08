/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {createRef, memo, useCallback, useContext, useMemo, useRef} from 'react';
import {StyleSheet, Text, View, FlatList, Button, Image, Pressable, StatusBar} from 'react-native';
import {NavigationContainer, useRoute, useNavigation} from '@react-navigation/native';
import {Divider} from 'react-native-elements';
import SwipeRender from "react-native-swipe-render";


import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {enableScreens} from 'react-native-screens';
import {createNativeStackNavigator} from 'react-native-screens/native-stack';
import {useEffect, useState} from "react";
import {Colors, IconButton, Snackbar, TouchableRipple} from "react-native-paper";
import {useBackHandler} from '@react-native-community/hooks'

import AsyncStorage from '@react-native-async-storage/async-storage';
import DropShadow from "react-native-drop-shadow";

import {serverURL} from "./config"

import {globalStyles} from "./styles/global"
import {pairView} from "./components/pairView"
import {CheckLogin} from "./components/login"
import globals from "./globals";
import {MyContext} from "./context"
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
    const [currentMonday, setCurrentMonday] = useState(globals.getMonday(new Date()));
    const [snackBarVisible, setSnackBarVisible] = useState(false);
    const [snackBarText, setSnackBarText] = useState("");
    let context = useContext(MyContext)

    console.log("Rendering HomeScreen!", currentMonday)

    const pairsSwiperRef = useRef()

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

    async function onCurrentMondayChanged(value) {
        await setCurrentMonday(value)
    }


    function fetchPairsData(setRefresh) {
        if (setRefresh) {
            setRefresh(true)
        }
        console.log("Fetching pairs data!")
        fetch(serverURL + 'pairs/timetable', {
            headers: globals.getAuthorization()
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
        }).finally(() => {
                if (setRefresh) {
                    setRefresh(false)
                }
            }
        )
    }

    if (!context["fetchPairsData"]) {
        context["fetchPairsData"] = fetchPairsData
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

    function updateWeekText() {
        console.log(currentMonday)
        let endWeek = currentMonday.addDays(6)
        setWeeksText(currentMonday.getDate() + " " + globals.MONTH_NAMES[currentMonday.getMonth()] + "  —  " +
            endWeek.getDate() + " " + globals.MONTH_NAMES[endWeek.getMonth()])
    }

    useEffect(() => updateWeekText(), [currentMonday])

    async function weekLeftArrowClicked() {
        // await setCurrentMonday(currentMonday.addDays(-7))
        pairsSwiperRef.current.scrollBy(-7, true)
    }

    async function weekRightArrowClicked() {
        // await setCurrentMonday(currentMonday.addDays(7))
        pairsSwiperRef.current.scrollBy(7, true)
    }

    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <View style={[globalStyles.horizontalContainer, globalStyles.marginTop5]}>
                <IconButton icon={require("./assets/back_arrow.png")} onPress={weekLeftArrowClicked}/>
                <Text style={styles.weekInfoText}>{weeksText}</Text>
                <IconButton icon={require("./assets/forward_arrow.png")} onPress={weekRightArrowClicked}/>
            </View>
            <PairScrollView pairsData={pairsData} currentMonday={currentMonday}
                            onCurrentMondayChanged={onCurrentMondayChanged}
                            pairsSwiperRef={pairsSwiperRef}/>
            <Snackbar duration={5000} visible={snackBarVisible} style={styles.snackBarContainer}
                      wrapperStyle={styles.snackBarWrapper} theme={{colors: {surface: Colors.black}}}
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
        <Tab.Navigator barStyle={globalStyles.backgroundDark} initialRouteName="MainScreen"
                       screenOptions={{headerShown: false}}>
            <Tab.Screen name="MainScreen" component={HomeWithHeader} options={{
                tabBarLabel: "Расписание",
                tabBarIcon: ({tintColor}) => (
                    <Image source={require('./assets/classes.png')} height={"1"}/>
                )

            }}/>
            <Tab.Screen name="Details" component={DetailScreen} options={{
                tabBarLabel: "Профиль",
                tabBarIcon: ({tintColor}) => (
                    <Image source={require('./assets/profile.png')} resizeMode={"stretch"} width={"5%"}/>
                )
            }}/>
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
            <Stack.Screen name="Home" options={{
                headerLeft: () => null, headerCenter: HomeHeader,
                headerRight: HomeSettings
            }}>
                {props => <HomeScreen {...props}/>}
            </Stack.Screen>
            <Stack.Screen name={"PairView"} component={pairView}/>
        </Stack.Navigator>
    )
}


export default function App() {
    return (
        <NavigationContainer>
            <MyContext.Provider value={{}}>
                <CheckLoginScreen/>
                <StatusBar hidden/>
                <FlashMessage position={"top"}/>
            </MyContext.Provider>
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

