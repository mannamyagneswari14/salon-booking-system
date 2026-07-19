from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .db import db_transaction, get_db_connection

# Helper to convert sqlite3.Row or list of Rows to dict or list of dicts
def row_to_dict(row):
    if row is None:
        return None
    return dict(row)

def rows_to_list(rows):
    return [dict(row) for row in rows]

# ================= CUSTOMER MANAGEMENT APIs =================

@api_view(['POST'])
def customer_add(request):
    try:
        data = request.data
        full_name = data.get('full_name')
        email = data.get('email')
        phone = data.get('phone')
        gender = data.get('gender')
        password = data.get('password')
        customer_id = data.get('customer_id')

        if not all([full_name, email, phone, gender, password]):
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        with db_transaction() as conn:
            cursor = conn.cursor()
            if customer_id:
                cursor.execute(
                    "INSERT INTO customers (customer_id, full_name, email, phone, gender, password) VALUES (?, ?, ?, ?, ?, ?)",
                    (customer_id, full_name, email, phone, gender, password)
                )
                new_id = customer_id
            else:
                cursor.execute(
                    "INSERT INTO customers (full_name, email, phone, gender, password) VALUES (?, ?, ?, ?, ?, ?)",
                    (full_name, email, phone, gender, password)
                )
                new_id = cursor.lastrowid
            
            cursor.execute("SELECT * FROM customers WHERE customer_id = ?", (new_id,))
            customer = row_to_dict(cursor.fetchone())
            
        return Response(customer, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def customer_list(request):
    with db_transaction() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM customers")
        customers = rows_to_list(cursor.fetchall())
    return Response(customers, status=status.HTTP_200_OK)

@api_view(['PUT'])
def customer_update(request, id):
    try:
        data = request.data
        full_name = data.get('full_name')
        email = data.get('email')
        phone = data.get('phone')
        gender = data.get('gender')
        password = data.get('password')

        with db_transaction() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM customers WHERE customer_id = ?", (id,))
            if not cursor.fetchone():
                return Response({"error": "Customer not found"}, status=status.HTTP_404_NOT_FOUND)

            cursor.execute(
                "UPDATE customers SET full_name = ?, email = ?, phone = ?, gender = ?, password = ? WHERE customer_id = ?",
                (full_name, email, phone, gender, password, id)
            )
            
            cursor.execute("SELECT * FROM customers WHERE customer_id = ?", (id,))
            customer = row_to_dict(cursor.fetchone())
            
        return Response(customer, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def customer_delete(request, id):
    try:
        with db_transaction() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM customers WHERE customer_id = ?", (id,))
            if not cursor.fetchone():
                return Response({"error": "Customer not found"}, status=status.HTTP_404_NOT_FOUND)
                
            cursor.execute("DELETE FROM customers WHERE customer_id = ?", (id,))
            
        return Response({"message": f"Customer {id} deleted successfully"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def customer_login(request):
    try:
        data = request.data
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        if email == "admin@salonspa.com" and password == "admin123":
            return Response({
                "message": "Admin Login Successful",
                "role": "admin",
                "customer": {
                    "customer_id": 999,
                    "full_name": "System Administrator",
                    "email": "admin@salonspa.com",
                    "phone": "0000000000",
                    "gender": "Other"
                }
            }, status=status.HTTP_200_OK)

        with db_transaction() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM customers WHERE email = ? AND password = ?", (email, password))
            customer = row_to_dict(cursor.fetchone())

        if customer:
            return Response({
                "message": "Login Successful",
                "role": "customer",
                "customer": customer
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ================= SERVICE MANAGEMENT APIs =================

@api_view(['POST'])
def service_add(request):
    try:
        data = request.data
        service_name = data.get('service_name')
        category = data.get('category')
        duration = data.get('duration')
        price = data.get('price')
        description = data.get('description')
        service_id = data.get('service_id')
        rating = data.get('rating', 4.5)
        image_url = data.get('image_url', '')

        if not all([service_name, category, duration, price, description]):
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        with db_transaction() as conn:
            cursor = conn.cursor()
            if service_id:
                cursor.execute(
                    "INSERT INTO services (service_id, service_name, category, duration, price, description, rating, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (service_id, service_name, category, duration, price, description, rating, image_url)
                )
                new_id = service_id
            else:
                cursor.execute(
                    "INSERT INTO services (service_name, category, duration, price, description, rating, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (service_name, category, duration, price, description, rating, image_url)
                )
                new_id = cursor.lastrowid

            cursor.execute("SELECT * FROM services WHERE service_id = ?", (new_id,))
            service = row_to_dict(cursor.fetchone())
            
        return Response(service, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def service_list(request):
    with db_transaction() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM services")
        services = rows_to_list(cursor.fetchall())
    return Response(services, status=status.HTTP_200_OK)

@api_view(['PUT'])
def service_update(request, id):
    try:
        data = request.data
        service_name = data.get('service_name')
        category = data.get('category')
        duration = data.get('duration')
        price = data.get('price')
        description = data.get('description')
        rating = data.get('rating', 4.5)
        image_url = data.get('image_url', '')

        with db_transaction() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM services WHERE service_id = ?", (id,))
            if not cursor.fetchone():
                return Response({"error": "Service not found"}, status=status.HTTP_404_NOT_FOUND)

            cursor.execute(
                "UPDATE services SET service_name = ?, category = ?, duration = ?, price = ?, description = ?, rating = ?, image_url = ? WHERE service_id = ?",
                (service_name, category, duration, price, description, rating, image_url, id)
            )
            
            cursor.execute("SELECT * FROM services WHERE service_id = ?", (id,))
            service = row_to_dict(cursor.fetchone())
            
        return Response(service, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def service_delete(request, id):
    try:
        with db_transaction() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM services WHERE service_id = ?", (id,))
            if not cursor.fetchone():
                return Response({"error": "Service not found"}, status=status.HTTP_404_NOT_FOUND)

            cursor.execute("DELETE FROM services WHERE service_id = ?", (id,))
            
        return Response({"message": f"Service {id} deleted successfully"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ================= STYLIST MANAGEMENT APIs =================

@api_view(['POST'])
def stylist_add(request):
    try:
        data = request.data
        stylist_name = data.get('stylist_name')
        specialization = data.get('specialization')
        experience = data.get('experience')
        phone = data.get('phone')
        availability = data.get('availability')
        stylist_id = data.get('stylist_id')
        rating = data.get('rating', 4.8)
        avatar_url = data.get('avatar_url', '')

        if not all([stylist_name, specialization, experience, phone, availability]):
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        with db_transaction() as conn:
            cursor = conn.cursor()
            if stylist_id:
                cursor.execute(
                    "INSERT INTO stylists (stylist_id, stylist_name, specialization, experience, phone, availability, rating, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (stylist_id, stylist_name, specialization, experience, phone, availability, rating, avatar_url)
                )
                new_id = stylist_id
            else:
                cursor.execute(
                    "INSERT INTO stylists (stylist_name, specialization, experience, phone, availability, rating, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (stylist_name, specialization, experience, phone, availability, rating, avatar_url)
                )
                new_id = cursor.lastrowid

            cursor.execute("SELECT * FROM stylists WHERE stylist_id = ?", (new_id,))
            stylist = row_to_dict(cursor.fetchone())
            
        return Response(stylist, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def stylist_list(request):
    with db_transaction() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM stylists")
        stylists = rows_to_list(cursor.fetchall())
    return Response(stylists, status=status.HTTP_200_OK)

@api_view(['PUT'])
def stylist_update(request, id):
    try:
        data = request.data
        stylist_name = data.get('stylist_name')
        specialization = data.get('specialization')
        experience = data.get('experience')
        phone = data.get('phone')
        availability = data.get('availability')
        rating = data.get('rating', 4.8)
        avatar_url = data.get('avatar_url', '')

        with db_transaction() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM stylists WHERE stylist_id = ?", (id,))
            if not cursor.fetchone():
                return Response({"error": "Stylist not found"}, status=status.HTTP_404_NOT_FOUND)

            cursor.execute(
                "UPDATE stylists SET stylist_name = ?, specialization = ?, experience = ?, phone = ?, availability = ?, rating = ?, avatar_url = ? WHERE stylist_id = ?",
                (stylist_name, specialization, experience, phone, availability, rating, avatar_url, id)
            )
            
            cursor.execute("SELECT * FROM stylists WHERE stylist_id = ?", (id,))
            stylist = row_to_dict(cursor.fetchone())
            
        return Response(stylist, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def stylist_delete(request, id):
    try:
        with db_transaction() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM stylists WHERE stylist_id = ?", (id,))
            if not cursor.fetchone():
                return Response({"error": "Stylist not found"}, status=status.HTTP_404_NOT_FOUND)

            cursor.execute("DELETE FROM stylists WHERE stylist_id = ?", (id,))
            
        return Response({"message": f"Stylist {id} deleted successfully"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ================= APPOINTMENT MANAGEMENT APIs =================

@api_view(['POST'])
def appointment_add(request):
    try:
        data = request.data
        customer_name = data.get('customer_name')
        stylist_name = data.get('stylist_name')
        service_name = data.get('service_name')
        appointment_date = data.get('appointment_date')
        appointment_time = data.get('appointment_time')
        total_amount = data.get('total_amount')
        appointment_status_val = data.get('appointment_status', 'Booked')
        appointment_id = data.get('appointment_id')

        if not all([customer_name, stylist_name, service_name, appointment_date, appointment_time, total_amount]):
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        with db_transaction() as conn:
            cursor = conn.cursor()
            if appointment_id:
                cursor.execute(
                    "INSERT INTO appointments (appointment_id, customer_name, stylist_name, service_name, appointment_date, appointment_time, total_amount, appointment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (appointment_id, customer_name, stylist_name, service_name, appointment_date, appointment_time, total_amount, appointment_status_val)
                )
                new_id = appointment_id
            else:
                cursor.execute(
                    "INSERT INTO appointments (customer_name, stylist_name, service_name, appointment_date, appointment_time, total_amount, appointment_status) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (customer_name, stylist_name, service_name, appointment_date, appointment_time, total_amount, appointment_status_val)
                )
                new_id = cursor.lastrowid

            cursor.execute("SELECT * FROM appointments WHERE appointment_id = ?", (new_id,))
            appointment = row_to_dict(cursor.fetchone())
            
        return Response(appointment, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def appointment_list(request):
    customer_name = request.GET.get('customer_name')
    with db_transaction() as conn:
        cursor = conn.cursor()
        if customer_name:
            cursor.execute("SELECT * FROM appointments WHERE customer_name = ? ORDER BY appointment_date DESC, appointment_time DESC", (customer_name,))
        else:
            cursor.execute("SELECT * FROM appointments ORDER BY appointment_date DESC, appointment_time DESC")
        appointments = rows_to_list(cursor.fetchall())
    return Response(appointments, status=status.HTTP_200_OK)

@api_view(['PUT'])
def appointment_update(request, id):
    try:
        data = request.data
        customer_name = data.get('customer_name')
        stylist_name = data.get('stylist_name')
        service_name = data.get('service_name')
        appointment_date = data.get('appointment_date')
        appointment_time = data.get('appointment_time')
        total_amount = data.get('total_amount')
        appointment_status_val = data.get('appointment_status')

        with db_transaction() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM appointments WHERE appointment_id = ?", (id,))
            existing = row_to_dict(cursor.fetchone())
            if not existing:
                return Response({"error": "Appointment not found"}, status=status.HTTP_404_NOT_FOUND)

            u_cust = customer_name if customer_name is not None else existing['customer_name']
            u_styl = stylist_name if stylist_name is not None else existing['stylist_name']
            u_serv = service_name if service_name is not None else existing['service_name']
            u_date = appointment_date if appointment_date is not None else existing['appointment_date']
            u_time = appointment_time if appointment_time is not None else existing['appointment_time']
            u_amt  = total_amount if total_amount is not None else existing['total_amount']
            u_stat = appointment_status_val if appointment_status_val is not None else existing['appointment_status']

            cursor.execute(
                "UPDATE appointments SET customer_name = ?, stylist_name = ?, service_name = ?, appointment_date = ?, appointment_time = ?, total_amount = ?, appointment_status = ? WHERE appointment_id = ?",
                (u_cust, u_styl, u_serv, u_date, u_time, u_amt, u_stat, id)
            )
            
            cursor.execute("SELECT * FROM appointments WHERE appointment_id = ?", (id,))
            appointment = row_to_dict(cursor.fetchone())
            
        return Response(appointment, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def appointment_delete(request, id):
    try:
        with db_transaction() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM appointments WHERE appointment_id = ?", (id,))
            if not cursor.fetchone():
                return Response({"error": "Appointment not found"}, status=status.HTTP_404_NOT_FOUND)

            cursor.execute("DELETE FROM appointments WHERE appointment_id = ?", (id,))
            
        return Response({"message": f"Appointment {id} deleted successfully"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ================= PAYMENT MANAGEMENT APIs =================

@api_view(['POST'])
def payment_add(request):
    try:
        data = request.data
        customer_name = data.get('customer_name')
        appointment_id = data.get('appointment_id')
        amount = data.get('amount')
        payment_method = data.get('payment_method')
        payment_status_val = data.get('payment_status')
        payment_date = data.get('payment_date')
        payment_id = data.get('payment_id')

        if not all([customer_name, appointment_id, amount, payment_method, payment_status_val, payment_date]):
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        with db_transaction() as conn:
            cursor = conn.cursor()
            if payment_id:
                cursor.execute(
                    "INSERT INTO payments (payment_id, customer_name, appointment_id, amount, payment_method, payment_status, payment_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (payment_id, customer_name, appointment_id, amount, payment_method, payment_status_val, payment_date)
                )
                new_id = payment_id
            else:
                cursor.execute(
                    "INSERT INTO payments (customer_name, appointment_id, amount, payment_method, payment_status, payment_date) VALUES (?, ?, ?, ?, ?, ?)",
                    (customer_name, appointment_id, amount, payment_method, payment_status_val, payment_date)
                )
                new_id = cursor.lastrowid

            cursor.execute("SELECT * FROM payments WHERE payment_id = ?", (new_id,))
            payment = row_to_dict(cursor.fetchone())
            
        return Response(payment, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def payment_list(request):
    with db_transaction() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM payments ORDER BY payment_date DESC")
        payments = rows_to_list(cursor.fetchall())
    return Response(payments, status=status.HTTP_200_OK)

@api_view(['PUT'])
def payment_update(request, id):
    try:
        data = request.data
        customer_name = data.get('customer_name')
        appointment_id = data.get('appointment_id')
        amount = data.get('amount')
        payment_method = data.get('payment_method')
        payment_status_val = data.get('payment_status')
        payment_date = data.get('payment_date')

        with db_transaction() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM payments WHERE payment_id = ?", (id,))
            existing = row_to_dict(cursor.fetchone())
            if not existing:
                return Response({"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)

            u_cust = customer_name if customer_name is not None else existing['customer_name']
            u_appt = appointment_id if appointment_id is not None else existing['appointment_id']
            u_amt  = amount if amount is not None else existing['amount']
            u_meth = payment_method if payment_method is not None else existing['payment_method']
            u_stat = payment_status_val if payment_status_val is not None else existing['payment_status']
            u_date = payment_date if payment_date is not None else existing['payment_date']

            cursor.execute(
                "UPDATE payments SET customer_name = ?, appointment_id = ?, amount = ?, payment_method = ?, payment_status = ?, payment_date = ? WHERE payment_id = ?",
                (u_cust, u_appt, u_amt, u_meth, u_stat, u_date, id)
            )
            
            cursor.execute("SELECT * FROM payments WHERE payment_id = ?", (id,))
            payment = row_to_dict(cursor.fetchone())
            
        return Response(payment, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def payment_delete(request, id):
    try:
        with db_transaction() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM payments WHERE payment_id = ?", (id,))
            if not cursor.fetchone():
                return Response({"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)

            cursor.execute("DELETE FROM payments WHERE payment_id = ?", (id,))
            
        return Response({"message": f"Payment {id} deleted successfully"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
