const currentDateTime =  () => {
    const newDate = new Date()
    const year = `${newDate.getFullYear()}`
    const month = newDate.getMonth() >= 10 ? `${newDate.getMonth()}` : `0${newDate.getMonth()}`
    const day = newDate.getDate() >= 10 ? `${newDate.getDate()}` : `0${newDate.getDate()}`
    const hour = newDate.getHours() >= 10 ? `${newDate.getHours()}` : `0${newDate.getHours()}`
    const minutes = newDate.getMinutes() >= 10 ? `${newDate.getMinutes()}` : `0${newDate.getMinutes()}`
    const seconds = newDate.getSeconds() >= 10 ? `${newDate.getSeconds()}` : `0${newDate.getSeconds()}`

    const date = {
        date: `${year}-${month}-${day}`,
        time: `${hour}:${minutes}:${seconds}`
    }

    return date
}

module.exports = currentDateTime