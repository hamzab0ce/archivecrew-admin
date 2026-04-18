import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// 1. TABLA: games
export const games = sqliteTable('games', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  slug: text('slug').unique(),
  requeriments: text('requeriments'),
  reqMinimos: text('reqMinimos'),
  cover_url: text('cover_url').notNull(),
  captura: text('captura'),
  content: text('content').notNull(),
  instructions: text('instructions'),
  platform: text('platform').notNull(),
  views: integer('views').default(0),
  fileSize: text('fileSize'),
  version: text('version'),
  creditSource: text('creditSource'),
  password: text('password'),
  
  // 🔥 NUEVOS CAMPOS: SISTEMA DE AYUDANTES Y LIMBO
  status: text('status').default('pending').notNull(), // Puede ser: 'pending', 'approved', 'rejected'
  uploader: text('uploader').default('Admin').notNull(), // Guardará 'Benslay', 'Admin', etc.

  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp_ms' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
  isAudited: integer('isAudited', { mode: 'boolean' }).default(false).notNull(),
}, (table) => ({
  // 🔥 ÍNDICES MÁGICOS QUE REDUCEN LAS LECTURAS UN 99%
  slugIdx: uniqueIndex('slug_idx').on(table.slug),
  createdIdx: index('created_at_idx').on(table.createdAt),
  // Índice extra para que buscar los pendientes sea ultra rápido
  statusIdx: index('status_idx').on(table.status),
}));

// 2. TABLA: links_descarga
export const linksDescarga = sqliteTable('links_descarga', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  juego_id: integer('juego_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  link: text('link').notNull(),
  label: text('label'),
  type: text('type').default('MIRROR').notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp_ms' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, (table) => ({
  juegoIdIdx: index('juego_id_idx').on(table.juego_id),
}));

// 3. TABLA: games_genres
export const gamesGenres = sqliteTable('games_genres', {
  genre_id: integer('genre_id').primaryKey({ autoIncrement: true }),
  genre: text('genre'),
  game_id: integer('game_id').references(() => games.id, { onDelete: 'cascade' }),
}, (table) => ({
  genreIdx: index('genre_idx').on(table.genre),
  gameIdIdx: index('game_id_idx').on(table.game_id),
}));

// 4. TABLA: News
export const news = sqliteTable('News', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content'),
  type: text('type').default('update').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  createdIdx: index('news_created_at_idx').on(table.createdAt),
}));

// ==========================================
// RELACIONES (Idénticas a Postgres)
// ==========================================
export const gamesRelations = relations(games, ({ many }) => ({
  linksDescarga: many(linksDescarga),
  gamesGenres: many(gamesGenres),
}));

export const linksDescargaRelations = relations(linksDescarga, ({ one }) => ({
  game: one(games, {
    fields: [linksDescarga.juego_id],
    references: [games.id],
  }),
}));

export const gamesGenresRelations = relations(gamesGenres, ({ one }) => ({
  game: one(games, {
    fields: [gamesGenres.game_id],
    references: [games.id],
  }),
}));