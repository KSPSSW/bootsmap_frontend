<template>
  <div class="q-pa-md">
    <!-- ช่องค้นหาและปุ่ม -->
    <q-row class="q-mb-md" justify="between" align="center">
      <q-input
        v-model="searchQuery"
        placeholder="Search..."
        rounded
        outlined
        dense
        style="width: 300px"
        class="q-mr-md"
      >
        <q-icon name="search"></q-icon>
      </q-input>

      <!-- ปุ่ม CheckStock ที่ขยับไปทางขวา -->
      <q-btn
        push
        color="orange"
        text-color="white"
        label="CheckStock"
        @click="openDialog"
        class="q-ml-auto"
      />

      <q-btn push color="green" text-color="white" label="+ Add" class="q-ml-auto" />
    </q-row>

    <!-- QTable -->
    <q-table
      style="height: 400px"
      flat
      bordered
      title="Stock Management"
      :rows="filteredRows"
      :columns="columns"
      row-key="index"
      virtual-scroll
      :rows-per-page-options="[0]"
    >
      <!-- Column for Edit button -->
      <template v-slot:body-cell-edit="props">
        <q-td :props="props">
          <q-btn
            push
            color="blue"
            text-color="white"
            label="Edit"
            @click="(evt) => editItem(evt, props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <!-- Dialog สำหรับ CheckStock -->
    <q-dialog v-model="dialogVisible">
      <q-card>
        <q-card-section>
          <div class="text-h6">Stock Check</div>
        </q-card-section>

        <q-card-section>
          <q-table
            style="height: 400px"
            flat
            bordered
            title="Stock Management"
            :rows="filteredRows"
            :columns="columns2"
            row-key="index"
            virtual-scroll
            :rows-per-page-options="[0]"
          >
            <!-- Column for Edit button -->
            <template v-slot:body-cell-edit="props">
              <q-td :props="props">
                <q-btn
                  push
                  color="blue"
                  text-color="white"
                  label="Edit"
                  @click="(evt) => editItem(evt, props.row)"
                />
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-card-actions>
          <q-btn label="Close" color="primary" @click="closeDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-btn push color="primary" text-color="white" label="History" />
    <q-btn push color="orange" text-color="white" label="Print" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { QTableColumn } from 'quasar'

// const text = ref<string>('')
// const ph = ref<string>('')
// const dense = ref<boolean>(false)

interface Product {
  name: string
  calories: number
  fat: number
  carbs: number
  protein: number
  sodium: number
  calcium: string
  iron: string
}

const columns: QTableColumn[] = [
  {
    name: 'index',
    label: 'No.',
    field: 'index',
  },
  {
    name: 'name',
    required: true,
    label: 'Name',
    align: 'left',
    field: 'name',
    sortable: true,
  },
  { name: 'calories', label: 'Calories', field: 'calories', sortable: true },
  { name: 'fat', label: 'Fat (g)', field: 'fat', sortable: true },
  { name: 'carbs', label: 'Carbs (g)', field: 'carbs' },
  { name: 'protein', label: 'Protein (g)', field: 'protein' },
  { name: 'sodium', label: 'Sodium (mg)', field: 'sodium' },
  {
    name: 'calcium',
    label: 'Calcium (%)',
    field: 'calcium',
    sortable: true,
    sort: (a, b) => parseInt(a, 10) - parseInt(b, 10),
  },
  {
    name: 'action',
    label: 'Action',
    field: 'action',
    align: 'center',
  },
  {
    name: 'edit',
    label: 'Edit',
    field: 'edit',
    align: 'center',
  },
]

const columns2: QTableColumn[] = [
  {
    name: 'index',
    label: 'No.',
    field: 'index',
  },
  {
    name: 'name',
    required: true,
    label: 'Name',
    align: 'left',
    field: 'name',
    sortable: true,
  },

  { name: 'fat', label: 'Fat (g)', field: 'fat', sortable: true },
]
const seed = [
  {
    name: 'Frozen Yogurt',
    calories: 159,
    fat: 6.0,
    carbs: 24,
    protein: 4.0,
    sodium: 87,
    calcium: '14%',
    iron: '1%',
  },
  {
    name: 'Ice cream sandwich',
    calories: 237,
    fat: 9.0,
    carbs: 37,
    protein: 4.3,
    sodium: 129,
    calcium: '8%',
    iron: '1%',
  },
  {
    name: 'Eclair',
    calories: 262,
    fat: 16.0,
    carbs: 23,
    protein: 6.0,
    sodium: 337,
    calcium: '6%',
    iron: '7%',
  },
  {
    name: 'Cupcake',
    calories: 305,
    fat: 3.7,
    carbs: 67,
    protein: 4.3,
    sodium: 413,
    calcium: '3%',
    iron: '8%',
  },
  {
    name: 'Gingerbread',
    calories: 356,
    fat: 16.0,
    carbs: 49,
    protein: 3.9,
    sodium: 327,
    calcium: '7%',
    iron: '16%',
  },
  {
    name: 'Jelly bean',
    calories: 375,
    fat: 0.0,
    carbs: 94,
    protein: 0.0,
    sodium: 50,
    calcium: '0%',
    iron: '0%',
  },
  {
    name: 'Lollipop',
    calories: 392,
    fat: 0.2,
    carbs: 98,
    protein: 0,
    sodium: 38,
    calcium: '0%',
    iron: '2%',
  },
  {
    name: 'Honeycomb',
    calories: 408,
    fat: 3.2,
    carbs: 87,
    protein: 6.5,
    sodium: 562,
    calcium: '0%',
    iron: '45%',
  },
  {
    name: 'Donut',
    calories: 452,
    fat: 25.0,
    carbs: 51,
    protein: 4.9,
    sodium: 326,
    calcium: '2%',
    iron: '22%',
  },
  {
    name: 'KitKat',
    calories: 518,
    fat: 26.0,
    carbs: 65,
    protein: 7,
    sodium: 54,
    calcium: '12%',
    iron: '6%',
  },
]

const searchQuery = ref('')

const filteredRows = computed(() => {
  return seed.filter((item) => item.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

// สถานะการแสดงผล dialog
const dialogVisible = ref(false)
const selectedItem = ref<Product | null>(null)

// เปิด dialog พร้อมข้อมูลสินค้าที่เลือก
const openDialog = () => {
  dialogVisible.value = true
}

// ปิด dialog
const closeDialog = () => {
  dialogVisible.value = false
  selectedItem.value = null
}

// ฟังก์ชันสำหรับการแก้ไขข้อมูล
const editItem = (evt: Event, item: Product) => {
  console.log('Editing item:', item)
  // สามารถเพิ่มการแก้ไขข้อมูลที่นี่
}
</script>
