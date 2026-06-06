from rest_framework import serializers

from .models import Chapter, Course, Enrollment


class ChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = ["id", "course", "title", "content", "is_public", "order"]


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


class CourseDetailSerializer(CourseSerializer):
    chapters = serializers.SerializerMethodField()

    class Meta(CourseSerializer.Meta):
        fields = CourseSerializer.Meta.fields + ["chapters"]

    def get_chapters(self, course):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if user and user.is_authenticated and course.instructor == user:
            chapters = course.chapters.all()
        else:
            chapters = course.chapters.filter(is_public=True)

        return ChapterSerializer(chapters, many=True, context=self.context).data


class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)

    class Meta:
        model = Enrollment
        fields = ["id", "student", "course", "course_title", "joined_at"]
        read_only_fields = ["student", "joined_at"]
