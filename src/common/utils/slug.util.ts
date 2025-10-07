import slugify from 'slugify';
import { Model, FilterQuery } from 'mongoose';

/**
 * Generate a unique slug for any Mongoose model.
 * @param model - The Mongoose model to check.
 * @param text - The text to slugify (usually the name).
 * @param field - The field to check uniqueness on (default: "slug").
 * @returns A unique slug string.
 */
export async function generateUniqueSlug<T>(
  model: Model<T>,
  text: string,
  field: string = 'slug',
): Promise<string> {
  const baseSlug = slugify(text, { lower: true, strict: true }) || 'item';
  let uniqueSlug = baseSlug;
  let counter = 1;

  // ✅ Properly type the query to avoid TypeScript errors
  let query: FilterQuery<T> = { [field]: uniqueSlug } as FilterQuery<T>;

  // Loop until unique slug found
  while (await model.exists(query)) {
    uniqueSlug = `${baseSlug}-${counter++}`;
    query = { [field]: uniqueSlug } as FilterQuery<T>; // reassign query each loop
  }

  return uniqueSlug;
}
