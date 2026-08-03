export interface Task {
  id: number;
  created_by: number;
  assigned_to: number;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  latitude: number;
  longitude: number;
  target_type?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  deadline?: string;
  is_deleted: boolean;
}