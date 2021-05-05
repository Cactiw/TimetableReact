import DropShadow from "react-native-drop-shadow";
import {Colors, TouchableRipple} from "react-native-paper";
import {StyleSheet, Text, View} from "react-native";
import {Divider} from "react-native-elements";
import React from "react";

let _ = require('lodash');


export default React.memo(({pairItem, index}) => {
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
}, (oldState, newState) => {
    return _.isEqual(oldState.pairItem, newState.pairItem)
})


const styles = StyleSheet.create({
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
