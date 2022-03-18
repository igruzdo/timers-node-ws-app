const currentDateTime =  () => {
    const newDate = new Date()
    const date = {
        date: `${newDate.getFullYear()}-${newDate.getMonth()}-${newDate.getDate()}`,
        time: `${newDate.getHours()}:${newDate.getMinutes()}:${newDate.getSeconds()}`
    }

    return date
}

module.exports = currentDateTime