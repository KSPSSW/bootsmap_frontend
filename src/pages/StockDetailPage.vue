<template>
  <q-page class="q-pa-md">
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6">รายละเอียดการเช็คสต็อก</div>
        <div>วันที่: {{ stockDetail.date }}</div>
        <div>ผู้ตรวจสอบ: {{ stockDetail.checker }}</div>
        <div>
          สถานะ:
          <q-badge :color="stockDetail.status === 'เสร็จสิ้น' ? 'positive' : 'warning'">{{
            stockDetail.status
          }}</q-badge>
        </div>
      </q-card-section>

      <q-card-section>
        <!-- <q-btn
            :color="showLowStock ? 'negative' : 'grey'"
            :label="showLowStock ? 'All Items' : 'Low Stock'"
            @click="toggleLowStock"
          /> -->
        <q-table :rows="stockItems" :columns="columns" row-key="code" dense flat>
          <template v-slot:body-cell-actualQty="props">
            <q-input
              v-model.number="props.row.actualQty"
              dense
              type="number"
              @blur="updateDifference(props.row)"
              :disable="isCompleted"
            />
          </template>
          <template v-slot:body-cell-action="props">
            <q-btn
              label="ลบ"
              size="sm"
              color="negative"
              :disable="isCompleted"
              @click="removeItem(props.row.code)"
            />
          </template>
        </q-table>
        <q-btn
          label="บันทึกการเช็คสต็อก"
          color="positive"
          class="q-mt-md"
          @click="completeStockCheck"
          :disable="isCompleted"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCheckStockStore } from 'src/stores/checkStockStore'
import { type QTableColumn } from 'quasar'
import { type CheckStockItem, type CheckStock, type InventoryItems } from 'src/models'
import { api } from 'src/boot/axios'

export default defineComponent({
  setup() {
    const route = useRoute()
    const stockStore = useCheckStockStore()
    const stockId = Number(route.params.id)
    const router = useRouter()
    const stockItems = ref<InventoryItems[]>([])
    // const showLowStock = ref(false)

    const goBackToStockPage = () => {
      router.push({ name: 'StockPage' })
    }

    const stockDetail = reactive(
      stockStore.getStockCheckById(stockId) || {
        id: stockId,
        date: '',
        checker: '',
        status: 'กำลังดำเนินการ',
        items: [],
      },
    )
    onMounted(() => {
      loadDetail()
      console.log('กสหา่้เดหีก้ดเ', stockItems.value)
    })

    const isCompleted = computed(() => stockDetail.status === 'เสร็จสิ้น')

    const columns: QTableColumn[] = [
      { name: 'id', label: 'ID', field: 'id', align: 'left' },
      { name: 'name', label: 'ชื่อสินค้า', field: 'name', align: 'left' },
      { name: 'quantity', label: 'จำนวน', field: 'quantity', align: 'right' },
      { name: 'unit', label: 'หน่วย', field: 'unit', align: 'left' },
      { name: 'minStock', label: 'สต็อกขั้นต่ำ', field: 'minStock', align: 'right' },
      { name: 'price', label: 'ราคา', field: 'price', align: 'right' },
      { name: 'supplier', label: 'ผู้จำหน่าย', field: 'supplier', align: 'left' },
      { name: 'actualQty', label: 'จำนวนที่นับได้', field: 'actualQty', align: 'center' },
    ]

    const updateDifference = (item: CheckStockItem) => {
      item.difference = item.actualQty - item.systemQty
    }

    const removeItem = (code: string) => {
      stockDetail.items = stockDetail.items.filter((item) => item.code !== code)
    }

    const completeStockCheck = () => {
      stockDetail.status = 'เสร็จสิ้น'
      stockStore.updateStockCheck(stockId, stockDetail as CheckStock)
    }
    // ฟังก์ชันดึงข้อมูลจาก API
    const loadDetail = async () => {
      try {
        const res = await api.get('/inventory-items/all') // ดึงข้อมูลทั้งหมดจาก API
        // แปลงข้อมูลที่ได้จาก API ให้ตรงกับโครงสร้างที่ต้องการในตาราง
        stockItems.value = res.data.map((item: InventoryItems) => ({
          id: item.id,
          name: item.name,
          category: item.category || {}, // ถ้ามี category ให้แสดง
          quantity: item.quantity,
          unit: item.unit,
          minStock: item.minStock,
          price: item.price,
          supplier: item.supplier,
          lastOrder: item.lastOrder,
          branch: item.branch || {}, // ถ้ามี branch ให้แสดง
          actualQty: 0, // จำนวนที่นับได้เริ่มต้นเป็น 0
          difference: 0, // ความแตกต่างเริ่มต้นเป็น 0
          note: '', // หมายเหตุเริ่มต้นเป็นค่าว่าง
        }))
      } catch (err) {
        console.error('ไม่สามารถโหลดข้อมูลจาก API ได้', err)
      }
    }

    const updateSystemQty = async (item: CheckStockItem) => {
      try {
        // ส่งคำขอ PATCH ไปยัง API เพื่ออัปเดต systemQty
        const response = await api.patch(`/inventory-items/${item.code}`, {
          systemQty: item.actualQty, // อัปเดตค่า systemQty ให้เป็น actualQty ใหม่
        })
        console.log('อัปเดตค่า systemQty สำเร็จ:', response.data)
      } catch (error) {
        console.error('ไม่สามารถอัปเดต systemQty ได้', error)
        // คุณสามารถแสดงข้อความแจ้งเตือนหรือทำการจัดการข้อผิดพลาดที่เหมาะสมได้ที่นี่
      }
    }

    return {
      stockDetail,
      columns,
      isCompleted,
      updateDifference,
      removeItem,
      completeStockCheck,
      goBackToStockPage,
      stockItems,
      loadDetail,
      updateSystemQty,
    }
  },
})
</script>
