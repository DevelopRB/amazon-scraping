# Gyan Letter App

A comprehensive web application for managing databases and creating professional letters and emails with template support.

## Features

### 📊 Database Management
- **PostgreSQL Storage**: All data stored in PostgreSQL database
- **CRUD Operations**: Add, edit, delete, and search records easily
- **Excel Import**: Upload Excel files (.xlsx, .xls, .csv) with preview
- **Dynamic Fields**: Create custom fields for your records
- **Search & Filter**: Advanced search and filtering capabilities
- **Sorting**: Sort records by any column
- **Delete Confirmation**: Safe deletion with confirmation modal

### ✉️ Letter & Email Editor
- **Rich Text Editor**: Create professional content with formatting options
- **Template Variables**: Insert database fields using `{{fieldName}}` syntax
- **Multiple Formats**: Support for both email and letter formats
- **Preview**: See how your content looks with actual data
- **Template Management**: Save and reuse letter/email templates

### 🖨️ Print & Export
- **Print Functionality**: Print letters with proper formatting
- **Email Integration**: Open emails in your default email client
- **HTML Export**: Export letters as HTML files

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up PostgreSQL Database

1. Create a PostgreSQL database:
```sql
CREATE DATABASE gyan_letter_db;
```

2. Create a `.env` file in the root directory:
```env
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=gyan_letter_db
DB_PASSWORD=your_password
DB_PORT=5432

# Server Configuration
PORT=5000
```

### 3. Start the Application

**Terminal 1 - Start Backend Server:**
```bash
npm run server
```

**Terminal 2 - Start Frontend Dev Server:**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage

### Managing Database

1. Navigate to the **Database** section
2. Click **Upload Excel** to import data from Excel files
3. Preview the data before importing
4. Click **Add Record** to create a new entry manually
5. Use the search bar to find specific records
6. Use filters to narrow down results
7. Click column headers to sort
8. Edit or delete records using the action buttons

### Creating Letters/Emails

1. Navigate to the **Letter Editor** section
2. Select a format (Email or Letter)
3. Choose a record from the database (optional, for variable replacement)
4. Use the variable buttons to insert database fields
5. Write your content using the rich text editor
6. Preview the result with actual data
7. Print, email, or export your letter

### Using Template Variables

- Click on any variable button to insert it into your content
- Variables use the format: `{{fieldName}}`
- When a record is selected, variables are automatically replaced with actual values
- Example: `{{name}}` will be replaced with the name from the selected record

### Saving Templates

1. Create your letter/email content
2. Enter a template name
3. Click **Save Template**
4. Load saved templates by clicking on them

## API Endpoints

- `GET /api/records` - Get all records (optional `?search=query`)
- `GET /api/records/:id` - Get a single record
- `POST /api/records` - Create a new record
- `POST /api/records/bulk` - Bulk create records (for Excel import)
- `PUT /api/records/:id` - Update a record
- `DELETE /api/records/:id` - Delete a record
- `GET /api/health` - Health check

## Project Structure

```
gyan-letter-app/
├── backend/
│   ├── db.js              # Database connection and schema
│   └── routes/
│       └── records.js     # API routes for records
├── src/
│   ├── components/
│   │   ├── DatabaseManager.jsx
│   │   └── LetterEditor.jsx
│   ├── services/
│   │   ├── api.js         # API service
│   │   └── database.js    # Database service wrapper
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── server.js              # Express server
├── package.json
└── README.md
```

## Technology Stack

- **Frontend**: React, React Router, React Quill, Tailwind CSS, Vite
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **File Processing**: xlsx library

## Environment Variables

Create a `.env` file with the following variables:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=gyan_letter_db
DB_PASSWORD=your_password
DB_PORT=5432
PORT=5000
```

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Check database credentials in `.env` file
3. Verify database exists: `CREATE DATABASE gyan_letter_db;`

### Port Already in Use

- Change the `PORT` in `.env` file
- Or kill the process using the port

## License

MIT
