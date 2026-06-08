from rest_framework import serializers

from .models import Chapter, Course, Enrollment


class CourseSerializer(serializers.ModelSerializer):
    instructor = serializers.StringRelatedField(read_only=True)
    course_code = serializers.SerializerMethodField()

    def get_course_code(self, course):
        request = self.context.get("request")
        if request and request.user == course.instructor:
            return course.course_code

        return None

    class Meta:
        model = Course
        fields = ["id", "title", "description", "instructor", "course_code"]
        read_only_fields = ["id", "instructor", "course_code"]


class ChapterSerializer(serializers.ModelSerializer):
    course = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Chapter
        fields = ["id", "number", "title", "content", "course", "is_public"]
        read_only_fields = ["id", "course"]


class EnrollmentSerializer(serializers.ModelSerializer):
    student = serializers.StringRelatedField(read_only=True)
    course = serializers.StringRelatedField(read_only=True)
    course_id = serializers.IntegerField(source="course.id", read_only=True)

    class Meta:
        model = Enrollment
        fields = ["id", "student", "course", "course_id", "enrolled_at"]
        read_only_fields = fields
