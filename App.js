import {StatusBar} from 'expo-status-bar';
import React from 'react';
import {StyleSheet, Text, View, FlatList, Button, Image} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {Divider} from 'react-native-elements';
import SwipeRender from "react-native-swipe-render";


import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {useEffect, useState} from "react";
import {Colors, IconButton} from "react-native-paper";

import AsyncStorage from '@react-native-async-storage/async-storage';
import DropShadow from "react-native-drop-shadow";

import {serverURL} from "./config"


const MONTH_NAMES = [
    "января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"
]
const DAY_NAMES = [
    "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"
]

Date.prototype.addDays = function (days) {
    let date = new Date(this.valueOf());
    console.log(days)
    date.setDate(date.getDate() + days);
    console.log("Returned " + date.toDateString())
    return date;
}


function HomeScreen() {
    const [pairsData, setPairsData] = useState({});
    const [weeksText, setWeeksText] = useState("И снова третье сентября");
    const [currentMonday, setCurrentMonday] = useState(getMonday(new Date()));

    const daysOfWeek = [
        0, 1, 2, 3, 4, 5
    ]

    useEffect(() => {
        loadPairsFromStorage().then(() => {
                console.log("Pairs loaded from device!", pairsData.length)
                fetchPairsData()
            }
        )
        updateWeekText()
    }, []);


    function fetchPairsData() {
        console.log("Fetching pairs data!")
        fetch(serverURL + 'pairs/by_group/47').then(
            (response) => response.json()).then((json) => {
            console.log(json)
            let pairsByDayData = {}
            for (let dayIndex in daysOfWeek) {
                pairsByDayData[dayIndex] = json.filter(pair => pair["day_of_week"].toString() === dayIndex.toString())
            }
            setPairsData(pairsByDayData)
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
                    shadowRadius: 2,
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
            <View style={[styles.horizontalContainer, styles.marginTop5]}>
                <IconButton icon={require("./assets/back_arrow.png")} onPress={weekLeftArrowClicked}/>
                <Text style={styles.weekInfoText}>{weeksText}</Text>
                <IconButton icon={require("./assets/forward_arrow.png")} onPress={weekRightArrowClicked}/>
            </View>
            <SwipeRender data={daysOfWeek} renderItem={renderPairsPane} loop={true} horizontal={true}
                         removeClippedSubviews={false}>
            </SwipeRender>
            <StatusBar style="auto"/>
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
const Stack = createStackNavigator();


function HomeHeader() {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Расписание</Text>
        </View>
    )
}

function HomeWithHeader() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen}
                          options={{headerTitle: props => <HomeHeader {...props} />}}/>
        </Stack.Navigator>
    )
}


export default function App() {
    return (

        <NavigationContainer>
            <Tab.Navigator initialRouteName="Home" screenOptions={{headerShown: false}}>
                <Tab.Screen name="Home" component={HomeWithHeader}/>
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

        borderRadius: 10,
        borderWidth: 1,
    },
    dayNameHeader: {
        fontWeight: "bold",
        fontSize: 16,
    },
    horizontalContainer: {
        justifyContent: 'center',
        alignItems: 'center', // Centered horizontally
        alignSelf: 'stretch',
        textAlign: 'center',
        flexDirection: 'row'
    },
    marginTop5: {
        marginTop: "5%"
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
        flexDirection: 'column'
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
        // width: "match_parent",
        // width: "88%",

        borderRadius: 10,
        borderWidth: 1,

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
