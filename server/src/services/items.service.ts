import { itemRepository } from '../repositories/item.repository';
import { Item } from '../types';

const PAGE_SIZE = 10;

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  perPage: number;
}

export const itemsService = {
  async getAll(page: number, search: string, userId: number, status?: string): Promise<PaginatedResult<Item>> {
    const { rows, total } = await itemRepository.findAll(page, search, userId, status);
    return {
      data: rows,
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE) || 1,
      perPage: PAGE_SIZE,
    };
  },

  async getById(id: number, userId: number): Promise<Item> {
    const item = await itemRepository.findById(id, userId);
    if (!item) throw new Error('Item não encontrado.');
    return item;
  },

  async create(data: Omit<Item, 'id' | 'created_at'>, userId: number): Promise<Item> {
    return itemRepository.create({ ...data, userId });
  },

  async update(id: number, data: Omit<Item, 'id' | 'created_at'>, userId: number): Promise<Item> {
    const item = await itemRepository.update(id, data, userId);
    if (!item) throw new Error('Item não encontrado.');
    return item;
  },

  async delete(id: number, userId: number): Promise<void> {
    const deleted = await itemRepository.delete(id, userId);
    if (!deleted) throw new Error('Item não encontrado.');
  },

  async updateStatus(id: number, status: Item['status']): Promise<void> {
    await itemRepository.updateStatus(id, status);
  },
};
