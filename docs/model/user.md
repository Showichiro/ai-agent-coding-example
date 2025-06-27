# User Data Model

## Source Feature Reference
This model implements data requirements from:
- `docs/features/user_authentication.md` - User authentication feature specification
- `docs/requirements/base.md` lines 11-14 - User authentication requirements

## User Entity

### Database Schema (from prisma/schema.prisma)
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String?
  tasks     Task[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Client-Side User Interface
```typescript
interface User {
  id: number
  email: string
  name?: string
}
```

## Field Specifications

### Required Fields
- **id**: Auto-generated integer primary key
- **email**: Unique identifier for user accounts
  - Must be valid email format
  - Used for login authentication
  - Unique constraint enforced at database level
- **password**: Hashed password for authentication
  - Stored as bcrypt hash (never plain text)
  - Minimum 6 characters required (from feature spec)

### Optional Fields
- **name**: Display name for user
  - Optional string field
  - Used for personalization and display purposes

### System Fields
- **createdAt**: Account creation timestamp
- **updatedAt**: Last modification timestamp
- **tasks**: Relationship to user's tasks (one-to-many)

## Validation Rules

### Email Validation
- Must match valid email format regex
- Case-insensitive uniqueness check
- Required field for all operations

### Password Security
- Minimum 6 characters (as per feature specification)
- Must be hashed using bcrypt before storage
- Salt should be used for additional security

### Name Validation
- Optional field
- Maximum length should be reasonable (suggested: 100 characters)
- No special validation requirements

## Data Relationships

### User → Tasks
- One-to-many relationship
- User can have multiple tasks
- Cascade delete: removing user removes all associated tasks
- Foreign key: `task.userId` references `user.id`

## Security Considerations

### Password Storage
- Never store plain text passwords
- Use bcrypt hashing with appropriate salt rounds
- Implement secure password comparison for authentication

### Data Privacy
- Email addresses are considered PII
- Implement appropriate data protection measures
- Consider GDPR compliance for user data handling

### Access Control
- Users can only access their own data
- Authentication required for all user data operations
- Session-based access control through JWT tokens

## Usage in Authentication Flow

### Registration
- Create new User record with email, hashed password, optional name
- Validate email uniqueness before creation
- Return user data (excluding password) after successful creation

### Login
- Retrieve user by email
- Compare provided password with stored hash
- Return user data (excluding password) for successful authentication

### Profile Management
- Users can update name and email (with uniqueness validation)
- Password changes require current password verification
- Soft delete option for account deactivation

## API Data Transfer

### User Registration Response
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### User Login Response
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com", 
    "name": "User Name"
  },
  "token": "jwt.token.here"
}
```

## Testing Requirements

### Unit Tests
- Email format validation
- Password hashing and verification
- User creation with valid/invalid data
- Uniqueness constraint enforcement

### Integration Tests
- User registration flow
- User authentication flow
- User data retrieval with proper authorization
- Cascade deletion of related tasks