import {StyleSheet, Text, View} from "react-native";
import React from "react";
import Colors from "react-native/Libraries/NewAppScreen/components/Colors";


export function pairView({ route, navigation }) {
    const {pairItem, pairDate} = route.params
    return (
        <View>
            <View style={styles.pairHeader}>
                <Text style={styles.pairTime}>{pairItem.begin_clear_time} — {pairItem.end_clear_time}</Text>
                <Text>Занятие</Text>
                <Text>{pairItem.subject}</Text>
            </View>
            <View>
                <View>
                    <Text>Аудитория</Text>
                    <Text>{pairItem.auditorium.name}</Text>
                </View>
                <View>
                    <Text>Преподаватель</Text>
                    <Text>{pairItem.teacher.fullname}</Text>
                </View>
                <View>
                    <Text>Группа</Text>
                    {/*<Text>{pairItem.group.name}</Text>*/}
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    pairHeader: {
        backgroundColor: "#140024",
    },
    pairTime: {
        fontSize: 17,
        fontWeight: "bold",
        color: Colors.white,
    }
})
