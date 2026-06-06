import { Scripture } from '../types.ts';
import popularScripturesRaw from './popular_scriptures.json';

export const POPULAR_SCRIPTURES: Scripture[] = popularScripturesRaw as Scripture[];
