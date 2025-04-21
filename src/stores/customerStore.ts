import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'
import type { Customer } from 'src/models'
import { Loading, Notify } from 'quasar'
import { api } from 'src/boot/axios'

export const useCustomerStore = defineStore('customer', () => {
  const customers = ref<Customer[]>([])
  // ใช้ filteredCustomers สำหรับการกรองลูกค้า
  const filteredCustomers = ref<Customer[]>([...customers.value])

  async function getCustomers() {
    try {
      Loading.show({
        message: 'กำลังโหลดข้อมูลลูกค้า...',
      })

      const res = await api.get('/customers')
      customers.value = res.data
      await getCustomers()
    } catch (error) {
      console.error('Error fetching customers:', error)
      Notify.create({
        message: 'ไม่สามารถโหลดข้อมูลลูกค้าได้',
        color: 'negative',
        position: 'top',
      })

      return []
    } finally {
      Loading.hide()
    }
  }
  async function addCustomer(customer: Customer) {
    try {
      Loading.show()
      delete customer.id
      const res = await api.post('/customers', customer)
      console.log(res.data)
      // เพิ่มผู้ใช้ใหม่ไปยังรายการ
      // Customers.value.push(res.data)
      await getCustomer()

      // อัปเดตรายการผู้ใช้ที่กรองแล้ว
      updateFilteredCustomers('')

      Notify.create({
        message: 'เพิ่มลูกค้าสำเร็จ',
        color: 'positive',
        position: 'top',
      })
    } catch (error) {
      console.error('Error adding Customer:', error)
      Notify.create({
        message: 'เพิ่มลูกค้าไม่สำเร็จ',
        color: 'negative',
        position: 'top',
      })

      throw error
    } finally {
      Loading.hide()
    }
  }

  async function updateCustomer(customer: Customer) {
    try {
      Loading.show({
        message: 'กำลังอัปเดตข้อมูลลูกค้า...',
      })

      const res = await api.patch(`/customers/${customer.id}`, customer)
      console.log(res.data)
      await getCustomer()
      // อัปเดตข้อมูลผู้ใช้ในรายการ
      // users.value = users.value.map((u) => (u.id === user.id ? res.data : u))

      // อัปเดตรายการผู้ใช้ที่กรองแล้ว
      updateFilteredCustomers('')

      Notify.create({
        message: 'อัปเดตข้อมูลลูกค้าสำเร็จ',
        color: 'positive',
        position: 'top',
      })

      return res.data
    } catch (error) {
      console.error('Error updating customer:', error)
      Notify.create({
        message: 'แก้ไขลูกค้าไม่สำเร็จ',
        color: 'negative',
        position: 'top',
      })

      throw error
    } finally {
      Loading.hide()
    }
  }

  async function deleteCustomer(id: number) {
    try {
      Loading.show({
        message: 'กำลังลบลูกค้า...',
      })
      const res = await api.delete(`/customers/${id}`)
      console.log(res.data)
      // ลบผู้ใช้ออกจากรายการ
      // users.value = users.value.filter((u) => u.id !== u.id)
      await getCustomer()

      // อัปเดตรายการผู้ใช้ที่กรองแล้ว
      updateFilteredCustomers('')

      Notify.create({
        message: 'ลบผู้ใช้งานสำเร็จ',
        color: 'positive',
        position: 'top',
      })
    } catch (error) {
      console.error('Error deleting customer:', error)
      Notify.create({
        message: 'ลบลูกค้าไม่สำเร็จ',
        color: 'negative',
        position: 'top',
      })

      throw error
    } finally {
      Loading.hide()
    }
  }
  function updateFilteredCustomers(query: string) {
    if (!query) {
      filteredCustomers.value = [...customers.value]
    } else {
      filteredCustomers.value = customers.value.filter(
        (customer) =>
          customer.name.toLowerCase().includes(query.toLowerCase()) ||
          customer.phone.includes(query),
      )
    }
  }
  async function getCustomer() {
    try {
      Loading.show()
      const res = await api.get('/customers')
      console.log(res.data)
      customers.value = res.data
    } catch (err) {
      console.error(err)
      console.log('finally')
      Loading.hide()
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Loading failed',
        icon: 'report_problem',
      })
    } finally {
      console.log('finally')
      Loading.hide()
    }
  }
  getCustomer()
  return {
    customers,
    filteredCustomers,
    getCustomers,
    addCustomer,
    deleteCustomer,
    updateCustomer,
    updateFilteredCustomers,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCustomerStore, import.meta.hot))
}
