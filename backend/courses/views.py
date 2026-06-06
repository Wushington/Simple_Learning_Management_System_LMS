from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsInstructor, IsStudent

from .models import Chapter, Course, Enrollment
from .permissions import (
    IsChapterCourseInstructorOrPublicReadOnly,
    IsCourseInstructorOrReadOnly,
)
from .serializers import (
    ChapterSerializer,
    CourseDetailSerializer,
    CourseSerializer,
    EnrollmentSerializer,
)


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.select_related("instructor").prefetch_related("chapters")

    def get_serializer_class(self):
        if self.action == "retrieve":
            return CourseDetailSerializer
        return CourseSerializer

    def get_permissions(self):
        if self.action == "create":
            return [IsInstructor()]

        if self.action in ["update", "partial_update", "destroy"]:
            return [IsCourseInstructorOrReadOnly()]

        if self.action == "join":
            return [IsStudent()]

        if self.action == "my_enrollments":
            return [IsAuthenticated()]

        return [AllowAny()]

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    @action(detail=True, methods=["post"])
    def join(self, request, pk=None):
        course = self.get_object()
        enrollment, created = Enrollment.objects.get_or_create(
            student=request.user,
            course=course,
        )

        if not created:
            return Response(
                {"detail": "You are already enrolled in this course."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = EnrollmentSerializer(enrollment, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"])
    def chapters(self, request, pk=None):
        course = self.get_object()
        user = request.user

        if user.is_authenticated and course.instructor == user:
            chapters = course.chapters.all()
        else:
            chapters = course.chapters.filter(is_public=True)

        serializer = ChapterSerializer(chapters, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="my-enrollments")
    def my_enrollments(self, request):
        enrollments = Enrollment.objects.filter(student=request.user).select_related("course")
        serializer = EnrollmentSerializer(enrollments, many=True, context={"request": request})
        return Response(serializer.data)


class ChapterViewSet(viewsets.ModelViewSet):
    serializer_class = ChapterSerializer
    permission_classes = [IsChapterCourseInstructorOrPublicReadOnly]

    def get_queryset(self):
        user = self.request.user
        queryset = Chapter.objects.select_related("course", "course__instructor")

        if user.is_authenticated and user.role == "instructor":
            return queryset.filter(course__instructor=user)

        return queryset.filter(is_public=True)

    def perform_create(self, serializer):
        course = serializer.validated_data.get("course")

        if not course:
            raise ValidationError({"course": "Course ID is required."})

        if course.instructor != self.request.user:
            raise PermissionDenied("You can only add chapters to your own courses.")

        serializer.save()
