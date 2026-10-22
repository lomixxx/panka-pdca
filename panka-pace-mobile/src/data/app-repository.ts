import { createAppRepository } from './create-app-repository';
import { storage } from './storage';

const repository = createAppRepository(storage);

export const { clearAppState, loadAppState, saveAppState } = repository;
