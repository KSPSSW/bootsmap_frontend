<template>
  <q-page padding>
    <div>
      <div class="text-h6 q-mb-lg">Product Management</div>
      <div class="row justify-between items-center q-mb-lg">
        <div class="row items-center q-gutter-md">
          <!-- Search Bar -->
          <q-input
            filled
            v-model="search"
            label="Search Product"
            debounce="300"
            class="q-mr-md"
            dense
            style="width: 250px"
          >
            <template v-slot:append>
              <q-icon name="search" class="cursor-pointer" />
            </template>
          </q-input>

          <!-- Total Count Display -->
          <div v-if="isFiltered" class="q-pa-none">
            <q-input
              filled
              readonly
              label="จำนวนสินค้าทั้งหมด"
              :model-value="totalCount.toString()"
              class="q-mr-md"
              dense
              style="width: 250px"
            >
              <template v-slot:prepend>
                <q-icon name="inventory_2" />
              </template>
            </q-input>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="row q-gutter-sm">
          <q-btn icon="filter_alt" color="blue" @click="openFilterDialog">Filter</q-btn>
          <q-btn icon="list_alt" color="green" @click="fetchProducts">Filter NoParam</q-btn>
          <q-btn icon="add" color="brown-10" @click="openDialog">Add</q-btn>
        </div>
      </div>
    </div>

    <q-table :columns="columns" :rows="filteredProducts" flat bordered dense>
      <template v-slot:body-cell-operation="{ row }">
        <div style="display: flex; gap: 8px; justify-content: center">
          <q-img :src="row.image" style="width: 70px; height: 70px; border-radius: 4px" />
          <q-btn flat icon="edit" @click="edit(row)" />
          <q-btn flat icon="delete" @click="remove(row)" />
        </div>
      </template>

      <!-- Slot for displaying image from 'image-url' -->
      <template v-slot:body-cell-image-url="{ row }">
        <q-img :src="'http://localhost:5002' + row.imageUrl" style="max-width: 50px"></q-img>
      </template>
    </q-table>

    <!-- Filter Dialog สำหรับ getProductByMinPrice_Category -->
    <q-dialog v-model="filterDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Filter Products</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form ref="filterForm" @submit="applyFilter" class="q-gutter-md">
            <!-- Minimum Price Input -->
            <q-input
              filled
              v-model="minPrice"
              type="number"
              label="Minimum Price *"
              lazy-rules
              :rules="[(val) => val >= 0 || 'Price must be a positive number']"
            />

            <!-- Category Select -->
            <q-select
              filled
              v-model="filterCategoryId"
              :options="productCategory"
              label="Category *"
              lazy-rules
              emit-value
              map-options
              :rules="[(val) => !!val || 'Category is required']"
            />

            <!-- Actions -->
            <div class="row justify-end q-mt-md">
              <q-btn label="Cancel" flat color="negative" v-close-popup class="q-mr-sm" />
              <q-btn
                v-if="isFiltered"
                label="Reset Filter"
                color="warning"
                @click="resetFilter"
                class="q-mr-sm"
              />
              <q-btn label="Apply Filter" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Original Dialog for adding/editing products -->
    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 600px">
        <q-card-section>
          <div class="text-h6">{{ id === 0 ? 'Add New Product' : 'Edit Product' }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form ref="form" @submit="save" @reset="reset" class="q-gutter-md">
            <!-- Name Input -->
            <q-input
              filled
              v-model="name"
              label="Name *"
              lazy-rules
              :rules="[(val) => !!val || 'Name is required']"
            />

            <!-- Price Input -->
            <q-input
              filled
              v-model="price"
              type="number"
              label="Price *"
              lazy-rules
              :rules="[(val) => !!val || 'Price is required']"
            />

            <!-- Category Select -->
            <q-select
              v-model="productCategoryId"
              :options="productCategory"
              label="Category *"
              lazy-rules
              emit-value
              map-options
              :rules="[(val) => !!val || 'Category is required']"
            />

            <!-- Type Section -->
            <div class="q-mt-lg">
              <div class="text-subtitle2 q-mb-sm">Type</div>
              <q-row>
                <q-col>
                  <q-option-group
                    v-model="typeIds"
                    :options="typesOption"
                    type="checkbox"
                    label="Select Type"
                    inline
                  />
                </q-col>
              </q-row>
            </div>

            <!-- Size Section -->
            <div class="q-mt-lg">
              <div class="text-subtitle2 q-mb-sm">Size</div>
              <q-row>
                <q-col>
                  <q-option-group
                    v-model="productSizeIds"
                    :options="productSizes"
                    type="checkbox"
                    label="Select Size"
                    inline
                  />
                </q-col>
              </q-row>
            </div>

            <!-- Sweet Level Section -->
            <div class="q-mt-lg">
              <div class="text-subtitle2 q-mb-sm">Sweet Level</div>
              <q-row>
                <q-col>
                  <q-option-group
                    v-model="productSweetLevelIds"
                    :options="productSweetLevels"
                    type="checkbox"
                    label="Select Sweet Level"
                    inline
                  />
                </q-col>
              </q-row>
            </div>

            <!-- Image Uploader -->
            <q-uploader
              v-model="imageFiles"
              label="Upload Image"
              accept="image/*"
              @added="onFileChange"
              class="q-mt-lg"
            />

            <!-- Actions -->
            <div>
              <q-btn label="Submit" type="submit" color="primary" />
              <q-btn label="Cancel" type="reset" color="primary" flat class="q-ml-sm" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { type QForm, type QTableColumn } from 'quasar'
import { useProductStore } from 'src/stores/productStore'
import type { Product, ProductCategory, ProductSize, ProductSweetLevel, Type } from 'src/models'
import { useProductCategoryStore } from 'src/stores/productCategoryStore'
import { useTypeStore } from 'src/stores/typeStore'
import { useProductSizeStore } from 'src/stores/productSizeStore'
import { useProductSweetLevelStore } from 'src/stores/productSweetLevelStore'
import { Notify } from 'quasar'

const productStore = useProductStore()
const search = ref<string>('') // For search input
const dialog = ref(false)
const form = ref<QForm | null>(null)
const id = ref(0)
const name = ref('')
const price = ref(0)
const image = ref<string | null>(null)
const productCategoryId = ref(1)
const productSizeIds = ref<number[]>([])
const productSweetLevelIds = ref<number[]>([]) // Always an array
const typeIds = ref<number[]>([]) // ให้ตรงกับ type.id ที่เป็น number

// สำหรับ Filter Dialog
const filterDialog = ref(false)
const filterForm = ref<QForm | null>(null)
const minPrice = ref(0)
const filterCategoryId = ref(1)
const filteredProductsData = ref<Product[]>([])
const totalCount = ref(0)
const isFiltered = ref(false)

const productCategoryStore = useProductCategoryStore()

const productCategory = computed(() =>
  productCategoryStore.productCategories.map((cat) => ({
    label: cat.name,
    value: cat.id,
  })),
)

const typeStore = useTypeStore()

const typesOption = computed(() =>
  typeStore.types.map((t) => ({
    label: t.name,
    value: t.id,
  })),
)
const productSizeStore = useProductSizeStore()

const productSizes = computed(() =>
  productSizeStore.productSizes.map((s) => ({
    label: s.name,
    value: s.id,
  })),
)
const productSweetLevelStore = useProductSweetLevelStore()
const productSweetLevels = computed(() =>
  productSweetLevelStore.productSweetLevels.map((sw) => ({
    label: sw.name,
    value: sw.id,
  })),
)

const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'center', sortable: true },
  { name: 'name', label: 'Name', field: 'name', align: 'center' },
  {
    name: 'price',
    label: 'Price',
    field: 'price',
    align: 'center',
    format: (val: number) => `${val} ฿`,
  },
  {
    name: 'categoryId',
    label: 'Category',
    field: 'productCategory',
    align: 'center',
    format: (val: ProductCategory) => {
      // ตรวจสอบว่า val เป็นอ็อบเจ็กต์และมีฟิลด์ id หรือไม่
      if (val && val.id) {
        return val.name.toString() // have id show name
      } else {
        return '-' // ถ้าไม่เจอ id หรือ productCategory ไม่ถูกต้อง
      }
    },
  },
  {
    name: 'type',
    label: 'Type',
    field: 'types',
    align: 'center',
    format: (val: Type[] | null) => {
      if (val && val.length > 0) {
        // ถ้า val เป็น array และมีข้อมูล
        return (
          val
            .filter((item) => item.id) // กรองเฉพาะอ็อบเจ็กต์ที่มี id
            .map((item) => item.name) // แสดง name ของแต่ละ item
            .join(', ') || '-'
        ) // หากมีหลาย name ให้แสดงเป็นคอมม่า และถ้าไม่มีจะเป็น '-'
      } else {
        return '-' // ถ้าไม่พบข้อมูลหรือ val เป็น null
      }
    },
  },
  {
    name: 'size',
    label: 'Size',
    field: 'productSizes',
    align: 'center',
    format: (val: ProductSize[] | null) => {
      if (val && val.length > 0) {
        // ถ้า val เป็น array และมีข้อมูล
        return (
          val
            .filter((item) => item.id) // กรองเฉพาะอ็อบเจ็กต์ที่มี id
            .map((item) => item.name) // แสดง name ของแต่ละ item
            .join(', ') || '-'
        ) // หากมีหลาย name ให้แสดงเป็นคอมม่า และถ้าไม่มีจะเป็น '-'
      } else {
        return '-' // ถ้าไม่พบข้อมูลหรือ val เป็น null
      }
    },
  },
  {
    name: 'sweetLevel',
    label: 'Sweet Level',
    field: 'productSweetLevels',
    align: 'center',
    format: (val: ProductSweetLevel[] | null) => {
      if (val && val.length > 0) {
        // ถ้า val เป็น array และมีข้อมูล
        return (
          val
            .filter((item) => item.id) // กรองเฉพาะอ็อบเจ็กต์ที่มี id
            .map((item) => item.name) // แสดง name ของแต่ละ item
            .join(', ') || '-'
        ) // หากมีหลาย name ให้แสดงเป็นคอมม่า และถ้าไม่มีจะเป็น '-'
      } else {
        return '-' // ถ้าไม่พบข้อมูลหรือ val เป็น null
      }
    },
  },
  {
    name: 'image-url',
    label: 'Image',
    field: 'imageUrl',
    align: 'center',
  },
  { name: 'operation', label: '', field: 'operation', align: 'center' },
]

const filteredProducts = computed(() => {
  // ถ้ามีการใช้ filter จาก getProductByMinPrice_Category ให้ใช้ข้อมูลที่กรองแล้ว
  if (isFiltered.value) {
    return filteredProductsData.value
  }

  // ถ้าไม่มีการ filter แต่มีการค้นหา
  if (search.value) {
    return productStore.products.filter((product) =>
      product.name.toLowerCase().includes(search.value.toLowerCase()),
    )
  }

  // ถ้าไม่มีการ filter และไม่มีการค้นหา
  return productStore.products
})

function openDialog() {
  reset()
  dialog.value = true
}

function openFilterDialog() {
  minPrice.value = 0
  // ตรวจสอบค่า undefined อย่างปลอดภัย
  if (
    productCategory.value.length > 0 &&
    productCategory.value[0] &&
    typeof productCategory.value[0].value === 'number'
  ) {
    filterCategoryId.value = productCategory.value[0].value
  } else {
    filterCategoryId.value = 1
  }
  filterDialog.value = true
}

async function applyFilter() {
  filterForm.value?.validate().then(async (success) => {
    if (success) {
      // เรียกใช้ฟังก์ชันค้นหาสินค้าตามราคาและหมวดหมู่
      const results = await productStore.getProductByMinPrice_Category(
        minPrice.value,
        filterCategoryId.value,
      )

      // เก็บผลลัพธ์และปรับสถานะการกรอง
      filteredProductsData.value = results.products
      totalCount.value = results.totalCount
      isFiltered.value = true

      // ปิด dialog
      filterDialog.value = false
    }
  })
}

function resetFilter() {
  isFiltered.value = false
  filteredProductsData.value = []
  totalCount.value = 0
  search.value = ''
}

function edit(row: Product) {
  id.value = row.id ?? 0
  name.value = row.name
  price.value = row.price
  productCategoryId.value = row.productCategory?.id ?? 1
  typeIds.value = row.types?.map((t) => t.id) || []
  productSizeIds.value = row.productSizes?.map((s) => s.id) || []
  productSweetLevelIds.value = row.productSweetLevels?.map((sw) => sw.id) || []
  image.value = row.image || null
  dialog.value = true
}

async function remove(p: Product) {
  await productStore.deleteProduct(p)
  // ถ้าเรากำลังใช้ฟิลเตอร์อยู่ ให้รีเฟรชข้อมูลที่กรองไว้
  if (isFiltered.value) {
    applyFilter()
  }
}

async function save() {
  form.value?.validate().then(async (success) => {
    if (success) {
      const selectedCategory = productCategoryStore.productCategories.find(
        (c) => c.id === productCategoryId.value,
      )
      const selectedTypes = typeStore.types.filter((t) => typeIds.value.includes(t.id))
      const selectedSizes = productSizeStore.productSizes.filter((s) =>
        productSizeIds.value.includes(s.id),
      )
      const selectedSweetLevels = productSweetLevelStore.productSweetLevels.filter((sw) =>
        productSweetLevelIds.value.includes(sw.id),
      )
      console.log(selectedCategory, selectedSizes, selectedSweetLevels, selectedTypes)
      const product: Product = {
        id: id.value,
        name: name.value,
        price: price.value,
        productCategory: selectedCategory!,
        types: selectedTypes,
        productSizes: selectedSizes,
        productSweetLevels: selectedSweetLevels,
        image: image.value || '',
      }

      if (id.value === 0) {
        await productStore.addProduct(product)
      } else {
        await productStore.updateProduct(product)
      }

      dialog.value = false
      reset()

      // ถ้าเรากำลังใช้ฟิลเตอร์อยู่ ให้รีเฟรชข้อมูลที่กรองไว้
      if (isFiltered.value) {
        applyFilter()
      }
    }
  })
}

function reset() {
  form.value?.resetValidation()
  id.value = 0
  name.value = ''
  price.value = 0
  productCategoryId.value = 1
  typeIds.value = []
  productSizeIds.value = []
  productSweetLevelIds.value = []
  image.value = null
  dialog.value = false
}

const imageFiles = ref<File[]>([])
function onFileChange(files: readonly File[]) {
  const file = files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = () => {
      image.value = reader.result as string
    }
    reader.readAsDataURL(file)
  }
}

async function fetchProducts() {
  try {
    // เรียกใช้ฟังก์ชัน getProductByMinPrice_Category_NoParameter
    const results = await productStore.getProductByMinPrice_Category_NoParameter()

    // เก็บผลลัพธ์และปรับสถานะการกรอง
    filteredProductsData.value = results.products
    totalCount.value = results.totalCount
    isFiltered.value = true

    // แสดงข้อความแจ้งเตือน
    Notify.create({
      message: 'แสดงข้อมูลสินค้าทั้งหมด',
      color: 'positive',
      position: 'top',
    })
  } catch (error) {
    console.error('Error fetching all products:', error)
  }
}
</script>
