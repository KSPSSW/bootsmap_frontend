<template>
  <q-page padding>
    <q-layout view="lHh Lpr lFf">
      <!-- แท็บ -->
      <q-tabs v-model="tab" dense class="bg-grey-2">
        <q-tab name="stockHistory" label="Stock History" />
        <q-tab name="checkStock" label="Check Stock" />
      </q-tabs>

      <q-separator />

      <!-- แท็บ Panel -->
      <q-tab-panels
        v-model="tab"
        animated
        class="fade-transition"
        style="max-width: 80%; margin: 0 auto"
      >
        <!-- แท็บ Check Stock -->
        <q-tab-panel name="checkStock">
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-h6">Stock Check Form</div>
            </q-card-section>

            <q-form @submit="submitForm">
              <!-- ช่องเลือกวันที่ -->
              <q-input
                filled
                v-model="selectedDate"
                label="Select Date"
                mask="date"
                :rules="[(val) => (val && val.length > 0) || 'Please select a date']"
              >
                <template v-slot:append>
                  <q-icon name="event" @click="openCalendar" />
                </template>
              </q-input>

              <!-- ช่องใส่ชื่อ -->
              <q-select
                filled
                v-model="selectedUser"
                :options="userList"
                label="Select User"
                emit-value
                map-options
                :rules="[(val) => !!val || 'Please select a user']"
              />

              <!-- ช่องใส่หมายเหตุ -->
              <q-input
                filled
                v-model="note"
                label="Note"
                type="textarea"
                :rules="[(val) => (val && val.length > 0) || 'Please enter a note']"
              />

              <!-- ปุ่ม Check Stock -->
              <q-btn
                label="Check Stock"
                type="submit"
                color="brown"
                @click="CheckStock"
                :disable="isCheckStockDisabled"
              />
              <q-dialog>
                <div v-for="(item, index) in stockItems" :key="index" class="q-gutter-md q-mb-md">
                  <q-select
                    v-model="item.inventoryItemId"
                    :options="inventoryItems.map((i) => ({ label: i.name, value: i.id }))"
                    label="Select Item"
                    @update:model-value="
                      (val) => {
                        const found = inventoryItems.find((i) => i.id === val)
                        item.previousQuantity = found?.quantity ?? 0
                      }
                    "
                    emit-value
                    map-options
                    filled
                    dense
                  />

                  <q-input
                    v-model="item.previousQuantity"
                    label="Previous Quantity"
                    filled
                    dense
                    readonly
                  />

                  <q-input
                    v-model.number="item.newQuantity"
                    label="New Quantity"
                    type="number"
                    filled
                    dense
                  />

                  <q-btn
                    icon="delete"
                    color="negative"
                    dense
                    flat
                    @click="stockItems.splice(index, 1)"
                  />

                  <q-btn
                    v-if="isCheckStocking"
                    label="Add Item"
                    icon="add"
                    flat
                    color="primary"
                    @click="
                      stockItems.push({
                        inventoryItemId: null,
                        previousQuantity: 0,
                        newQuantity: 0,
                      })
                    "
                  />
                </div>
              </q-dialog>

              <q-btn label="Save" color="positive" @click="saveStockCheckUpdate" />
            </q-form>
          </q-card>
        </q-tab-panel>

        <!-- แท็บ Stock History -->
        <q-tab-panel name="stockHistory">
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-h6">Stock Check History</div>

              <!-- ช่องกรองปีและเดือน -->
              <div class="q-gutter-md q-mb-md">
                <q-select
                  v-model="selectedYear"
                  :options="years"
                  label="Year"
                  dense
                  class="q-ma-xs"
                />
                <q-select
                  v-model="selectedMonth"
                  :options="months"
                  label="Month"
                  dense
                  class="q-ma-xs"
                />
                <q-btn label="Filter" @click="filterHistory" color="primary" class="q-ma-xs" />
                <q-btn label="Refresh" @click="refreshHistory" color="secondary" class="q-ma-xs" />
              </div>

              <!-- ตารางประวัติ -->
              <q-table
                :columns="columns"
                :rows="filteredHistory"
                row-key="id"
                dense
                flat
                @row-click="viewStockDetails"
              >
                <template v-slot:body-cell-date="{ row }">
                  <td class="q-td" style="text-align: center">
                    {{ row.checkDate ? new Date(row.checkDate).toLocaleDateString() : '' }}
                  </td>
                </template>

                <template v-slot:body-cell-name="{ row }">
                  <td class="q-td" style="text-align: center">
                    {{ row.staffName || 'N/A' }}
                  </td>
                </template>

                <template v-slot:body-cell-note="{ row }">
                  <td class="q-td" style="text-align: center">
                    {{ row.note || 'N/A' }}
                  </td>
                </template>

                <template v-slot:body-cell-items="{ row }">
                  <td class="q-td" style="text-align: center">
                    <q-table :rows="row.items" :column="itemsColumns" row-key="id" dense flat />
                  </td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </q-tab-panel>
      </q-tab-panels>
    </q-layout>
    <!--ไดอาลอกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกกก-->

    <q-dialog v-model="dialog" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">รายละเอียดการเช็คสต็อก</div>
          <div>ชื่อผู้ตรวจสอบ: {{ selectedRecord?.staffName }}</div>
          <div>หมายเหตุ: {{ selectedRecord?.note }}</div>
          <div>วันที่เช็ค: {{ selectedRecord?.checkDate }}</div>
          <div>สถานะ: {{ selectedRecord?.status }}</div>

          <!-- แสดงข้อมูลสินค้าใน StockCheckDetail -->
          <q-table :column="itemsColumns" :rows="selectedItems" row-key="id" dense flat>
            <template v-slot:body-cell-productName="{ row }">
              <td class="q-td" style="text-align: left">{{ row.productName }}</td>
            </template>

            <template v-slot:body-cell-previousQuantity="{ row }">
              <td class="q-td" style="text-align: center">{{ row.previousQuantity }}</td>
            </template>

            <template v-slot:body-cell-newQuantity="{ row }">
              <td class="q-td" style="text-align: center">{{ row.newQuantity }}</td>
            </template>

            <template v-slot:body-cell-unit="{ row }">
              <td class="q-td" style="text-align: center">{{ row.unit }}</td>
            </template>

            <template v-slot:body-cell-difference="{ row }">
              <td class="q-td" style="text-align: center">{{ row.difference }}</td>
            </template>

            <template v-slot:body-cell-status="{ row }">
              <td class="q-td" style="text-align: center">{{ row.status }}</td>
            </template>
          </q-table>
        </q-card-section>

        <q-card-actions>
          <q-btn label="ปิด" color="primary" @click="dialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog สำหรับเลือกวันที่ -->
    <q-dialog v-model="calendarDialog" persistent>
      <q-date v-model="selectedDate" @input="calendarDialog = false" />
      <q-card-actions align="right">
        <q-btn label="Confirm" color="primary" @click="confirmDate" />
      </q-card-actions>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import type { StockCheckRecord, StockDetails, User } from 'src/models'
import { type QTableColumn } from 'quasar'
// กำหนดตัวแปรสำหรับข้อมูล Stock
const selectedDate = ref('')
const selectedYear = ref<number | null>(null)
const selectedMonth = ref<number | null>(null)
const name = ref('')
const note = ref('')
const calendarDialog = ref(false)
const tab = ref('stockHistory') // กำหนดแท็บเริ่มต้นเป็น "Stock History"
const searchQuery = ref('') // ตัวแปรสำหรับการค้นหาชื่อ
const dialog = ref(false)
const selectedRecord = ref()
const selectedItems = ref<StockDetails[]>([])
const selectedUser = ref<number | null>(null)
const userList = ref<UserOption[]>([])
const inventoryItems = ref<{ id: number; name: string; quantity: number }[]>([])
const stockItems = ref([{ inventoryItemId: null, previousQuantity: 0, newQuantity: 0 }])
const isCheckStocking = ref(false)

const years = ref([2023, 2024, 2025]) // รายชื่อปี
const months = ref([
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 },
])

const history = ref<StockCheckRecord[]>([]) // รายการข้อมูลเช็คสต็อก

interface UserOption {
  label: string
  value: number
}

async function loadInventoryItems() {
  try {
    const res = await axios.get('http://localhost:5002/inventory-items') // เปลี่ยน URL ให้ตรงระบบ
    inventoryItems.value = res.data
  } catch (error) {
    console.error('Error loading inventory items:', error)
  }
}

async function loadUsers() {
  try {
    const res = await axios.get('http://localhost:5002/users') // เปลี่ยนให้ตรงกับ API จริง
    userList.value = res.data.map((u: User) => ({
      label: u.name,
      value: u.id,
    }))
  } catch (err) {
    console.error('Error loading user list:', err)
  }
}

// กำหนด column สำหรับ StockDetail
const itemsColumns = [
  { name: 'productName', label: 'Product Name', field: 'productName', align: 'left' },
  {
    name: 'previousQuantity',
    label: 'Previous Quantity',
    field: 'previousQuantity',
    align: 'center',
  },
  { name: 'newQuantity', label: 'New Quantity', field: 'newQuantity', align: 'center' },
  { name: 'unit', label: 'Unit', field: 'unit', align: 'center' },
  { name: 'difference', label: 'Difference', field: 'difference', align: 'center' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
]

const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', align: 'center', field: 'id', sortable: true },
  { name: 'checkDate', label: 'วันที่เช็ค', align: 'center', field: 'checkDate' },
  { name: 'staffName', label: 'ผู้ตรวจสอบ', align: 'center', field: 'staffName' },
  { name: 'actions', label: '', align: 'center', field: 'viewdetail' },
]

onMounted(() => {
  loadHistory() // เรียกใช้ฟังก์ชัน loadHistory
  loadUsers()
  loadInventoryItems()
})

async function saveStockCheckUpdate() {
  if (!selectedRecord.value) return

  const payload = {
    checkDate: selectedRecord.value.checkDate,
    staffName: selectedRecord.value.staffName,
    note: selectedRecord.value.note,
    userId: selectedRecord.value.userId,
    items: selectedItems.value.map((item) => ({
      inventoryItemId: item.inventoryitemId,
      newQuantity: item.newQuantity,
    })),
  }

  try {
    const res = await axios.patch(
      `http://localhost:5002/stockcheck-record/${selectedRecord.value.id}`,
      payload,
    )
    console.log('Update success', res.data)
    dialog.value = false
    await loadHistory() // โหลดข้อมูลใหม่
  } catch (err) {
    console.error('Update failed', err)
  }
}

// ดึงข้อมูลจาก API เมื่อหน้าโหลด
async function loadHistory() {
  try {
    const response = await axios.get('http://localhost:5002/stockcheck-record') // URL ของ API ที่จะดึงข้อมูลจาก DB
    history.value = response.data // เก็บข้อมูลที่ได้จาก API
  } catch (error) {
    console.error('Error fetching stock check records:', error)
  }
}

const isCheckStockDisabled = computed(() => {
  return (
    !selectedDate.value || // ไม่ได้เลือกวันที่
    !selectedUser.value || // ไม่ได้เลือกชื่อผู้ใช้
    note.value.trim() === '' // ไม่ได้กรอกหมายเหตุ
  )
})

function CheckStock() {
  dialog.value = true
  if (!isCheckStockDisabled.value) {
    isCheckStocking.value = true
    // คุณอาจใส่โค้ดเตรียมค่าอื่นๆ ได้ตรงนี้
  }
}

// ฟังก์ชันกรองประวัติการเช็คสต็อก
function filterHistory() {
  console.log(`Filtering by year: ${selectedYear.value}, month: ${selectedMonth.value}`)
}

// ฟังก์ชันรีเฟรชการกรอง
function refreshHistory() {
  selectedYear.value = null
  selectedMonth.value = null
}

// ฟังก์ชันดูรายละเอียด
function viewStockDetails(evt: Event, row: StockCheckRecord) {
  selectedRecord.value = row
  selectedItems.value = row.stockcheckDetails // เข้าถึงข้อมูล stockcheckDetails
  dialog.value = true // เปิด Dialog
}

function submitForm() {
  console.log('Submit', {
    selectedDate: selectedDate.value,
    name: name.value,
    note: note.value,
  })
}

function openCalendar() {
  calendarDialog.value = true
}

function confirmDate() {
  calendarDialog.value = false
}
// การกรองข้อมูลประวัติ
const filteredHistory = computed(() => {
  // การกรองข้อมูลตามปี, เดือน และชื่อที่พิมพ์
  return history.value.filter((item) => {
    const itemDate = new Date(item.checkDate) // แปลง checkDate เป็นวันที่
    const yearMatch = selectedYear.value ? itemDate.getFullYear() === selectedYear.value : true // กรองตามปี
    const monthMatch = selectedMonth.value ? itemDate.getMonth() + 1 === selectedMonth.value : true // กรองตามเดือน
    const dayMatch = itemDate.getDate() >= 1 && itemDate.getDate() <= 31 // กรองทุกวันที่ 1-31 ของเดือน
    const nameMatch = item.staffName.toLowerCase().includes(searchQuery.value.toLowerCase()) // กรองตามชื่อผู้ตรวจสอบ

    return yearMatch && monthMatch && dayMatch && nameMatch
  })
})
</script>

<style scoped>
/* เพิ่มแอนิเมชั่นการเปลี่ยนแท็บ */
.fade-transition {
  transition: opacity 0.3s ease-in-out;
}

.q-tab-panels {
  display: flex;
  justify-content: center;
  align-items: center;
}

.q-tab-panel {
  opacity: 0;
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
