import { defineStore, acceptHMRUpdate } from 'pinia'
import { Loading, Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { ref } from 'vue'
import type { InventoryItems } from 'src/models'

export const useInventoryItemsStore = defineStore('inventoryItems', () => {
  const inventoryItems = ref<InventoryItems[]>([])
  const filteredInventoryItems = ref<InventoryItems[]>([])
  const currentInventoryItem = ref<InventoryItems | null>(null)

  function setCurrentInventoryItem(item: InventoryItems | null) {
    currentInventoryItem.value = item
  }

  // ดึงข้อมูลสินค้าคงคลังทั้งหมด
  async function getInventoryItems() {
    try {
      Loading.show({
        message: 'กำลังโหลดข้อมูลสินค้าคงคลัง...',
      })

      const res = await api.get('/inventory-items')
      inventoryItems.value = res.data
      // อัปเดตรายการสินค้าที่กรองแล้ว
      updateFilteredInventoryItems('')

      return res.data
    } catch (error) {
      console.error('Error fetching inventory items:', error)
      Notify.create({
        message: 'ไม่สามารถโหลดข้อมูลสินค้าคงคลังได้',
        color: 'negative',
        position: 'top',
      })

      return []
    } finally {
      Loading.hide()
    }
  }

  // ดึงข้อมูลสินค้าคงคลังตาม ID
  async function getInventoryItemById(id: number) {
    try {
      Loading.show({
        message: 'กำลังโหลดข้อมูลสินค้า...',
      })

      const res = await api.get(`/inventory-items/${id}`)
      return res.data
    } catch (error) {
      console.error('Error fetching inventory item:', error)
      Notify.create({
        message: 'ไม่สามารถโหลดข้อมูลสินค้าได้',
        color: 'negative',
        position: 'top',
      })
      return null
    } finally {
      Loading.hide()
    }
  }

  async function getInventoryItemsByBranchId(branchId: number) {
    try {
      Loading.show({
        message: 'กำลังโหลดข้อมูลสินค้าคงคลัง...',
      })
      const res = await api.get(`/inventory-items/branch/${branchId}`)
      return res.data
    } catch (error) {
      console.error('Error fetching inventory items by branch id:', error)
      Notify.create({
        message: 'ไม่สามารถโหลดข้อมูลสินค้าคงคลังได้',
        color: 'negative',
        position: 'top',
      })
    }
  }

  // เพิ่มสินค้าใหม่
  async function addInventoryItem(item: InventoryItems) {
    try {
      Loading.show({
        message: 'กำลังเพิ่มสินค้า...',
      })

      delete item.id
      const res = await api.post('/inventory-items', item)
      await getInventoryItems()

      Notify.create({
        message: 'เพิ่มสินค้าสำเร็จ',
        color: 'positive',
        position: 'top',
      })

      return res.data
    } catch (error) {
      console.error('Error adding inventory item:', error)
      Notify.create({
        message: 'เพิ่มสินค้าไม่สำเร็จ',
        color: 'negative',
        position: 'top',
      })

      throw error
    } finally {
      Loading.hide()
    }
  }

  // อัปเดตข้อมูลสินค้า
  async function updateInventoryItem(item: InventoryItems) {
    try {
      Loading.show({
        message: 'กำลังอัปเดตข้อมูลสินค้า...',
      })

      const res = await api.patch(`/inventory-items/${item.id}`, item)
      await getInventoryItems()

      Notify.create({
        message: 'อัปเดตข้อมูลสินค้าสำเร็จ',
        color: 'positive',
        position: 'top',
      })

      return res.data
    } catch (error) {
      console.error('Error updating inventory item:', error)
      Notify.create({
        message: 'แก้ไขข้อมูลสินค้าไม่สำเร็จ',
        color: 'negative',
        position: 'top',
      })

      throw error
    } finally {
      Loading.hide()
    }
  }

  // ลบสินค้า
  async function deleteInventoryItem(item: InventoryItems) {
    try {
      Loading.show({
        message: 'กำลังลบสินค้า...',
      })

      await api.delete(`/inventory-items/${item.id}`)
      await getInventoryItems()

      Notify.create({
        message: 'ลบสินค้าสำเร็จ',
        color: 'positive',
        position: 'top',
      })
    } catch (error) {
      console.error('Error deleting inventory item:', error)
      Notify.create({
        message: 'ลบสินค้าไม่สำเร็จ',
        color: 'negative',
        position: 'top',
      })

      throw error
    } finally {
      Loading.hide()
    }
  }

  // อัปเดตรายการสินค้าที่กรองแล้ว
  function updateFilteredInventoryItems(query: string) {
    if (!query) {
      filteredInventoryItems.value = [...inventoryItems.value]
      return
    }

    const isNumericQuery = !isNaN(Number(query))
    const queryLowerCase = query.toLowerCase()

    filteredInventoryItems.value = inventoryItems.value.filter((item) => {
      if (isNumericQuery) {
        return item.id === Number(query)
      }

      return (
        item.name.toLowerCase().includes(queryLowerCase) ||
        item.supplier.toLowerCase().includes(queryLowerCase) ||
        item.unit.toLowerCase().includes(queryLowerCase)
      )
    })
  }

  // เรียกข้อมูลสินค้าเมื่อสร้าง store
  getInventoryItems()

  return {
    inventoryItems,
    filteredInventoryItems,
    currentInventoryItem,
    getInventoryItems,
    getInventoryItemById,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    updateFilteredInventoryItems,
    setCurrentInventoryItem,
    getInventoryItemsByBranchId,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useInventoryItemsStore, import.meta.hot))
}
