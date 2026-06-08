from django.db import models
from django.conf import settings


# Create your models here.
class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="courses_taught",
    )

    def __str__(self):
        return self.title


class Chapter(models.Model):
    number = models.PositiveIntegerField(default=1)
    title = models.CharField(max_length=255)
    content = models.TextField()
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="chapters",
    )
    hidden = models.BooleanField(default=True)

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
        unique_together = ("student", "course")

    def __str__(self):
        return f"{self.student.username} enrolled in {self.course.title}"
