import DropShadow from "react-native-drop-shadow";
import {Colors, TouchableRipple} from "react-native-paper";
import {StyleSheet, Text, View} from "react-native";
import {Divider} from "react-native-elements";
import React from "react";

let _ = require('lodash');

const _MS_PER_DAY = 1000 * 60 * 60 * 24;

// a and b are javascript Date objects
function dateDiffInDays(a, b) {
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

export default React.memo(({pairItem, index, currentDay}) => {
    console.log("Rendering pair!", index)
    let beginDate = new Date(pairItem.begin_time);
    let endDate = new Date(pairItem.end_time);
    let changes = pairItem.changes
    let currentChanges = [null]
    if (changes) {
        currentChanges = changes.filter(changeItem => {
            const dif = dateDiffInDays(new Date(changeItem["change_date"]), currentDay)
            return Math.abs(dif) < 2
        })
    }

    function pairStyle() {
        let res = [
            styles.pairCellDivider
        ]
        if (currentChanges.length > 0) {
            let change = currentChanges[currentChanges.length - 1]
            if (change["is_canceled"]) {
                res.push(styles.red)
            }
        } else {
            res.push(styles.black)
        }
        return res
    }

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
                    <Divider style={pairStyle()}/>
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
    return _.isEqual(oldState.pairItem, newState.pairItem) && oldState.currentDay === newState.currentDay
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
        width: 3,
        height: '80%',
    },
    black: {
        backgroundColor: Colors.grey400,
    },
    red: {
        // backgroundColor: 'rgba(255, 0, 102, 1)'
        backgroundColor: 'rgba(255, 0, 0, 0.8)'
    },
    pairName: {
        fontWeight: 'bold',
        fontSize: 16,
        // textAlign: 'center',
    }

})
