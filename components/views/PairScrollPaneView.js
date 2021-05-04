import {FlatList, Text, View, StyleSheet} from "react-native";
import React, {useState} from "react";
import globals from "../../globals";
import {Colors, TouchableRipple} from "react-native-paper";
import DropShadow from "react-native-drop-shadow";
import {Divider} from "react-native-elements";
import {useNavigation} from "@react-navigation/native";


export default React.memo(({item, index, pairsData, startOffset, modOffset, currentMonday, fetchPairsData,
                           pairsRefreshing}) => {
    console.log("Rendering pane", index)
    let changeDays = (item - startOffset)
    const today = new Date()
    let currentDay = today.addDays(changeDays).addDays(-(today.getDay() - 1))
    let dayOfWeek = (changeDays + modOffset) % globals.daysOfWeek.length

    const navigation = useNavigation()

    function onPairCellPress(event, item) {
        const pairDate = currentMonday.addDays(item["day_of_week"])
        navigation.navigate('PairView', {
            pairItem: item,
            pairDate: pairDate.getDate() + " " + globals.MONTH_NAMES[pairDate.getMonth()]
        })
    }


    function renderPairCell(pairItem, index) {
        console.log("Rendering pair!", index)
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


    return (
        <View style={styles.pairsPane}>
            <View style={styles.dayNameCell}>
                <Text style={styles.dayNameHeader}>{
                    `${globals.DAY_NAMES[dayOfWeek]}, ${currentDay.getDate()} ${globals.MONTH_NAMES[currentDay.getMonth()]}`}</Text>
            </View>
            <FlatList
                data={pairsData[dayOfWeek]}
                keyExtractor={({id}, index) => id.toString()}
                renderItem={({item}) => (
                    renderPairCell(item, index)
                )}
                onRefresh={ () => {
                    fetchPairsData()
                }}
                refreshing={pairsRefreshing}
            />
        </View>
    )
})

const styles = StyleSheet.create({
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
})