from django.urls import path
from .views import EmployeeListCreateView, EmployeeDetailView, DashboardStatsView, AttendanceDetailView, EmployeeAttendanceView, AttendanceListCreateView, NextEmployeeIdView
urlpatterns = [
    path('employees/', EmployeeListCreateView.as_view(), name='employee-list-create'),
    path('employees/<int:pk>/', EmployeeDetailView.as_view(), name='employee-detail'),
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('attendance/', AttendanceListCreateView.as_view(), name='attendance-list-create'),
    path('attendance/<int:pk>/', AttendanceDetailView.as_view(), name='attendance-detail'),
    path('employees/<int:employee_pk>/attendance/', EmployeeAttendanceView.as_view(), name='employee-attendance'),
    path('employees/next-id/', NextEmployeeIdView.as_view(), name='employee-next-id'),
]