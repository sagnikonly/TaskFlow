# 🏗️ Cloud Sync Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER DEVICES                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  📱 Phone          💻 Laptop         📱 Tablet                   │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                │
│  │  React   │     │  React   │     │  React   │                │
│  │   App    │     │   App    │     │   App    │                │
│  └────┬─────┘     └────┬─────┘     └────┬─────┘                │
│       │                │                │                        │
│       │  Real-time     │  Real-time     │  Real-time            │
│       │  WebSocket     │  WebSocket     │  WebSocket            │
│       └────────────────┴────────────────┘                        │
│                         │                                         │
└─────────────────────────┼─────────────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────────┐
        │      SUPABASE CLOUD BACKEND         │
        ├─────────────────────────────────────┤
        │                                     │
        │  🔐 Authentication (Auth.users)     │
        │  ├─ Email/Password                  │
        │  ├─ Session Management              │
        │  └─ User Profiles                   │
        │                                     │
        │  📊 PostgreSQL Database             │
        │  ├─ tasks table                     │
        │  ├─ categories table                │
        │  └─ user_analytics table            │
        │                                     │
        │  🔒 Row Level Security (RLS)        │
        │  ├─ User isolation                  │
        │  └─ Secure queries                  │
        │                                     │
        │  ⚡ Realtime Subscriptions          │
        │  ├─ Task changes                    │
        │  └─ Category changes                │
        │                                     │
        └─────────────────────────────────────┘
```

## Data Flow

### 1. User Creates Task

```
User Action (Device A)
    │
    ▼
┌─────────────────────┐
│  TaskContext        │
│  - addTask()        │
│  - Update local     │
│    state (instant)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  SyncService        │
│  - addTaskToCloud() │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Supabase Client    │
│  - INSERT into      │
│    tasks table      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  PostgreSQL DB      │
│  - Store task       │
│  - Trigger RLS      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Realtime Engine    │
│  - Broadcast change │
│    to subscribers   │
└──────────┬──────────┘
           │
           ▼
    Device B, C, D...
    (Receive update instantly)
```

### 2. Real-Time Sync

```
Device A makes change
    │
    ▼
Supabase Database
    │
    ├─► Device A (confirmation)
    ├─► Device B (real-time update)
    ├─► Device C (real-time update)
    └─► Device D (real-time update)

All devices stay in sync! ⚡
```

### 3. Offline → Online Sync

```
┌─────────────────────────────────────────┐
│  OFFLINE MODE                           │
├─────────────────────────────────────────┤
│                                         │
│  User creates/edits tasks               │
│         │                               │
│         ▼                               │
│  Saved to localStorage                  │
│  (Backup storage)                       │
│                                         │
│  ⚠️  "Offline mode" indicator shown     │
│                                         │
└─────────────────────────────────────────┘
                │
                │ Internet restored
                ▼
┌─────────────────────────────────────────┐
│  ONLINE MODE                            │
├─────────────────────────────────────────┤
│                                         │
│  Auto-detect connection                 │
│         │                               │
│         ▼                               │
│  Sync localStorage → Cloud              │
│         │                               │
│         ▼                               │
│  ✅ "Synced to cloud" message           │
│                                         │
└─────────────────────────────────────────┘
```

## Component Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      App.tsx                             │
│  ┌────────────────────────────────────────────────┐     │
│  │              AuthProvider                      │     │
│  │  ┌──────────────────────────────────────┐     │     │
│  │  │         TaskProvider                 │     │     │
│  │  │  ┌────────────────────────────┐      │     │     │
│  │  │  │      Pages & Components    │      │     │     │
│  │  │  │  - Home                    │      │     │     │
│  │  │  │  - Analysis                │      │     │     │
│  │  │  │  - Subjects                │      │     │     │
│  │  │  │  - Settings                │      │     │     │
│  │  │  └────────────────────────────┘      │     │     │
│  │  │                                      │     │     │
│  │  │  Uses:                               │     │     │
│  │  │  - syncService                       │     │     │
│  │  │  - Real-time subscriptions           │     │     │
│  │  │  - Cloud sync methods                │     │     │
│  │  └──────────────────────────────────────┘     │     │
│  │                                                │     │
│  │  Provides:                                     │     │
│  │  - user, session, profile                     │     │
│  │  - signIn, signUp, signOut                    │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  Global Components:                                      │
│  - SyncStatus (shows online/offline)                    │
│  - BottomNav                                             │
└──────────────────────────────────────────────────────────┘
```

## Database Schema

```
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  auth.users (Built-in)                                  │
│  ├─ id (UUID)                                           │
│  ├─ email                                               │
│  └─ encrypted_password                                  │
│                                                         │
│  profiles (Custom)                                      │
│  ├─ id (UUID)                                           │
│  ├─ user_id → auth.users.id                            │
│  ├─ full_name                                           │
│  ├─ target_exam                                         │
│  └─ goal                                                │
│                                                         │
│  tasks (Custom) ⭐                                       │
│  ├─ id (UUID)                                           │
│  ├─ user_id → auth.users.id                            │
│  ├─ title                                               │
│  ├─ category                                            │
│  ├─ completed                                           │
│  ├─ count_current, count_total                          │
│  ├─ completion_history (JSONB)                          │
│  ├─ step_up_history (JSONB)                             │
│  ├─ priority, recurrence                                │
│  └─ created_at, updated_at                              │
│                                                         │
│  categories (Custom) ⭐                                  │
│  ├─ id (UUID)                                           │
│  ├─ user_id → auth.users.id                            │
│  ├─ name                                                │
│  ├─ icon                                                │
│  └─ created_at, updated_at                              │
│                                                         │
│  user_analytics (Custom) ⭐                              │
│  ├─ id (UUID)                                           │
│  ├─ user_id → auth.users.id                            │
│  ├─ total_tasks, completed_tasks                        │
│  ├─ current_streak, longest_streak                      │
│  ├─ heat_map_data (JSONB)                               │
│  └─ category_stats (JSONB)                              │
│                                                         │
└─────────────────────────────────────────────────────────┘

⭐ = New tables for cloud sync
```

## Security Model

```
┌─────────────────────────────────────────────────────┐
│           ROW LEVEL SECURITY (RLS)                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Every query automatically filtered by user_id      │
│                                                     │
│  User A (id: abc-123)                               │
│    │                                                │
│    ├─► SELECT * FROM tasks                         │
│    │   WHERE user_id = 'abc-123'  ← Auto-added     │
│    │                                                │
│    ├─► INSERT INTO tasks                           │
│    │   VALUES (..., user_id: 'abc-123')            │
│    │                                                │
│    └─► UPDATE tasks                                │
│        WHERE user_id = 'abc-123'  ← Auto-added     │
│                                                     │
│  User B (id: xyz-789)                               │
│    │                                                │
│    └─► Cannot see User A's data ❌                 │
│        Cannot modify User A's data ❌              │
│                                                     │
│  Result: Complete data isolation! 🔒               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Sync Service API

```typescript
// Core sync operations
class SyncService {
  
  // Tasks
  syncTasksFromCloud(userId)      // Load all tasks
  syncTasksToCloud(tasks, userId) // Bulk upload
  addTaskToCloud(task, userId)    // Add one task
  updateTaskInCloud(id, updates)  // Update one task
  deleteTaskFromCloud(id, userId) // Delete one task
  
  // Categories
  syncCategoriesFromCloud(userId)
  addCategoryToCloud(category, icon, userId)
  updateCategoryIconInCloud(category, icon, userId)
  deleteCategoryFromCloud(category, userId)
  
  // Real-time
  subscribeToTasks(userId, callback)
  subscribeToCategories(userId, callback)
  
  // Migration
  migrateLocalDataToCloud(userId)
}
```

## Performance Optimizations

```
┌─────────────────────────────────────────────────────┐
│              PERFORMANCE FEATURES                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Optimistic Updates                              │
│     - UI updates instantly                          │
│     - Cloud sync happens in background              │
│     - No waiting for server response                │
│                                                     │
│  2. Local Caching                                   │
│     - localStorage backup                           │
│     - Instant app startup                           │
│     - Works offline                                 │
│                                                     │
│  3. Efficient Queries                               │
│     - Indexed columns (user_id, created_at)         │
│     - Only fetch user's own data                    │
│     - Pagination ready                              │
│                                                     │
│  4. Real-time Subscriptions                         │
│     - WebSocket connection                          │
│     - Only receive relevant updates                 │
│     - Minimal bandwidth usage                       │
│                                                     │
│  5. Batch Operations                                │
│     - Bulk insert for migration                     │
│     - Efficient sync algorithms                     │
│     - Reduced API calls                             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## User Journey

```
┌─────────────────────────────────────────────────────┐
│              NEW USER JOURNEY                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Sign Up                                         │
│     ↓                                               │
│  2. Default categories created automatically        │
│     ↓                                               │
│  3. Create first task                               │
│     ↓                                               │
│  4. Task saved to cloud instantly                   │
│     ↓                                               │
│  5. Login on another device                         │
│     ↓                                               │
│  6. See all tasks immediately                       │
│     ↓                                               │
│  7. Make changes on any device                      │
│     ↓                                               │
│  8. Changes sync everywhere in real-time            │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│           EXISTING USER JOURNEY                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Login (has localStorage data)                   │
│     ↓                                               │
│  2. Migration runs automatically                    │
│     ↓                                               │
│  3. All local data moved to cloud                   │
│     ↓                                               │
│  4. See "Data synced from cloud" message            │
│     ↓                                               │
│  5. Can now use multiple devices                    │
│     ↓                                               │
│  6. Data safe in cloud forever                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Summary

This architecture provides:
- ✅ **Real-time sync** across all devices
- ✅ **Offline support** with automatic sync
- ✅ **Secure** with RLS and user isolation
- ✅ **Fast** with optimistic updates
- ✅ **Reliable** with cloud backup
- ✅ **Scalable** with efficient queries

Just like the big apps! 🚀
