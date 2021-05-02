import {StatusBar} from 'expo-status-bar';
import React from 'react';
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

enableScreens()


const MONTH_NAMES = [
    "января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"
]
const DAY_NAMES = [
    "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"
]

Date.prototype.addDays = function (days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}


function HomeScreen(props) {
    const navigation = props.navigation;

    let [pairsData, setPairsData] = useState({});
    let [pairsRefreshing, setPairsRefreshing] = useState(false);
    const [weeksText, setWeeksText] = useState("И снова третье сентября");
    const [currentMonday, setCurrentMonday] = useState(getMonday(new Date()));
    const [snackBarVisible, setSnackBarVisible] = useState(false);
    const [snackBarText, setSnackBarText] = useState("");

    const daysOfWeek = [
        0, 1, 2, 3, 4, 5
    ]

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


    function fetchPairsData() {
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
                for (let dayIndex in daysOfWeek) {
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

    function onPairCellPress(event, item) {
        const pairDate = currentMonday.addDays(item["day_of_week"])
        navigation.navigate('PairView', {
            pairItem: item,
            pairDate: pairDate.getDate() + " " + MONTH_NAMES[pairDate.getMonth()]
        })
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
                    shadowOpacity: 0,
                    shadowRadius: 2,
                }}
            >
                <TouchableRipple borderless={true} onPress={e => onPairCellPress(e, pairItem)} >
                    <View style={styles.pairCell}>
                        <View style={styles.pairLeftContainer}>
                            <Text>{pairItem.begin_clear_time}</Text>
                            <Text>{pairItem.end_clear_time}</Text>
                        </View>
                        <Divider style={styles.pairCellDivider}/>
                        <View style={styles.pairCenterContainer}>
                            <Text style={styles.pairName}>{pairItem.subject}</Text>
                            {pairItem.teacher && <Text>{pairItem.teacher ? pairItem.teacher.fullname : ""}</Text>}
                        </View>
                        <View>
                            {pairItem.auditorium && <Text>{pairItem.auditorium ? pairItem.auditorium.name : ""}</Text>}
                        </View>
                    </View>
                </TouchableRipple>
            </DropShadow>
        )
    }

    function renderPairsPane({item, index}) {
        return (
            <View style={styles.pairsPane}>
                <View style={styles.dayNameCell}>
                    <Text style={styles.dayNameHeader}>{DAY_NAMES[item]}</Text>
                </View>
                <FlatList
                    data={pairsData[item]}
                    keyExtractor={({id}, index) => id.toString()}
                    renderItem={({item}) => (
                        renderPairCell(item)
                    )}
                    onRefresh={ () => {
                        setPairsRefreshing(true)
                        fetchPairsData()
                    }}
                    refreshing={pairsRefreshing}
                />
            </View>
        )
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
        setWeeksText(currentMonday.getDate() + " " + MONTH_NAMES[currentMonday.getMonth()] + "  —  " +
            endWeek.getDate() + " " + MONTH_NAMES[endWeek.getMonth()])
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
            <SwipeRender data={daysOfWeek} extraData={pairsData} renderItem={renderPairsPane} loop={true} horizontal={true}
                         removeClippedSubviews={false}>
            </SwipeRender>
            <Snackbar duration={5000} visible={snackBarVisible} style={styles.snackBarContainer}
                      wrapperStyle={styles.snackBarWrapper} theme={{colors: {surface : Colors.black}}}
                      onDismiss={snackBarDismiss}>{snackBarText}</Snackbar>
            <StatusBar style="auto"/>
        </View>
    )
}

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
        fontSize: 16
    },
    dayNameCell: {
        justifyContent: 'center', //Centered vertically
        alignItems: 'center', // Centered horizontally
        // backgroundColor: Colors.red50,
        backgroundColor: Colors.grey200,
        alignSelf: 'stretch',
        textAlign: 'center',
        flexDirection: 'row',
        // margin: 10,
        padding: 10,

        // borderRadius: 10,
        // borderWidth: 1,
    },
    dayNameHeader: {
        fontWeight: "bold",
        fontSize: 16,
    },

    pairsPane: {
        // width: "85%",
        // flex: 0.5,
        marginTop: "5%",
        marginBottom: 0,
        marginLeft: "10%",
        marginRight: "10%",
        // alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'stretch',
        textAlign: 'center',
        flexDirection: 'column',

        borderRadius: 10,
        borderWidth: 1,
        overflow: 'hidden',
    },
    pairCell: {
        // justifyContent: 'center', //Centered vertically
        alignItems: 'center', // Centered horizontally
        // backgroundColor: Colors.red50,
        backgroundColor: Colors.white,
        alignSelf: 'stretch',
        textAlign: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        margin: 0.5,
        padding: 10,

        // borderRadius: 10,
        // borderWidth: 1,

        // https://ethercreative.github.io/react-native-shadow-generator/
    },
    pairLeftContainer: {
        margin: 10
    },
    centerText: {
        textAlign: 'center',
    },
    pairCenterContainer: {
        justifyContent: 'center',
        textAlign: 'center',
        flex: 1,
    },
    pairCellDivider: {
        margin: 10,
        marginLeft: 0,
        width: 1,
        height: '80%',
        backgroundColor: Colors.black,
    },
    pairName: {
        fontWeight: 'bold',
        fontSize: 16,
        // textAlign: 'center',
    }
});
