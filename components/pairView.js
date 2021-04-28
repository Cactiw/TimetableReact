import {ImageBackground, StyleSheet, Text, View} from "react-native";
import React from "react";
import {Colors} from "react-native-paper";
import {Divider} from "react-native-elements";


export function pairView({route, navigation}) {
    const {pairItem, pairDate} = route.params
    return (
        <View>
            <View style={styles.pairHeader}>
                <ImageBackground source={require("../assets/copybook_1.jpg")} style={styles.image}>
                    <View style={styles.pairHeaderContainer}>
                        <Text style={[styles.pairTime, styles.pairHeaderMargin]}>{pairItem.begin_clear_time} — {pairItem.end_clear_time}</Text>
                        <Text style={[styles.pairHeaderType, styles.pairHeaderMargin]}>{pairItem.group.type.name}</Text>
                        <Text style={[styles.pairHeaderSubject, styles.pairHeaderMargin]}>{pairItem.subject}</Text>
                    </View>
                </ImageBackground>
            </View>
            <View>
                <View style={styles.pairDetailsItem}>
                    <Text style={styles.pairDetailsHeader}>Аудитория</Text>
                    <Text style={styles.pairDetailsText}>{pairItem.auditorium ? pairItem.auditorium.name : ""}</Text>
                </View>
                <Divider/>
                <View style={styles.pairDetailsItem}>
                    <Text style={styles.pairDetailsHeader}>Преподаватель</Text>
                    <Text style={styles.pairDetailsText}>{pairItem.teacher ? pairItem.teacher.fullname : ""}</Text>
                </View>
                <Divider/>
                <View style={styles.pairDetailsItem}>
                    <Text style={styles.pairDetailsHeader}>Группа</Text>
                    <Text style={styles.pairDetailsText}>{pairItem.group.name}</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    pairHeader: {
        height: "50%"
    },
    pairHeaderContainer: {
        marginLeft: "3%",
        padding: 10,
    },
    pairHeaderMargin: {
        margin: 10
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
