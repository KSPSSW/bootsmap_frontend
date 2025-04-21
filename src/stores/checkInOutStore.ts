import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CheckInOut } from 'src/models'
import { api } from 'src/boot/axios'
import { Loading, Notify } from 'quasar'

export const useCheckInOutStore = defineStore('checkInOut', () => {
  // const InOutNotPaidByID = ref<CheckInOut[]>([])
  const checkInOutData = ref<CheckInOut[]>([])

  async function getCheckInOut() {
    try {
      const res = await api.get('/CheckTimes')
      checkInOutData.value = res.data
      checkInOutData.value.sort((a, b) => Number(b.id ?? 0) - Number(a.id ?? 0)) // Sort ตารางตาม ID ใหม่ล่าสุด
      console.log('check time =', JSON.stringify(checkInOutData.value, null, 2))
    } catch (error) {
      console.error('Error fetching salaries:', error)
      Notify.create({
        message: 'Cannot load checkInOut data',
        color: 'negative',
        position: 'top',
      })
      return []
    }
  }

  async function addCheckIn(newcheckInOut: CheckInOut) {
    try {
      Loading.show()
      const checkInOutData = {
        checkInTime: newcheckInOut.checkInTime,
        userId: newcheckInOut.userId.id,
        totalHours: newcheckInOut.totalHours,
      }
      console.log('checkInOutData :', checkInOutData)
      const res = await api.post('/CheckTimes', checkInOutData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log('res', res)
      await getCheckInOut()
      Notify.create({
        message: 'CheckIn success',
        color: 'positive',
        position: 'top',
        icon: 'check',
      })
    } catch (error) {
      console.error(error)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'CheckIn failed',
        icon: 'report_problem',
      })
    } finally {
      console.log('finally')
      Loading.hide()
    }
  }

  async function addCheckOut(newcheckInOut: CheckInOut) {
    try {
      Loading.show()
      const checkInOutData = {
        checkOutTime: newcheckInOut.checkOutTime,
        totalHours: newcheckInOut.totalHours,
      }
      console.log('checkInOutData :', checkInOutData)
      const res = await api.patch(`/CheckTimes/${newcheckInOut.id}`, checkInOutData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log('res', res)
      await getCheckInOut()
      Notify.create({
        message: 'CheckOut success',
        color: 'positive',
        position: 'top',
        icon: 'check',
      })
    } catch (error) {
      console.error(error)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'CheckOut failed',
        icon: 'report_problem',
      })
    } finally {
      console.log('finally')
      Loading.hide()
    }
  }

  async function addSalaryId(checktimeId: number, salaryId: number) {
    try {
      const checktime = { salary: salaryId }
      const res = await api.patch(`/CheckTimes/${checktimeId}`, checktime, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log('addsalaryId : ', res.data)
    } catch (error) {
      console.error(error)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'add salary in checkTime failed',
        icon: 'report_problem',
      })
    } finally {
      console.log('finally')
      Loading.hide()
    }
  }
  // function formatTime(date: Date): string {
  //   return `${padToTwoDigits(date.getHours())}:${padToTwoDigits(date.getMinutes())}:${padToTwoDigits(date.getSeconds())}`
  // }

  // function padToTwoDigits(num: number): string {
  //   return num.toString().padStart(2, '0')
  // }

  // function removeEntry(id: number) {
  //   const index = checkInOutData.value.findIndex((entry) => entry.id === id)
  //   if (index !== -1) {
  //     checkInOutData.value.splice(index, 1)
  //   }
  // }
  // function updateInOutNotPaidByID(id: number) {
  //   InOutNotPaidByID.value = checkInOutData.value.filter(
  //     (CheckInOut) => CheckInOut.id === id && CheckInOut.salaryId === null,
  //   )
  // }
  function getTotalHoursByUserID(userId: number): number {
    return checkInOutData.value
      .filter((entry) => entry.userId.id === userId && entry.salary === null)
      .reduce((sum, entry) => sum + Number(entry.totalHours), 0)
  }

  return {
    checkInOutData,
    addCheckIn,
    addCheckOut,
    addSalaryId,
    // InOutNotPaidByID,
    // updateInOutNotPaidByID,

    getTotalHoursByUserID,
    getCheckInOut,
  }
})
