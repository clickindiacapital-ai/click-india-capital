import { supabase } from './supabase';
import { Task, TaskStatus, TaskPriority } from '@click-india/shared-types';
import { eventBus } from '@click-india/shared-events';
import { auditService } from '@click-india/shared-audit';

export class TaskService {
  public static async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return null;
    }

    const newTask = data as Task;

    eventBus.emit({
      type: 'TaskCreated',
      actor: { id: 'SYSTEM', type: 'SYSTEM' },
      payload: newTask,
    });

    await auditService.log({
      actor_id: 'SYSTEM',
      actor_type: 'SYSTEM',
      action: 'TASK_CREATED',
      entity_type: 'TASK',
      entity_id: newTask.id,
      new_state: newTask,
    });

    return newTask;
  }

  public static async updateTaskStatus(taskId: string, status: TaskStatus): Promise<boolean> {
    const { data: oldTask } = await supabase.from('tasks').select('*').eq('id', taskId).single();
    
    const { error } = await supabase
      .from('tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task status:', error);
      return false;
    }

    eventBus.emit({
      type: 'TaskUpdated',
      actor: { id: 'SYSTEM', type: 'SYSTEM' },
      payload: { taskId, status },
    });

    await auditService.log({
      actor_id: 'SYSTEM',
      actor_type: 'SYSTEM',
      action: 'TASK_STATUS_UPDATED',
      entity_type: 'TASK',
      entity_id: taskId,
      previous_state: oldTask?.status,
      new_state: status,
    });

    return true;
  }
}
