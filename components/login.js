import globals from "../globals";
import React, {createRef, useEffect, useState} from "react";
import {serverURL} from "../config";
import LoginScreen from "react-native-login-screen";
import {Text, View} from "react-native";
import FlashMessage, {showMessage} from "react-native-flash-message";
import EncryptedStorage from 'react-native-encrypted-storage';





export function CheckLogin(props) {
    const navigation = props.navigation;

    const [login, setLogin] = useState("")
    const [password, setPassword] = useState("")
    const [spinnerVisibility, setSpinnerVisibility] = useState(false)

    let loadedToken
    let loadedUserData

    useEffect(() => {
        getToken().then(token => {
            loadedToken = token;
        }).then(getUserData).then(userData => {
            loadedUserData = userData
        }).then(checkToken).catch(e => console.error(e))
    }, [])

    function checkToken() {
        globals.authToken = loadedToken
        globals.userData = loadedUserData
        if (globals.authToken) {
            navigateToHome()
        }
    }

    function navigateToHome() {
        navigation.navigate("AppWithTab")
    }

    async function saveToken(token) {
        await EncryptedStorage.setItem("authToken", token)
    }

    async function getToken() {
        const token = await EncryptedStorage.getItem("authToken")
        globals.authToken = token
        return token
    }

    async function saveUserData(userData) {
        await EncryptedStorage.setItem("userData", JSON.stringify(userData))
    }

    async function getUserData() {
        return JSON.parse(await EncryptedStorage.getItem("userData"))
    }

    function loginChanged(login) {
        setLogin(login)
    }

    function passwordChanged(password) {
        setPassword(password)
    }

    async function saveLoginData(response) {
        let json = await response.json()
        let token = json['token']
        globals.authToken = token
        console.log("Saved token!")
        console.log(globals.authToken)
        await saveToken(token)

        delete json['token']
        await saveUserData(json)
        globals.userData = json

        navigateToHome()
    }

    function loginPressed() {
        if (!login || !password) {
            showMessage({message: "?????????????????? ?????? ????????!", type: "danger"})
            return
        }
        setSpinnerVisibility(true)
        fetch(serverURL + 'users/login', {
            method: 'POST',

            body: JSON.stringify({
                email: login, password: password
            })
        }).then(response => {
            console.log(response)
            if (response.status === 401) {
                showMessage({message: "???????????????? ?????? ???????????????????????? ?????? ????????????.", type: "danger"})
            } else if (!response.ok) {
                console.log("Showing message!")
                showMessage({message: "???????????? ?????? ??????????????????????.", type: "danger"})
            } else {
                showMessage({message: "???????????????? ??????????????????????!", type: "success"})
                return saveLoginData(response)
            }
        }).catch(e => {
            console.error(e)
            showMessage({message: "???????????? ?????? ??????????????????????.", type: "danger"})
        }).finally(() =>
            setSpinnerVisibility(false)
        )
    }

    return (
        <LoginScreen spinnerEnable
                     spinnerVisibility={spinnerVisibility}
                     source={require("../assets/GZ.jpg")} disableSettings={true}
                     signupText={"??????????????????????"} loginButtonText={"????????"} loginText={"??????????"} onPressLogin={loginPressed}
                     usernameOnChangeText={loginChanged} passwordOnChangeText={passwordChanged}>
            <View>

            </View>

        </LoginScreen>
    )
}




