from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Employee, Attendance
from .serializers import EmployeeSerializer, AttendanceSerializer
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from django.db.models import Q

# Create your views here.
class EmployeeListCreateView(APIView):
    """
    GET  /api/employees/       - List all employees (with optional search)
    POST /api/employees/       - Create new employee
    """

    def get(self, request):
        search = request.query_params.get('search', '')
        department = request.query_params.get('department', '')

        employees = Employee.objects.all()

        if search:
            employees = employees.filter(
                Q(full_name__icontains=search) |
                Q(employee_id__icontains=search) |
                Q(email__icontains=search)
            )

        if department:
            employees = employees.filter(department=department)

        serializer = EmployeeSerializer(employees, many=True)
        return Response({
            'count': employees.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = EmployeeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({
            'errors': serializer.errors,
            'message': 'Validation failed. Please check the submitted data.'
        }, status=status.HTTP_400_BAD_REQUEST)

class EmployeeDetailView(APIView):
    """
    GET    /api/employees/<id>/  - Get single employee
    DELETE /api/employees/<id>/  - Delete employee
    """

    def get(self, request, pk):
        employee = get_object_or_404(Employee, pk=pk)
        serializer = EmployeeSerializer(employee)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, pk):
        employee = get_object_or_404(Employee, pk=pk)
        serializer = EmployeeSerializer(employee, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        employee = get_object_or_404(Employee, pk=pk)
        employee_name = employee.full_name
        employee.delete()
        return Response({
            'message': f'Employee "{employee_name}" has been deleted successfully.'
        }, status=status.HTTP_200_OK)

class DashboardStatsView(APIView):

    def get(self, request):

        from django.utils import timezone
        import datetime

        today = timezone.now().date()

        total_employees = Employee.objects.count()
        departments = Employee.objects.values('department').distinct().count()

        today_present = Attendance.objects.filter(date=today, status='Present').count()
        today_absent = Attendance.objects.filter(date=today, status='Absent').count()

        dept_breakdown = {}
        for emp in Employee.objects.values('department'):
            dept = emp['department']
            dept_breakdown[dept] = dept_breakdown.get(dept, 0) + 1

        return Response({
            'total_employees': total_employees,
            'total_departments': departments,
            'today_present': today_present,
            'today_absent': today_absent,
            'today': str(today),
            'department_breakdown': [
                {'department': k, 'count': v}
                for k, v in dept_breakdown.items()
            ]
        }, status=status.HTTP_200_OK)
    
class AttendanceListCreateView(APIView):
    """
    GET  /api/attendance/   - List all attendance records (filterable)
    POST /api/attendance/   - Mark attendance
    """

    def get(self, request):
        queryset = Attendance.objects.select_related('employee').all()

        employee_id = request.query_params.get('employee_id')
        date = request.query_params.get('date')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        status_filter = request.query_params.get('status')

        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        if date:
            queryset = queryset.filter(date=date)
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        serializer = AttendanceSerializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AttendanceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({
            'errors': serializer.errors,
            'message': 'Validation failed. Please check the submitted data.'
        }, status=status.HTTP_400_BAD_REQUEST)

class AttendanceDetailView(APIView):
    """
    GET    /api/attendance/<id>/  - Get single record
    PUT    /api/attendance/<id>/  - Update attendance
    DELETE /api/attendance/<id>/  - Delete attendance record
    """

    def get(self, request, pk):
        record = get_object_or_404(Attendance, pk=pk)
        serializer = AttendanceSerializer(record)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        record = get_object_or_404(Attendance, pk=pk)
        serializer = AttendanceSerializer(record, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({
            'errors': serializer.errors,
            'message': 'Validation failed.'
        }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        record = get_object_or_404(Attendance, pk=pk)
        record.delete()
        return Response({'message': 'Attendance record deleted.'}, status=status.HTTP_200_OK)

class EmployeeAttendanceView(APIView):
    """
    GET /api/employees/<employee_pk>/attendance/  - All attendance for an employee
    """

    def get(self, request, employee_pk):
        employee = get_object_or_404(Employee, pk=employee_pk)
        queryset = Attendance.objects.filter(employee=employee)

        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        status_filter = request.query_params.get('status')

        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        serializer = AttendanceSerializer(queryset, many=True)

        total = queryset.count()
        present = queryset.filter(status='Present').count()
        absent = queryset.filter(status='Absent').count()

        return Response({
            'employee_id': employee.pk,
            'employee_name': employee.full_name,
            'summary': {
                'total': total,
                'present': present,
                'absent': absent,
                'attendance_rate': round((present / total * 100), 1) if total > 0 else 0
            },
            'records': serializer.data
        }, status=status.HTTP_200_OK)