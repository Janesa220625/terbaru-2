export type UserRole =
  | "admin"
  | "manager"
  | "staff"
  | "viewer"
  | "warehouse_manager";

export interface UserPermissions {
  canViewDashboard: boolean;
  canManageProducts: boolean;
  canViewProducts: boolean;
  canManageInventory: boolean;
  canViewInventory: boolean;
  canPerformStockOpname: boolean;
  canViewReports: boolean;
  canExportData: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canManageWarehouses?: boolean;
  canViewAllWarehouses?: boolean;
  canApproveDeliveries?: boolean;
  canManageBoxStock?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  warehouseId?: string;
  permissions: UserPermissions;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isActive?: boolean;
  phoneNumber?: string;
  avatarUrl?: string;
}

export const DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canViewDashboard: true,
    canManageProducts: true,
    canViewProducts: true,
    canManageInventory: true,
    canViewInventory: true,
    canPerformStockOpname: true,
    canViewReports: true,
    canExportData: true,
    canManageUsers: true,
    canManageSettings: true,
    canManageWarehouses: true,
    canViewAllWarehouses: true,
    canApproveDeliveries: true,
    canManageBoxStock: true,
  },
  manager: {
    canViewDashboard: true,
    canManageProducts: true,
    canViewProducts: true,
    canManageInventory: true,
    canViewInventory: true,
    canPerformStockOpname: true,
    canViewReports: true,
    canExportData: true,
    canManageUsers: false,
    canManageSettings: false,
    canManageWarehouses: false,
    canViewAllWarehouses: true,
    canApproveDeliveries: true,
    canManageBoxStock: true,
  },
  warehouse_manager: {
    canViewDashboard: true,
    canManageProducts: false,
    canViewProducts: true,
    canManageInventory: true,
    canViewInventory: true,
    canPerformStockOpname: true,
    canViewReports: true,
    canExportData: true,
    canManageUsers: false,
    canManageSettings: false,
    canManageWarehouses: false,
    canViewAllWarehouses: false,
    canApproveDeliveries: true,
    canManageBoxStock: true,
  },
  staff: {
    canViewDashboard: true,
    canManageProducts: false,
    canViewProducts: true,
    canManageInventory: true,
    canViewInventory: true,
    canPerformStockOpname: true,
    canViewReports: false,
    canExportData: false,
    canManageUsers: false,
    canManageSettings: false,
    canManageWarehouses: false,
    canViewAllWarehouses: false,
    canApproveDeliveries: false,
    canManageBoxStock: false,
  },
  viewer: {
    canViewDashboard: true,
    canManageProducts: false,
    canViewProducts: true,
    canManageInventory: false,
    canViewInventory: true,
    canPerformStockOpname: false,
    canViewReports: true,
    canExportData: true,
    canManageUsers: false,
    canManageSettings: false,
    canManageWarehouses: false,
    canViewAllWarehouses: false,
    canApproveDeliveries: false,
    canManageBoxStock: false,
  },
};
