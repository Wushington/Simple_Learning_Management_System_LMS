from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Chapter, Course, Enrollment
from .serializers import (
    ChapterSerializer,
    CourseSerializer,
    EnrollmentSerializer,
)


def is_instructor(user):
    return user.is_authenticated and user.role == "instructor"


def is_student(user):
    return user.is_authenticated and user.role == "student"


def is_course_owner(user, course):
    return is_instructor(user) and course.instructor == user


def is_enrolled(user, course):
    return (
        is_student(user)
        and Enrollment.objects.filter(student=user, course=course).exists()
    )


def get_course_or_404(pk):
    try:
        return Course.objects.get(pk=pk)
    except Course.DoesNotExist:
        return None


def get_chapter_or_404(course_pk, chapter_pk):
    try:
        return Chapter.objects.get(pk=chapter_pk, course__pk=course_pk)
    except Chapter.DoesNotExist:
        return None


class CourseListView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request):
        courses = Course.objects.all()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not is_instructor(request.user):
            return Response(
                {"detail": "Only instructors can create courses."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            course = serializer.save(instructor=request.user)
            return Response(
                CourseSerializer(course).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CourseDetailView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, pk):
        course = get_course_or_404(pk)
        if course is None:
            return Response(
                {"detail": "Course not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = CourseSerializer(course)
        return Response(serializer.data)

    def put(self, request, pk):
        course = get_course_or_404(pk)
        if course is None:
            return Response(
                {"detail": "Course not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not is_course_owner(request.user, course):
            return Response(
                {"detail": "Only the course instructor can update this course."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = CourseSerializer(course, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        course = get_course_or_404(pk)
        if course is None:
            return Response(
                {"detail": "Course not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not is_course_owner(request.user, course):
            return Response(
                {"detail": "Only the course instructor can delete this course."},
                status=status.HTTP_403_FORBIDDEN,
            )

        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChapterListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_pk):
        course = get_course_or_404(course_pk)
        if course is None:
            return Response(
                {"detail": "Course not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if is_course_owner(request.user, course):
            chapters = Chapter.objects.filter(course=course)
        elif is_enrolled(request.user, course):
            chapters = Chapter.objects.filter(course=course, is_public=True)
        else:
            return Response(
                {"detail": "You do not have permission to view chapters of this course."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ChapterSerializer(chapters, many=True)
        return Response(serializer.data)

    def post(self, request, course_pk):
        course = get_course_or_404(course_pk)
        if course is None:
            return Response(
                {"detail": "Course not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not is_course_owner(request.user, course):
            return Response(
                {"detail": "Only the course instructor can add chapters."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ChapterSerializer(data=request.data)
        if serializer.is_valid():
            chapter = serializer.save(course=course)
            return Response(
                ChapterSerializer(chapter).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChapterDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_pk, chapter_pk):
        chapter = get_chapter_or_404(course_pk, chapter_pk)
        if chapter is None:
            return Response(
                {"detail": "Chapter not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not (
            is_course_owner(request.user, chapter.course)
            or (is_enrolled(request.user, chapter.course) and chapter.is_public)
        ):
            return Response(
                {"detail": "You do not have permission to view this chapter."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ChapterSerializer(chapter)
        return Response(serializer.data)

    def put(self, request, course_pk, chapter_pk):
        chapter = get_chapter_or_404(course_pk, chapter_pk)
        if chapter is None:
            return Response(
                {"detail": "Chapter not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not is_course_owner(request.user, chapter.course):
            return Response(
                {"detail": "Only the course instructor can update this chapter."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ChapterSerializer(chapter, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, course_pk, chapter_pk):
        chapter = get_chapter_or_404(course_pk, chapter_pk)
        if chapter is None:
            return Response(
                {"detail": "Chapter not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not is_course_owner(request.user, chapter.course):
            return Response(
                {"detail": "Only the course instructor can delete this chapter."},
                status=status.HTTP_403_FORBIDDEN,
            )

        chapter.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class EnrollCourseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_pk):
        course = get_course_or_404(course_pk)
        if course is None:
            return Response(
                {"detail": "Course not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not is_student(request.user):
            return Response(
                {"detail": "Only students can enroll in courses."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if Enrollment.objects.filter(student=request.user, course=course).exists():
            return Response(
                {"detail": "You are already enrolled in this course."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        enrollment = Enrollment.objects.create(student=request.user, course=course)
        serializer = EnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class EnrollmentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_student(request.user):
            return Response(
                {"detail": "Only students can view their enrollments."},
                status=status.HTTP_403_FORBIDDEN,
            )

        enrollments = Enrollment.objects.filter(student=request.user)
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)
