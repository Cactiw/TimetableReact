import {FlatList, Text, View, StyleSheet} from "react-native";
import React, {useState} from "react";
import globals from "../../globals";
import {Colors, TouchableRipple} from "react-native-paper";
import DropShadow from "react-native-drop-shadow";
import {Divider} from "react-native-elements";
import {useNavigation} from "@react-navigation/native";
import PairScrollCellView from "./PairScrollCellView";



export default React.memo(({item, index, pairsData, startOffset, modOffset, currentMonday,
                               fetchPairsData, pairsRefreshing}) => {
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
                    <PairScrollCellView pairItem={item} index={index} currentDay={currentDay}/>
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
        // backgroundColor: Colors.grey200,
        // backgroundColor: "#3d4058",
        backgroundColor: "rgba(76,81,126,1)",
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
        color: Colors.white
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
    }
})