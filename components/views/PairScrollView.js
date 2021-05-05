import SwipeRender from "react-native-swipe-render";
import React, {useCallback, useMemo, useState} from "react";
import globals from "../../globals";
import {Dimensions, FlatList, ScrollView, StyleSheet, Text, View} from "react-native";
import DropShadow from "react-native-drop-shadow";
import {Colors, TouchableRipple} from "react-native-paper";
import {Divider} from "react-native-elements";
import {useNavigation} from "@react-navigation/native";
import PairScrollPaneView from "./PairScrollPaneView";
import Carousel from 'react-native-snap-carousel';


const neverChange = true;


// <Carousel data={daysToRender} extraData={pairsData} renderItem={
//     (props) => <PairScrollPaneView pairsData={pairsData} currentMonday={currentMonday}
//                                    fetchPairsData={fetchPairsData} pairsRefreshing={pairsRefreshing}
//                                    startOffset={startOffset}
//                                    modOffset={modOffset} item={props.item} index={props.index}/>
// }
//           sliderWidth={windowWidth} itemWidth={windowWidth}
//           enableMomentum={true} decelerationRate={0.9}/>

export default React.memo(({
                               pairsData, currentMonday, onCurrentMondayChanged,
                               fetchPairsData, pairsRefreshing, pairsSwiperRef
                           }) => {
        console.log("Rendering view")


        const renderDays = 365 * 4;
        const startOffset = renderDays / 2;
        const modOffset = renderDays * globals.daysOfWeek.length
        const daysToRender = [...Array(renderDays).keys()];

        const startIndex = startOffset + (new Date()).getDay() - 1

        const windowWidth = Dimensions.get('window').width;

        const [currentIndex, setCurrentIndex] = useState(startIndex)

        console.log("currentIndex", currentIndex, "startOffset", startOffset, currentIndex - startOffset)
        let dayOfWeek = (currentIndex - startOffset + modOffset) % globals.daysOfWeek.length
        console.log(dayOfWeek)

        async function onIndexChanged(newIndex) {
            console.log("Index changed (old", currentIndex, "new", newIndex, ")", dayOfWeek)
            console.log("Index", dayOfWeek === globals.daysOfWeek.length - 1, dayOfWeek, globals.daysOfWeek.length - 1)

            if (Math.abs(newIndex - currentIndex) === 1) {
                if (dayOfWeek === 0 && newIndex < currentIndex) {
                    await onCurrentMondayChanged(currentMonday.addDays(-7))
                } else if (dayOfWeek === globals.daysOfWeek.length - 1 && newIndex > currentIndex) {
                    console.log("Current monday: ", currentMonday, currentMonday.addDays(7))
                    await onCurrentMondayChanged(currentMonday.addDays(7))
                }
            } else {
                const today = new Date()
                let currentDay = today.addDays(newIndex - startOffset).addDays(-(today.getDay() - 1))
                console.log("Opened ", currentDay, globals.getMonday(currentDay))
                onCurrentMondayChanged(globals.getMonday(currentDay))
            }

            await setCurrentIndex(newIndex)
        }

        async function onScrollEnded(index) {
            console.log("Ended scroll!", index)
        }

        return (
            <SwipeRender ref={pairsSwiperRef} data={daysToRender} extraData={pairsData} renderItem={
                (props) => <PairScrollPaneView pairsData={pairsData} currentMonday={currentMonday}
                                               fetchPairsData={fetchPairsData} pairsRefreshing={pairsRefreshing}
                                               startOffset={startOffset}
                                               modOffset={modOffset} item={props.item} index={props.index}/>
            }
                         onIndexChanged={onIndexChanged}
                         // onIndexChangeReached={onScrollEnded}
                         enableAndroidViewPager={false}
                         loop={false} horizontal={true} removeClippedSubviews={true}
                         loadMinimal={true} loadMinimalSize={21} index={startIndex}>
            </SwipeRender>
        )
    },
    (oldState, newState) => {
        return oldState.pairsData === newState.pairsData && oldState.currentMonday === newState.currentMonday
    }
)


const styles = StyleSheet.create({})
