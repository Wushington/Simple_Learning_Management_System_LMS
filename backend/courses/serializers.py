from rest_framework import serializers

from .models import Chapter, Course, Enrollment


class ChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = ["id", "course", "title", "content", "is_public", "order"]
        read_only_fields = ["course"]


class CourseSerializer(serializers.ModelSerializer):
    instructor_username = serializers.CharField(
        source="instructor.username",
        read_only=True,
    )

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "instructor",
            "instructor_username",
            "created_at",
        ]
        read_only_fields = ["instructor", "created_at"]


class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)

    class Meta:
        model = Enrollment
        fields = ["id", "student", "course", "course_title", "joined_at"]
        read_only_fields = ["student", "joined_at"]
