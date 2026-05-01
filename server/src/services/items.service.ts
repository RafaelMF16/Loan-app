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
  async getAll(page: number, search: string): Promise<PaginatedResult<Item>> {
    const { rows, total } = await itemRepository.findAll(page, search);
    return {
      data: rows,
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE) || 1,
      perPage: PAGE_SIZE,
    };
  },

  async getById(id: number): Promise<Item> {
    const item = await itemRepository.findById(id);
    if (!item) throw new Error('Item não encontrado.');
    return item;
  },

  async create(data: Omit<Item, 'id' | 'created_at'>): Promise<Item> {
    return itemRepository.create(data);
  },

  async update(id: number, data: Omit<Item, 'id' | 'created_at'>): Promise<Item> {
    const item = await itemRepository.update(id, data);
    if (!item) throw new Error('Item não encontrado.');
    return item;
  },

  async delete(id: number): Promise<void> {
    const deleted = await itemRepository.delete(id);
    if (!deleted) throw new Error('Item não encontrado.');
  },
};
