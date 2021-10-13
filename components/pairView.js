import {Alert, ImageBackground, StyleSheet, Text, View} from "react-native";
import React, {useContext, useEffect, useState} from "react";
import {Colors} from "react-native-paper";
import {Divider} from "react-native-elements";
import {FloatingAction} from "react-native-floating-action";
import globals from "../globals";
import {MyContext} from "../context"


import Spinner from 'react-native-loading-spinner-overlay';
import DateTimePicker from '@react-native-community/datetimepicker';
import {serverURL} from "../config";


export function pairView({route, navigation}) {
    let {pairItem, pairDateString, canceled, moved} = route.params
    const context = useContext(MyContext)
    const [spinnerVisible, setSpinnerVisible] = useState(false)
    const [isCanceled, setIsCanceled] = useState(canceled)
    const [showDatepicker, setShowDatepicker] = useState(false)
    const [datepickerMode, setDatepickerMode] = useState('date')
    const [scheduleDate, setScheduleDate] = useState(new Date(pairItem.begin_time))

    let pairDate = new Date(pairDateString)
    let pairDateStr = pairDate.getDate() + " " + globals.MONTH_NAMES[pairDate.getMonth()]
    useEffect(() => {
        if (isCanceled) {
            navigation.setOptions({
                headerTintColor: Colors.white,
                title: "Отменена",
                headerStyle: {
                    // backgroundColor: 'rgba(255,78,78,1)',
                    backgroundColor: 'rgb(243,99,99)',
                }, headerTitleStyle: {
                    color: Colors.white
                }
            })
        }
        else if (moved) {
            navigation.setOptions({
                headerTintColor: Colors.white,
                title: "Перенесена",
                headerStyle: {
                    // backgroundColor: 'rgba(255,78,78,1)',
                    backgroundColor: 'rgb(99,169,243)',
                }, headerTitleStyle: {
                    color: Colors.white
                }
            })
        } else {
            navigation.setOptions({
                // title: pairDateStr,
                title: '',
                headerStyle: {
                    backgroundColor: Colors.white
                },
                headerTintColor: Colors.blue600

            })
        }
    })

    async function cancelPair() {
        setSpinnerVisible(true)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)
        console.log(serverURL + 'pairs/cancel')
        let sendDateString = new Date(pairDate.getTime() - (pairDate.getTimezoneOffset() * 60000 ))
            .toISOString()
            .split("T")[0];
        fetch(serverURL + 'pairs/cancel', {
            method: "POST",
            signal: controller.signal,
            headers: globals.getAuthorization(),
            body: JSON.stringify({
                'pair_id': pairItem.id,
                'pair_date': sendDateString
            })
        }).then(result => {
            console.log(result)
                clearTimeout(timeoutId)
                if (!result.ok) {
                    throw result.status
                }
                return result.json()
            }
        ).then(json => {
            console.log(json)
            setIsCanceled(!isCanceled)
            context.fetchPairsData(setSpinnerVisible)
        })
            .catch(e => {
                Alert.alert("Ошибка.", "Произошла ошибка при отмене занятия\n" + e,
                    [{text: "Ок.", onPress: () => console.log("Cancel Pressed")}])
                console.error(e)
                setSpinnerVisible(false)
            })
    }

    async function schedulePairAction() {
        setShowDatepicker(true)

    }

    async function schedulePair(selectedDate) {
        setSpinnerVisible(true)

        let sendDateString = new Date(pairDate.getTime() - (pairDate.getTimezoneOffset() * 60000 ))
            .toISOString()
            .split("T")[0];
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)
        console.log({
            'request_pair_id': pairItem.id,
            'change_date': sendDateString,
            'new_begin_time': selectedDate,
            'new_end_time': new Date(selectedDate.getTime() + (new Date(pairItem.end_time) - new Date(pairItem.begin_time)))
        })
        fetch(serverURL + 'requests/create', {
            method: "POST",
            signal: controller.signal,
            headers: globals.getAuthorization(),
            body: JSON.stringify({
                'request_pair_id': pairItem.id,
                'change_date': sendDateString,
                'new_begin_time': selectedDate,
                'new_end_time': new Date(selectedDate.getTime() + (new Date(pairItem.end_time) - new Date(pairItem.begin_time)))
            })
        }).then(result => {
                console.log(result)
                clearTimeout(timeoutId)
                if (!result.ok) {
                    throw result.status
                }
                return result.json()
            }
        ).then(json => {
            console.log(json)
            setIsCanceled(true)
            context.fetchPairsData(setSpinnerVisible)
        })
            .catch(e => {
                Alert.alert("Ошибка.", "Произошла ошибка при переносе занятия\n" + e,
                    [{text: "Ок.", onPress: () => console.log("Cancel Pressed")}])
                console.error(e)
                setSpinnerVisible(false)
            })
        setSpinnerVisible(false)
    }

    async function onDatepickerChange(event, selectedDate) {
        console.log(event)
        if (event.type === "dismissed") {
            setShowDatepicker(false)
            setDatepickerMode("date")
            return
        }
        setShowDatepicker(false)
        if (datepickerMode === "date") {
            setDatepickerMode("time")
            setShowDatepicker(true)
        } else {
            setScheduleDate(selectedDate);
            setDatepickerMode("date")

            console.log("Selected date")
            console.log(selectedDate)

            return await schedulePair(selectedDate)
        }
        // setShowDatepicker(Platform.OS === 'ios');
    }

    return (
        <View style={styles.container}>
            <View style={styles.pairView}>
                <View style={styles.pairHeader}>
                    <ImageBackground source={require("../assets/copybook_1.jpg")} style={styles.image}>
                        <View style={styles.pairHeaderContainer}>
                            <View style={styles.pairHeaderTimeContainer}>
                                <Text
                                    style={[styles.pairTime, styles.pairHeaderHorizontalMargin]}>{pairItem.begin_clear_time} — {pairItem.end_clear_time}</Text>
                                <Text style={[styles.pairHeaderDate, styles.pairHeaderHorizontalMargin]}>{pairDateStr}</Text>
                            </View>
                            <Text
                                style={[styles.pairHeaderType, styles.pairHeaderMargin]}>{pairItem.group.type.name}</Text>
                            <Text style={[styles.pairHeaderSubject, styles.pairHeaderMargin]}>{pairItem.subject}</Text>
                        </View>
                    </ImageBackground>
                </View>
                <View>
                    <View style={styles.pairDetailsItem}>
                        <Text style={styles.pairDetailsHeader}>Аудитория</Text>
                        <Text
                            style={styles.pairDetailsText}>{
                                pairItem.is_online ? "Дист." :
                                pairItem.auditorium ? pairItem.auditorium.name : "—"
                            }</Text>
                    </View>
                    <Divider/>
                    <View style={styles.pairDetailsItem}>
                        <Text style={styles.pairDetailsHeader}>Преподаватель</Text>
                        <Text style={styles.pairDetailsText}>{pairItem.teacher ? pairItem.teacher.fullname : "—"}</Text>
                    </View>
                    <Divider/>
                    <View style={styles.pairDetailsItem}>
                        <Text style={styles.pairDetailsHeader}>Группа</Text>
                        <Text style={styles.pairDetailsText}>{pairItem.group.name}</Text>
                    </View>
                </View>
            </View>

            {showDatepicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={scheduleDate}
                    mode={datepickerMode}
                    is24Hour={true}
                    display="default"
                    onChange={onDatepickerChange}
                    timeZoneOffsetInMinutes={0}
                />
            )}

            {globals.userData.role === globals.TEACHER_ROLE &&
            <FloatingAction actions={actions}
                            onPressItem={name => {
                                if (name === 'pair_action_cancel') {
                                    return cancelPair()
                                } else if (name === 'pair_action_schedule') {
                                    return schedulePairAction()
                                }
                                setSpinnerVisible(true)
                                console.log(`Pressed ${name}`)
                                setTimeout(() => setSpinnerVisible(false), 4000)
                            }}
                            floatingIcon={require("../assets/edit.png")}
                            iconHeight={20}
                            animated={true}
                            distanceToEdge={{vertical: 30, horizontal: 20}}
                            // showBackground={false}
            />}

            <Spinner visible={spinnerVisible}/>
        </View>
    )
}


const actions = [
    {
        text: "Перенести",
        icon: require("../assets/schedule.png"),
        name: "pair_action_schedule",
        position: 1,
    },
    {
        text: "Отменить",
        icon: require("../assets/cancel.png"),
        name: "pair_action_cancel",
        position: 2,
    },
]

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    pairView: {
        flex: 1,
    },
    pairHeader: {
        height: "40%"
    },
    pairHeaderContainer: {
        marginLeft: "3%",
        padding: 10,
    },
    pairHeaderMargin: {
        margin: 10
    },
    pairHeaderHorizontalMargin: {
        marginHorizontal: 10,
    },
    pairHeaderSubject: {
        color: Colors.white,
        fontWeight: "bold",
        fontSize: 18,
        flexWrap: 'wrap',
        width: "65%",
    },
    pairHeaderType: {
        color: Colors.lightGreen100,
        fontSize: 18,
        fontWeight: "bold",
    },
    image: {
        flex: 1,
        resizeMode: "cover",
        justifyContent: "center"
    },
    pairTime: {
        fontSize: 28,
        fontWeight: "bold",
        color: Colors.white,
        marginTop: 10
    },
    pairHeaderDate: {
        color: Colors.white,
        fontWeight: "bold",
        fontSize: 18,
        flexWrap: 'wrap',
        width: "65%",
        marginBottom: 10,
    },


    pairDetailsItem: {
        margin: 10,
    },
    pairDetailsHeader: {
        margin: 5,
        fontWeight: "bold",
        fontSize: 15,
    },
    pairDetailsText: {
        margin: 5,
    },
})
