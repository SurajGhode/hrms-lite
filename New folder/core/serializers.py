from rest_framework import serializers
from .models import Employee, Attendance
import re

class EmployeeSerializer(serializers.ModelSerializer):
    total_present = serializers.SerializerMethodField()
    total_absent = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = ['id', 'employee_id', 'full_name', 'email', 'department',
                  'created_at', 'updated_at', 'total_present', 'total_absent']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_total_present(self, obj):
        return obj.attendance_set.filter(status='Present').count()

    def get_total_absent(self, obj):
        return obj.attendance_set.filter(status='Absent').count()

    def validate_employee_id(self, value):
        value = value.strip().upper()
        if not re.match(r'^[A-Z0-9\-_]+$', value):
            raise serializers.ValidationError(
                "Employee ID can only contain letters, numbers, hyphens, and underscores."
            )
        return value

    def validate_email(self, value):
        return value.strip().lower()

    def validate_full_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Full name must be at least 2 characters.")
        return value

class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    department = serializers.CharField(source='employee.department', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'employee', 'employee_name', 'employee_id', 'department',
                  'date', 'status', 'note', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    

    def validate_date(self, value):
        from django.utils import timezone
        if value > timezone.now().date():
            raise serializers.ValidationError("Cannot mark attendance for a future date.")
        return value

    def validate(self, attrs):
        # Check for duplicate (handled by unique_together but give better error)
        employee = attrs.get('employee')
        date = attrs.get('date')

        if employee and date:
            existing = Attendance.objects.filter(employee=employee, date=date)
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            if existing.exists():
                raise serializers.ValidationError(
                    f"Attendance for this employee on {date} already exists. Use PUT to update."
                )
        return attrs