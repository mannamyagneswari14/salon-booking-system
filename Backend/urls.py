from django.urls import path
from . import views

urlpatterns = [
    # Customer Management
    path('customers/add/', views.customer_add, name='customer_add'),
    path('customers/', views.customer_list, name='customer_list'),
    path('customers/update/<int:id>/', views.customer_update, name='customer_update'),
    path('customers/delete/<int:id>/', views.customer_delete, name='customer_delete'),
    path('customers/login/', views.customer_login, name='customer_login'),

    # Service Management
    path('services/add/', views.service_add, name='service_add'),
    path('services/', views.service_list, name='service_list'),
    path('services/update/<int:id>/', views.service_update, name='service_update'),
    path('services/delete/<int:id>/', views.service_delete, name='service_delete'),

    # Stylist Management
    path('stylists/add/', views.stylist_add, name='stylist_add'),
    path('stylists/', views.stylist_list, name='stylist_list'),
    path('stylists/update/<int:id>/', views.stylist_update, name='stylist_update'),
    path('stylists/delete/<int:id>/', views.stylist_delete, name='stylist_delete'),

    # Appointment Management
    path('appointments/add/', views.appointment_add, name='appointment_add'),
    path('appointments/', views.appointment_list, name='appointment_list'),
    path('appointments/update/<int:id>/', views.appointment_update, name='appointment_update'),
    path('appointments/delete/<int:id>/', views.appointment_delete, name='appointment_delete'),

    # Payment Management
    path('payments/add/', views.payment_add, name='payment_add'),
    path('payments/', views.payment_list, name='payment_list'),
    path('payments/update/<int:id>/', views.payment_update, name='payment_update'),
    path('payments/delete/<int:id>/', views.payment_delete, name='payment_delete'),
]
