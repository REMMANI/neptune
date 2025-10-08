# Database Setup & Prisma Singleton

## Overview
The Prisma client is now implemented as a robust singleton pattern that can be used consistently throughout the application. This ensures optimal connection management and prevents multiple database connections.

## Architecture

### 1. Prisma Singleton (`/src/lib/prisma.ts`)
```typescript
export const prisma = globalThis.__prisma ?? createPrismaClient();
```
- **Global instance**: Prevents multiple connections in development
- **Connection management**: Automatic connection handling
- **Health monitoring**: Built-in health check functionality
- **Graceful shutdown**: Automatic cleanup on process exit

### 2. Database Service Layer (`/src/lib/db.ts`)
```typescript
export const db = DatabaseService.getInstance();
```
- **Service pattern**: Centralized database operations
- **Connection ensurance**: Automatic connection before queries
- **Type safety**: Generic methods with proper TypeScript support
- **Convenience functions**: Pre-built common queries

## Usage Examples

### Direct Prisma Access
```typescript
import { prisma } from '@/lib/prisma';

const users = await prisma.user.findMany();
```

### Database Service (Recommended)
```typescript
import { db, findDealerById } from '@/lib/db';

// Using convenience functions
const dealer = await findDealerById('dealer-123');

// Using service methods
const result = await db.findMany('dealer', { where: { status: 'ACTIVE' } });
```

### Connection Management
```typescript
import { connectPrisma, checkDatabaseHealth } from '@/lib/prisma';

// Ensure connection
await connectPrisma();

// Health check
const health = await checkDatabaseHealth();
```

## API Integration

All API routes now use the database utilities:

### Dealer Configuration
- **GET** `/api/dealers/[id]/site-config` - Get dealer configuration
- **POST** `/api/dealers/[id]/customizations/draft` - Update draft
- **POST** `/api/dealers/[id]/customizations/publish` - Publish draft

### Health Monitoring
- **GET** `/api/health` - System health check with database status

## Key Features

### 1. Automatic Connection Management
- Connections are established only when needed
- Automatic reconnection on failure
- Connection pooling through Prisma

### 2. Error Handling
- Graceful fallbacks when database is unavailable
- Proper error logging and monitoring
- Maintains application functionality without database

### 3. Performance Optimization
- Connection reuse across requests
- Built-in query optimization through Prisma
- Lazy connection establishment

### 4. Development-Friendly
- Enhanced logging in development mode
- Clear error messages
- Health monitoring endpoints

## Configuration

The database connection is configured through environment variables:

```env
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=..."
```

### Supported Database URLs
- **PostgreSQL**: `postgresql://user:pass@host:port/db`
- **Prisma Accelerate**: `prisma+postgres://accelerate.prisma-data.net/?api_key=...`
- **Local SQLite**: `file:./dev.db`

## Database Schema

Current models:
- **Dealer**: Multi-tenant dealer information
- **DealerCustomization**: Versioned configuration with draft/published workflow

## Testing

The system includes comprehensive testing utilities:

```bash
# Health check
curl http://localhost:3000/api/health

# Dealer configuration
curl http://localhost:3000/api/dealers/premium-motors/site-config
```

## Best Practices

1. **Always use the singleton**: Import from `/src/lib/prisma` or `/src/lib/db`
2. **Use database service methods**: For common operations, use the convenience functions
3. **Handle connection errors**: Always wrap database calls in try-catch
4. **Monitor health**: Use the health check endpoint for monitoring
5. **Use transactions**: For multi-step operations, use Prisma transactions

## Migration Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Seed database
npm run db:seed
```

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Check DATABASE_URL in .env.local
   - Verify database server is running
   - Check network connectivity

2. **Schema Mismatches**
   - Run `npm run db:generate`
   - Verify schema.prisma changes

3. **Performance Issues**
   - Check connection pool settings
   - Monitor query performance
   - Use database indexes

The Prisma singleton is now ready for production use and provides a solid foundation for all database operations in the multi-tenant CMS system.