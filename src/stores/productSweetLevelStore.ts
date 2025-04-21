import { defineStore, acceptHMRUpdate } from 'pinia'
import { Loading, Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { type ProductSweetLevel } from 'src/models'
import { ref } from 'vue'

export const useProductSweetLevelStore = defineStore('productSweetLevel', () => {
  const productSweetLevels = ref<ProductSweetLevel[]>([])

  // ดึงข้อมูลระดับความหวาน
  async function getProductSweetLevels() {
    try {
      Loading.show({ message: 'กำลังโหลดระดับความหวาน...' })

      const res = await api.get('/productsweetlevel')
      productSweetLevels.value = res.data
    } catch (error) {
      console.error('Error fetching sweet levels:', error)
      Notify.create({
        message: 'ไม่สามารถโหลดระดับความหวานได้',
        color: 'negative',
        position: 'top',
      })
    } finally {
      Loading.hide()
    }
  }

  // เพิ่มระดับความหวาน
  async function addProductSweetLevel(level: ProductSweetLevel) {
    try {
      Loading.show()
      const res = await api.post('/productsweetlevel', level)
      console.log(res.data)
      await getProductSweetLevels()
      Notify.create({
        message: 'เพิ่มระดับความหวานสำเร็จ',
        color: 'positive',
        position: 'top',
      })
    } catch (error) {
      console.error('Error adding sweet level:', error)
      Notify.create({
        message: 'เพิ่มระดับความหวานล้มเหลว',
        color: 'negative',
        position: 'top',
      })
    } finally {
      Loading.hide()
    }
  }

  // อัปเดตระดับความหวาน
  async function updateProductSweetLevel(level: ProductSweetLevel) {
    try {
      Loading.show({ message: 'กำลังอัปเดตระดับความหวาน...' })

      const res = await api.patch(`/productsweetlevel/${level.id}`, level)
      console.log(res.data)
      await getProductSweetLevels()
      Notify.create({
        message: 'อัปเดตระดับความหวานสำเร็จ',
        color: 'positive',
        position: 'top',
      })

      return res.data
    } catch (error) {
      console.error('Error updating sweet level:', error)
      Notify.create({
        message: 'อัปเดตระดับความหวานล้มเหลว',
        color: 'negative',
        position: 'top',
      })
      throw error
    } finally {
      Loading.hide()
    }
  }

  // ลบระดับความหวาน
  async function deleteProductSweetLevel(levelId: number) {
    try {
      Loading.show({ message: 'กำลังลบระดับความหวาน...' })

      const res = await api.delete(`/productsweetlevel/${levelId}`)
      console.log(res.data)
      await getProductSweetLevels()
      Notify.create({
        message: 'ลบระดับความหวานสำเร็จ',
        color: 'positive',
        position: 'top',
      })
    } catch (error) {
      console.error('Error deleting sweet level:', error)
      Notify.create({
        message: 'ลบระดับความหวานล้มเหลว',
        color: 'negative',
        position: 'top',
      })
      throw error
    } finally {
      Loading.hide()
    }
  }

  // โหลดข้อมูลทันทีเมื่อ store ถูกสร้าง
  getProductSweetLevels()

  return {
    productSweetLevels,
    getProductSweetLevels,
    addProductSweetLevel,
    updateProductSweetLevel,
    deleteProductSweetLevel,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProductSweetLevelStore, import.meta.hot))
}
