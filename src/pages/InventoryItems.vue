<template>
  <q-page padding>
    <div>
      <!-- หัวข้อหลัก -->
      <div class="text-h6 q-mb-lg">Inventory Management</div>
      <!-- แถวสำหรับช่องค้นหาและปุ่ม -->
      <div class="row justify-between items-center q-mb-lg">
        <div class="row items-center q-gutter-md">
          <q-input
            filled
            v-model="search"
            label="Search"
            debounce="300"
            class="q-mr-md"
            dense
            @update:model-value="handleSearch"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append>
              <q-icon name="close" @click="clearSearch" class="cursor-pointer" v-if="search" />
            </template>
          </q-input>

          <q-btn-dropdown color="primary" label="Category Filter">
            <q-list>
              <q-item clickable v-close-popup @click="filterByCategory(null)">
                <q-item-section>
                  <q-item-label>All Categories</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item
                v-for="category in categoryOptions"
                :key="category.id ?? -1"
                clickable
                v-close-popup
                @click="filterByCategory(category.id ?? null)"
              >
                <q-item-section>
                  <q-item-label>{{ category.name }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <q-btn-dropdown color="primary" label="Branch Filter">
            <q-list>
              <q-item clickable v-close-popup @click="filterByBranch(null)" v-if="isAdmin">
                <q-item-section>
                  <q-item-label>All Branches</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator v-if="isAdmin" />
              <q-item
                v-for="branch in filteredBranchOptions"
                :key="branch.id ?? -1"
                clickable
                v-close-popup
                @click="filterByBranch(branch.id ?? null)"
              >
                <q-item-section>
                  <q-item-label>{{ branch.name }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <q-btn
            :color="showLowStock ? 'negative' : 'grey'"
            :label="showLowStock ? 'All Items' : 'Low Stock'"
            @click="toggleLowStock"
          />
        </div>

        <q-btn icon="add" color="brown-10" label="Add Item" @click="openDialog" />
      </div>
    </div>
    <q-table
      :columns="columns"
      :rows="displayedItems"
      class="q-mb-lg"
      row-key="id"
      :rows-per-page-options="[10, 20, 50, 0]"
    >
      <template v-slot:body="props">
        <q-tr :props="props" :class="{ 'bg-red-1': isLowStock(props.row) }">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.value }}
          </q-td>
          <q-td auto-width>
            <div class="q-gutter-sm">
              <q-btn
                flat
                round
                color="blue"
                icon="edit"
                @click="edit(props.row)"
                :disable="!canEditItem(props.row)"
              >
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="red"
                icon="delete"
                @click="remove(props.row)"
                :disable="!canEditItem(props.row)"
              >
                <q-tooltip>Delete</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-dialog v-model="dialog" persistent maximized :full-height="false">
      <q-card style="width: 700px; max-width: 90vw">
        <q-card-section class="bg-brown-7 text-white">
          <div class="text-h6">{{ id === 0 ? 'Add New Item' : 'Edit Item' }}</div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <q-form ref="form" @submit="save" @reset="reset" class="q-gutter-md">
            <div class="text-subtitle2 q-mb-sm">Basic Information</div>
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input
                  filled
                  v-model="name"
                  label="Name *"
                  lazy-rules
                  :rules="[(val) => !!val || 'Name is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="inventory_2" />
                  </template>
                </q-input>
              </div>

              <div class="col-md-6 col-sm-12">
                <q-select
                  filled
                  v-model="categoryId"
                  label="Category *"
                  :options="categoryOptions"
                  option-value="id"
                  option-label="name"
                  map-options
                  lazy-rules
                  :rules="[(val) => !!val || 'Category is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="category" />
                  </template>
                </q-select>
              </div>

              <div class="col-md-6 col-sm-12">
                <q-select
                  filled
                  v-model="branchId"
                  label="Branch *"
                  :options="isAdmin ? branchOptions : userBranchOptions"
                  option-value="id"
                  option-label="name"
                  map-options
                  lazy-rules
                  :rules="[(val) => !!val || 'Branch is required']"
                  :disable="!isAdmin"
                >
                  <template v-slot:prepend>
                    <q-icon name="store" />
                  </template>
                </q-select>
              </div>
            </div>

            <q-separator spaced />
            <div class="text-subtitle2 q-mb-sm">Quantity Information</div>

            <div class="row q-col-gutter-md">
              <div class="col-md-6 col-sm-12">
                <q-input
                  filled
                  type="number"
                  v-model.number="quantity"
                  label="Quantity *"
                  lazy-rules
                  :rules="[(val) => val > 0 || 'Quantity must be greater than 0']"
                >
                  <template v-slot:prepend>
                    <q-icon name="inventory" />
                  </template>
                </q-input>
              </div>
              <div class="col-md-6 col-sm-12">
                <q-input
                  filled
                  v-model="unit"
                  label="Unit *"
                  lazy-rules
                  :rules="[(val) => !!val || 'Unit is required']"
                >
                  <template v-slot:prepend>
                    <q-icon name="straighten" />
                  </template>
                </q-input>
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-md-6 col-sm-12">
                <q-input
                  filled
                  type="number"
                  v-model.number="minStock"
                  label="Min Stock *"
                  lazy-rules
                  :rules="[(val) => val >= 0 || 'Min stock must be greater than or equal to 0']"
                >
                  <template v-slot:prepend>
                    <q-icon name="low_priority" />
                  </template>
                </q-input>
              </div>
              <div class="col-md-6 col-sm-12">
                <q-input
                  filled
                  type="number"
                  v-model.number="price"
                  label="Price *"
                  lazy-rules
                  :rules="[(val) => val > 0 || 'Price must be greater than 0']"
                >
                  <template v-slot:prepend>
                    <q-icon name="paid" />
                  </template>
                  <template v-slot:append>
                    <div class="text-grey">฿</div>
                  </template>
                </q-input>
              </div>
            </div>

            <q-separator spaced />
            <div class="text-subtitle2 q-mb-sm">Additional Information</div>

            <q-input
              filled
              v-model="supplier"
              label="Supplier *"
              lazy-rules
              :rules="[(val) => !!val || 'Supplier is required']"
            >
              <template v-slot:prepend>
                <q-icon name="shopping_cart" />
              </template>
            </q-input>

            <q-input
              filled
              type="date"
              v-model="lastOrder"
              label="Last Order *"
              lazy-rules
              :rules="[(val) => !!val || 'Last order date is required']"
            >
              <template v-slot:prepend>
                <q-icon name="event" />
              </template>
            </q-input>

            <div class="row justify-end q-mt-md">
              <q-btn label="Cancel" type="reset" color="grey" flat class="q-mr-sm" />
              <q-btn label="Submit" type="submit" color="brown-7" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { type QForm, type QTableColumn, Notify } from 'quasar'
import { useInventoryItemsStore } from 'src/stores/inventoryItemsStore'
import { useCategoryInventoryStore } from 'src/stores/category_inventoryStore'
import { useBranchStore } from 'src/stores/branchStore'
import { useAuthStore } from 'src/stores/authStore'
import type { InventoryItems } from 'src/models'

const inventoryItemsStore = useInventoryItemsStore()
const categoryStore = useCategoryInventoryStore()
const branchStore = useBranchStore()
const authStore = useAuthStore()
const search = ref<string>('')
const dialog = ref(false)
const form = ref<QForm | null>(null)
const id = ref(0)
const name = ref('')
const categoryId = ref(1)
const branchId = ref(1)
const quantity = ref(0)
const unit = ref('')
const minStock = ref(0)
const price = ref(0)
const supplier = ref('')
const lastOrder = ref('')
const selectedCategoryId = ref<number | null>(null)
const selectedBranchId = ref<number | null>(null)
const showLowStock = ref(false)

// ดึงข้อมูล User ปัจจุบันและตรวจสอบว่าเป็น Admin หรือไม่
const currentUser = computed(() => authStore.user)
const isAdmin = computed(() => currentUser.value?.roles?.some((role) => role.id === 1) ?? false)

// ตัวเลือกสาขาสำหรับผู้ใช้ที่ไม่ใช่ Admin (เฉพาะสาขาของตนเอง)
const userBranchOptions = computed(() => {
  if (!currentUser.value || !currentUser.value.branch) return []
  return [currentUser.value.branch]
})

// คำนวณสินค้าที่ผ่านการกรอง
const filteredInventoryItems = computed(() => {
  let items = [...inventoryItemsStore.filteredInventoryItems]

  // ถ้าไม่ใช่ Admin ให้แสดงเฉพาะสินค้าในสาขาของตนเอง
  if (!isAdmin.value && currentUser.value?.branch?.id) {
    items = items.filter((item) => item.branch?.id === currentUser.value?.branch?.id)
  }

  return items
})

// รายการที่แสดงผล (ผ่านการกรองตาม category, branch และ lowStock)
const displayedItems = computed(() => {
  let items = [...filteredInventoryItems.value]

  // กรองตามหมวดหมู่ (ถ้ามีการเลือก)
  if (selectedCategoryId.value !== null) {
    items = items.filter((item) => item.category?.id === selectedCategoryId.value)
  }

  // กรองตามสาขา (ถ้ามีการเลือก)
  if (selectedBranchId.value !== null) {
    items = items.filter((item) => item.branch?.id === selectedBranchId.value)
  }

  // กรองตาม lowStock (ถ้าเปิดใช้)
  if (showLowStock.value) {
    items = items.filter((item) => item.quantity <= item.minStock)
  }

  return items
})

// ใช้ข้อมูลหมวดหมู่จาก category store
const categoryOptions = computed(() => categoryStore.categories)

// ใช้ข้อมูลสาขาจาก branch store
const branchOptions = computed(() => branchStore.branches)

// ตัวเลือกสาขาที่กรองตามสิทธิ์ของผู้ใช้แล้ว
const filteredBranchOptions = computed(() => {
  if (isAdmin.value) return branchOptions.value
  if (currentUser.value?.branch) {
    return [currentUser.value.branch]
  }
  return []
})

// เรียกดึงข้อมูลหมวดหมู่และสาขาเมื่อโหลดหน้า
onMounted(async () => {
  await categoryStore.getCategories()
  await branchStore.getBranches()

  // ถ้าผู้ใช้ไม่ใช่ Admin และมีข้อมูลสาขา ให้กำหนดค่าเริ่มต้นสำหรับ branchId
  if (!isAdmin.value && currentUser.value?.branch?.id) {
    branchId.value = currentUser.value.branch.id
    selectedBranchId.value = currentUser.value.branch.id
  }
})

// ตรวจสอบว่าสามารถแก้ไขรายการได้หรือไม่ (Admin สามารถแก้ไขได้ทุกรายการ, User ปกติแก้ไขได้เฉพาะสาขาตัวเอง)
function canEditItem(item: InventoryItems): boolean {
  if (isAdmin.value) return true
  return item.branch?.id === currentUser.value?.branch?.id
}

const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'center', sortable: true },
  { name: 'name', label: 'Name', field: 'name', align: 'center' },
  {
    name: 'category_inventory',
    label: 'Category',
    field: (row) => getCategoryName(row.category?.id),
    align: 'center',
  },
  {
    name: 'branch',
    label: 'Branch',
    field: (row) => getBranchName(row.branch?.id),
    align: 'center',
  },
  { name: 'quantity', label: 'Quantity', field: 'quantity', align: 'center' },
  { name: 'unit', label: 'Unit', field: 'unit', align: 'center' },
  { name: 'minStock', label: 'Min Stock', field: 'minStock', align: 'center' },
  { name: 'price', label: 'Price', field: 'price', align: 'center', format: (val) => `฿${val}` },
  { name: 'supplier', label: 'Supplier', field: 'supplier', align: 'center' },
  {
    name: 'lastOrder',
    label: 'Last Order',
    field: 'lastOrder',
    align: 'center',
    format: (val) => formatDate(val),
  },
  { name: 'operation', label: 'Actions', field: 'operation', align: 'center' },
]

function getCategoryName(id: number) {
  const category = categoryStore.categories.find((c) => c.id === id)
  return category ? category.name : 'Unknown'
}

function getBranchName(id: number) {
  const branch = branchStore.branches.find((b) => b.id === id)
  return branch ? branch.name : 'Unknown'
}

function formatDate(dateString: string) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

function openDialog() {
  reset()

  // ถ้าผู้ใช้ไม่ใช่ Admin ให้กำหนดสาขาเป็นสาขาของผู้ใช้เลย
  if (!isAdmin.value && currentUser.value?.branch?.id) {
    branchId.value = currentUser.value.branch.id
  }

  dialog.value = true
}

function edit(row: InventoryItems) {
  // ตรวจสอบก่อนว่าสามารถแก้ไขได้หรือไม่
  if (!canEditItem(row)) return

  id.value = row.id ?? 0
  name.value = row.name
  categoryId.value = row.category?.id ?? 1
  branchId.value = row.branch?.id ?? 1
  quantity.value = row.quantity
  unit.value = row.unit
  minStock.value = row.minStock
  price.value = row.price
  supplier.value = row.supplier
  lastOrder.value = row.lastOrder
  dialog.value = true
}

function remove(item: InventoryItems) {
  // ตรวจสอบก่อนว่าสามารถลบได้หรือไม่
  if (!canEditItem(item)) return

  inventoryItemsStore.deleteInventoryItem(item)
}

function save() {
  form.value?.validate().then(async (success) => {
    if (success) {
      // ถ้าผู้ใช้ไม่ใช่ Admin และกำลังพยายามเพิ่มหรือแก้ไขรายการในสาขาอื่น ให้ยกเลิก
      if (!isAdmin.value && branchId.value !== currentUser.value?.branch?.id) {
        Notify.create({
          message: 'คุณไม่มีสิทธิ์แก้ไขข้อมูลสาขาอื่น',
          color: 'negative',
          position: 'top',
        })
        return
      }

      if (id.value === 0) {
        await inventoryItemsStore.addInventoryItem({
          id: id.value,
          name: name.value,
          category: {
            id: categoryId.value,
            name: getCategoryName(categoryId.value),
          },
          branch: {
            id: branchId.value,
            name: getBranchName(branchId.value),
            address: '',
            openDate: new Date(),
            phone: 0,
          },
          quantity: quantity.value,
          unit: unit.value,
          minStock: minStock.value,
          price: price.value,
          supplier: supplier.value,
          lastOrder: lastOrder.value,
        })
      } else {
        await inventoryItemsStore.updateInventoryItem({
          id: id.value,
          name: name.value,
          category: {
            id: categoryId.value,
            name: getCategoryName(categoryId.value),
          },
          branch: {
            id: branchId.value,
            name: getBranchName(branchId.value),
            address: '',
            openDate: new Date(),
            phone: 0,
          },
          quantity: quantity.value,
          unit: unit.value,
          minStock: minStock.value,
          price: price.value,
          supplier: supplier.value,
          lastOrder: lastOrder.value,
        })
      }
      dialog.value = false
      reset()
    }
  })
}

function reset() {
  form.value?.resetValidation()
  id.value = 0
  name.value = ''
  categoryId.value =
    categoryOptions.value.length > 0 && categoryOptions.value[0]?.id !== undefined
      ? categoryOptions.value[0].id
      : 1

  // สำหรับ branch ถ้าไม่ใช่ Admin ให้เป็นสาขาของผู้ใช้เท่านั้น
  if (!isAdmin.value && currentUser.value?.branch?.id) {
    branchId.value = currentUser.value.branch.id
  } else {
    branchId.value =
      branchOptions.value.length > 0 && branchOptions.value[0]?.id !== undefined
        ? branchOptions.value[0].id
        : 1
  }

  quantity.value = 0
  unit.value = ''
  minStock.value = 0
  price.value = 0
  supplier.value = ''
  lastOrder.value = ''
  dialog.value = false
}

function handleSearch() {
  inventoryItemsStore.updateFilteredInventoryItems(search.value)
}

function clearSearch() {
  search.value = ''
  handleSearch()
}

// ฟังก์ชันกรองตาม category
function filterByCategory(categoryId: number | null) {
  selectedCategoryId.value = categoryId
}

// ฟังก์ชันกรองตาม branch
function filterByBranch(branchId: number | null) {
  selectedBranchId.value = branchId
}

// สลับการแสดงสินค้าที่ใกล้หมด
function toggleLowStock() {
  showLowStock.value = !showLowStock.value
}

// ตรวจสอบว่าสินค้าใกล้หมดหรือไม่
function isLowStock(item: InventoryItems) {
  return item.quantity <= item.minStock
}
</script>

<style lang="scss">
.bg-red-1 {
  background-color: rgba(255, 0, 0, 0.1);
}
</style>
