import { defineStore, acceptHMRUpdate } from 'pinia'
import { Loading, Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { type Type } from 'src/models'
import { ref } from 'vue'

export const useTypeStore = defineStore('type', () => {
  const types = ref<Type[]>([])

  // ดึงข้อมูลประเภทสินค้า
  async function getTypes() {
    try {
      Loading.show({ message: 'กำลังโหลดประเภทสินค้า...' })

      const res = await api.get('/types')
      types.value = res.data
    } catch (error) {
      console.error('Error fetching types:', error)
      Notify.create({
        message: 'ไม่สามารถโหลดประเภทสินค้าได้',
        color: 'negative',
        position: 'top',
      })
    } finally {
      Loading.hide()
    }
  }

  // เพิ่มประเภทสินค้าใหม่
  async function addType(type: Type) {
    try {
      Loading.show()
      const res = await api.post('/types', type)
      console.log(res.data)
      await getTypes()
      Notify.create({
        message: 'เพิ่มประเภทสินค้าสำเร็จ',
        color: 'positive',
        position: 'top',
      })
    } catch (error) {
      console.error('Error adding type:', error)
      Notify.create({
        message: 'เพิ่มประเภทสินค้าล้มเหลว',
        color: 'negative',
        position: 'top',
      })
    } finally {
      Loading.hide()
    }
  }

  // อัปเดตประเภทสินค้า
  async function updateType(type: Type) {
    try {
      Loading.show({ message: 'กำลังอัปเดตประเภทสินค้า...' })

      const res = await api.patch(`/types/${type.id}`, type)
      console.log(res.data)
      await getTypes()
      Notify.create({
        message: 'อัปเดตประเภทสินค้าสำเร็จ',
        color: 'positive',
        position: 'top',
      })

      return res.data
    } catch (error) {
      console.error('Error updating type:', error)
      Notify.create({
        message: 'อัปเดตประเภทสินค้าล้มเหลว',
        color: 'negative',
        position: 'top',
      })
      throw error
    } finally {
      Loading.hide()
    }
  }

  // ลบประเภทสินค้า
  async function deleteType(typeId: number) {
    try {
      Loading.show({ message: 'กำลังลบประเภทสินค้า...' })

      const res = await api.delete(`/types/${typeId}`)
      console.log(res.data)
      await getTypes()
      Notify.create({
        message: 'ลบประเภทสินค้าสำเร็จ',
        color: 'positive',
        position: 'top',
      })
    } catch (error) {
      console.error('Error deleting type:', error)
      Notify.create({
        message: 'ลบประเภทสินค้าล้มเหลว',
        color: 'negative',
        position: 'top',
      })
      throw error
    } finally {
      Loading.hide()
    }
  }

  // โหลดข้อมูลทันที
  getTypes()

  return {
    types,
    getTypes,
    addType,
    updateType,
    deleteType,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTypeStore, import.meta.hot))
}
