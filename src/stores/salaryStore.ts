import { defineStore, acceptHMRUpdate } from 'pinia'
import { Loading, Notify } from 'quasar'
import { api } from 'src/boot/axios'
import type { CheckInOut } from 'src/models'
import { type Salary } from 'src/models'
import { ref } from 'vue'
import { useCheckInOutStore } from './checkInOutStore'

export const useSalaryStore = defineStore('SalaryStore', () => {
  const SelectSalaryByID = ref<Salary[]>([])
  const salaries = ref<Salary[]>([])
  const checkTimeStore = useCheckInOutStore()

  async function getSalaries() {
    try {
      const res = await api.get('/salaries')
      salaries.value = res.data
    } catch (error) {
      console.error('Error fetching salaries:', error)
      Notify.create({
        message: 'ไม่สามารถโหลดข้อมูลเงินเดือนได้',
        color: 'negative',
        position: 'top',
      })
      return []
    }
  }
  function updateSelectSalaryByID(id: number) {
    SelectSalaryByID.value = salaries.value.filter((Salary) => Salary.userID === id)
  }
  async function addSalary(newSalary: Salary) {
    console.log('newSalary', newSalary)
    try {
      Loading.show()
      const salaryData = {
        payDate: newSalary.paydate,
        amount: newSalary.amount,
        userID: newSalary.userID,
        totalHours: newSalary.totalHours,
      }

      const res = await api.post('/salaries', salaryData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log('res', res)

      const salaryId = res.data.id

      markEntriesAsPaid(newSalary.userID, salaryId)

      await getSalaries()
      await checkTimeStore.getCheckInOut()
      Notify.create({
        message: 'pay success',
        color: 'positive',
        position: 'top',
        icon: 'check',
      })
    } catch (error) {
      console.error(error)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'pay failed',
        icon: 'report_problem',
      })
    } finally {
      console.log('finally')
      Loading.hide()
    }
  }

  ///////////////////////////////////////////////////
  //mockup data CheckInOut

  const InOutNotPaidByID = ref<CheckInOut[]>([])

  function updateInOutNotPaidByID(id: number) {
    InOutNotPaidByID.value = checkTimeStore.checkInOutData.filter(
      (CheckInOut) => CheckInOut.userId.id === id && CheckInOut.salary === null,
    )

    console.log('Inout =', JSON.stringify(checkTimeStore.checkInOutData, null, 2))
    console.log('InOutNotPaidByID =', JSON.stringify(InOutNotPaidByID.value, null, 2))
  }

  function getTotalHoursByUserID(userId: number): number {
    return checkTimeStore.checkInOutData
      .filter((entry) => entry.userId.id === userId && entry.salary === null)
      .reduce((sum, entry) => sum + Number(entry.totalHours), 0)
  }
  function markEntriesAsPaid(userId: number, salaryId: number) {
    checkTimeStore.checkInOutData.forEach((entry) => {
      if (entry.id != null && entry.userId.id === userId && entry.salary == null) {
        checkTimeStore.addSalaryId(entry.id, salaryId) // Update the salaryId in the checkInOut entry
      }
    })
  }

  return {
    salaries,
    SelectSalaryByID,
    updateSelectSalaryByID,
    addSalary,
    getSalaries,
    /////////////////////////////////////////////
    InOutNotPaidByID,
    updateInOutNotPaidByID,
    getTotalHoursByUserID,
    ///////////////////////////////////////////////////
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSalaryStore, import.meta.hot))
}
