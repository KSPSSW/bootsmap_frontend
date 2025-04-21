import { Loading, Notify } from 'quasar'
import { api } from 'src/boot/axios'
import type { Branch } from 'src/models'
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useBranchStore = defineStore('branch', () => {
  const branches = ref<Branch[]>([])
  const currentBranch = ref<Branch | null>(null)

  function setCurrentBranch(branch: Branch | null) {
    currentBranch.value = branch
  }

  async function getBranches() {
    try {
      Loading.show({
        message: 'กำลังโหลดข้อมูลหมวดหมู่...',
      })

      const res = await api.get('/branches')
      branches.value = res.data
      return res.data
    } catch (error) {
      console.error('Error fetching branches:', error)
      Notify.create({
        message: 'ไม่สามารถโหลดข้อมูลหมวดหมู่ได้',
        color: 'negative',
        position: 'top',
      })

      return []
    } finally {
      Loading.hide()
    }
  }

  async function getBranchById(id: number) {
    try {
      Loading.show({
        message: 'กำลังโหลดข้อมูลหมวดหมู่...',
      })

      const res = await api.get(`/branches/${id}`)
      return res.data
    } catch (error) {
      console.error('Error fetching branch by id:', error)
      Notify.create({
        message: 'ไม่สามารถโหลดข้อมูลหมวดหมู่ได้',
        color: 'negative',
        position: 'top',
      })

      return null
    } finally {
      Loading.hide()
    }
  }

  async function addBranch(branch: Branch) {
    try {
      Loading.show({
        message: 'กำลังเพิ่มข้อมูลสาขา...',
      })

      delete branch.id
      const res = await api.post('/branches', branch)
      await getBranches()

      Notify.create({
        message: 'เพิ่มข้อมูลสาขาเรียบร้อย',
        color: 'positive',
        position: 'top',
      })
      return res.data
    } catch (error) {
      console.error('Error adding branch:', error)
      Notify.create({
        message: 'ไม่สามารถเพิ่มข้อมูลสาขาได้',
        color: 'negative',
        position: 'top',
      })

      return null
    } finally {
      Loading.hide()
    }
  }

  async function updateBranch(branch: Branch) {
    try {
      Loading.show({
        message: 'กำลังอัปเดตข้อมูลสาขา...',
      })

      const res = await api.patch(`/branches/${branch.id}`, branch)
      await getBranches()

      Notify.create({
        message: 'อัปเดตข้อมูลสาขาเรียบร้อย',
        color: 'positive',
        position: 'top',
      })

      return res.data
    } catch (error) {
      console.error('Error updating branch:', error)
      Notify.create({
        message: 'ไม่สามารถอัปเดตข้อมูลสาขาได้',
        color: 'negative',
        position: 'top',
      })

      throw error
    } finally {
      Loading.hide()
    }
  }

  async function deleteBranch(branch: Branch) {
    try {
      Loading.show({
        message: 'กำลังลบข้อมูลสาขา...',
      })

      await api.delete(`/branches/${branch.id}`)
      await getBranches()

      Notify.create({
        message: 'ลบข้อมูลสาขาเรียบร้อย',
        color: 'positive',
        position: 'top',
      })
    } catch (error) {
      console.error('Error deleting branch:', error)
      Notify.create({
        message: 'ไม่สามารถลบข้อมูลสาขาได้',
        color: 'negative',
        position: 'top',
      })

      throw error
    } finally {
      Loading.hide()
    }
  }

  return {
    branches,
    currentBranch,
    setCurrentBranch,
    getBranches,
    getBranchById,
    addBranch,
    updateBranch,
    deleteBranch,
  }
})
