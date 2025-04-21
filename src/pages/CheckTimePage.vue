<template>
  <q-page padding>
    <div class="header-title">CheckTime Management</div>
    <div class="row justify-between items-center q-mb-md">
      <div class="row items-center search-bar">
        <q-input
          outlined
          dense
          v-model="search"
          placeholder="Search"
          class="search-input"
          clearable
        >
          <template v-slot:append>
            <q-icon name="search" class="search-icon" />
          </template>
        </q-input>
      </div>

      <q-btn label="Check Time" color="brown-10" @click="openDialog" />
    </div>

    <q-dialog v-model="showDialog">
      <q-card style="min-width: 400px; text-align: center">
        <q-card-section>
          <div class="text-h6 q-mb-md">Check Time</div>
          <q-img src="logo.png" style="max-width: 100px; margin: 0 auto" />
        </q-card-section>

        <q-card-section>
          <q-form ref="form" @submit="submitCheckTime" class="q-gutter-md">
            <q-input
              filled
              v-model="email"
              label="Email"
              lazy-rules
              :rules="[(val) => !!val || 'Email is required']"
              prepend-icon="email"
              color="brown"
            />
            <q-input
              filled
              v-model="password"
              label="Password"
              type="password"
              lazy-rules
              :rules="[(val) => !!val || 'Password is required']"
              prepend-icon="lock"
              color="brown"
            />
            <q-radio v-model="checkAction" val="checkin" label="Check In" color="brown-10" />
            <q-radio v-model="checkAction" val="checkout" label="Check Out" color="brown-10" />
          </q-form>
        </q-card-section>

        <q-card-section>
          <div class="row q-gutter-sm justify-center">
            <q-btn label="Confirm" type="submit" color="brown-10" @click="submitCheckTime" />
            <q-btn flat label="Cancel" color="negative" @click="closeDialog" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-table :columns="columns" :rows="filteredData" row-key="id" flat class="q-mt-md styled-table">
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge
            :color="props.row.checkOutTime ? 'green' : 'red'"
            :label="props.row.checkOutTime ? 'Checked Out' : 'Checked In'"
          />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { ref } from 'vue'
import type { QTableColumn } from 'quasar'
import { QForm } from 'quasar'
import { useUserStore } from 'src/stores/userStore'
import { useCheckInOutStore } from 'src/stores/checkInOutStore'

const checkInOutStore = useCheckInOutStore()
const userStore = useUserStore()
const form = ref<QForm | null>(null)
const search = ref<string>('')
const email = ref('')
const password = ref('')
const checkAction = ref('checkin')
const showDialog = ref(false)
const checkInTime = ref('')
const checkOutTime = ref('')

onMounted(async () => {
  await checkInOutStore.getCheckInOut()
})

const filteredData = computed(() =>
  checkInOutStore.checkInOutData.filter((entry) =>
    entry.userId.name.toLowerCase().includes(search.value.toLowerCase()),
  ),
)

const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'center' },
  { name: 'user_Id', label: 'User ID', field: (row) => row.userId.id, align: 'center' },
  { name: 'Name', label: 'Name', field: (row) => row.userId.name, align: 'center' },
  { name: 'checkInTime', label: 'Check-in Time', field: 'checkInTime', align: 'center' },
  { name: 'checkOutTime', label: 'Check-out Time', field: 'checkOutTime', align: 'center' },
  { name: 'totalHours', label: 'Total Hours', field: 'totalHours', align: 'center' },
]

function openDialog() {
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
}

function submitCheckTime() {
  form.value?.validate().then((success) => {
    if (success) {
      const user = userStore.users.find(
        (u) => u.email === email.value && u.password === password.value,
      )

      if (user) {
        const currentTime = new Date()
        console.log('Current time:', currentTime)
        if (checkAction.value === 'checkin') {
          const alreadyCheckedIn = checkInOutStore.checkInOutData.find(
            (entry) => entry.userId.id === user.id && !entry.checkOutTime,
          )
          console.log('Already checked in:', alreadyCheckedIn)
          if (alreadyCheckedIn) {
            alert('You have already checked in.')
            return
          }

          checkInTime.value = formatTime(currentTime)

          const newCheckInout = {
            userId: user,
            checkInTime: checkInTime.value,
            checkOutTime: '',
            totalHours: 0,
          }
          checkInOutStore.addCheckIn(newCheckInout)
        } else if (checkAction.value === 'checkout') {
          const lastEntry = checkInOutStore.checkInOutData.find(
            (entry) => entry.userId.id === user.id && !entry.checkOutTime,
          )

          if (lastEntry) {
            const newCheckOutTime = formatTime(currentTime)
            const newCheckOut = { ...lastEntry } // Clone the last entry
            newCheckOut.checkOutTime = newCheckOutTime

            const checkInDate = new Date(newCheckOut.checkInTime)
            const checkOutDate = new Date(newCheckOutTime)

            if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
              alert('Invalid check-in or check-out time')
              return
            }

            const totalMilliseconds = checkOutDate.getTime() - checkInDate.getTime()
            console.log('Total milliseconds:', totalMilliseconds)
            const totalHours = Math.floor(totalMilliseconds / (1000 * 60 * 60)) // แปลงเป็นชั่วโมง
            newCheckOut.totalHours = totalHours // แสดงผลเป็นชั่วโมง
            console.log('newCheckInOut final:', newCheckOut)
            //addto DB
            checkInOutStore.addCheckOut(newCheckOut)
          } else {
            alert('You have not checked in yet.')
            return
          }
        }

        reset()
        closeDialog()
      } else {
        alert('Invalid email or password')
      }
    }
  })
}

function formatTime(date: Date): string {
  const year = date.getFullYear()
  const month = padToTwoDigits(date.getMonth() + 1)
  const day = padToTwoDigits(date.getDate())
  const hours = padToTwoDigits(date.getHours())
  const minutes = padToTwoDigits(date.getMinutes())
  const seconds = padToTwoDigits(date.getSeconds())

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

function padToTwoDigits(num: number): string {
  return num.toString().padStart(2, '0')
}

function reset() {
  form.value?.resetValidation()
  email.value = ''
  password.value = ''
  checkInTime.value = ''
  checkOutTime.value = ''
}
</script>

<style scoped>
.header-title {
  margin-bottom: 25px;
  font-weight: bold;
  font-size: 20px;
}

.search-bar {
  width: 100%;
  max-width: 300px;
}

.search-input {
  border-radius: 12px;
  background-color: #fff;
  border: 2px solid #5c4033;
}

.search-icon {
  color: #5c4033;
}

.styled-table .q-th,
.styled-table .q-td {
  border-radius: 8px;
  text-align: center;
  padding: 10px;
}
</style>
