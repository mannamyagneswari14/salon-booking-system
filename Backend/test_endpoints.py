import os
import sys
import django

# Setup Django settings
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from django.conf import settings

if not settings.configured:
    settings.configure(
        DEBUG=True,
        SECRET_KEY='test_secret_key',
        ROOT_URLCONF='Backend.urls',
        ALLOWED_HOSTS=['*'],
        MIDDLEWARE=[
            'corsheaders.middleware.CorsMiddleware',
            'django.middleware.common.CommonMiddleware',
        ],
        INSTALLED_APPS=[
            'django.contrib.contenttypes',
            'django.contrib.auth',
            'corsheaders',
            'rest_framework',
        ],
        DATABASES={
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': ':memory:',
            }
        }
    )

django.setup()

from django.test import Client
from Backend.db import init_db, get_db_connection, DB_PATH

def run_tests():
    print("==================================================")
    print("      RUNNING SALON & SPA API ENDPOINT TESTS      ")
    print("==================================================")

    # Delete existing database file to reset state
    if os.path.exists(DB_PATH):
        try:
            os.remove(DB_PATH)
        except Exception as e:
            print(f"Note: Could not delete DB file: {e}")

    # Initialize Database tables and seeds
    init_db()

    client = Client()
    success_count = 0
    total_count = 0

    def assert_status(response, expected_status, test_name):
        nonlocal success_count, total_count
        total_count += 1
        if response.status_code in expected_status:
            print(f"[OK] {test_name}: Passed (Status {response.status_code})")
            success_count += 1
            return True
        else:
            print(f"[FAIL] {test_name}: Failed (Expected {expected_status}, Got {response.status_code})")
            print(f"   Response Content: {response.content.decode('utf-8')}")
            return False

    # ---------------- 1. CUSTOMERS APIs ----------------
    print("\n--- Testing Customers Module ---")
    
    # POST /customers/add/
    cust_data = {
        "customer_id": 104,
        "full_name": "Vikram Singh",
        "email": "vikram@gmail.com",
        "phone": "9876543209",
        "gender": "Male",
        "password": "vikram123"
    }
    r = client.post('/customers/add/', data=json_data(cust_data), content_type='application/json')
    assert_status(r, [201], "1.1 Add Customer (POST)")

    # GET /customers/
    r = client.get('/customers/')
    assert_status(r, [200], "1.2 List Customers (GET)")

    # PUT /customers/update/104/
    updated_cust = cust_data.copy()
    updated_cust["full_name"] = "Vikram K. Singh"
    r = client.put('/customers/update/104/', data=json_data(updated_cust), content_type='application/json')
    assert_status(r, [200], "1.3 Update Customer (PUT)")

    # DELETE /customers/delete/104/
    r = client.delete('/customers/delete/104/')
    assert_status(r, [200], "1.4 Delete Customer (DELETE)")

    # POST /customers/login/
    login_data = {"email": "rahul@gmail.com", "password": "rahul123"}
    r = client.post('/customers/login/', data=json_data(login_data), content_type='application/json')
    assert_status(r, [200], "1.5 Login Customer (POST)")


    # ---------------- 2. SERVICES APIs ----------------
    print("\n--- Testing Services Module ---")

    # POST /services/add/
    serv_data = {
        "service_id": 208,
        "service_name": "Premium Hair Treatment",
        "category": "Hair Styling",
        "duration": 45,
        "price": 1800,
        "description": "Premium hair care styling and serum application"
    }
    r = client.post('/services/add/', data=json_data(serv_data), content_type='application/json')
    assert_status(r, [201], "2.1 Add Service (POST)")

    # GET /services/
    r = client.get('/services/')
    assert_status(r, [200], "2.2 List Services (GET)")

    # PUT /services/update/208/
    updated_serv = serv_data.copy()
    updated_serv["price"] = 2000
    r = client.put('/services/update/208/', data=json_data(updated_serv), content_type='application/json')
    assert_status(r, [200], "2.3 Update Service (PUT)")

    # DELETE /services/delete/208/
    r = client.delete('/services/delete/208/')
    assert_status(r, [200], "2.4 Delete Service (DELETE)")


    # ---------------- 3. STYLISTS APIs ----------------
    print("\n--- Testing Stylists Module ---")

    # POST /stylists/add/
    stylist_data = {
        "stylist_id": 305,
        "stylist_name": "Meera Nair",
        "specialization": "Spa",
        "experience": 5,
        "phone": "9988776650",
        "availability": "Available"
    }
    r = client.post('/stylists/add/', data=json_data(stylist_data), content_type='application/json')
    assert_status(r, [201], "3.1 Add Stylist (POST)")

    # GET /stylists/
    r = client.get('/stylists/')
    assert_status(r, [200], "3.2 List Stylists (GET)")

    # PUT /stylists/update/305/
    updated_stylist = stylist_data.copy()
    updated_stylist["availability"] = "Busy"
    r = client.put('/stylists/update/305/', data=json_data(updated_stylist), content_type='application/json')
    assert_status(r, [200], "3.3 Update Stylist (PUT)")

    # DELETE /stylists/delete/305/
    r = client.delete('/stylists/delete/305/')
    assert_status(r, [200], "3.4 Delete Stylist (DELETE)")


    # ---------------- 4. APPOINTMENTS APIs ----------------
    print("\n--- Testing Appointments Module ---")

    # POST /appointments/add/
    appt_data = {
        "appointment_id": 403,
        "customer_name": "Rahul Sharma",
        "stylist_name": "Priya Sharma",
        "service_name": "Hair Spa",
        "appointment_date": "2026-08-22",
        "appointment_time": "12:00",
        "total_amount": 1200,
        "appointment_status": "Booked"
    }
    r = client.post('/appointments/add/', data=json_data(appt_data), content_type='application/json')
    assert_status(r, [201], "4.1 Book Appointment (POST)")

    # GET /appointments/
    r = client.get('/appointments/')
    assert_status(r, [200], "4.2 List Appointments (GET)")

    # PUT /appointments/update/403/
    updated_appt = appt_data.copy()
    updated_appt["appointment_status"] = "Completed"
    r = client.put('/appointments/update/403/', data=json_data(updated_appt), content_type='application/json')
    assert_status(r, [200], "4.3 Update Appointment (PUT)")

    # DELETE /appointments/delete/403/
    r = client.delete('/appointments/delete/403/')
    assert_status(r, [200], "4.4 Delete Appointment (DELETE)")


    # ---------------- 5. PAYMENTS APIs ----------------
    print("\n--- Testing Payments Module ---")

    # POST /payments/add/
    pay_data = {
        "payment_id": 503,
        "customer_name": "Rahul Sharma",
        "appointment_id": 401,
        "amount": 1200,
        "payment_method": "UPI",
        "payment_status": "Paid",
        "payment_date": "2026-08-20"
    }
    r = client.post('/payments/add/', data=json_data(pay_data), content_type='application/json')
    assert_status(r, [201], "5.1 Add Payment (POST)")

    # GET /payments/
    r = client.get('/payments/')
    assert_status(r, [200], "5.2 List Payments (GET)")

    # PUT /payments/update/503/
    updated_pay = pay_data.copy()
    updated_pay["payment_status"] = "Completed" # or Paid
    r = client.put('/payments/update/503/', data=json_data(updated_pay), content_type='application/json')
    assert_status(r, [200], "5.3 Update Payment (PUT)")

    # DELETE /payments/delete/503/
    r = client.delete('/payments/delete/503/')
    assert_status(r, [200], "5.4 Delete Payment (DELETE)")

    print("\n==================================================")
    print(f"   SUMMARY: {success_count} / {total_count} Tests Passed")
    print("==================================================")

def json_data(d):
    import json
    return json.dumps(d)

if __name__ == '__main__':
    run_tests()
