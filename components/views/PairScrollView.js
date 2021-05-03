import SwipeRender from "react-native-swipe-render";
import React, {useCallback, useMemo, useState} from "react";
import globals from "../../globals";
import {Dimensions, FlatList, ScrollView, StyleSheet, Text, View} from "react-native";
import DropShadow from "react-native-drop-shadow";
import {Colors, TouchableRipple} from "react-native-paper";
import {Divider} from "react-native-elements";
import {useNavigation} from "@react-navigation/native";
import PairScrollPaneView from "./PairScrollPaneView";


const neverChange = true;

export default React.memo(({pairsData, currentMonday, fetchPairsData, pairsRefreshing}) => {
    console.log(pairsData)
    console.log("Rendering view")

    const renderDays = 365 * 4;
    const startOffset = renderDays / 2;
    const modOffset = renderDays * globals.daysOfWeek.length
    const daysToRender = [...Array(renderDays).keys()];

    return (
        <SwipeRender data={daysToRender} extraData={pairsData} renderItem={
            (props) => <PairScrollPaneView pairsData={pairsData} currentMonday={currentMonday}
                                           fetchPairsData={fetchPairsData} pairsRefreshing={pairsRefreshing}
                                           startOffset={startOffset}
                                           modOffset={modOffset} item={props.item} index={props.index}/>
        }
                     loop={false} horizontal={true} removeClippedSubviews={true} enableAndroidViewPager={false}
                     loadMinimal={true} loadMinimalSize={21} index={startOffset}>
        </SwipeRender>
    )
}, (oldState, newState) => {
    return oldState.pairsData === newState.pairsData
})


const styles = StyleSheet.create({

})
