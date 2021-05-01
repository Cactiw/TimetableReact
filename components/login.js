import globals from "../globals";
import React, {createRef, useState} from "react";
import {serverURL} from "../config";
import LoginScreen from "react-native-login-screen";
import {View} from "react-native";
import FlashMessage, {showMessage} from "react-native-flash-message";





export function CheckLogin(props) {
    const navigation = props.navigation;
    if (globals.authToken) {
        navigation.navigate("Home")
    }

    const [login, setLogin] = useState("")
    const [password, setPassword] = useState("")
    const [spinnerVisibility, setSpinnerVisibility] = useState(false)

    const loginFlashMessage = createRef()

    function loginChanged(login) {
        setLogin(login)
    }

    function passwordChanged(password) {
        setPassword(password)
    }

    function loginPressed() {
        if (!login || !password) {
            showMessage({message: "Заполните все поля!", type: "danger"})
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
                showMessage({message: "Неверные имя пользователя или пароль.", type: "danger"})
            } else if (!response.ok) {
                console.log("Showing message!")
                showMessage({message: "Ошибка при авторизации.", type: "danger"})
            } else {
                showMessage({message: "Успешная авторизация!", type: "success"})
            }
        }).catch(e => {
            console.error(e)
            showMessage({message: "Ошибка при авторизации.", type: "danger"})
        }).finally(() =>
            setSpinnerVisibility(false)
        )
    }

    return (
        <LoginScreen spinnerEnable
                     spinnerVisibility={spinnerVisibility}
                     source={require("../assets/GZ.jpg")} disableSettings={true}
                     signupText={"Регистрация"} loginButtonText={"Вход"} loginText={"Войти"} onPressLogin={loginPressed}
                     usernameOnChangeText={loginChanged} passwordOnChangeText={passwordChanged}>
            <View>

            </View>

        </LoginScreen>
    )
}




