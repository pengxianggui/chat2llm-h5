import { v4 as uuidv4 } from 'uuid'

/**
 * 生成uuid
 */
export const generateUUID = function() {
  return uuidv4().replaceAll('-', '')
}