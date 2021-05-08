import {ImageBackground, StyleSheet, Text, View} from "react-native";
import React, {useEffect} from "react";
import {Colors} from "react-native-paper";
import {Divider} from "react-native-elements";
import {FloatingAction} from "react-native-floating-action";
import globals from "../globals";


export function pairView({route, navigation}) {
    const {pairItem, pairDate, canceled, moved} = route.params
    useEffect(() => {
        if (canceled) {
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
                // title: pairDate,
                title: '',

            })
        }
    })

    return (
        <View style={styles.container}>
            <View style={styles.pairView}>
                <View style={styles.pairHeader}>
                    <ImageBackground source={require("../assets/copybook_1.jpg")} style={styles.image}>
                        <View style={styles.pairHeaderContainer}>
                            <View style={styles.pairHeaderTimeContainer}>
                                <Text
                                    style={[styles.pairTime, styles.pairHeaderHorizontalMargin]}>{pairItem.begin_clear_time} — {pairItem.end_clear_time}</Text>
                                <Text style={[styles.pairHeaderDate, styles.pairHeaderHorizontalMargin]}>{pairDate}</Text>
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
                            style={styles.pairDetailsText}>{pairItem.auditorium ? pairItem.auditorium.name : "—"}</Text>
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

            {globals.userData.role === globals.TEACHER_ROLE && <FloatingAction actions={actions}
                            onPressItem={name => {
                                console.log(`Pressed ${name}`)
                            }}
                            floatingIcon={require("../assets/edit.png")}
                            iconHeight={20}
                            animated={true}
                            distanceToEdge={{vertical: 30, horizontal: 20}}
                            // showBackground={false}
            />}
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
