import React from "react"

export default {
    authToken: null,
    userData: null,

    OPERATOR_ROLE: 0,
    TEACHER_ROLE: 1,
    STUDENT_ROLE: 2,


    daysOfWeek: [
        0, 1, 2, 3, 4, 5, 6
    ],

    DAY_NAMES: [
        "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"
    ],


    MONTH_NAMES: [
        "января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"
    ],

    getMonday: (d) => {
        d = new Date(d);
        let day = d.getDay(),
            diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    },

    getAuthorization() {
        return {
            'Authorization': 'Bearer ' + this.authToken,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    },



}
