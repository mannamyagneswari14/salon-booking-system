import sqlite3
import os
from contextlib import contextmanager

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'salon_spa.db')

def get_db_connection():
    """Establish and return a connection to the SQLite database with row factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@contextmanager
def db_transaction():
    """Context manager for SQLite database transactions. Automatically commits or rolls back and closes."""
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    """Initialize the database tables and seed sample data if tables are empty."""
    with db_transaction() as conn:
        cursor = conn.cursor()

        # 1. Customers Table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS customers (
            customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT NOT NULL,
            gender TEXT NOT NULL,
            password TEXT NOT NULL
        )
        ''')

        # 2. Services Table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS services (
            service_id INTEGER PRIMARY KEY AUTOINCREMENT,
            service_name TEXT NOT NULL,
            category TEXT NOT NULL,
            duration INTEGER NOT NULL,
            price REAL NOT NULL,
            description TEXT NOT NULL,
            rating REAL DEFAULT 4.5,
            image_url TEXT
        )
        ''')

        # 3. Stylists Table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS stylists (
            stylist_id INTEGER PRIMARY KEY AUTOINCREMENT,
            stylist_name TEXT NOT NULL,
            specialization TEXT NOT NULL,
            experience INTEGER NOT NULL,
            phone TEXT NOT NULL,
            availability TEXT NOT NULL,
            rating REAL DEFAULT 4.8,
            avatar_url TEXT
        )
        ''')

        # 4. Appointments Table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS appointments (
            appointment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            stylist_name TEXT NOT NULL,
            service_name TEXT NOT NULL,
            appointment_date TEXT NOT NULL,
            appointment_time TEXT NOT NULL,
            total_amount REAL NOT NULL,
            appointment_status TEXT NOT NULL
        )
        ''')

        # 5. Payments Table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS payments (
            payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            appointment_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            payment_method TEXT NOT NULL,
            payment_status TEXT NOT NULL,
            payment_date TEXT NOT NULL
        )
        ''')

    # Seed initial data outside transaction to handle tables separately
    conn = get_db_connection()
    cursor = conn.cursor()

    # Seeding Sample Customers if empty
    cursor.execute("SELECT COUNT(*) FROM customers")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO customers (customer_id, full_name, email, phone, gender, password) VALUES (?, ?, ?, ?, ?, ?)",
                       (101, "Rahul Sharma", "rahul@gmail.com", "9876543210", "Male", "rahul123"))
        cursor.execute("INSERT INTO customers (customer_id, full_name, email, phone, gender, password) VALUES (?, ?, ?, ?, ?, ?)",
                       (102, "Priya Patel", "priya@gmail.com", "9876543222", "Female", "priya123"))
        cursor.execute("INSERT INTO customers (customer_id, full_name, email, phone, gender, password) VALUES (?, ?, ?, ?, ?, ?)",
                       (103, "Akash Mehta", "akash@gmail.com", "9876543233", "Male", "akash123"))
        conn.commit()

    # Seeding Sample Services if empty
    cursor.execute("SELECT COUNT(*) FROM services")
    if cursor.fetchone()[0] == 0:
        services_data = [
            (201, "Hair Spa", "Spa", 60, 1200.0, "Deep conditioning hair spa treatment", 4.7, "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600&auto=format&fit=crop"),
            (202, "Classic Haircut", "Hair Cut", 30, 500.0, "Precision haircut and expert style custom to your facial structure", 4.9, "https://images.unsplash.com/photo-1605497746444-052d5b6bc34b?q=80&w=600&auto=format&fit=crop"),
            (203, "Aromatherapy Massage", "Massage", 90, 2500.0, "Deep tissue tension relief massage using pure essential oils", 4.8, "https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=600&auto=format&fit=crop"),
            (204, "Hydrating Facial", "Facial", 45, 1500.0, "Deep skin hydration treatment with herbal extracts & gentle scrub", 4.6, "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=600&auto=format&fit=crop"),
            (205, "Luxury Pedicure", "Pedicure", 45, 800.0, "Complete nail shaping, custom exfoliation scrub, cuticle care, and hot stone massage", 4.5, "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=600&auto=format&fit=crop"),
            (206, "Hair Coloring", "Hair Coloring", 120, 3000.0, "Professional permanent/semi-permanent full hair color or highlights", 4.8, "https://images.unsplash.com/photo-1560869713-7d0a29430f39?q=80&w=600&auto=format&fit=crop"),
            (207, "Swedish Massage", "Massage", 60, 2000.0, "Soothing whole body Swedish massage to ease muscles and improve blood flow", 4.9, "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=600&auto=format&fit=crop")
        ]
        cursor.executemany("INSERT INTO services (service_id, service_name, category, duration, price, description, rating, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", services_data)
        conn.commit()

    # Seeding Sample Stylists if empty
    cursor.execute("SELECT COUNT(*) FROM stylists")
    if cursor.fetchone()[0] == 0:
        stylists_data = [
            (301, "Priya Sharma", "Hair Styling", 6, "9988776655", "Available", 4.9, "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop"),
            (302, "Rohan Verma", "Massage", 8, "9988776654", "Available", 4.8, "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=600&auto=format&fit=crop"),
            (303, "Ananya Sen", "Facial", 4, "9988776653", "Busy", 4.7, "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=600&auto=format&fit=crop"),
            (304, "Kabir Malhotra", "Hair Cut", 10, "9988776652", "Available", 4.9, "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop")
        ]
        cursor.executemany("INSERT INTO stylists (stylist_id, stylist_name, specialization, experience, phone, availability, rating, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", stylists_data)
        conn.commit()

    # Seeding Sample Appointments if empty
    cursor.execute("SELECT COUNT(*) FROM appointments")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO appointments (appointment_id, customer_name, stylist_name, service_name, appointment_date, appointment_time, total_amount, appointment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                       (401, "Rahul Sharma", "Priya Sharma", "Hair Spa", "2026-08-20", "11:30", 1200.0, "Booked"))
        cursor.execute("INSERT INTO appointments (appointment_id, customer_name, stylist_name, service_name, appointment_date, appointment_time, total_amount, appointment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                       (402, "Priya Patel", "Kabir Malhotra", "Classic Haircut", "2026-07-22", "14:00", 500.0, "Completed"))
        conn.commit()

    # Seeding Sample Payments if empty
    cursor.execute("SELECT COUNT(*) FROM payments")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO payments (payment_id, customer_name, appointment_id, amount, payment_method, payment_status, payment_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
                       (501, "Rahul Sharma", 401, 1200.0, "UPI", "Paid", "2026-08-20"))
        cursor.execute("INSERT INTO payments (payment_id, customer_name, appointment_id, amount, payment_method, payment_status, payment_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
                       (502, "Priya Patel", 402, 500.0, "Credit Card", "Paid", "2026-07-22"))
        conn.commit()

    conn.close()

# Initialize DB on load
init_db()
print("SQLite Database initialized and seeded successfully.")
