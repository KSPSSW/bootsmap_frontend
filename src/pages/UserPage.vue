<template>
  <q-page padding>
    <div>
      <!-- หัวข้อหลัก -->
      <div class="text-h6 q-mb-lg">User Management</div>
      <!-- แถวสำหรับช่องค้นหาและปุ่ม -->
      <div class="row justify-between items-center q-mb-lg">
        <q-input
          filled
          v-model="search"
          label="Search"
          debounce="300"
          class="q-mr-md"
          dense
          @input="handleSearch"
        >
          <template v-slot:append>
            <!-- ปุ่มค้นหาที่ทำงานเหมือนปุ่ม -->
            <q-icon name="search" @click="handleSearch" class="cursor-pointer" />
          </template>
        </q-input>
        <q-btn icon="add" color="brown-10" @click="openDialog">Add</q-btn>
      </div>
    </div>
    <q-table :columns="columns" :rows="filteredUsers" class="q-mb-lg">
      <template v-slot:body-cell-operation="{ row }">
        <q-btn flat icon="edit" @click="edit(row)"></q-btn>
        <q-btn flat icon="delete" @click="remove(row)"></q-btn>
      </template>
    </q-table>
    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ id === 0 ? 'Add New User' : 'Edit User' }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form ref="form" @submit="save" @reset="reset" class="q-gutter-md">
            <q-input
              filled
              v-model="name"
              label="Name *"
              lazy-rules
              :rules="[(val) => !!val || 'Name is required']"
            />
            <q-input
              filled
              v-model="email"
              label="Email *"
              lazy-rules
              :rules="[(val) => !!val || 'Email is required']"
            />
            <q-input
              filled
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              label="Password *"
              lazy-rules
              :rules="[(val) => !!val || 'Password is required']"
            >
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility' : 'visibility_off'"
                  @click="togglePasswordVisibility"
                  class="cursor-pointer"
                />
              </template>
            </q-input>
            <div class="q-gutter-none q-row">
              <q-select
                filled
                v-model="gender"
                label="Gender *"
                :options="['Male', 'Female']"
                hint="Select Gender"
                lazy-rules
                :rules="[(val) => ['Male', 'Female'].includes(val) || 'Invalid gender']"
                class="q-col-6"
              />
              <q-select
                filled
                v-model="roles"
                label="Role *"
                :options="['Admin', 'User']"
                hint="Select Role"
                lazy-rules
                :rules="[(val) => ['Admin', 'User'].includes(val) || 'Invalid roles']"
                class="q-col-6"
              />
            </div>
            <q-select
              filled
              v-model="branchId"
              label="Branch *"
              :options="branchOptions"
              option-value="id"
              option-label="name"
              map-options
              lazy-rules
              :rules="[(val) => !!val || 'Branch is required']"
            >
              <template v-slot:prepend>
                <q-icon name="store" />
              </template>
            </q-select>
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
import { ref, computed, onMounted } from 'vue'
import { type QForm, type QTableColumn } from 'quasar'
import { useUserStore } from 'src/stores/userStore'
import { useBranchStore } from 'src/stores/branchStore'
import type { User } from 'src/models'

const userStore = useUserStore()
const branchStore = useBranchStore()
const search = ref<string>('') // ใช้ search แทน searchQuery
const dialog = ref(false)
const form = ref<QForm | null>(null)
const id = ref(0)
const name = ref('')
const email = ref('')
const gender = ref('')
const roles = ref('')
const password = ref('')
const branchId = ref<number>(1)
const showPassword = ref(false)

// ใช้ข้อมูลสาขาจาก branch store
const branchOptions = computed(() => branchStore.branches)

// เรียกดึงข้อมูลสาขาเมื่อโหลดหน้า
onMounted(async () => {
  await branchStore.getBranches()
})

// คำนวณผู้ใช้งานที่ผ่านการกรอง
const filteredUsers = computed(() =>
  userStore.users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.value.toLowerCase()) ||
      user.email.toLowerCase().includes(search.value.toLowerCase()) ||
      user.roles,
  ),
)

const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'center', sortable: true },
  { name: 'name', label: 'Name', field: 'name', align: 'center' },
  { name: 'email', label: 'Email', field: 'email', align: 'center' },
  { name: 'password', label: 'Password', field: 'password', align: 'center' },
  { name: 'gender', label: 'Gender', field: 'gender', align: 'center' },
  {
    name: 'branch',
    label: 'Branch',
    field: (row) => row.branch?.name || 'Unknown',
    align: 'center',
  },
  // { name: 'roles', label: 'Role', field: 'roles', align: 'center' },
  { name: 'operation', label: 'Action', field: 'operation', align: 'center' },
]

function openDialog() {
  reset()
  dialog.value = true
}

function getBranchName(id: number) {
  const branch = branchStore.branches.find((b) => b.id === id)
  return branch ? branch.name : 'Unknown'
}

function edit(row: User) {
  console.log('User data for edit:', row)
  console.log('Role data:', row.roles)
  id.value = row.id ?? 0
  name.value = row.name
  email.value = row.email
  gender.value = row.gender
  branchId.value = row.branch?.id ?? 1
  // roles.value = row.roles && row.roles.length > 0 && row.roles[0]?.id === 1 ? 'Admin' : 'User'
  // ตรวจสอบเงื่อนไขการกำหนดค่า roles
  if (row.roles && Array.isArray(row.roles)) {
    // ดูว่ามี roles หรือไม่
    if (row.roles.length > 0) {
      // ตรวจสอบค่า id ที่ถูกต้อง - อาจต้องปรับตามโครงสร้างจริงของคุณ
      roles.value = row.roles[0]?.id === 1 ? 'Admin' : 'User'
      console.log('Role set to:', roles.value)
    } else {
      roles.value = 'User' // ค่าเริ่มต้นถ้าไม่มี roles
      console.log('No roles found, defaulting to User')
    }
  } else {
    console.error('Role property is not an array or is missing')
    roles.value = 'User' // ค่าเริ่มต้นถ้าไม่มี roles array
  }
  password.value = row.password
  dialog.value = true
}

function remove(u: User) {
  userStore.deleteUser(u)
}

function save() {
  form.value?.validate().then(async (success) => {
    if (success) {
      if (id.value === 0) {
        await userStore.addUser({
          id: id.value,
          name: name.value,
          email: email.value,
          gender: gender.value,
          roles: [{ id: roles.value === 'Admin' ? 1 : 2 }],
          password: password.value,
          branch: {
            id: branchId.value,
            name: getBranchName(branchId.value),
            address: '',
            openDate: new Date(),
            phone: 0,
          },
        })
      } else {
        await userStore.updateUser({
          id: id.value,
          name: name.value,
          email: email.value,
          gender: gender.value,
          roles: [{ id: roles.value === 'Admin' ? 1 : 2 }],
          password: password.value,
          branch: {
            id: branchId.value,
            name: getBranchName(branchId.value),
            address: '',
            openDate: new Date(),
            phone: 0,
          },
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
  email.value = ''
  gender.value = ''
  roles.value = ''
  password.value = ''
  branchId.value =
    branchOptions.value.length > 0 && branchOptions.value[0]?.id !== undefined
      ? branchOptions.value[0].id
      : 1
  dialog.value = false
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

// ฟังก์ชันสำหรับค้นหาข้อมูล (ไม่ต้องทำงานเพิ่มเติมในตัวอย่างนี้)
function handleSearch() {}
</script>
