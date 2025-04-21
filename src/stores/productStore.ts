import { defineStore, acceptHMRUpdate } from 'pinia'
import { Loading, Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { type Product } from 'src/models'
import { ref } from 'vue'

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([])

  // ดึงข้อมูลสินค้าทั้งหมด
  async function getProducts() {
    try {
      Loading.show({
        message: 'กำลังโหลดข้อมูลสินค้า...',
      })

      const res = await api.get('/products')
      products.value = res.data
    } catch (error) {
      console.error('Error fetching products:', error)
      Notify.create({
        message: 'ไม่สามารถโหลดข้อมูลสินค้าได้',
        color: 'negative',
        position: 'top',
      })
    } finally {
      Loading.hide()
    }
  }

  // เพิ่มสินค้าใหม่
  async function addProduct(product: Product) {
    try {
      Loading.show()
      delete product.id
      const res = await api.post('/products', product)
      console.log(res.data)
      await getProducts() // โหลดข้อมูลสินค้าใหม่
      Notify.create({
        message: 'เพิ่มสินค้าสำเร็จ',
        color: 'positive',
        position: 'top',
      })
    } catch (error) {
      console.error('Error adding product:', error)
      Notify.create({
        message: 'เพิ่มสินค้าล้มเหลว',
        color: 'negative',
        position: 'top',
      })
    } finally {
      Loading.hide()
    }
  }

  // อัปเดตข้อมูลสินค้า
  async function updateProduct(product: Product) {
    try {
      Loading.show({
        message: 'กำลังอัปเดตข้อมูลสินค้า...',
      })

      const res = await api.patch(`/products/${product.id}`, product)
      console.log(res.data)
      await getProducts()
      Notify.create({
        message: 'อัปเดตข้อมูลสินค้าสำเร็จ',
        color: 'positive',
        position: 'top',
      })

      return res.data
    } catch (error) {
      console.error('Error updating product:', error)
      Notify.create({
        message: 'แก้ไขสินค้าล้มเหลว',
        color: 'negative',
        position: 'top',
      })
      throw error
    } finally {
      Loading.hide()
    }
  }

  // ลบสินค้า
  async function deleteProduct(product: Product) {
    try {
      Loading.show({
        message: 'กำลังลบสินค้า...',
      })
      const res = await api.delete(`/products/${product.id}`)
      console.log(res.data)
      await getProducts() // รีเฟรชข้อมูลสินค้า
      Notify.create({
        message: 'ลบสินค้าสำเร็จ',
        color: 'positive',
        position: 'top',
      })
    } catch (error) {
      console.error('Error deleting product:', error)
      Notify.create({
        message: 'ลบสินค้าล้มเหลว',
        color: 'negative',
        position: 'top',
      })
      throw error
    } finally {
      Loading.hide()
    }
  }

  async function getProductByMinPrice_Category(
    minPrice: number,
    categoryID: number,
  ): Promise<{ products: Product[]; totalCount: number }> {
    try {
      Loading.show({
        message: 'กำลังโหลดข้อมูลสินค้า...',
      })

      // สร้าง interface สำหรับข้อมูลที่ได้จาก API
      interface ApiProductItem {
        id: number
        name: string
        price: number
        createdAt: string
        category_name: string
      }

      const res = await api.get(
        `/products/stored-procedure03?minPrice=${minPrice}&categoryID=${categoryID}`,
      )

      let totalCount = 0
      let formattedProducts: Product[] = []

      // ข้อมูลที่ได้มีโครงสร้างเป็น array แรกคือ metadata ส่วนที่สองคือสินค้า
      if (Array.isArray(res.data) && res.data.length > 0) {
        // ดึง total_count จากข้อมูลแรก
        if (Array.isArray(res.data[0]) && res.data[0].length > 0 && res.data[0][0]?.total_count) {
          totalCount = parseInt(res.data[0][0].total_count) || 0
        }

        // ข้อมูลสินค้าอยู่ในอาร์เรย์ที่สอง
        if (Array.isArray(res.data[1])) {
          const productsData = res.data[1] as ApiProductItem[]

          // แปลงข้อมูลให้เข้ากับโครงสร้าง Product ที่ใช้ในแอพ
          formattedProducts = productsData.map((item: ApiProductItem) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            image: '', // ตั้งค่าเริ่มต้นเป็นค่าว่าง
            productCategory: {
              id: categoryID, // ใช้ categoryID ที่ส่งไปกับ API
              name: item.category_name || '',
            },
            // ตั้งค่า array ว่างสำหรับ field ที่ไม่มีในข้อมูลจาก API
            productSizes: [],
            productSweetLevels: [],
            types: [],
          }))
        }
      }

      return { products: formattedProducts, totalCount }
    } catch (error) {
      console.error('Error fetching products by min price and category:', error)
      Notify.create({
        message: 'ไม่สามารถโหลดข้อมูลสินค้าได้',
        color: 'negative',
        position: 'top',
      })
      return { products: [], totalCount: 0 }
    } finally {
      Loading.hide()
    }
  }

  async function getProductByMinPrice_Category_NoParameter(): Promise<{
    products: Product[]
    totalCount: number
  }> {
    try {
      Loading.show({
        message: 'กำลังโหลดข้อมูลสินค้า...',
      })

      // สร้าง interface สำหรับข้อมูลที่ได้จาก API
      interface ApiProductItem {
        id: number
        name: string
        price: number
        createdAt: string
        category_name: string
        category_id?: number
      }

      const res = await api.get(`/products/stored-procedure04`)

      let totalCount = 0
      let formattedProducts: Product[] = []

      // ข้อมูลที่ได้มีโครงสร้างเป็น array แรกคือ metadata ส่วนที่สองคือสินค้า
      if (Array.isArray(res.data) && res.data.length > 0) {
        // ดึง total_count จากข้อมูลแรก
        if (Array.isArray(res.data[0]) && res.data[0].length > 0 && res.data[0][0]?.total_count) {
          totalCount = parseInt(res.data[0][0].total_count) || 0
        }

        // ข้อมูลสินค้าอยู่ในอาร์เรย์ที่สอง
        if (Array.isArray(res.data[1])) {
          const productsData = res.data[1] as ApiProductItem[]

          // แปลงข้อมูลให้เข้ากับโครงสร้าง Product ที่ใช้ในแอพ
          formattedProducts = productsData.map((item: ApiProductItem) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            image: '', // ตั้งค่าเริ่มต้นเป็นค่าว่าง
            productCategory: {
              id: item.category_id || 1, // ใช้ category_id จาก API หรือค่าเริ่มต้น 1
              name: item.category_name || '',
            },
            // ตั้งค่า array ว่างสำหรับ field ที่ไม่มีในข้อมูลจาก API
            productSizes: [],
            productSweetLevels: [],
            types: [],
          }))
        }
      }

      return { products: formattedProducts, totalCount }
    } catch (error) {
      console.error('Error fetching all products:', error)
      Notify.create({
        message: 'ไม่สามารถโหลดข้อมูลสินค้าได้',
        color: 'negative',
        position: 'top',
      })
      return { products: [], totalCount: 0 }
    } finally {
      Loading.hide()
    }
  }

  // เรียกใช้ฟังก์ชัน getProducts ทันทีเมื่อ store ถูกสร้าง
  getProducts()

  return {
    products,
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductByMinPrice_Category,
    getProductByMinPrice_Category_NoParameter,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProductStore, import.meta.hot))
}
