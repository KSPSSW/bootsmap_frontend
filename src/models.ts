export interface Product {
  id?: number
  name: string
  price: number
  productSizes?: ProductSize[]
  productSweetLevels?: ProductSweetLevel[]
  types?: Type[]
  image: string
  productCategory: ProductCategory
}

export interface ProductCategory {
  id: number
  name: string
}

export interface ProductSize {
  id: number
  name: string
  price: number
}
export interface ProductSweetLevel {
  id: number
  name: string
  price: number
}

export interface Type {
  id: number
  name: string
  price: number
}
export interface Receipt {
  id: number
  createdDate: Date
  total: number
  cash: number
  change: number
  totalQty: number
  userId: number
  customerId?: number
  customer?: Customer
  receiptDetails: ReceiptDetail[]
}
export interface ReceiptDetail {
  id: number
  productId: number
  productName: string
  productPrice: number
  qty: number
  totalPrice: number
  receiptId: number
  productSize: string
  productSweetLevel: string
  productType: string
}
export interface Category {
  id: number
  name: string
}
export interface User {
  id?: number
  name: string
  email: string
  gender: string
  roles: Role[]
  password: string
  branch: Branch
}

export interface Payment {
  id?: number
  amount: number
  date: string
  status: 'Pending' | 'Completed' | 'Failed'
  method: string // e.g., 'Credit Card', 'PayPal', etc.
  currency: string // e.g., 'USD', 'EUR', etc.
  name: string
}

export interface CheckInOut {
  id?: number
  userId: User
  checkInTime: string
  checkOutTime: string
  totalHours: number
  salary?: Salary
}

export interface Customer {
  id?: number
  name: string
  phone: string
  point: number
}

export interface StockDetails {
  id: number
  productName: string
  previousQuantity: number
  newQuantity: number
  unit: string
  difference: number
  status: string
  inventoryitemId: number
  stockcheckRecordId: number
}

export interface StockCheckRecord {
  stockcheckDetails:
    | StockDetails[]
    | {
        id: number
        productName: string
        previousQuantity: number
        newQuantity: number
        unit: string
        difference: number
        status: string
        inventoryitemId: number
        stockcheckRecordId: number
      }[]
  id: number
  checkDate: string
  staffName: string
  note: string
  userId: number
}

export interface Salary {
  id?: number
  paydate: string
  amount: number
  userID: number
  totalHours: number
  paymentMethod?: 'cash' | 'transfer'
}

export interface Role {
  id: number
}

export interface InventoryItems {
  id?: number
  name: string
  category?: Category_Inventory
  quantity: number
  unit: string
  minStock: number
  price: number
  supplier: string
  lastOrder: string
  branch: Branch
}

export interface Category_Inventory {
  id?: number
  name: string
}

export interface Branch {
  id?: number
  name: string
  address: string
  openDate: Date
  phone: number
}
