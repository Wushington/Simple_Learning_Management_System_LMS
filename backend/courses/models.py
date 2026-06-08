import secrets
import string

from django.conf import settings
from django.db import models


# Create your models here.
COURSE_CODE_ALPHABET = string.ascii_uppercase + string.digits
COURSE_CODE_LENGTH = 8


def generate_course_code():
    return "".join(
        secrets.choice(COURSE_CODE_ALPHABET) for _ in range(COURSE_CODE_LENGTH)
    )


class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    course_code = models.CharField(
        max_length=8,
        unique=True,
        db_index=True,
        blank=True,
    )
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="courses_taught",
    )

    def save(self, *args, **kwargs):
        if not self.course_code:
            self.course_code = self.get_unique_course_code()

        super().save(*args, **kwargs)

    @staticmethod
    def get_unique_course_code():
        while True:
            course_code = generate_course_code()
            if not Course.objects.filter(course_code=course_code).exists():
                return course_code

    def __str__(self):
        return self.title


class Chapter(models.Model):
    number = models.PositiveIntegerField(default=1)
    title = models.CharField(max_length=255)
    content = models.JSONField(default=list)
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="chapters",
    )
    is_public = models.BooleanField(default=False)

    class Meta:
        ordering = ["course", "number", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["course", "number"],
                name="unique_chapter_number_per_course",
            )
        ]

    def __str__(self):
        return f"Chapter {self.number}: {self.title}"


class Enrollment(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="enrollments",
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="enrollments",
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["student", "course"],
                name="unique_student_enrollment_per_course",
            )
        ]

    def __str__(self):
        return f"{self.student.username} enrolled in {self.course.title}"
