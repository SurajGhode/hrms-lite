from django.db import models

# Create your models here.
class Employee(models.Model):
    DEPARTMENT_CHOICES = [
        ('Engineering', 'Engineering'),
        ('Marketing', 'Marketing'),
        ('Sales', 'Sales'),
        ('HR', 'HR'),
        ('Finance', 'Finance'),
        ('Operations', 'Operations'),
        ('Design', 'Design'),
        ('Product', 'Product'),
        ('Legal', 'Legal'),
        ('Other', 'Other'),
    ]

    employee_id = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.employee_id} - {self.full_name}"
    
class Attendance(models.Model):
    STATUS_CHOICES = [
        ('Present', 'Present'),
        ('Absent', 'Absent'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_set')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    note = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('employee', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.employee.full_name} - {self.date} - {self.status}"