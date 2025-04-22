<!-- eslint-disable vue/no-parsing-error -->
<template>
  <q-page class="q-pa-md">
    <!-- Stock Info Section -->-

    <!-- Add Stock Check Section -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">เพิ่มการเช็คสต็อกใหม่</div>
      </q-card-section>
      <q-card-section>
        <q-form @submit.prevent="handleNewStockCheck">
          <q-input
            v-model="newStockCheck.date"
            type="date"
            label="วันที่เช็คสต็อก"
            dense
            outlined
            required
          />
          <q-input v-model="newStockCheck.checker" label="ผู้ตรวจสอบ" dense outlined required />
          <q-input v-model="newStockCheck.note" label="หมายเหตุ" dense outlined />
          <q-btn label="เริ่มเช็คสต็อก" type="submit" color="primary" class="q-mt-sm" />
        </q-form>
      </q-card-section>
    </q-card>

    <!-- Stock History Section -->
    <q-card>
      <q-card-section>
        <div class="text-h6">ประวัติการเช็คสต็อก</div>
        <q-select
          v-model="filters.status"
          :options="statusOptions"
          label="สถานะ"
          dense
          outlined
          class="q-mb-sm"
        />
        <q-input
          v-model="filters.startDate"
          label="วันที่เริ่มต้น"
          type="date"
          dense
          outlined
          class="q-mb-sm"
        />
        <q-input
          v-model="filters.endDate"
          label="วันที่สิ้นสุด"
          type="date"
          outlined
          class="q-mb-sm"
        />
        <q-btn label="รีเฟรช" color="secondary" class="q-mb-md" @click="loadStockHistory" />
      </q-card-section>
      <q-table :rows="filteredChecks" :columns="columns" row-key="id" class="q-pa-sm">
        <template v-slot:body-cell-status="props">
          <q-td :props="props" align="center">
            <!-- ใช้ align="center" เพื่อจัดตำแหน่ง -->
            <q-chip
              :color="getStatusColor(props.row.status).color"
              :text-color="getStatusColor(props.row.status).textColor"
              :label="props.row.status"
              class="q-mb-xs"
            />
          </q-td>
        </template>

        <!-- คอลัมน์ปุ่มดูรายละเอียด -->
        <template v-slot:body-cell-actions="props">
          <q-btn label="ดูรายละเอียด" color="info" @click="viewDetails(props.row.id)" flat />
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCheckStockStore } from 'src/stores/checkStockStore'
import { type CheckStock } from 'src/models'
import { type QTableColumn } from 'quasar'
import { useUserStore } from 'src/stores/userStore'

export default defineComponent({
  setup() {
    const stockStore = useCheckStockStore()
    const router = useRouter()
    const userStore = useUserStore()

    const currentUser = computed(() => userStore.currentUser)

    const newStockCheck = ref({
      date: '',
      checker: currentUser.value?.name,
      note: '',
    })

    const filters = ref({
      status: 'all',
      startDate: '',
      endDate: '',
    })

    const statusOptions = [
      { label: 'ทุกสถานะ', value: 'all' },
      { label: 'กำลังดำเนินการ', value: 'กำลังดำเนินการ' },
      { label: 'เสร็จสิ้น', value: 'เสร็จสิ้น' },
    ]

    const columns: QTableColumn[] = [
      { name: 'date', label: 'วันที่', align: 'center', field: 'date' },
      { name: 'checker', label: 'ผู้ตรวจสอบ', align: 'center', field: 'checker' },
      { name: 'status', label: 'สถานะ', align: 'center', field: 'status' },
      { name: 'note', label: 'หมายเหตุ', align: 'center', field: 'note' },
      { name: 'actions', label: '', align: 'center', field: 'actions' },
    ]

    const handleNewStockCheck = () => {
      const newCheck = {
        ...newStockCheck.value,
        id: Date.now(),
        status: 'กำลังดำเนินการ',
        items: [],
      }
      stockStore.addStockCheck(newCheck as CheckStock)
      router.push(`/stock-detail/${newCheck.id}`)
    }

    const loadStockHistory = () => {
      // Implement logic to load stock history based on filters
    }

    const viewDetails = (id: number) => {
      router.push(`/stock-detail/${id}`)
    }

    const filteredChecks = computed(() => stockStore.loadStockHistory())

    // กำหนดประเภทของผลลัพธ์ให้ชัดเจน
    const getStatusColor = (status: string): { color: string; textColor: string } => {
      if (status === 'กำลังดำเนินการ') {
        return { color: 'yellow', textColor: 'black' }
      } else if (status === 'เสร็จสิ้น') {
        return { color: 'green', textColor: 'white' }
      } else {
        return { color: 'grey', textColor: 'black' }
      }
    }

    return {
      newStockCheck,
      filters,
      statusOptions,
      columns,
      handleNewStockCheck,
      loadStockHistory,
      viewDetails,
      filteredChecks,
      getStatusColor,
    }
  },
})
</script>

<style scoped>
.q-chip {
  font-weight: bold;
}
</style>
